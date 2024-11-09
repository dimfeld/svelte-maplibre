<script lang="ts">
  import type { LngLatLike, MapMouseEvent } from 'maplibre-gl';
  import MapLibre from '$lib/MapLibre.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';
  import type { MapMoveEvent } from '$lib';

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

  let center: LngLatLike = $state(coords[0].center);
  let zoom = $state(coords[0].zoom);
  let bearing = $state(coords[0].bearing);
  let pitch = $state(coords[0].pitch);

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

  let currentCoords = $state(center);
  let currentZoom = $state(zoom);
  let currentBearing = $state(bearing);
  let currentPitch = $state(pitch);

  function handleMoveEnd(ev: MapMoveEvent) {
    const map = ev.target;
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
    <button class="variant-filled btn mb-4" type="button" onclick={toggle}> Toggle </button>

    <button class="variant-filled btn mb-4" type="button" onclick={quickToggle}>
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
  onmoveend={handleMoveEnd}
  {bearing}
  {pitch}
  {center}
  {zoom}
  standardControls
></MapLibre>

<CodeSample {code} />
