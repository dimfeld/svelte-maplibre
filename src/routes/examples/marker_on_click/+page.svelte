<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import MapEvents from '$lib/MapEvents.svelte';
  import code from './+page.svelte?raw';
  import DefaultMarker from '$lib/DefaultMarker.svelte';
  import type { LngLat, MapMouseEvent } from 'maplibre-gl';

  let markers: { lngLat: LngLat }[] = $state([]);

  function addMarker(e: MapMouseEvent) {
    markers = [...markers, { lngLat: e.lngLat }];
  }
</script>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class="relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full"
  standardControls
>
  <!-- MapEvents gives you access to map events even from other components inside the map,
  where you might not have access to the top-level `MapLibre` component. In this case
  it would also work to just use on:click on the MapLibre component itself. -->
  <MapEvents onclick={addMarker} />

  {#each markers as marker}
    <DefaultMarker lngLat={marker.lngLat} />
  {/each}
</MapLibre>

<CodeSample {code} />
