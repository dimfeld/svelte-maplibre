<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import Marker from '$lib/Marker.svelte';
  import { mapClasses } from '../styles';
  import code from './+page.svelte?raw';
  import CodeSample from '$site/CodeSample.svelte';
  import type { MarkerClickInfo } from '$lib';

  let markerPos = [-122.2993, 47.4464];
  const handleDrag = (event: CustomEvent<MarkerClickInfo>) => (markerPos = event.detail.lngLat);
</script>

<p>
  Current position: {JSON.stringify(markerPos)}
</p>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class={mapClasses}
  standardControls
  zoom={1}
  center={[-20, 0]}
>
  <Marker
    lngLat={[-122.2993, 47.4464]}
    draggable
    on:drag={handleDrag}
    class="border-gray-200 border shadow-2xl focus:outline-2 focus:outline-black w-20 h-8 bg-red-300 text-black rounded-full grid place-items-center"
  >
    <span> Drag me ! </span>
  </Marker>
</MapLibre>

<CodeSample {code} />
