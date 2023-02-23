<script lang="ts">
  import { getId } from './context';
  import Layer from './Layer.svelte';

  export let id = getId('symbol');
  /** Set the source for this layer. This can be omitted when the Layer is created in the slot
   * of a source component. */
  export let source: string | undefined = undefined;
  /** Draw this layer under another layer. This is only evaluated when the component is created. */
  export let beforeId: string | undefined = undefined;
  export let paint: maplibregl.SymbolLayerSpecification['paint'] | undefined = undefined;
  export let layout: maplibregl.SymbolLayerSpecification['layout'] | undefined = undefined;
  export let filter: maplibregl.ExpressionSpecification | undefined = undefined;
  export let applyToClusters: boolean | undefined = undefined;
  export let minzoom: number | undefined = undefined;
  export let maxzoom: number | undefined = undefined;
  /** Set the cursor style to this value when the mouse is over the layer. */
  export let hoverCursor: string | undefined = undefined;
</script>

<Layer
  {id}
  type="symbol"
  {source}
  {beforeId}
  {paint}
  {layout}
  {filter}
  {applyToClusters}
  {minzoom}
  {maxzoom}
  {hoverCursor}
  on:click
  on:mouseenter
  on:mouseleave
>
  <slot />
</Layer>
