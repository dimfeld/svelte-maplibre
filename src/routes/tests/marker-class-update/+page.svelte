<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';
  import type { PageData } from './$types';
  import states from '$site/states.json?url';
  import MarkerLayer from '$lib/MarkerLayer.svelte';
  import GeoJSON from '$lib/GeoJSON.svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let colors = $state([
    'bg-gray-200 text-gray-800',
    'bg-red-200 text-red-800',
    'bg-teal-200 text-teal-800',
  ]);

  function swapColor() {
    colors = [...colors.slice(1), colors[0]];
  }
</script>

<button class="variant-filled btn mb-4" type="button" onclick={swapColor}>Cycle Color</button>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class="relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full"
  center={[-98.137, 40.137]}
  zoom={4}
  standardControls
>
  <GeoJSON id="states" data={states} promoteId="STATEFP">
    <MarkerLayer draggable class="rounded-full p-2 shadow {colors[0]}">
      {#snippet children({ feature })}
        <div class="text-sm font-bold">{feature.properties.NAME}</div>
      {/snippet}
    </MarkerLayer>
  </GeoJSON>
</MapLibre>

<CodeSample {code} />
