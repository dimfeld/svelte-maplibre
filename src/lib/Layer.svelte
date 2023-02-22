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
  import flush from 'just-flush';
  import { onDestroy } from 'svelte';

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

  let clusterFilter: maplibregl.ExpressionSpecification | undefined;
  $: clusterFilter =
    applyToClusters === true
      ? ['has', 'point_count']
      : applyToClusters === false
      ? ['!', ['has', 'point_count']]
      : undefined;
  $: layerFilter = combineFilters('all', clusterFilter, filter);
  $: console.log({ layerFilter });

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
