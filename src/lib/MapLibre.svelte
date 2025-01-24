<script lang="ts">
  import { flush } from '$lib/flush.js';
  import { Box, createMapContext, setLayerEvent } from './context.svelte.js';
  import { getViewportHash, parseViewportHash } from './hash.js';
  import maplibre, {
    type CenterZoomBearing,
    type LayerSpecification,
    type LngLatBoundsLike,
    type LngLatLike,
    type SourceSpecification,
  } from 'maplibre-gl';
  import compare from 'just-compare';
  import 'maplibre-gl/dist/maplibre-gl.css';
  import type { CustomImageSpec, MapMoveEvent } from './types.js';
  import NavigationControl from './NavigationControl.svelte';
  import GeolocateControl from './GeolocateControl.svelte';
  import FullscreenControl from './FullscreenControl.svelte';
  import ScaleControl from './ScaleControl.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    map?: maplibregl.Map;
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
    bearingSnap?: number;
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
    minPitch?: number;
    maxPitch?: number;
    renderWorldCopies?: boolean;
    dragPan?: boolean;
    dragRotate?: boolean;
    pitchWithRotate?: boolean;
    antialias?: boolean;
    zoomOnDoubleClick?: boolean;
    /** Override MapLibre's default locale table */
    locale?: any;
    interactive?: boolean;
    /** Set false to hide the default attribution control, so you can add your own. */
    attributionControl?: false | maplibre.AttributionControlOptions;
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
    children?: Snippet<
      [
        {
          map: maplibregl.Map;
          loadedImages: Set<string>;
          allImagesLoaded: boolean;
        },
      ]
    >;

    onload?: (map: maplibregl.Map) => void;
    onerror?: (error: Partial<ErrorEvent>) => void;
    onclick?: (e: maplibregl.MapMouseEvent) => void;
    ondblclick?: (e: maplibregl.MapMouseEvent) => void;
    onmousemove?: (e: maplibregl.MapMouseEvent) => void;
    oncontextmenu?: (e: maplibregl.MapMouseEvent) => void;
    onmovestart?: (e: MapMoveEvent) => void;
    onmoveend?: (e: MapMoveEvent) => void;
    onzoomstart?: (e: maplibregl.MapLibreZoomEvent) => void;
    onzoom?: (e: maplibregl.MapLibreZoomEvent) => void;
    onzoomend?: (e: maplibregl.MapLibreZoomEvent) => void;
    onpitch?: (e: maplibregl.MapLibreEvent<MouseEvent | TouchEvent | undefined>) => void;
    onrotate?: (e: maplibregl.MapLibreEvent<MouseEvent | TouchEvent | undefined>) => void;
    onwheel?: (e: maplibregl.MapWheelEvent) => void;
    ondata?: (e: maplibregl.MapDataEvent) => void;
    onstyledata?: (e: maplibregl.MapStyleDataEvent) => void;
    onidle?: (e: maplibregl.MapLibreEvent) => void;
  }

  let {
    map = $bindable(undefined),
    mapContainer = $bindable(undefined),
    class: classNames = undefined,
    style,
    diffStyleUpdates = false,
    center = $bindable(undefined),
    zoom = $bindable(undefined),
    pitch = $bindable(0),
    bearing = $bindable(0),
    bearingSnap = 7,
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
    attributionControl = undefined,
    cooperativeGestures = false,
    preserveDrawingBuffer = false,
    maxBounds = undefined,
    images = [],
    standardControls = false,
    filterLayers = undefined,
    transformRequest = undefined,
    children,

    onload,
    onerror,
    onclick,
    ondblclick,
    onmousemove,
    oncontextmenu,
    onmovestart,
    onmoveend,
    onzoomstart,
    onzoom,
    onzoomend,
    onpitch,
    onrotate,
    onwheel,
    ondata,
    onstyledata,
    onidle,
  }: Props = $props();

  let standardControlsPosition = $derived(
    typeof standardControls === 'boolean' ? undefined : standardControls
  );

  const mapContext = createMapContext();
  setLayerEvent(new Box(undefined));

  let loadingImages = $state(new Set());
  async function loadImage(image: CustomImageSpec, force = false) {
    if (!map) {
      return;
    }

    if (!map?.loaded() && !force) {
      return;
    }

    if ('url' in image) {
      loadingImages.add(image.id);
      try {
        let imageData = await map.loadImage(image.url);
        map.addImage(image.id, imageData.data, image.options);
        mapContext.loadedImages.add(image.id);
      } catch (e) {
        if (onerror) {
          onerror({ error: e as Error });
        } else {
          console.error(e);
        }
      } finally {
        loadingImages.delete(image.id);
      }
    } else {
      map.addImage(image.id, image.data, image.options);
      mapContext.loadedImages.add(image.id);
    }
  }

  $effect(() => {
    if (loaded && map?.loaded()) {
      for (let image of images) {
        if (
          !mapContext.loadedImages.has(image.id) &&
          !loadingImages.has(image.id) &&
          !map.hasImage(image.id)
        ) {
          loadImage(image);
        }
      }
    }
  });

  let allImagesLoaded = $derived(images.every((image) => mapContext.loadedImages.has(image.id)));

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

  function handleError(event: ErrorEvent) {
    if (onerror) {
      onerror(event);
    } else if (event.error.name !== 'AbortError') {
      // If there's no error handler, just log it to match the default behavior from MapLibre.
      // But skip AbortError since that's a normal thing that happens inside certain sources,
      // and not useful to log.
      console.error(event.error);
    }
  }

  function createMap(element: HTMLDivElement) {
    onHashChange();

    map = mapContext.map = new maplibre.Map(
      flush({
        container: element,
        style,
        locale,
        center,
        zoom,
        pitch,
        bearing,
        bearingSnap,
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

    map.on('load', (e) => {
      e.target.getContainer().setAttribute('data-testid', 'map');
      e.target.getCanvas().setAttribute('data-testid', 'map-canvas');
      if (onload) {
        onload(map!);
      }

      mapContext.loaded = true;
      loaded = true;
    });

    map.on('error', handleError);

    if (onmovestart) {
      map.on('movestart', onmovestart);
    }

    map.on('moveend', (ev) => {
      center = ev.target.getCenter();
      zoom = ev.target.getZoom();
      pitch = ev.target.getPitch();
      bearing = ev.target.getBearing();
      bounds = ev.target.getBounds();
      onmoveend?.(ev);
      if (hash) {
        let location = new URL(window.location.href.replace(/(#.+)?$/, getViewportHash(ev.target)));
        updateHash(location);
      }
    });

    if (onclick) {
      map.on('click', onclick);
    }
    if (ondblclick) {
      map.on('dblclick', ondblclick);
    }
    if (oncontextmenu) {
      map.on('contextmenu', oncontextmenu);
    }
    if (onmousemove) {
      map.on('mousemove', onmousemove);
    }
    if (onzoomstart) {
      map.on('zoomstart', onzoomstart);
    }
    if (onzoom) {
      map.on('zoom', onzoom);
    }
    if (onzoomend) {
      map.on('zoomend', onzoomend);
    }
    if (onpitch) {
      map.on('pitch', onpitch);
    }
    if (onrotate) {
      map.on('rotate', onrotate);
    }
    if (onwheel) {
      map.on('wheel', onwheel);
    }
    if (ondata) {
      map.on('data', ondata);
    }
    if (onidle) {
      map.on('idle', onidle);
    }

    // When the basemap style is changed, it nukes all existing layers and sources
    // Here we listen for style.load events, store the layers and sources that
    // have come from the new basemap style and then add back in any layers and
    // styles that where added by the user as sub elements

    map.on('style.load', () => {
      if (map) {
        const mapStyle = map.getStyle();
        lastStyleLayerIds = mapStyle.layers.map((l) => l.id);
        lastStyleSourceIds = Object.keys(mapStyle.sources);
        if (sourcesToReAddAfterStyleChange) {
          for (const [id, source] of Object.entries(sourcesToReAddAfterStyleChange)) {
            map.addSource(id, source);
          }
        }
        if (layersToReAddAfterStyleChange) {
          for (const layer of layersToReAddAfterStyleChange) {
            map.addLayer(layer);
          }
        }

        // Need to reload images as well when the style is changed.
        for (const image of images) {
          // Force the image to reload, since when this runs map.loaded() == false
          // but it's actually safe to do so.
          loadImage(image, true);
        }
      }
    });

    map.on('styledata', (ev) => {
      if (map && filterLayers) {
        const layers = map.getStyle().layers;
        if (layers) {
          for (let layer of layers) {
            if (!filterLayers(layer)) {
              map.setLayoutProperty(layer.id, 'visibility', 'none');
            }
          }
        }
      }

      onstyledata?.(ev);
    });

    return {
      destroy() {
        loaded = false;
        mapContext.loaded = false;
        map?.remove();
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
    if (map && !compare(style, lastStyle)) {
      const oldMapStyle = map.getStyle();

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
      map.setStyle(style, { diff: diffStyleUpdates });

      // Changing the style unloads the images. We'll reload them after the map finishes loading the new style.
      mapContext.loadedImages.clear();
      loadingImages = new Set();
    }
  });

  $effect(() => {
    if (map) {
      let options: CenterZoomBearing & { pitch?: number } = {};
      if (center != null && !compare(center, map.getCenter())) {
        options.center = center;
      }

      if (zoom != null && !compare(zoom, map.getZoom())) {
        options.zoom = zoom;
      }

      if (bearing != null && !compare(bearing, map.getBearing())) {
        options.bearing = bearing;
      }

      if (pitch != null && !compare(pitch, map.getPitch())) {
        options.pitch = pitch;
      }

      if (Object.keys(options).length) {
        map.easeTo(options);
      }
    }
  });

  $effect(() => {
    if (bounds && !compare(bounds, map?.getBounds())) map?.fitBounds(bounds);
  });
  $effect(() => {
    zoomOnDoubleClick ? map?.doubleClickZoom.enable() : map?.doubleClickZoom.disable();
  });

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
  {#if map && loaded}
    {#if standardControls}
      <NavigationControl position={standardControlsPosition} />
      <GeolocateControl position={standardControlsPosition} fitBoundsOptions={{ maxZoom: 12 }} />
      <FullscreenControl position={standardControlsPosition} />
      <ScaleControl position={standardControlsPosition} />
    {/if}
    {@render children?.({
      map,
      loadedImages: mapContext.loadedImages,
      allImagesLoaded,
    })}
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
