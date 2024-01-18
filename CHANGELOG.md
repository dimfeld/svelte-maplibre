# svelte-maplibre

## 0.7.6

### Minor Changes

- [#121](https://github.com/dimfeld/svelte-maplibre/pull/121) [`1e9ecfa`](https://github.com/dimfeld/svelte-maplibre/commit/1e9ecfa73051cdaf5013b74abb2b4b944557ea57) Thanks [@torsteinringnes](https://github.com/torsteinringnes)! - Add cooperativeGestures as svelte prop

## 0.7.5

### Minor Changes

- [#117](https://github.com/dimfeld/svelte-maplibre/pull/117) [`bb1441a`](https://github.com/dimfeld/svelte-maplibre/commit/bb1441a6d9bdb829d19acb5fcb644e62b80f177f) Thanks [@Sidd27](https://github.com/Sidd27)! - Added Rotation property to marker

## 0.7.4

### Minor Changes

- [#112](https://github.com/dimfeld/svelte-maplibre/pull/112) [`b77ab5a`](https://github.com/dimfeld/svelte-maplibre/commit/b77ab5a615082b8be836cb867639787a5b94645f) Thanks [@dimfeld](https://github.com/dimfeld)! - Add DefaultMarker component

### Patch Changes

- [#111](https://github.com/dimfeld/svelte-maplibre/pull/111) [`8821852`](https://github.com/dimfeld/svelte-maplibre/commit/88218528a90056892d96219e8e4cb232a1f4e76a) Thanks [@dimfeld](https://github.com/dimfeld)! - Update imports to work with Vite 5 and Node.js

- [#113](https://github.com/dimfeld/svelte-maplibre/pull/113) [`28f1dd1`](https://github.com/dimfeld/svelte-maplibre/commit/28f1dd1b4fb8532dc5232af66cd6409e412290b0) Thanks [@dimfeld](https://github.com/dimfeld)! - Add "default" export condition to help frameworks that don't add "svelte" to their list

## 0.7.3

### Minor Changes

- [#106](https://github.com/dimfeld/svelte-maplibre/pull/106) [`36a1ec3`](https://github.com/dimfeld/svelte-maplibre/commit/36a1ec30c0225b6fba5ee3d69cbbc23ac910cbee) Thanks [@dabreegster](https://github.com/dabreegster)! - Update filters when changed

- [#105](https://github.com/dimfeld/svelte-maplibre/pull/105) [`55818fe`](https://github.com/dimfeld/svelte-maplibre/commit/55818fe525c62acd03a323a02ce12c98329f02f4) Thanks [@dabreegster](https://github.com/dabreegster)! - Add ImageSource

## 0.7.2

### Patch Changes

- [`25d840c`](https://github.com/dimfeld/svelte-maplibre/commit/25d840cb13f2f42a8df771374f5508387a709c22) Thanks [@dimfeld](https://github.com/dimfeld)! - Add type definition for events emitted by MarkerLayer

- [`25d840c`](https://github.com/dimfeld/svelte-maplibre/commit/25d840cb13f2f42a8df771374f5508387a709c22) Thanks [@dimfeld](https://github.com/dimfeld)! - Fix missing type definition file for Marker.svelte

## 0.7.1

### Minor Changes

- [`b3f4305`](https://github.com/dimfeld/svelte-maplibre/commit/b3f43050a2e44954151ed66e8567636feeda27d0) Thanks [@dimfeld](https://github.com/dimfeld)! - Add extra info to MarkerLayer events

## 0.7.0

### Major Changes

- [#92](https://github.com/dimfeld/svelte-maplibre/pull/92) [`3800dbc`](https://github.com/dimfeld/svelte-maplibre/commit/3800dbcdb0808e280e0adc2ef1b29a77e23e7d1d) Thanks [@dabreegster](https://github.com/dabreegster)! - Add RasterTileSource and RasterLayer. This is a breaking change in that the required version of maplibre-gl is changed from ^3.0.0 to ^3.5.0.

## 0.6.0

### Major Changes

- [#94](https://github.com/dimfeld/svelte-maplibre/pull/94) [`90cde79`](https://github.com/dimfeld/svelte-maplibre/commit/90cde791dd6222086197edfc6a872177bf6c1920) Thanks [@dimfeld](https://github.com/dimfeld)!

Allow setting layers to be non-interactive. Layers with `interactive={false}` will not emit mouse events, and will not
participate in hit testing when comparing to other layers with `eventsIfTopMost`.

This is useful, for example, when placing a SymbolLayer on top of a
CircleLayer. See the updated "Clusters and Popups" example; previous the popup would disappear when the mouse was over
the labels, but not it does not.

This is a breaking change:

- The `interactive` prop for `Marker` and `MarkerLayer` has been renamed to `asButton`, to make room for the new
  `interactive` prop.
- DeckGlLayer still continues to allow the `pickable` prop, but `interactive` should be used instead for consistency.
  The behavior here is unchanged though.

### Minor Changes

- [#91](https://github.com/dimfeld/svelte-maplibre/pull/91) [`52a7f4b`](https://github.com/dimfeld/svelte-maplibre/commit/52a7f4b5e0dd11d33da8e824cfeb5d5871cc9865) Thanks [@dimfeld](https://github.com/dimfeld)! - Export source helpers for use by other Source components

### Patch Changes

- [#93](https://github.com/dimfeld/svelte-maplibre/pull/93) [`4357161`](https://github.com/dimfeld/svelte-maplibre/commit/4357161e9c207c114e00226d9c36f5d975c72ad5) Thanks [@dimfeld](https://github.com/dimfeld)! - Fix exception when clicking a deck.gl layer with a Popup

## 0.5.3

### Minor Changes

- [#90](https://github.com/dimfeld/svelte-maplibre/pull/90) [`44df623`](https://github.com/dimfeld/svelte-maplibre/commit/44df62373aa7d086a68aea5d8494994ee4e41338) Thanks [@dimfeld](https://github.com/dimfeld)! - Add all components to the export map. This allows importing like "svelte-maplibre/MapLibre.svelte" in addition to importing everything from the package root.

### Patch Changes

- [#88](https://github.com/dimfeld/svelte-maplibre/pull/88) [`8d03d54`](https://github.com/dimfeld/svelte-maplibre/commit/8d03d5421557bc046130d01b1ac777c50e8e11fe) Thanks [@dimfeld](https://github.com/dimfeld)! - Properly remove sources and handle the source being quickly replaced

- [#89](https://github.com/dimfeld/svelte-maplibre/pull/89) [`23bc94a`](https://github.com/dimfeld/svelte-maplibre/commit/23bc94ad46a0c1ad549facec8f06041908619c90) Thanks [@dimfeld](https://github.com/dimfeld)! - Export JoinedData from index file, mark sourceLayer optional

## 0.5.2

### Minor Changes

- [#82](https://github.com/dimfeld/svelte-maplibre/pull/82) [`8edfc1f`](https://github.com/dimfeld/svelte-maplibre/commit/8edfc1fe7dd4ad7399790e6c3408cccd6a0538fe) Thanks [@dimfeld](https://github.com/dimfeld)! - Allow setting z-index on Marker and MarkerLayer

## 0.5.1

### Patch Changes

- [#78](https://github.com/dimfeld/svelte-maplibre/pull/78) [`b69ddb1`](https://github.com/dimfeld/svelte-maplibre/commit/b69ddb1fbd29ab669fd19501a7d0f68983d26889) Thanks [@dimfeld](https://github.com/dimfeld)! - Fix Marker popup click handler

## 0.5.0

### Major Changes

- [#71](https://github.com/dimfeld/svelte-maplibre/pull/71) [`821c3bd`](https://github.com/dimfeld/svelte-maplibre/commit/821c3bd7e14a761ff8c58a1a74feb2f8433d9071) Thanks [@dabreegster](https://github.com/dabreegster)! - Make eventsIfTopMost also work for manageHoverState, and introduce
  openIfTopMost for Popups. `openIfTopMost` defaults to true, which changes the default behavior for overlapping popups.

### Patch Changes

- [#75](https://github.com/dimfeld/svelte-maplibre/pull/75) [`accb09d`](https://github.com/dimfeld/svelte-maplibre/commit/accb09da27971efade03fa9a211679c08334698f) Thanks [@mhrgoldberg](https://github.com/mhrgoldberg)! - Fix GeoJSON component reactivity to data changes after map styles are updated.

## 0.4.3

### Minor Changes

- [#65](https://github.com/dimfeld/svelte-maplibre/pull/65) [`6e9a532`](https://github.com/dimfeld/svelte-maplibre/commit/6e9a532aa5b8de7e2aa90be6173bfb8743f232d4) Thanks [@stuartlynn](https://github.com/stuartlynn)! - Adds a JoinData component to allow data to be joined to vector features in the client

- [#69](https://github.com/dimfeld/svelte-maplibre/pull/69) [`1ced5d7`](https://github.com/dimfeld/svelte-maplibre/commit/1ced5d7995b73ae6990a592a3135c16cd78be1ea) Thanks [@dabreegster](https://github.com/dabreegster)! - Add hash to track viewport in the URL

### Patch Changes

- [#68](https://github.com/dimfeld/svelte-maplibre/pull/68) [`d2459d5`](https://github.com/dimfeld/svelte-maplibre/commit/d2459d562c845e731337fa80595f62d97c4edb6c) Thanks [@dabreegster](https://github.com/dabreegster)! - Fix the map bounds property to work when initially set

- [#72](https://github.com/dimfeld/svelte-maplibre/pull/72) [`f403ca0`](https://github.com/dimfeld/svelte-maplibre/commit/f403ca0250dd12957b43cf87721baaf171887b51) Thanks [@dabreegster](https://github.com/dabreegster)! - Fix hover state for vector tiles sources

- [#73](https://github.com/dimfeld/svelte-maplibre/pull/73) [`c42b2cc`](https://github.com/dimfeld/svelte-maplibre/commit/c42b2ccbb47f37365a16c69169fb768592c8463e) Thanks [@knd775](https://github.com/knd775)! - Re-export common types from `maplibre-gl`

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
