<script lang="ts">
  import { getId } from './context';
  import Layer from './Layer.svelte';

  interface Props {
    id?: any;
    /** Set the source for this layer. This can be omitted when the Layer is created in the slot
     * of a source component. */
    source?: string | undefined;
    /** Draw this layer under another layer. This is only evaluated when the component is created. */
    beforeId?: string | undefined;
    /** Draw this layer all layers of this type. This is only evaluated when the component is created. */
    beforeLayerType?: string | ((layer: maplibregl.LayerSpecification) => boolean) | undefined;
    paint?: maplibregl.HillshadeLayerSpecification['paint'] | undefined;
    layout?: maplibregl.HillshadeLayerSpecification['layout'] | undefined;
    minzoom?: number | undefined;
    maxzoom?: number | undefined;
    children?: import('svelte').Snippet;
  }

  let {
    id = getId('hillshade-layer'),
    source = undefined,
    beforeId = undefined,
    beforeLayerType = undefined,
    paint = undefined,
    layout = undefined,
    minzoom = undefined,
    maxzoom = undefined,
    children,
  }: Props = $props();
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
  {@render children?.()}
</Layer>
