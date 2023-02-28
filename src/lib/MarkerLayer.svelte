<script lang="ts">
  import type { Feature } from 'geojson';
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { getId, mapContext } from './context';
  import { combineFilters, isClusterFilter } from './filters';
  import { geoCentroid } from 'd3-geo';
  import Marker from './Marker.svelte';
  import FillLayer from './FillLayer.svelte';
  import type { MapLibreZoomEvent } from 'maplibre-gl';

  const { map, source, minzoom: minZoomContext, maxzoom: maxZoomContext } = mapContext();
  const dispatch = createEventDispatcher();

  export let applyToClusters: boolean | undefined = undefined;
  export let filter: maplibregl.ExpressionSpecification | undefined = undefined;
  /** How to calculate the coordinates of the marker.
   * @default Calls d3.geoCentroid` on the feature. */
  export let markerLngLat: (feature: Feature) => [number, number] = geoCentroid;
  /** If interactive is true (default), the markers will render as `button`. If not,
   * they will render as `div` elements. */
  export let interactive = false;
  export let minzoom: number | undefined = undefined;
  export let maxzoom: number | undefined = undefined;
  export let hovered: Feature | null = null;

  $: actualMinZoom = minzoom ?? $minZoomContext;
  $: actualMaxZoom = maxzoom ?? $maxZoomContext;
  $: actualFilter = combineFilters('all', isClusterFilter(applyToClusters), filter);

  let installedHandlers = false;
  function setupHandlers() {
    if (!$map) {
      return;
    }

    installedHandlers = true;

    $map.on('zoom', handleZoom);
    $map.on('move', updateMarkers);
    $map.on('moveend', updateMarkers);
    if (!$map.loaded()) {
      updateMarkers();
    } else {
      $map.once('load', updateMarkers);
    }
  }

  function handleData(e: maplibregl.MapSourceDataEvent) {
    if (e.sourceId === $source && e.isSourceLoaded) {
      if (installedHandlers) {
        updateMarkers();
      } else {
        setupHandlers();
      }
    }
  }

  onDestroy(() => {
    if (!$map) {
      return;
    }

    $map.off('zoom', handleZoom);
    $map.off('move', updateMarkers);
    $map.off('moveend', updateMarkers);
    $map.off('sourcedata', handleData);
  });

  $: if ($map && $source) {
    let sourceObj = $map.getSource($source);
    if (sourceObj?.loaded()) {
      setupHandlers();
    } else {
      // Need to wait for the data to load
      $map.on('sourcedata', handleData);
    }
  }

  let features: Feature[] = [];
  function updateMarkers() {
    if (!$map || !$source) {
      return;
    }

    let featureList = $map.querySourceFeatures($source, {
      filter: actualFilter,
    });

    // Need to dedupe the results of featureList
    let featureMap = new Map<string | number, Feature>();
    for (let feature of featureList) {
      if (!feature.id) {
        if (feature.properties?.cluster_id) {
          feature.id = 'autocluster_' + feature.properties.cluster_id;
        } else {
          feature.id = getId('autofeat');
        }
      }
      featureMap.set(feature.id, feature);
    }

    // Sort the features by ID so that the #each loop doesn't think the order ever changes. If the order
    // changes then it tries to move the element around which interferes with the map's management of the
    // marker element.
    features = [...featureMap.values()].sort((a, b) =>
      a.id.toString().localeCompare(b.id.toString())
    );
  }

  let zoom = $map?.getZoom() ?? 0;
  function handleZoom(e: MapLibreZoomEvent) {
    zoom = $map!.getZoom();
    updateMarkers();
  }
</script>

<!--
@component Manages a set of HTML markers for the features in a source.
  This acts similar to a Layer component, but is not actually registered with
the map as a layer. Markers for non-point features are placed at the geometry's center.
-->

<!-- Set up an invisible layer so that querySourceFeatures has something search through. -->
<FillLayer {minzoom} {maxzoom} paint={{ 'fill-opacity': 0 }} beforeLayerType="symbol" />

{#if zoom >= actualMinZoom && zoom <= actualMaxZoom}
  {#each features as feature (feature.id)}
    {@const c = markerLngLat(feature)}
    <Marker
      {interactive}
      lngLat={c}
      on:mouseenter={() => {
        hovered = feature;
      }}
      on:mouseleave={() => {
        if (hovered?.id === feature.id) {
          hovered = null;
        }
      }}
      on:click={(e) => dispatch('click', { ...e, feature })}
    >
      <slot {feature} position={c} />
    </Marker>
  {/each}
{/if}
