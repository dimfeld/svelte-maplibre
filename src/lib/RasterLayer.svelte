<script lang="ts" generics="FEATURE extends Feature = Feature">
  import { getId } from './context.svelte.js';
  import Layer from './Layer.svelte';
  import type { Feature } from 'geojson';
  import type { CommonLayerProps } from './types.js';
  import type { RasterLayerSpecification } from 'maplibre-gl';

  interface Props extends CommonLayerProps<FEATURE> {
    paint: RasterLayerSpecification['paint'];
    layout?: RasterLayerSpecification['layout'] | undefined;
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

<!-- @component
Add a MapLibre `raster` layer to the map. It shows raster tiles, such as from a `RasterTileSource`.

This is a thin wrapper around `Layer` with `type` set to `raster`. Place it inside a source component such as `GeoJSON`, or set the `source` prop.
-->

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
