<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { createMapContext } from './context.js';
  import maplibre, { type LngLatBoundsLike, type LngLatLike } from 'maplibre-gl';
  import compare from 'just-compare';
  import 'maplibre-gl/dist/maplibre-gl.css';
  import type { CustomImageSpec } from './types.js';
  import NavigationControl from './NavigationControl.svelte';
  import GeolocateControl from './GeolocateControl.svelte';
  import FullscreenControl from './FullscreenControl.svelte';
  import ScaleControl from './ScaleControl.svelte';

  export let map: maplibregl.Map | null = null;
  let classNames: string | undefined = undefined;
  export { classNames as class };
  /** The style to use for the map. */
  export let style: string | maplibregl.StyleSpecification;
  export let center: LngLatLike = [0, 0];
  export let zoom = 1;
  export let pitch = 0;
  export let bearing = 0;
  export let bounds: LngLatBoundsLike | undefined = undefined;
  export let loaded = false;
  export let minZoom = 0;
  export let maxZoom = 22;
  export let interactive = true;
  /** Set false to hide the default attribution control, so you can add your own. */
  export let attributionControl = true;
  /** Set to true if you want to export the map as an image */
  export let preserveDrawingBuffer = false;
  export let maxBounds: LngLatBoundsLike | undefined = undefined;
  /** Custom images to load into the map. */
  export let images: CustomImageSpec[] = [];
  /** Set to true or a position to add all the standard controls. */
  export let standardControls: boolean | maplibregl.ControlPosition = false;
  /** Filter the map's builtin layers, hiding any for which this function returns false. */
  export let filterLayers: ((layer: maplibregl.LayerSpecification) => boolean) | undefined =
    undefined;

  /** Function that modifies requests, such as by adding an API key. **/
  export let transformRequest: maplibregl.RequestTransformFunction | undefined = undefined;

  $: standardControlsPosition =
    typeof standardControls === 'boolean' ? undefined : standardControls;

  const dispatch = createEventDispatcher<{
    load: maplibregl.Map;
    error: Error;
    movestart: maplibregl.MapMouseEvent & { map: maplibregl.Map };
    moveend: maplibregl.MapMouseEvent & { map: maplibregl.Map };
    zoomstart: maplibregl.MapLibreZoomEvent & { map: maplibregl.Map };
    zoom: maplibregl.MapLibreZoomEvent & { map: maplibregl.Map };
    zoomend: maplibregl.MapLibreZoomEvent & { map: maplibregl.Map };
    styledata: maplibregl.MapStyleDataEvent & { map: maplibregl.Map };
  }>();

  const { map: mapInstance, loadedImages } = createMapContext();
  $: map = $mapInstance;

  let loadingImages = new Set();
  function loadImage(image: CustomImageSpec) {
    if (!$mapInstance?.loaded()) {
      return;
    }

    if ('url' in image) {
      loadingImages.add(image.id);
      $mapInstance.loadImage(image.url, (error, imageData) => {
        loadingImages.delete(image.id);
        if (error) {
          dispatch('error', error);
        } else if (imageData) {
          $mapInstance?.addImage(image.id, imageData, image.options);
          $loadedImages.add(image.id);
          $loadedImages = $loadedImages; // trigger reactivity
        }
      });
    } else {
      $mapInstance.addImage(image.id, image.data, image.options);
      $loadedImages.add(image.id);
      $loadedImages = $loadedImages; // trigger reactivity
    }
  }

  $: if (loaded && $mapInstance?.loaded()) {
    for (let image of images) {
      if (!loadingImages.has(image.id) && !$mapInstance.hasImage(image.id)) {
        loadImage(image);
      }
    }
  }

  $: allImagesLoaded = images.every((image) => $loadedImages.has(image.id));

  function createMap(element: HTMLDivElement) {
    $mapInstance = new maplibre.Map({
      container: element,
      style,
      center,
      zoom,
      pitch,
      bearing,
      minZoom,
      maxZoom,
      interactive,
      preserveDrawingBuffer,
      maxBounds,
      bounds,
      attributionControl,
      transformRequest,
    });

    $mapInstance.on('load', (e) => {
      loaded = true;
      dispatch('load', $mapInstance);
    });

    $mapInstance.on('error', (e) => dispatch('error', { ...e, map: $mapInstance }));

    $mapInstance.on('movestart', (ev) => dispatch('movestart', { ...ev, map: $mapInstance }));
    $mapInstance.on('moveend', (ev) => {
      center = ev.target.getCenter();
      zoom = ev.target.getZoom();
      bounds = ev.target.getBounds();
      dispatch('moveend', { ...ev, map: $mapInstance });
    });

    $mapInstance.on('zoomstart', (ev) => dispatch('zoomstart', { ...ev, map: $mapInstance }));
    $mapInstance.on('zoom', (ev) => {
      zoom = ev.target.getZoom();
      dispatch('zoom', { ...ev, map: $mapInstance });
    });
    $mapInstance.on('zoomend', (ev) => {
      zoom = ev.target.getZoom();
      dispatch('zoomend', { ...ev, map: $mapInstance });
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

  $: if (center && !compare(center, $mapInstance?.getCenter())) $mapInstance?.panTo(center);
  $: if (zoom && !compare(zoom, $mapInstance?.getZoom())) $mapInstance?.zoomTo(zoom);
  $: if (bounds && !compare(bounds, $mapInstance?.getBounds())) $mapInstance?.fitBounds(bounds);
</script>

<div class={classNames} class:expand-map={!classNames} use:createMap>
  {#if $mapInstance && loaded}
    {#if standardControls}
      <NavigationControl position={standardControlsPosition} />
      <GeolocateControl position={standardControlsPosition} fitBoundsOptions={{ maxZoom: 12 }} />
      <FullscreenControl position={standardControlsPosition} />
      <ScaleControl position={standardControlsPosition} />
    {/if}
    <slot map={$mapInstance} loadedImages={$loadedImages} {allImagesLoaded} />
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
