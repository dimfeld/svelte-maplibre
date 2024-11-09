<script lang="ts">
  import { onDestroy } from 'svelte';
  import { getId, updatedSourceContext } from './context';
  import type { GeoJSON } from 'geojson';
  import type { ClusterOptions } from './types.js';
  import { addSource, removeSource } from './source.js';
  import flush from 'just-flush';
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

  const { map, cluster: clusterStore, self: source } = updatedSourceContext();
  let sourceObj: GeoJSONSource | undefined = $state();

  $effect(() => {
    $clusterStore = cluster;
  });

  let first = $state(true);
  $effect(() => {
    if ($map && $source !== id) {
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
    $map?.on('style.load', () => {
      // When the style changes the current sources are nuked and recreated. Because of this the
      // source object no longer references the current source on the map so we update it here.
      sourceObj = $map?.getSource(id) as GeoJSONSource | undefined;
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
    if ($source && sourceObj && $map) {
      removeSource(map, $source, sourceObj);
      $source = null;
      sourceObj = undefined;
    }
  });
</script>

{#if $source}
  {#key $source}
    {@render children?.()}
  {/key}
{/if}
