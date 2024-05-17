<script lang="ts">
  import type { LngLatLike } from 'maplibre-gl';
  import MapLibre from '$lib/MapLibre.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';

  let center: LngLatLike = [0, 0];
  let zoom = 2;

  let newZoom = zoom;
  let newCenter = center;

  function apply() {
    center = newCenter;
    zoom = newZoom;
  }
</script>

<div class="flex gap-4">
  <label>
    Longitude
    <input type="number" class="input" bind:value={newCenter[0]} />
  </label>
  <label>
    Latitude
    <input type="number" class="input" bind:value={newCenter[1]} />
  </label>
  <label>
    Zoom
    <input type="number" class="input" bind:value={newZoom} />
  </label>
</div>

<button class="btn variant-filled mb-4 mt-2" type="button" on:click={apply}
  >Apply new Coordinates</button
>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class="relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full"
  bind:center
  bind:zoom
  standardControls
></MapLibre>

<CodeSample {code} />
