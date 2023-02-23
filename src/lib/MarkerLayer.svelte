<!--
@component Manages a set of markers for the features in a source.
  This acts similar to a Layer component, but is not actually registered with
the map as a layer. Markers for non-point features are placed at the geometry's centroid.
-->
<script lang="ts">
  import type { Feature } from 'geojson';
  import { onDestroy } from 'svelte';
  import { mapContext } from './context';
  import { combineFilters, isClusterFilter } from './filters';
  import centroid from '@turf/centroid';
  import Marker from './Marker.svelte';

  const { map, source } = mapContext();

  export let applyToClusters: boolean | undefined = undefined;
  export let filter: maplibregl.ExpressionSpecification | undefined = undefined;
  export let interactive = false;

  $: actualFilter = combineFilters('all', isClusterFilter(applyToClusters), filter);

  function setupHandlers() {
    if (!$map?.loaded()) {
      return;
    }

    $map.on('move', updateMarkers);
    $map.on('moveend', updateMarkers);
    updateMarkers();
  }

  function handleData(e: maplibregl.MapSourceDataEvent) {
    if (!$map?.loaded()) {
      return;
    }

    if (e.sourceId === $source && e.isSourceLoaded) {
      setupHandlers();
      $map?.off('sourcedata', handleData);
    }
  }

  onDestroy(() => {
    if ($map?.loaded()) {
      $map.off('move', updateMarkers);
      $map.off('moveend', updateMarkers);
      $map.off('sourcedata', handleData);
    }
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
    if (!$map?.loaded() || !$source) {
      return;
    }

    features = $map.querySourceFeatures($source, {
      filter: actualFilter,
    });
  }
</script>

{#each features as feature (feature.id ?? feature)}
  {@const c = centroid(feature)}
  <Marker {interactive} lngLat={c.geometry.coordinates}>
    <slot {feature} centroid={c} />
  </Marker>
{/each}
