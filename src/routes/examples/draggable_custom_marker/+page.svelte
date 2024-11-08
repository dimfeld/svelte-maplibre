<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import Marker from '$lib/Marker.svelte';
  import { mapClasses } from '../styles';
  import code from './+page.svelte?raw';
  import CodeSample from '$site/CodeSample.svelte';
  import type { MarkerClickInfo } from '$lib';

  let markerPos = $state([-122.2993, 47.4464]);
  const handleDrag = (event: CustomEvent<MarkerClickInfo>) => (markerPos = event.detail.lngLat);

  let boundPos = $state({ lng: -10, lat: -20 });
</script>

<ul>
  <li>Position from drag events: {JSON.stringify(markerPos)}</li>
  <li>Position from <code>bind:latLng</code>: {JSON.stringify(boundPos)}</li>
</ul>

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
    class="grid h-8 w-20 place-items-center rounded-full border border-gray-200 bg-red-300 text-black shadow-2xl focus:outline-2 focus:outline-black"
  >
    <span> Drag me ! </span>
  </Marker>

  <Marker
    bind:lngLat={boundPos}
    draggable
    class="grid h-8 w-24 place-items-center rounded-full border border-gray-200 bg-red-300 text-black shadow-2xl focus:outline-2 focus:outline-black"
  >
    <span> 2-way Bound ! </span>
  </Marker>
</MapLibre>

<p>
  Bound props can use either <code>&#123; lng, lat &#125;</code> objects or GeoJSON Location
  <code>[lng, lat]</code> arrays.
</p>

<CodeSample {code} />
