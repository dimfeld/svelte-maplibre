<script lang="ts">
  import { onDestroy } from 'svelte';
  import { getId, updatedSourceContext } from './context';
  import type { GeoJSON } from 'geojson';
  import type { ClusterOptions } from './types.js';
  import { addSource, removeSource } from './source.js';
  import flush from 'just-flush';
  import type { GeoJSONSource, ExpressionSpecification } from 'maplibre-gl';

  export let id: string = getId('geojson');
  export let data: GeoJSON | string;
  /** Generate a unique id for each feature. This will overwrite existing IDs. */
  export let generateId = false;
  /** Use this property on the feature as the ID. This will overwrite existing IDs. */
  export let promoteId: string | undefined = undefined;
  export let filter: ExpressionSpecification | undefined = undefined;
  /** True to calculate line lengths. Required to use a line layer that
   * uses the "line-gradient" paint property. */
  export let lineMetrics: boolean | undefined = undefined;

  export let cluster: ClusterOptions | undefined = undefined;

  export let maxzoom: number | undefined = undefined;
  export let attribution: string | undefined = undefined;
  export let buffer: number | undefined = undefined;
  export let tolerance: number | undefined = undefined;

  const { map, cluster: clusterStore, self: source } = updatedSourceContext();
  let sourceObj: GeoJSONSource | undefined;

  $: $clusterStore = cluster;

  let first = true;
  $: if ($map && $source !== id) {
    $source = id;
    addSource(
      $map,
      $source,
      flush({
        type: 'geojson',
        data,
        filter,
        lineMetrics,
        generateId,
        promoteId,
        cluster: !!cluster,
        clusterMinPoints: cluster?.minPoints,
        clusterMaxZoom: cluster?.maxZoom,
        clusterRadius: cluster?.radius,
        clusterProperties: cluster?.properties,
        maxzoom,
        attribution,
        buffer,
        tolerance,
      }),
      (sourceId: string) => $map && sourceId === $source,
      () => {
        if (!$source) {
          return;
        }

        sourceObj = $map?.getSource($source) as GeoJSONSource;
        first = true;
      }
    );

    sourceObj;
  }

  // Don't set the data again after we've just created it.
  $: if (sourceObj) {
    if (first) {
      first = false;
    } else {
      sourceObj.setData(data);
    }
  }

  $: $map?.on('style.load', () => {
    // When the style changes the current sources are nuked and recreated. Because of this the
    // source object no longer references the current source on the map so we update it here.
    sourceObj = $map?.getSource(id) as GeoJSONSource | undefined;
  });

  $: sourceObj?.setClusterOptions(
    flush({
      cluster: !!cluster,
      clusterMaxZoom: cluster?.maxZoom,
      clusterRadius: cluster?.radius,
    })
  );

  onDestroy(() => {
    if ($source && sourceObj && $map) {
      removeSource(map, $source, sourceObj);
      $source = null;
      sourceObj = undefined;
    }
  });
</script>

{#if $source}
  {#key $source}
    <slot />
  {/key}
{/if}
