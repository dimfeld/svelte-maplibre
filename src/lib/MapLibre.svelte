<script lang="ts">
  import flush from 'just-flush';
  import { createEventDispatcher } from 'svelte';
  import { createMapContext } from './context.js';
  import { getViewportHash, parseViewportHash } from './hash.js';
  import maplibre, {
    type CenterZoomBearing,
    type GestureOptions,
    type LayerSpecification,
    type LngLatBoundsLike,
    type LngLatLike,
    type SourceSpecification,
  } from 'maplibre-gl';
  import compare from 'just-compare';
  import 'maplibre-gl/dist/maplibre-gl.css';
  import type { CustomImageSpec } from './types.js';
  import NavigationControl from './NavigationControl.svelte';
  import GeolocateControl from './GeolocateControl.svelte';
  import FullscreenControl from './FullscreenControl.svelte';
  import ScaleControl from './ScaleControl.svelte';

  interface Props {
    map?: maplibregl.Map | null;
    /** The `div` element that the Map is placed into. You can bind to this prop to access the element for yourself.
     * Setting it externally will have no effect. */
    mapContainer?: HTMLDivElement | undefined;
    class?: string | undefined;
    /** The style to use for the map. */
    style: string | maplibregl.StyleSpecification;
    /** Tell MapLibre to update the map in place when changing the style, diffing the old style against the new one to
     * make minimal changes. If you enable this, be aware of https://github.com/maplibre/maplibre-gl-js/issues/2651,
     * which may prevent some style changes from becoming visible when diffing is enabled. */
    diffStyleUpdates?: boolean;
    center?: LngLatLike | undefined;
    zoom?: number | undefined;
    pitch?: number;
    bearing?: number;
    bounds?: LngLatBoundsLike | undefined;
    /** Set to true to track the map viewport in the URL hash. If the URL hash is set, that overrides initial viewport settings. */
    hash?: boolean;
    /** Update the URL when the hash changes, if `hash` is true.
     * The default behavior uses `window.history.replaceState`. For SvelteKit, you should
     *  `import { replaceState } from '$app/navigation';` and pass something like
     *  `updateHash={(u) => replaceState(u, $page.state)}` when instantiating the map.
     */
    updateHash?: (url: URL) => void;
    loaded?: boolean;
    minZoom?: number;
    maxZoom?: number;
    minPitch?: number | undefined;
    maxPitch?: number | undefined;
    renderWorldCopies?: boolean | undefined;
    dragPan?: boolean | undefined;
    dragRotate?: boolean | undefined;
    pitchWithRotate?: boolean | undefined;
    antialias?: boolean | undefined;
    zoomOnDoubleClick?: boolean;
    /** Override MapLibre's default locale table */
    locale?: any;
    interactive?: boolean;
    /** Set false to hide the default attribution control, so you can add your own. */
    attributionControl?: boolean;
    /** Set true to require hitting ⌘/Ctrl while scrolling to zoom. Or use two fingers on phones. */
    cooperativeGestures?: boolean;
    /** Set to true if you want to export the map as an image */
    preserveDrawingBuffer?: boolean;
    maxBounds?: LngLatBoundsLike | undefined;
    /** Custom images to load into the map. */
    images?: CustomImageSpec[];
    /** Set to true or a position to add all the standard controls. */
    standardControls?: boolean | maplibregl.ControlPosition;
    /** Filter the map's builtin layers, hiding any for which this function returns false. */
    filterLayers?: ((layer: maplibregl.LayerSpecification) => boolean) | undefined;
    /** Function that modifies requests, such as by adding an API key. **/
    transformRequest?: maplibregl.RequestTransformFunction | undefined;
    children?: import('svelte').Snippet<[any]>;
  }

  let {
    map = $bindable(null),
    mapContainer = $bindable(undefined),
    class: classNames = undefined,
    style,
    diffStyleUpdates = false,
    center = $bindable(undefined),
    zoom = $bindable(undefined),
    pitch = $bindable(0),
    bearing = $bindable(0),
    bounds = $bindable(undefined),
    hash = false,
    updateHash = (url) => {
      window.history.replaceState(window.history.state, '', url);
    },
    loaded = $bindable(false),
    minZoom = 0,
    maxZoom = 22,
    minPitch = 0,
    maxPitch = 60,
    renderWorldCopies = undefined,
    dragPan = undefined,
    dragRotate = undefined,
    pitchWithRotate = undefined,
    antialias = undefined,
    zoomOnDoubleClick = true,
    locale = undefined,
    interactive = true,
    attributionControl = true,
    cooperativeGestures = false,
    preserveDrawingBuffer = false,
    maxBounds = undefined,
    images = [],
    standardControls = false,
    filterLayers = undefined,
    transformRequest = undefined,
    children,
  }: Props = $props();

  let standardControlsPosition = $derived(
    typeof standardControls === 'boolean' ? undefined : standardControls
  );

  const dispatch = createEventDispatcher<{
    load: maplibregl.Map;
    error: Error;
    click: maplibregl.MapMouseEvent & { map: maplibregl.Map };
    dblclick: maplibregl.MapMouseEvent & { map: maplibregl.Map };
    contextmenu: maplibregl.MapMouseEvent & { map: maplibregl.Map };
    movestart: maplibregl.MapMouseEvent & { map: maplibregl.Map };
    moveend: maplibregl.MapMouseEvent & { map: maplibregl.Map };
    zoomstart: maplibregl.MapLibreZoomEvent & { map: maplibregl.Map };
    zoom: maplibregl.MapLibreZoomEvent & { map: maplibregl.Map };
    zoomend: maplibregl.MapLibreZoomEvent & { map: maplibregl.Map };
    styledata: maplibregl.MapStyleDataEvent & { map: maplibregl.Map };
  }>();

  const { map: mapInstance, loadedImages } = createMapContext();
  $effect(() => {
    map = $mapInstance;
  });

  let loadingImages = $state(new Set());
  async function loadImage(image: CustomImageSpec, force = false) {
    if (!$mapInstance) {
      return;
    }

    if (!$mapInstance.loaded() && !force) {
      return;
    }

    if ('url' in image) {
      loadingImages.add(image.id);
      try {
        let imageData = await $mapInstance.loadImage(image.url);
        $mapInstance?.addImage(image.id, imageData.data, image.options);
        $loadedImages.add(image.id);
        $loadedImages = $loadedImages; // trigger reactivity
      } catch (e) {
        dispatch('error', e as Error);
      } finally {
        loadingImages.delete(image.id);
      }
    } else {
      $mapInstance.addImage(image.id, image.data, image.options);
      $loadedImages.add(image.id);
      $loadedImages = $loadedImages; // trigger reactivity
    }
  }

  $effect(() => {
    if (loaded && $mapInstance?.loaded()) {
      for (let image of images) {
        if (
          !$loadedImages.has(image.id) &&
          !loadingImages.has(image.id) &&
          !$mapInstance.hasImage(image.id)
        ) {
          loadImage(image);
        }
      }
    }
  });

  let allImagesLoaded = $derived(images.every((image) => $loadedImages.has(image.id)));

  // These variables are used to keep track of what sources / layers
  // are part of the basemap style vs those that are part of the
  // user defined sources and layers. This is so we can reconstruct the
  // user defined sources and layers after a basemap style change which
  // overwrites all previous sources and layers

  let lastStyleLayerIds: Array<string> | undefined = $state(undefined);
  let lastStyleSourceIds: Array<string> | undefined = $state(undefined);
  let layersToReAddAfterStyleChange: Array<LayerSpecification> | undefined = $state(undefined);
  let sourcesToReAddAfterStyleChange: Record<string, SourceSpecification> | undefined =
    $state(undefined);

  function createMap(element: HTMLDivElement) {
    onHashChange();

    $mapInstance = new maplibre.Map(
      flush({
        container: element,
        style,
        locale,
        center,
        zoom,
        pitch,
        bearing,
        minZoom,
        maxZoom,
        minPitch,
        maxPitch,
        renderWorldCopies,
        dragPan,
        dragRotate,
        pitchWithRotate,
        antialias,
        interactive,
        preserveDrawingBuffer,
        maxBounds,
        bounds,
        attributionControl,
        transformRequest,
        cooperativeGestures,
      })
    );

    $mapInstance.on('load', (e) => {
      e.target.getContainer().setAttribute('data-testid', 'map');
      e.target.getCanvas().setAttribute('data-testid', 'map-canvas');
      loaded = true;
      dispatch('load', $mapInstance!);
    });

    $mapInstance.on('error', (e) => dispatch('error', { ...e, map: $mapInstance }));

    $mapInstance.on('movestart', (ev) => dispatch('movestart', { ...ev, map: $mapInstance }));
    $mapInstance.on('moveend', (ev) => {
      center = ev.target.getCenter();
      zoom = ev.target.getZoom();
      pitch = ev.target.getPitch();
      bearing = ev.target.getBearing();
      bounds = ev.target.getBounds();
      dispatch('moveend', { ...ev, map: $mapInstance });
      if (hash) {
        let location = new URL(
          window.location.href.replace(/(#.+)?$/, getViewportHash($mapInstance))
        );
        updateHash(location);
      }
    });

    $mapInstance.on('click', (ev) => dispatch('click', { ...ev, map: $mapInstance }));
    $mapInstance.on('dblclick', (ev) => dispatch('dblclick', { ...ev, map: $mapInstance }));
    $mapInstance.on('contextmenu', (ev) => dispatch('contextmenu', { ...ev, map: $mapInstance }));
    $mapInstance.on('zoomstart', (ev) => dispatch('zoomstart', { ...ev, map: $mapInstance }));
    $mapInstance.on('zoom', (ev) => {
      dispatch('zoom', { ...ev, map: $mapInstance });
    });
    $mapInstance.on('zoomend', (ev) => {
      dispatch('zoomend', { ...ev, map: $mapInstance });
    });

    // When the basemap style is changed, it nukes all existing layers and sources
    // Here we listen for style.load events, store the layers and sources that
    // have come from the new basemap style and then add back in any layers and
    // styles that where added by the user as sub elements

    $mapInstance.on('style.load', () => {
      if ($mapInstance) {
        const mapStyle = $mapInstance.getStyle();
        lastStyleLayerIds = mapStyle.layers.map((l) => l.id);
        lastStyleSourceIds = Object.keys(mapStyle.sources);
        if (sourcesToReAddAfterStyleChange) {
          for (const [id, source] of Object.entries(sourcesToReAddAfterStyleChange)) {
            $mapInstance.addSource(id, source);
          }
        }
        if (layersToReAddAfterStyleChange) {
          for (const layer of layersToReAddAfterStyleChange) {
            $mapInstance.addLayer(layer);
          }
        }

        // Need to reload images as well when the style is changed.
        for (const image of images) {
          // Force the image to reload, since when this runs $mapInstance.loaded() == false
          // but it's actually safe to do so.
          loadImage(image, true);
        }
      }
    });

    $mapInstance.on('styledata', (ev) => {
      if ($mapInstance && filterLayers) {
        const layers = $mapInstance.getStyle().layers;
        if (layers) {
          for (let layer of layers) {
            if (!filterLayers(layer)) {
              $mapInstance.setLayoutProperty(layer.id, 'visibility', 'none');
            }
          }
        }
      }

      dispatch('styledata', { ...ev, map: $mapInstance });
    });

    return {
      destroy() {
        loaded = false;
        $mapInstance?.remove();
        $mapInstance = null;
      },
    };
  }

  let lastStyle = $state(style);

  // If the last style is different from the current one
  // we grab a list of the currrent layers and sources
  // compare this with the stored list of layer and source ids
  // to pick out the layers / sources which are not part of the current
  // basemaps.
  // We then update the style which will trigger the style.load event on
  // map which will in turn add the user defined sources and layers back
  // on to the map

  $effect(() => {
    if ($mapInstance && !compare(style, lastStyle)) {
      const oldMapStyle = $mapInstance.getStyle();

      if (lastStyleLayerIds) {
        layersToReAddAfterStyleChange = oldMapStyle.layers.filter(
          (l) => !lastStyleLayerIds!.includes(l.id)
        );
      }
      if (lastStyleSourceIds) {
        const nonStyleSourceIds = Object.keys(oldMapStyle.sources).filter(
          (sourceId) => !lastStyleSourceIds!.includes(sourceId)
        );
        sourcesToReAddAfterStyleChange = {};
        for (const id of nonStyleSourceIds) {
          sourcesToReAddAfterStyleChange[id] = oldMapStyle.sources[id];
        }
      }
      lastStyle = style;
      $mapInstance.setStyle(style, { diff: diffStyleUpdates });

      // Changing the style unloads the images. We'll reload them after the map finishes loading the new style.
      $loadedImages = new Set();
      loadingImages = new Set();
    }
  });

  $effect(() => {
    if ($mapInstance) {
      let options: CenterZoomBearing & { pitch?: number } = {};
      if (center != null && !compare(center, $mapInstance?.getCenter())) {
        options.center = center;
      }

      if (zoom != null && !compare(zoom, $mapInstance?.getZoom())) {
        options.zoom = zoom;
      }

      if (bearing != null && !compare(bearing, $mapInstance?.getBearing())) {
        options.bearing = bearing;
      }

      if (pitch != null && !compare(pitch, $mapInstance?.getPitch())) {
        options.pitch = pitch;
      }

      if (Object.keys(options).length) {
        $mapInstance.easeTo(options);
      }
    }
  });

  $effect(() => {
    if (bounds && !compare(bounds, $mapInstance?.getBounds())) $mapInstance?.fitBounds(bounds);
  });
  $effect(() => {
    zoomOnDoubleClick
      ? $mapInstance?.doubleClickZoom.enable()
      : $mapInstance?.doubleClickZoom.disable();
  });

  // https://github.com/dummdidumm/rfcs/blob/ts-typedefs-within-svelte-components/text/ts-typing-props-slots-events.md#typing-slots
  interface $$Slots {
    default: {
      // `map` is always a MaplibreMap, never `null`
      map: maplibregl.Map;
      // the other slot props are correctly autodetected
      loadedImages: Set<string>;
      allImagesLoaded: boolean;
    };
  }

  function onHashChange() {
    if (hash) {
      let parts = parseViewportHash(window.location.hash);
      if (parts.length >= 3) {
        zoom = parts[0];
        center = [parts[2], parts[1]];
      }
      if (parts.length == 5) {
        bearing = parts[3];
        pitch = parts[4];
      }
    }
  }
</script>

<svelte:window onhashchange={onHashChange} />

<div
  class={classNames}
  bind:this={mapContainer}
  class:expand-map={!classNames}
  use:createMap
  data-testid="map-container"
>
  {#if $mapInstance && loaded}
    {#if standardControls}
      <NavigationControl position={standardControlsPosition} />
      <GeolocateControl position={standardControlsPosition} fitBoundsOptions={{ maxZoom: 12 }} />
      <FullscreenControl position={standardControlsPosition} />
      <ScaleControl position={standardControlsPosition} />
    {/if}
    {@render children?.({ map: $mapInstance, loadedImages: $loadedImages, allImagesLoaded })}
  {/if}
</div>

<style>
  .expand-map {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
</style>
