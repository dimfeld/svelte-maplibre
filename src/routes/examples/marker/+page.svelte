<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import DefaultMarker from '$lib/DefaultMarker.svelte';
  import { mapClasses } from '../styles';
  import code from './+page.svelte?raw';
  import CodeSample from '$site/CodeSample.svelte';
  import Popup from '$lib/Popup.svelte';

  const markers: Array<{
    lngLat: [number, number];
    label: string;
    name: string;
  }> = [
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

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class={mapClasses}
  standardControls
  zoom={1}
  center={[-20, 0]}
>
  {#each markers as { lngLat, name }}
    <!-- Unlike the custom marker example, default markers do not have mouse events,
    and popups only support the default openOn="click" behavior -->
    <DefaultMarker {lngLat} draggable>
      <Popup offset={[0, -10]}>
        <div class="text-lg font-bold">{name}</div>
      </Popup>
    </DefaultMarker>
  {/each}
</MapLibre>

<CodeSample {code} />
