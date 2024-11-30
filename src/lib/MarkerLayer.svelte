<script lang="ts" generics="FEATURE extends Feature = Feature">
  import type maplibregl from 'maplibre-gl';
  import type { Feature } from 'geojson';
  import { onDestroy } from 'svelte';
  import type { Snippet } from 'svelte';
  import { getId, getSource, getZoomLimits, getMapContext } from './context.svelte.js';
  import { combineFilters, isClusterFilter } from './filters';
  import { geoCentroid } from 'd3-geo';
  import Marker from './Marker.svelte';
  import FillLayer from './FillLayer.svelte';
  import type { MapLibreZoomEvent } from 'maplibre-gl';
  import type { FeatureWithId, MarkerClickInfo, MarkerClickInfoFeature } from './types';
  import { dequal } from 'dequal/lite';

  interface ExtendedMarkerClickInfo extends MarkerClickInfo<MarkerClickInfoFeature<FEATURE>> {
    source: string | undefined;
    feature: FeatureWithId<FEATURE>;
  }

  const { map, loaded } = $derived(getMapContext());
  const source = getSource();
  const zoomLimits = getZoomLimits();

  /** CSS classes to apply to each marker */
  interface Props {
    applyToClusters?: boolean;
    filter?: maplibregl.ExpressionSpecification;
    /** How to calculate the coordinates of the marker.
     * @default Calls d3.geoCentroid` on the feature. */
    markerLngLat?: (feature: FEATURE) => [number, number];
    /** Handle mouse events */
    interactive?: boolean;
    /** Make markers tabbable and add the button role. */
    asButton?: boolean;
    draggable?: boolean;
    minzoom?: number;
    maxzoom?: number;
    hovered?: FEATURE;
    /** The z-index of the markers. This can also be set via CSS classes using the `class` prop.
     * If a function is provided, it will be called with each feature as an argument. */
    zIndex?: number | ((feature: FEATURE) => number);
    class?: string;
    children?: Snippet<[{ feature: FEATURE; position: [number, number] }]>;

    onclick?: (e: ExtendedMarkerClickInfo) => void;
    ondblclick?: (e: ExtendedMarkerClickInfo) => void;
    oncontextmenu?: (e: ExtendedMarkerClickInfo) => void;
    ondrag?: (e: ExtendedMarkerClickInfo) => void;
    ondragstart?: (e: ExtendedMarkerClickInfo) => void;
    ondragend?: (e: ExtendedMarkerClickInfo) => void;
  }

  let {
    applyToClusters = undefined,
    filter = undefined,
    markerLngLat = geoCentroid,
    interactive = true,
    asButton = false,
    draggable = false,
    minzoom = undefined,
    maxzoom = undefined,
    hovered = $bindable(undefined),
    zIndex = undefined,
    class: className = undefined,
    children,

    onclick = undefined,
    ondblclick = undefined,
    oncontextmenu = undefined,
    ondrag = undefined,
    ondragstart = undefined,
    ondragend = undefined,
  }: Props = $props();

  let actualMinZoom = $derived(minzoom ?? zoomLimits.minzoom);
  let actualMaxZoom = $derived(maxzoom ?? zoomLimits.maxzoom);
  let actualFilter = $derived(combineFilters('all', isClusterFilter(applyToClusters), filter));

  let installedHandlers = false;
  function setupHandlers() {
    installedHandlers = true;

    map.on('zoom', handleZoom);
    map.on('move', updateMarkers);
    map.on('moveend', updateMarkers);
    if (map.loaded()) {
      updateMarkers();
    } else {
      // updateMarkers queries the map, so if it's not in a steady state then we need to wait
      map.once('load', updateMarkers);
    }
  }

  function handleData(e: maplibregl.MapSourceDataEvent) {
    if (e.sourceId === source?.value && e.isSourceLoaded) {
      if (installedHandlers) {
        updateMarkers();
      } else {
        setupHandlers();
      }
    }
  }

  onDestroy(() => {
    if (!map) {
      return;
    }

    map.off('zoom', handleZoom);
    map.off('move', updateMarkers);
    map.off('moveend', updateMarkers);
    map.off('sourcedata', handleData);
  });

  let sourceObj = $derived(map && source?.value ? map.getSource(source.value) : undefined);

  $effect(() => {
    if (!map) {
      return;
    }

    if (sourceObj?.loaded()) {
      setupHandlers();
    } else {
      // Need to wait for the data to load
      map.on('sourcedata', handleData);
    }
  });

  let features: Array<FeatureWithId<FEATURE>> = $state([]);
  function stripAutoFeatId(f: FeatureWithId<FEATURE>) {
    if (f.id.toString().startsWith('autocluster_')) {
      return 'autocluster';
    }
    if (f.id.toString().startsWith('autofeat')) {
      return 'autofeat';
    }
    return f.id;
  }

  function someFeaturesChanged(
    current: Array<FeatureWithId<FEATURE>>,
    next: Array<FeatureWithId<FEATURE>>
  ) {
    return (
      current.length !== next.length ||
      next.some((nextValue, idx) => {
        const currentValue = current[idx];
        return !dequal(
          {
            ...(currentValue as maplibregl.MapGeoJSONFeature)?.toJSON(),
            id: currentValue ? stripAutoFeatId(currentValue) : undefined,
          },
          {
            ...(nextValue as maplibregl.MapGeoJSONFeature).toJSON(),
            id: stripAutoFeatId(nextValue),
          }
        );
      })
    );
  }

  function updateMarkers() {
    if (!source?.value) {
      return;
    }

    let featureList = map.querySourceFeatures(source.value, {
      filter: actualFilter,
    });

    // Need to dedupe the results of featureList
    let featureMap = new Map<string | number, FeatureWithId<FEATURE>>();
    for (let feature of featureList) {
      if (!feature.id) {
        if (feature.properties?.cluster_id) {
          feature.id = 'autocluster_' + feature.properties.cluster_id;
        } else {
          feature.id = getId('autofeat');
        }
      }
      featureMap.set(feature.id, feature as FeatureWithId<FEATURE>);
    }

    // Sort the features by ID so that the #each loop doesn't think the order ever changes. If the order
    // changes then it tries to move the element around which interferes with the map's management of the
    // marker element.
    const sorted = [...featureMap.values()].sort((a, b) =>
      a.id.toString().localeCompare(b.id.toString())
    );

    const currentFeatures = features;
    // Don't cause markers to rerender if nothing has changed.
    if (!someFeaturesChanged(currentFeatures, sorted)) {
      return;
    }

    features = sorted;
  }

  // svelte-ignore state_referenced_locally
  let zoom = $state(map.getZoom());
  function handleZoom(e: MapLibreZoomEvent) {
    zoom = map.getZoom();
    updateMarkers();
  }
</script>

<!--
@component Manages a set of HTML markers for the features in a source.
  This acts similar to a Layer component, but is not actually registered with
the map as a layer. Markers for non-point features are placed at the geometry's center.
-->

<!-- Set up an invisible layer so that querySourceFeatures has something to search through. -->
<FillLayer {minzoom} {maxzoom} paint={{ 'fill-opacity': 0 }} beforeLayerType="symbol" />

{#if loaded && zoom >= actualMinZoom && zoom <= actualMaxZoom}
  {#each features as feature (feature.id)}
    {@const c = markerLngLat(feature)}
    {@const z = typeof zIndex === 'function' ? zIndex(feature) : zIndex}
    <Marker
      {asButton}
      {interactive}
      {draggable}
      class={className}
      zIndex={z}
      lngLat={c}
      onmouseenter={() => {
        hovered = feature;
      }}
      onmouseleave={() => {
        if (hovered?.id === feature.id) {
          hovered = undefined;
        }
      }}
      ondragstart={(e: MarkerClickInfo<MarkerClickInfoFeature<FEATURE>>) =>
        ondragstart?.({ ...e, source: source?.value, feature })}
      ondrag={(e) => ondrag?.({ ...e, source: source?.value, feature })}
      ondragend={(e) => ondragend?.({ ...e, source: source?.value, feature })}
      onclick={(e) => onclick?.({ ...e, source: source?.value, feature })}
      ondblclick={(e) => ondblclick?.({ ...e, source: source?.value, feature })}
      oncontextmenu={(e) => oncontextmenu?.({ ...e, source: source?.value, feature })}
    >
      {@render children?.({ feature, position: c })}
    </Marker>
  {/each}
{/if}
