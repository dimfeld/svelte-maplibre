<script lang="ts">
  import type { Feature } from 'geojson';
  import { getId } from './context';
  import Layer from './Layer.svelte';

  export let id = getId('circle');
  /** Set the source for this layer. This can be omitted when the Layer is created in the slot
   * of a source component. */
  export let source: string | undefined = undefined;
  /** When setting up a layer for a vector tile source, the source layer to which this layer corresponds. */
  export let sourceLayer: string | undefined = undefined;
  /** Draw this layer under another layer. This is only evaluated when the component is created. */
  export let beforeId: string | undefined = undefined;
  /** Draw this layer all layers of this type. This is only evaluated when the component is created. */
  export let beforeLayerType:
    | string
    | ((layer: maplibregl.LayerSpecification) => boolean)
    | undefined = undefined;
  export let paint: maplibregl.CircleLayerSpecification['paint'];
  export let layout: maplibregl.CircleLayerSpecification['layout'] | undefined = undefined;
  export let filter: maplibregl.ExpressionSpecification | undefined = undefined;
  export let applyToClusters: boolean | undefined = undefined;
  export let minzoom: number | undefined = undefined;
  export let maxzoom: number | undefined = undefined;
  /** Set the cursor style to this value when the mouse is over the layer. */
  export let hoverCursor: string | undefined = undefined;
  export let hovered: Feature | null = null;
</script>

<Layer
  {id}
  type="circle"
  {source}
  {sourceLayer}
  {beforeId}
  {beforeLayerType}
  {paint}
  {layout}
  {filter}
  {applyToClusters}
  {minzoom}
  {maxzoom}
  {hoverCursor}
  bind:hovered
  on:click
  on:mouseenter
  on:mousemove
  on:mouseleave
>
  <slot />
</Layer>
