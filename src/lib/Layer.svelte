<!--
@component
A component that handles a generic layer. This is intended for use by other type-specific
layer components, such as FillLayer, and usually you will want to use one of those in your
code instead of directly using this component.
-->
<script lang="ts">
  import { getId, updatedLayerContext } from './context.js';
  import { diffApplier } from './compare.js';
  import { combineFilters } from './filters.js';
  import type { LayerClickInfo } from './types.js';
  import flush from 'just-flush';
  import { onDestroy, createEventDispatcher } from 'svelte';

  export let id = getId('layer');
  /** Set the source for this layer. This can be omitted when the Layer is created in the slot
   * of a source component. */
  export let source: string | undefined = undefined;

  /** Draw this layer under another layer. This is only evaluated when the component is created. */
  export let beforeId: string | undefined = undefined;
  export let type: maplibregl.LayerSpecification['type'];
  export let paint: object | undefined = undefined;
  export let layout: object | undefined = undefined;
  export let filter: maplibregl.ExpressionSpecification | undefined = undefined;
  export let applyToClusters: boolean | undefined = undefined;
  export let minzoom = 0;
  export let maxzoom = 24;

  export let hoverCursor: string | undefined = undefined;

  const dispatch = createEventDispatcher<{
    click: LayerClickInfo;
    mouseenter: LayerClickInfo;
    mouseleave: Pick<LayerClickInfo, 'map' | 'layer' | 'source'>;
  }>();

  let clusterFilter: maplibregl.ExpressionSpecification | undefined;
  $: clusterFilter =
    applyToClusters === true
      ? ['has', 'point_count']
      : applyToClusters === false
      ? ['!', ['has', 'point_count']]
      : undefined;
  $: layerFilter = combineFilters('all', clusterFilter, filter);

  const { map, source: sourceName, self: layer } = updatedLayerContext();

  onDestroy(() => {
    if ($layer) {
      $map?.removeLayer($layer);
    }
  });

  $: actualSource = source || $sourceName;

  $: if ($map && $layer !== id && actualSource) {
    $layer = id;
    $map.addLayer(
      flush({
        id: $layer,
        type,
        source: actualSource,
        filter: layerFilter,
        paint,
        layout,
        minzoom,
        maxzoom,
      }),
      beforeId
    );

    $map.on('click', $layer, (e) => {
      if (!$layer || !$map) {
        return;
      }

      let features =
        $map?.queryRenderedFeatures(e.point, {
          layers: [$layer],
        }) ?? [];
      let clusterId = features[0]?.properties?.cluster_id;
      dispatch('click', {
        map: $map!,
        clusterId,
        layer: $layer,
        source: actualSource!,
        features,
      });
    });

    $map.on('mouseenter', $layer, (e) => {
      if (!$layer || !$map) {
        return;
      }

      if (hoverCursor) {
        $map.getCanvas().style.cursor = hoverCursor;
      }

      let features =
        $map?.queryRenderedFeatures(e.point, {
          layers: [$layer],
        }) ?? [];
      let clusterId = features[0]?.properties?.cluster_id;

      dispatch('mouseenter', {
        map: $map!,
        clusterId,
        layer: $layer!,
        source: actualSource!,
        features,
      });
    });

    $map.on('mouseleave', $layer, () => {
      if (!$layer || !$map) {
        return;
      }

      if (hoverCursor) {
        $map.getCanvas().style.cursor = '';
      }

      dispatch('mouseleave', {
        map: $map!,
        layer: $layer,
        source: actualSource!,
      });
    });
  }

  $: applyPaint = $layer
    ? diffApplier((key, value) => $map?.setPaintProperty($layer!, key, value))
    : undefined;
  $: applyLayout = $layer
    ? diffApplier((key, value) => $map?.setLayoutProperty($layer!, key, value))
    : undefined;

  $: applyPaint?.(paint);
  $: applyLayout?.(layout);
  $: if ($layer) $map?.setLayerZoomRange($layer, minzoom, maxzoom);
</script>

{#if $layer}
  {#key $layer}
    <slot />
  {/key}
{/if}
