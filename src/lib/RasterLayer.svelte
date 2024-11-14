<script lang="ts">
  import { getId } from './context.svelte.js';
  import Layer from './Layer.svelte';
  import type { CommonLayerProps } from './types.js';

  interface Props extends CommonLayerProps {
    paint: maplibregl.RasterLayerSpecification['paint'];
    layout?: maplibregl.RasterLayerSpecification['layout'] | undefined;
  }

  let {
    id = getId('raster-layer'),
    source = undefined,
    beforeId = undefined,
    beforeLayerType = undefined,
    paint,
    layout = undefined,
    minzoom = undefined,
    maxzoom = undefined,
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
  type="raster"
  {source}
  {beforeId}
  {beforeLayerType}
  {paint}
  {layout}
  {minzoom}
  {maxzoom}
  {onclick}
  {ondblclick}
  {oncontextmenu}
  {onmouseenter}
  {onmousemove}
  {onmouseleave}
>
  {@render children?.()}
</Layer>
