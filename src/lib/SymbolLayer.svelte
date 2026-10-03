<script lang="ts" generics="FEATURE extends Feature = Feature">
  import { getId } from './context.svelte.js';
  import Layer from './Layer.svelte';
  import type { CommonLayerProps } from './types.js';
  import type { SymbolLayerSpecification } from 'maplibre-gl';
  import type { Feature } from 'geojson';

  interface Props extends CommonLayerProps<FEATURE> {
    paint?: SymbolLayerSpecification['paint'] | undefined;
    layout?: SymbolLayerSpecification['layout'] | undefined;
    applyToClusters?: boolean | undefined;
  }

  let {
    id = getId('symbol'),
    source = undefined,
    sourceLayer = undefined,
    beforeId = undefined,
    beforeLayerType = undefined,
    paint = undefined,
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

<!-- @component
Add a MapLibre `symbol` layer to the map. It shows icons and text labels for features.

This is a thin wrapper around `Layer` with `type` set to `symbol`. Place it inside a source component such as `GeoJSON`, or set the `source` prop.

Set `applyToClusters` to `true` to show only clustered points, or to `false` to show only points that are not clusters.

Set `manageHoverState` to set the `hover` feature state on the feature under the mouse. Bind to `hovered` to get that feature.
-->

<Layer
  {id}
  type="symbol"
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
