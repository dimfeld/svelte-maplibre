---
'svelte-maplibre': major
---

Support maplibre-gl 6. The required `maplibre-gl` version is now `^6.0.0`; versions 4 and 5 are no longer supported.

MapLibre 6 is ESM-only and drops its default export, so internal imports switched to namespace imports. It also no longer resolves its own worker URL once a bundler has rewritten the module graph, so `MapLibre` now calls `setWorkerUrl()` with a Vite-bundled worker before creating the map (skipped if you already called `setWorkerUrl()` yourself).

Breaking changes to this library's own API:

- `StyleLoadEvent` is now an alias for MapLibre's `MapStyleLoadEvent`. It no longer has `map` and `style` properties — those never existed at runtime — and carries `target` instead.
- The `zoomstart`, `zoom`, `zoomend`, `pitch` and `rotate` handlers on `MapLibre` and `MapEvents` now receive `MapMovementEvent`. They were previously typed as `MapLibreZoomEvent`, which MapLibre 6 renamed to `MapBoxZoomEvent` and which only ever described box-zoom events.
- The `data` handler on `MapLibre` and `MapEvents` now receives `MapSourceDataEvent | MapStyleDataEvent`; `MapDataEvent` was removed from MapLibre.
- `Popup`'s `onhover` prop was removed. It listened for a `hover` event that MapLibre's `Popup` never fires, so it never ran. Use `openOn="hover"` with `onopen`.
- `Layer`'s `paint` and `layout` props are typed as `AllPaintProperties` / `AllLayoutProperties` instead of `object`, following MapLibre 6's typed `setPaintProperty` / `setLayoutProperty`.
- `RasterDEMTileSource`'s `encoding` prop is typed as `RasterDEMSourceSpecification['encoding']`, since MapLibre does not export `DEMEncoding`.

New in this release:

- `MapLibre` accepts a `zoomLevelsToOverscale` prop. MapLibre 6 changed this option's default to 4, which splits vector tiles above a source's `maxzoom` rather than overscaling them; that improves labeling but slightly alters rendering and `queryRenderedFeatures` results. Pass `null` to overscale at every zoom level, as MapLibre 5 did.
