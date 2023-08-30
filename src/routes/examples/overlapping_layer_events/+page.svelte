<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';
  import type { PageData } from './$types';
  import GeoJson from '$lib/GeoJSON.svelte';
  import CircleLayer from '$lib/CircleLayer.svelte';

  export let data: PageData;

  function randomCircle(): GeoJSON.Feature {
    const lng = Math.random() * 360 - 180;
    const lat = Math.random() * 180 - 90;
    const radius = Math.random() * 50;

    return {
      type: 'Feature',
      properties: {
        radius,
      },
      geometry: {
        type: 'Point',
        coordinates: [lng, lat],
      },
    };
  }

  const layer1 = Array.from({ length: 20 }, randomCircle);
  const layer2 = Array.from({ length: 20 }, randomCircle);
  const layer3 = Array.from({ length: 20 }, randomCircle);

  const layers = [
    { data: layer1, color: 'red' },
    { data: layer2, color: 'green' },
    { data: layer3, color: 'blue' },
  ];

  const lastEvent = [];

  function labelFeature(f: GeoJSON.Feature | undefined) {
    if (!f) {
      return 'None';
    }

    return f.geometry.coordinates.map((c) => c.toFixed(4)).join(' ,');
  }

  let eventsIfTopMost = true;
</script>

<label>
  <input type="checkbox" bind:checked={eventsIfTopMost} />
  When layers overlap, only fire events for top-most layer
</label>

<div class="grid grid-cols-[auto_1fr] gap-x-2">
  {#each layers as layer, i}
    <span class="flex-none">Last Event for {layer.color} layer: </span>
    <span class="w-64">{labelFeature(lastEvent[i])}</span>
  {/each}
</div>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class="relative w-full aspect-[9/16] max-h-[70vh] sm:max-h-full sm:aspect-video"
  standardControls
>
  {#each layers as { data, color }, i}
    <GeoJson id="layer{i + 1}" data={{ type: 'FeatureCollection', features: data }}>
      <CircleLayer
        {eventsIfTopMost}
        paint={{
          'circle-color': color,
          'circle-radius': ['get', 'radius'],
        }}
        on:click={(e) => {
          lastEvent[i] = e.detail.features?.[0];
        }}
        on:mouseleave={(e) => {
          lastEvent[i] = undefined;
        }}
        on:mousemove={(e) => {
          lastEvent[i] = e.detail.features?.[0];
        }}
      />
    </GeoJson>
  {/each}
</MapLibre>

<CodeSample {code} />
