<script lang="ts">
  import { getId } from './context';
  import Layer from './Layer.svelte';

  export let id = getId('hillshade-layer');
  /** Set the source for this layer. This can be omitted when the Layer is created in the slot
   * of a source component. */
  export let source: string | undefined = undefined;
  /** Draw this layer under another layer. This is only evaluated when the component is created. */
  export let beforeId: string | undefined = undefined;
  /** Draw this layer all layers of this type. This is only evaluated when the component is created. */
  export let beforeLayerType:
    | string
    | ((layer: maplibregl.LayerSpecification) => boolean)
    | undefined = undefined;
  export let paint: maplibregl.HillshadeLayerSpecification['paint'] | undefined = undefined;
  export let layout: maplibregl.HillshadeLayerSpecification['layout'] | undefined = undefined;
  export let minzoom: number | undefined = undefined;
  export let maxzoom: number | undefined = undefined;
</script>

<Layer
  {id}
  type="hillshade"
  {source}
  {beforeId}
  {beforeLayerType}
  {paint}
  {layout}
  {minzoom}
  {maxzoom}
  on:click
  on:dblclick
  on:contextmenu
  on:mouseenter
  on:mousemove
  on:mouseleave
>
  <slot />
</Layer>
