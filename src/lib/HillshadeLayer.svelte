<script lang="ts" generics="FEATURE extends Feature = Feature">
  import { getId } from './context.svelte.js';
  import Layer from './Layer.svelte';
  import type { Feature } from 'geojson';
  import type { CommonLayerProps } from './types.js';
  import type { HillshadeLayerSpecification } from 'maplibre-gl';

  interface Props extends CommonLayerProps<FEATURE> {
    paint?: HillshadeLayerSpecification['paint'] | undefined;
    layout?: HillshadeLayerSpecification['layout'] | undefined;
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
  type="hillshade"
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
