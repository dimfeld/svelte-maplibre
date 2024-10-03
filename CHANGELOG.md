# svelte-maplibre

## 0.9.14

### Patch Changes

- [`d84def9`](https://github.com/dimfeld/svelte-maplibre/commit/d84def9df60c14b5eed66ac912288386db308055) Thanks [@ciscorn](https://github.com/ciscorn)! - Defer updating Layer’s layout and paint properties until Map style is fully loaded

## 0.9.13

### Patch Changes

- [#199](https://github.com/dimfeld/svelte-maplibre/pull/199) [`579769d`](https://github.com/dimfeld/svelte-maplibre/commit/579769d177fbd3f18dffe30b98a23a875833a515) Thanks [@craumix](https://github.com/craumix)! - Expose additional MapOptions for MapLibre

## 0.9.12

### Patch Changes

- [#195](https://github.com/dimfeld/svelte-maplibre/pull/195) [`aeaf638`](https://github.com/dimfeld/svelte-maplibre/commit/aeaf63881c945efd2c56c415bc874dfd5c4d0e53) Thanks [@dimfeld](https://github.com/dimfeld)! - Fix marker popups not closing properly when clicking on a different marker. This broke in v0.9.0

## 0.9.11

### Minor Changes

- [#189](https://github.com/dimfeld/svelte-maplibre/pull/189) [`d070959`](https://github.com/dimfeld/svelte-maplibre/commit/d07095952d801dc24a9d5201dc3a60af96f41353) Thanks [@tjhorner](https://github.com/tjhorner)! - Add title attribute to ControlButton

## 0.9.10

### Patch Changes

- [#185](https://github.com/dimfeld/svelte-maplibre/pull/185) [`2a1fe13`](https://github.com/dimfeld/svelte-maplibre/commit/2a1fe1302f02a318b5ff8afa80a63535678a39c5) Thanks [@hmnd](https://github.com/hmnd)! - fix degraded performance with MarkerLayer
- [#186](https://github.com/dimfeld/svelte-maplibre/pull/186) [`484209f`](https://github.com/dimfeld/svelte-maplibre/commit/484209f2658512c460f37ecac310a08bb014c5a1) Thanks [@hmnd](https://github.com/hmnd)! - Fix types for Popup features and data

## 0.9.9

### Patch Changes

- [#180](https://github.com/dimfeld/svelte-maplibre/pull/180) [`9e999f1`](https://github.com/dimfeld/svelte-maplibre/commit/9e999f1e81691d7e187a92ddf304f457f49cea58) Thanks [@dimfeld](https://github.com/dimfeld)! - Add `draw-plugin.css` CSS file, which you can import to help with integrating the Mapbox Draw plugin

## 0.9.8

### Patch Changes

- [#178](https://github.com/dimfeld/svelte-maplibre/pull/178) [`6f8e10b`](https://github.com/dimfeld/svelte-maplibre/commit/6f8e10b4432e22a86d2c140bc4b7ab3b29043ea7) Thanks [@ADD-William-WaltersDavis](https://github.com/ADD-William-WaltersDavis)! - Add pmtiles support for raster url

## 0.9.7

### Patch Changes

- [#175](https://github.com/dimfeld/svelte-maplibre/pull/175) [`c857517`](https://github.com/dimfeld/svelte-maplibre/commit/c857517afa9516da50e4858f4d0e6aa4897e749b) Thanks [@dimfeld](https://github.com/dimfeld)! - Allow providing custom hash update function for better framework compatibility

## 0.9.6

### Patch Changes

- [#169](https://github.com/dimfeld/svelte-maplibre/pull/169) [`3af7f53`](https://github.com/dimfeld/svelte-maplibre/commit/3af7f536ff69665e19e48d25b4930fa155416bc6) Thanks [@dimfeld](https://github.com/dimfeld)! - Use easeTo so that simultaneous changes to center and zoom work properly

- [#169](https://github.com/dimfeld/svelte-maplibre/pull/169) [`3af7f53`](https://github.com/dimfeld/svelte-maplibre/commit/3af7f536ff69665e19e48d25b4930fa155416bc6) Thanks [@dimfeld](https://github.com/dimfeld)! - Handle changes in bearing and pitch

## 0.9.5

### Patch Changes

- [#173](https://github.com/dimfeld/svelte-maplibre/pull/173) [`2beda17`](https://github.com/dimfeld/svelte-maplibre/commit/2beda17e2c8348eeb7602441a871d97a5e65e6b3) Thanks [@ragone](https://github.com/ragone)! - Expose source attributes

## 0.9.4

### Minor Changes

- [#171](https://github.com/dimfeld/svelte-maplibre/pull/171) [`d968425`](https://github.com/dimfeld/svelte-maplibre/commit/d9684251e1d727393fa4b072160d6313b850d768) Thanks [@thijserven](https://github.com/thijserven)! - Exposed control value of GeolocateControl so you can do bind:control and access the root maplibre-gl functionalities from the outside.

## 0.9.3

### Minor Changes

- [#164](https://github.com/dimfeld/svelte-maplibre/pull/164) [`39371ee794f2a338c5760a840295af25964cfdec`](https://github.com/dimfeld/svelte-maplibre/commit/39371ee794f2a338c5760a840295af25964cfdec) Thanks [@larsmaxfield](https://github.com/larsmaxfield)! - Add 3D Terrain components and corresponding demo page

## 0.9.2

### Minor Changes

- [#161](https://github.com/dimfeld/svelte-maplibre/pull/161) [`90ddec8`](https://github.com/dimfeld/svelte-maplibre/commit/90ddec849b9cf57dcf7d4165d7437f6f52318409) Thanks [@dimfeld](https://github.com/dimfeld)! - Add MapEvents component that makes it easier to subscribe to map events from inside Map components

## 0.9.1

### Patch Changes

- [`efa0430`](https://github.com/dimfeld/svelte-maplibre/commit/efa04302841b32795172f06db4151d312d9bde39) Thanks [@dimfeld](https://github.com/dimfeld)! - Add Svelte 5 to peerDependencies

## 0.9.0

### Minor Changes

- [#159](https://github.com/dimfeld/svelte-maplibre/pull/159) [`23fb3ab`](https://github.com/dimfeld/svelte-maplibre/commit/23fb3abd4605406765126a720b5f35194197a10e) Thanks [@dimfeld](https://github.com/dimfeld)! - MapLibre component now exposes its `<div>` element on the `mapContainer` prop

- [#160](https://github.com/dimfeld/svelte-maplibre/pull/160) [`756a1ef`](https://github.com/dimfeld/svelte-maplibre/commit/756a1efecc726e0111faab59323f8f88fb916365) Thanks [@dimfeld](https://github.com/dimfeld)! - Update Marker and DefaultMarker to expose the internal `maplibregl.Marker` through the `marker` prop

- [#157](https://github.com/dimfeld/svelte-maplibre/pull/157) [`417d468`](https://github.com/dimfeld/svelte-maplibre/commit/417d468edcca782ce93c58e72d1412a927703a4d) Thanks [@dabreegster](https://github.com/dabreegster)! - Stop propagation of clicks on Markers

### Patch Changes

- [#156](https://github.com/dimfeld/svelte-maplibre/pull/156) [`1529801`](https://github.com/dimfeld/svelte-maplibre/commit/15298014bc258cc594745a82d7724201776887c2) Thanks [@singingwolfboy](https://github.com/singingwolfboy)! - improve TypeScript typings for DefaultMarker

## 0.8.5

### Patch Changes

- [#153](https://github.com/dimfeld/svelte-maplibre/pull/153) [`14b46a7`](https://github.com/dimfeld/svelte-maplibre/commit/14b46a784277d6ec43749c9024bb6d44310b8c3c) Thanks [@Tenchi2xh](https://github.com/Tenchi2xh)! - Added property to control antialiasing

## 0.8.4

### Patch Changes

- [#148](https://github.com/dimfeld/svelte-maplibre/pull/148) [`f39e1d6`](https://github.com/dimfeld/svelte-maplibre/commit/f39e1d677c7e25dba389cbc4328c45697cba27c5) Thanks [@singingwolfboy](https://github.com/singingwolfboy)! - Tell Typescript that features in MarkerLayer always have an id

## 0.8.3

### Patch Changes

- [#142](https://github.com/dimfeld/svelte-maplibre/pull/142) [`c22141a`](https://github.com/dimfeld/svelte-maplibre/commit/c22141a6282b5cc57dc67e7b6a104eba58412cb5) Thanks [@dabreegster](https://github.com/dabreegster)! - Update the viewport when the URL hash changes

## 0.8.2

### Minor Changes

- [#130](https://github.com/dimfeld/svelte-maplibre/pull/130) [`d464803`](https://github.com/dimfeld/svelte-maplibre/commit/d4648033ae95c45d7ace386a36c9a5fea33083e7) Thanks [@singingwolfboy](https://github.com/singingwolfboy)! - Add on:open and on:close events to Popup

### Patch Changes

- [#132](https://github.com/dimfeld/svelte-maplibre/pull/132) [`a66a3df`](https://github.com/dimfeld/svelte-maplibre/commit/a66a3dfee93bce54562439a5526384b017f7d53e) Thanks [@dimfeld](https://github.com/dimfeld)! - Reload images when the map style changes

## 0.8.1

### Patch Changes

- [#129](https://github.com/dimfeld/svelte-maplibre/pull/129) [`766f4ac`](https://github.com/dimfeld/svelte-maplibre/commit/766f4ace330a2cbec0db0ddd9c3bd33b5bdacb91) Thanks [@singingwolfboy](https://github.com/singingwolfboy)! - Fix typing for `map` prop in slot

## 0.8.0

### Major Changes

- [#128](https://github.com/dimfeld/svelte-maplibre/pull/128) [`802474a`](https://github.com/dimfeld/svelte-maplibre/commit/802474ad25d5e719e0f3150b2075d8eba56c9d6f) Thanks [@dimfeld](https://github.com/dimfeld)! - Support maplibre v4

  All the breaking changes in the MaplibreGL JS v4 release apply here. Some specific API changes to this package:

  - Upgrade maplibregl-js to ^4.0.0
  - Upgrade pmtiles to ^3.0.3
  - `cooperativeGestures` prop is now just a boolean to match maplibre v4.
  - Add `locale` property to MapLibre component.
  - Add `opacity` property for Markers

## 0.7.7

### Patch Changes

- [#123](https://github.com/dimfeld/svelte-maplibre/pull/123) [`b97d4c5`](https://github.com/dimfeld/svelte-maplibre/commit/b97d4c59097a64827b849841489959518e223059) Thanks [@dimfeld](https://github.com/dimfeld)! - Explicitly unsubscribe from events in Layer to avoid race condition between Layer and containing Source being torn down

- [#123](https://github.com/dimfeld/svelte-maplibre/pull/123) [`b97d4c5`](https://github.com/dimfeld/svelte-maplibre/commit/b97d4c59097a64827b849841489959518e223059) Thanks [@dimfeld](https://github.com/dimfeld)! - Properly remove Popup if it is open when the Popup component is destroyed

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
