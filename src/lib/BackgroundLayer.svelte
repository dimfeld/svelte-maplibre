<script lang="ts" generics="FEATURE extends Feature = Feature">
  import type { Feature } from 'geojson';
  import { getId } from './context.svelte.js';
  import Layer from './Layer.svelte';
  import type { CommonLayerProps } from './types.js';

  interface Props extends Omit<CommonLayerProps<FEATURE>, 'source' | 'sourceLayer'> {
    paint: maplibregl.BackgroundLayerSpecification['paint'];
    layout?: maplibregl.BackgroundLayerSpecification['layout'];
    applyToClusters?: boolean | undefined;
  }

  let {
    id = getId('background'),
    beforeId = undefined,
    beforeLayerType = undefined,
    paint,
    layout = undefined,
    filter = undefined,
    applyToClusters = undefined,
    minzoom = undefined,
    maxzoom = undefined,
    hoverCursor = undefined,
    manageHoverState = false,
    hovered = $bindable(),
    eventsIfTopMost = false,
    interactive = true,
    children = undefined,

    onclick = undefined,
    ondblclick = undefined,
    oncontextmenu = undefined,
    onmouseenter = undefined,
    onmousemove = undefined,
    onmouseleave = undefined,
  }: Props = $props();
</script>

<Layer
  {id}
  type="background"
  requireSource={false}
  {beforeId}
  {beforeLayerType}
  {paint}
  {layout}
  {filter}
  {applyToClusters}
  {minzoom}
  {maxzoom}
  {hoverCursor}
  {manageHoverState}
  {eventsIfTopMost}
  {interactive}
  bind:hovered
  {onclick}
  {ondblclick}
  {oncontextmenu}
  {onmouseenter}
  {onmousemove}
  {onmouseleave}
>
  {@render children?.()}
</Layer>
