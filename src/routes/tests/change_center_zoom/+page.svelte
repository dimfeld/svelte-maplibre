<script lang="ts">
  import type { LngLatLike, MapMouseEvent } from 'maplibre-gl';
  import MapLibre from '$lib/MapLibre.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';

  let coords = [
    {
      center: [116, -34],
      zoom: 8,
      pitch: 30,
      bearing: 30,
    },
    {
      center: [-107, 40],
      zoom: 3,
      pitch: 0,
      bearing: 210,
    },
  ] as { center: [number, number]; zoom: number; pitch: number; bearing: number }[];

  let center: LngLatLike = coords[0].center;
  let zoom = coords[0].zoom;
  let bearing = coords[0].bearing;
  let pitch = coords[0].pitch;

  let currentIndex = 0;
  function toggle() {
    currentIndex = (currentIndex + 1) % coords.length;
    const {
      center: newCenter,
      zoom: newZoom,
      bearing: newBearing,
      pitch: newPitch,
    } = coords[currentIndex];
    center = newCenter;
    zoom = newZoom;
    bearing = newBearing;
    pitch = newPitch;
  }

  function quickToggle() {
    toggle();
    setTimeout(() => toggle(), 200);
  }

  let currentCoords = center;
  let currentZoom = zoom;
  let currentBearing = bearing;
  let currentPitch = pitch;

  function handleMoveEnd(ev: CustomEvent<MapMouseEvent>) {
    const map = ev.detail.target;
    let center = map.getCenter();
    currentCoords = [center.lng, center.lat];
    currentZoom = map.getZoom();
    currentBearing = map.getBearing();
    currentPitch = map.getPitch();
  }

  // when working correctly, the Toggle button should successfully change all the values, and Quick Toggle should end up
  // back at the current coordinates.
</script>

<div class="flex gap-4">
  <div class="flex gap-4">
    <button class="btn variant-filled mb-4" type="button" on:click={toggle}> Toggle </button>

    <button class="btn variant-filled mb-4" type="button" on:click={quickToggle}>
      Toggle and Back
    </button>
  </div>
  <div>
    {currentCoords[0].toFixed(3)}, {currentCoords[1].toFixed(3)} @ {currentZoom}, {currentBearing}/{currentPitch}
  </div>
</div>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class="relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full"
  on:moveend={handleMoveEnd}
  {bearing}
  {pitch}
  {center}
  {zoom}
  standardControls
></MapLibre>

<CodeSample {code} />
