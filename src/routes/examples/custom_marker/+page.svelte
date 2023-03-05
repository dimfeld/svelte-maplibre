<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import Marker from '$lib/Marker.svelte';
  import { mapClasses } from '../styles';
  import code from './+page.svelte?raw';
  import CodeSample from '$site/CodeSample.svelte';
  import Popup from '$lib/Popup.svelte';

  let clickedName = '';

  const markers = [
    {
      lngLat: [-122.2993, 47.4464],
      label: 'SEA',
      name: 'Seattle',
    },
    {
      lngLat: [-159.3438, 21.9788],
      label: 'LIH',
      name: 'Lihue',
    },
    {
      lngLat: [2.5479, 49.0097],
      label: 'CDG',
      name: 'Paris Charles de Gaulle',
    },
    {
      lngLat: [-58.5348, -34.82],
      label: 'EZE',
      name: 'Ministro Pistarini',
    },
    {
      lngLat: [18.6021, -33.9715],
      label: 'CPT',
      name: 'Cape Town',
    },
    {
      lngLat: [121.0165, 14.5123],
      label: 'MNL',
      name: 'Ninoy Aquino',
    },
  ];
</script>

<p>
  {#if clickedName}
    You clicked {clickedName}
  {:else}
    Click a marker to see the airport's name.
  {/if}
</p>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class={mapClasses}
  standardControls
  zoom={1}
  center={[-20, 0]}
>
  {#each markers as { lngLat, label, name } (label)}
    <Marker
      {lngLat}
      on:click={() => (clickedName = name)}
      class="border-gray-200 border shadow-2xl focus:outline-2 focus:outline-black w-8 h-8 bg-red-300 text-black rounded-full grid place-items-center"
    >
      <span>
        {label}
      </span>

      <Popup openOn="hover" offset={[0, -10]}>
        <div class="text-lg font-bold">{name}</div>
      </Popup>
    </Marker>
  {/each}
</MapLibre>

<CodeSample {code} />
