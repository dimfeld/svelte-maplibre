<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { createMapContext } from './context.js';
  import { Map, type LngLatBoundsLike, type LngLatLike } from 'maplibre-gl';
  import compare from 'just-compare';
  import 'maplibre-gl/dist/maplibre-gl.css';

  export let map: Map | null = null;
  let classNames: string | undefined = undefined;
  export { classNames as class };
  export let center: LngLatLike = [0, 0];
  export let zoom = 1;
  export let bounds: LngLatBoundsLike | undefined = undefined;
  export let loaded = false;
  export let minZoom = 0;
  export let maxZoom = 22;
  export let interactive = true;
  /** Set to true if you want to export the map as an image */
  export let preserveDrawingBuffer = false;
  export let maxBounds: LngLatBoundsLike | undefined = undefined;

  const dispatch = createEventDispatcher();

  const { map: mapInstance } = createMapContext();
  $: map = $mapInstance;

  function createMap(element: HTMLDivElement) {
    $mapInstance = new Map({
      container: element,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center,
      zoom,
      minZoom,
      maxZoom,
      interactive,
      preserveDrawingBuffer,
      maxBounds,
      bounds,
    });

    $mapInstance.on('load', (e) => {
      loaded = true;
      dispatch('load', { map: $mapInstance });
    });

    $mapInstance.on('movestart', (ev) => dispatch('movestart', { ...ev, map: $mapInstance }));
    $mapInstance.on('moveend', (ev) => {
      center = ev.target.getCenter();
      zoom = ev.target.getZoom();
      bounds = ev.target.getBounds();
      dispatch('moveend', { ...ev, map: $mapInstance });
    });

    $mapInstance.on('zoomstart', (ev) => dispatch('zoomstart', { ...ev, map: $mapInstance }));
    $mapInstance.on('zoomend', (ev) => {
      zoom = ev.target.getZoom();
      dispatch('zoomend', { ...ev, map: $mapInstance });
    });

    return {
      destroy() {
        $mapInstance?.remove();
        $mapInstance = null;
      },
    };
  }

  $: if (center && !compare(center, $mapInstance?.getCenter())) $mapInstance?.panTo(center);
  $: if (zoom && !compare(zoom, $mapInstance?.getZoom())) $mapInstance?.zoomTo(zoom);
  $: if (bounds && !compare(bounds, $mapInstance?.getBounds())) $mapInstance?.fitBounds(bounds);
</script>

<div class={classNames} use:createMap>
  {#if $mapInstance && loaded}
    <slot />
  {/if}
</div>

<style>
  div {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
</style>
