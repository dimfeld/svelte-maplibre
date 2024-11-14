<script lang="ts">
  import { onDestroy } from 'svelte';
  import { getCluster, getId, mapContext, updatedSourceContext } from './context.svelte.js';
  import type { GeoJSON } from 'geojson';
  import type { ClusterOptions } from './types.js';
  import { addSource, removeSource } from './source.js';
  import { flush } from '$lib/flush.js';
  import type { GeoJSONSource, ExpressionSpecification } from 'maplibre-gl';

  interface Props {
    id?: string;
    data: GeoJSON | string;
    /** Generate a unique id for each feature. This will overwrite existing IDs. */
    generateId?: boolean;
    /** Use this property on the feature as the ID. This will overwrite existing IDs. */
    promoteId?: string | undefined;
    filter?: ExpressionSpecification | undefined;
    /** True to calculate line lengths. Required to use a line layer that
     * uses the "line-gradient" paint property. */
    lineMetrics?: boolean | undefined;
    cluster?: ClusterOptions | undefined;
    maxzoom?: number | undefined;
    attribution?: string | undefined;
    buffer?: number | undefined;
    tolerance?: number | undefined;
    children?: import('svelte').Snippet;
  }

  let {
    id = getId('geojson'),
    data,
    generateId = false,
    promoteId = undefined,
    filter = undefined,
    lineMetrics = undefined,
    cluster = undefined,
    maxzoom = undefined,
    attribution = undefined,
    buffer = undefined,
    tolerance = undefined,
    children,
  }: Props = $props();

  const { map } = mapContext();
  const { source } = updatedSourceContext();
  let sourceObj: GeoJSONSource | undefined = $state();

  let first = $state(true);
  $effect(() => {
    if (map && source.value !== id) {
      source.value = id;
      addSource(
        map,
        source.value,
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
        (sourceId: string) => map && sourceId === source.value,
        () => {
          if (!source.value) {
            return;
          }

          sourceObj = map.getSource(source.value) as GeoJSONSource;
          first = true;
        }
      );

      sourceObj;
    }
  });

  // Don't set the data again after we've just created it.
  $effect(() => {
    if (sourceObj) {
      if (first) {
        first = false;
      } else {
        sourceObj.setData(data);
      }
    }
  });

  $effect(() => {
    map.on('style.load', () => {
      // When the style changes the current sources are nuked and recreated. Because of this the
      // source object no longer references the current source on the map so we update it here.
      sourceObj = map.getSource(id) as GeoJSONSource | undefined;
    });
  });

  $effect(() => {
    sourceObj?.setClusterOptions(
      flush({
        cluster: !!cluster,
        clusterMaxZoom: cluster?.maxZoom,
        clusterRadius: cluster?.radius,
      })
    );
  });

  onDestroy(() => {
    if (source.value && sourceObj && map) {
      removeSource(map, source.value, sourceObj);
      source.value = undefined;
      sourceObj = undefined;
    }
  });
</script>

{#if source.value}
  {#key source.value}
    {@render children?.()}
  {/key}
{/if}
