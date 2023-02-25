<script lang="ts">
  import type { Feature } from 'geojson';
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { getId, mapContext } from './context';
  import { combineFilters, isClusterFilter } from './filters';
  import center from '@turf/center';
  import Marker from './Marker.svelte';
  import FillLayer from './FillLayer.svelte';

  const { map, source } = mapContext();
  const dispatch = createEventDispatcher();

  export let applyToClusters: boolean | undefined = undefined;
  export let filter: maplibregl.ExpressionSpecification | undefined = undefined;
  /** If interactive is true (default), the markers will render as `button`. If not,
   * they will render as `div` elements. */
  export let interactive = false;

  $: actualFilter = combineFilters('all', isClusterFilter(applyToClusters), filter);

  let installedHandlers = false;
  function setupHandlers() {
    if (!$map) {
      return;
    }

    installedHandlers = true;

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
</script>

<!--
@component Manages a set of HTML markers for the features in a source.
  This acts similar to a Layer component, but is not actually registered with
the map as a layer. Markers for non-point features are placed at the geometry's center.
-->

<!-- Set up an invisible layer so that querySourceFeatures has something search through. -->
<FillLayer paint={{ 'fill-opacity': 0 }} beforeLayerType="symbol" />

{#each features as feature (feature.id)}
  {@const c = center(feature)}
  <Marker
    {interactive}
    lngLat={c.geometry.coordinates}
    on:click={(e) => dispatch('click', { ...e, feature })}
  >
    <slot {feature} center={c} />
  </Marker>
{/each}
