<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';
  import type { PageData } from './$types';
  import states from '$site/states.json?url';
  import MarkerLayer from '$lib/MarkerLayer.svelte';
  import GeoJSON from '$lib/GeoJSON.svelte';

  export let data: PageData;

  let colors = [
    'bg-gray-200 text-gray-800',
    'bg-red-200 text-red-800',
    'bg-teal-200 text-teal-800',
  ];

  function swapColor() {
    colors = [...colors.slice(1), colors[0]];
  }
</script>

<button class="btn variant-filled mb-4" type="button" on:click={swapColor}>Cycle Color</button>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class="relative w-full aspect-[9/16] max-h-[70vh] sm:max-h-full sm:aspect-video"
  center={[-98.137, 40.137]}
  zoom={4}
  standardControls
>
  <GeoJSON id="states" data={states} promoteId="STATEFP">
    <MarkerLayer let:feature class="rounded-full p-2 shadow {colors[0]}">
      <div class="text-sm font-bold">{feature.properties.NAME}</div>
    </MarkerLayer>
  </GeoJSON>
</MapLibre>

<CodeSample {code} />
