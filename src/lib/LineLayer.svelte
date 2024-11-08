<script lang="ts">
  import type { Feature } from 'geojson';
  import { getId } from './context';
  import Layer from './Layer.svelte';

  interface Props {
    id?: any;
    /** Set the source for this layer. This can be omitted when the Layer is created in the slot
     * of a source component. */
    source?: string | undefined;
    /** When setting up a layer for a vector tile source, the source layer to which this layer corresponds. */
    sourceLayer?: string | undefined;
    /** Draw this layer under another layer. This is only evaluated when the component is created. */
    beforeId?: string | undefined;
    /** Draw this layer all layers of this type. This is only evaluated when the component is created. */
    beforeLayerType?: string | ((layer: maplibregl.LayerSpecification) => boolean) | undefined;
    paint: maplibregl.LineLayerSpecification['paint'];
    layout?: maplibregl.LineLayerSpecification['layout'] | undefined;
    filter?: maplibregl.ExpressionSpecification | undefined;
    minzoom?: number | undefined;
    maxzoom?: number | undefined;
    /** Set the cursor style to this value when the mouse is over the layer. */
    hoverCursor?: string | undefined;
    /** Enable to use hoverStateFilter or filter on `hover-state`. Features must have an `id` property for this to work. */
    manageHoverState?: boolean;
    hovered?: Feature | null;
    eventsIfTopMost?: boolean;
    /** Handle mouse events on this layer. */
    interactive?: boolean;
    children?: import('svelte').Snippet;
  }

  let {
    id = getId('line'),
    source = undefined,
    sourceLayer = undefined,
    beforeId = undefined,
    beforeLayerType = undefined,
    paint,
    layout = undefined,
    filter = undefined,
    minzoom = undefined,
    maxzoom = undefined,
    hoverCursor = undefined,
    manageHoverState = false,
    hovered = $bindable(null),
    eventsIfTopMost = false,
    interactive = true,
    children,
  }: Props = $props();
</script>

<Layer
  {id}
  type="line"
  {source}
  {sourceLayer}
  {beforeId}
  {beforeLayerType}
  {paint}
  {layout}
  {filter}
  {minzoom}
  {maxzoom}
  {hoverCursor}
  {manageHoverState}
  {eventsIfTopMost}
  {interactive}
  bind:hovered
  on:click
  on:dblclick
  on:contextmenu
  on:mouseenter
  on:mousemove
  on:mouseleave
>
  {@render children?.()}
</Layer>
