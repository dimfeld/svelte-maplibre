# svelte-maplibre

## 0.4.2

### Minor Changes

- [#66](https://github.com/dimfeld/svelte-maplibre/pull/66) [`6505882`](https://github.com/dimfeld/svelte-maplibre/commit/650588281c4bd0d90d81079071d187d82eec319d) Thanks [@knd775](https://github.com/knd775)! - Support setting `offset` on markers

## 0.4.1

### Minor Changes

Added missing export for `VectorTileSource`.

## 0.4.0

### Major Changes

- [#61](https://github.com/dimfeld/svelte-maplibre/pull/61) Thanks [@dabreegster](https://github.com/dabreegster)! - Consistent default values for manageHoverState. The default value for `manageHoverState` on all Layer types is now `false`, which is a breaking change.

### Patch Changes

- [#60](https://github.com/dimfeld/svelte-maplibre/pull/60) [`ffd53aa`](https://github.com/dimfeld/svelte-maplibre/commit/ffd53aafb462677e12b3aa4f6ce4d3233e185f83) Thanks [@stuartlynn](https://github.com/stuartlynn)! - Preserve sources and layers added by the user when changing the base map style

- [#59](https://github.com/dimfeld/svelte-maplibre/pull/59) [`721b0a0`](https://github.com/dimfeld/svelte-maplibre/commit/721b0a0929a23a5308e4bd2e91365500ab2b0fa4) Thanks [@stuartlynn](https://github.com/stuartlynn)! - Add support for vector tile sources

## 0.3.5

### Patch Changes

- [#54](https://github.com/dimfeld/svelte-maplibre/pull/54) [`e5d8a09`](https://github.com/dimfeld/svelte-maplibre/commit/e5d8a0957c0b73ff65ed7b4a91d77d79a6b057c8) Avoid clobbering MapLibre's added classes on Marker elements

- [#54](https://github.com/dimfeld/svelte-maplibre/pull/54) [`e5d8a09`](https://github.com/dimfeld/svelte-maplibre/commit/e5d8a0957c0b73ff65ed7b4a91d77d79a6b057c8) Support `draggable` and drag events on MarkerLayer

- [#55](https://github.com/dimfeld/svelte-maplibre/pull/55) [`7b94240`](https://github.com/dimfeld/svelte-maplibre/commit/7b9424077c4797386b9f6adbd3e2dcc61b48b6b6) Allow disabling zoom on double click

- [#55](https://github.com/dimfeld/svelte-maplibre/pull/55) [`7b94240`](https://github.com/dimfeld/svelte-maplibre/commit/7b9424077c4797386b9f6adbd3e2dcc61b48b6b6) Support dblclick and contextmenu events on layesrs and markers

- [#56](https://github.com/dimfeld/svelte-maplibre/pull/56) [`3cec7bf`](https://github.com/dimfeld/svelte-maplibre/commit/3cec7bf9441a6dfb7d2d648a5b27b456d9fd2837) Handle updates to the MapLibre component's `style` prop

## 0.3.4

- Support 2-way binding for `latLng` on draggable markers.
- Add `eventsIfTopMost` to Layers, to only fire mouse events if the layer is the top-most layer under the mouse pointer.

## 0.3.3

- Support `draggable` on `Marker`

## 0.3.2

- Properly manage hover state on features with ID `0`

## 0.3.1

- Lazily load deck.gl library so that the rest of the package can be used without including it.

## 0.3.0

- Support Svelte 4
- Upgrade to fully-released version of MapLibre GL 3.0

## 0.2.2

- Support `transformRequest` property on Map component.

## 0.2.1

- Fix layers not removing while data sources elsewhere in the map are loading
