<script lang="ts" generics="FEATURE extends Feature = Feature">
  import { getId } from './context.svelte.js';
  import Layer from './Layer.svelte';
  import type { Feature } from 'geojson';
  import type { CommonLayerProps } from './types.js';
  import type { LineLayerSpecification } from 'maplibre-gl';

  interface Props extends CommonLayerProps<FEATURE> {
    paint: LineLayerSpecification['paint'];
    layout?: LineLayerSpecification['layout'] | undefined;
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

<!-- @component
Add a MapLibre `line` layer to the map. It shows line features, and the outlines of polygon features.

This is a thin wrapper around `Layer` with `type` set to `line`. Place it inside a source component such as `GeoJSON`, or set the `source` prop.

Set `manageHoverState` to set the `hover` feature state on the feature under the mouse. Bind to `hovered` to get that feature.
-->

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
  {onclick}
  {ondblclick}
  {oncontextmenu}
  {onmouseenter}
  {onmousemove}
  {onmouseleave}
>
  {@render children?.()}
</Layer>
