<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import DefaultMarker from '$lib/DefaultMarker.svelte';
  import { mapClasses } from '../styles';
  import code from './+page.svelte?raw';
  import serverCode from './[id]/+server.ts?raw';
  import CodeSample from '$site/CodeSample.svelte';
  import Popup from '$lib/Popup.svelte';

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

  interface APIResponse {
    width: number;
    height: number;
  }

  let cache: Record<string, APIResponse> = {};
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
      <Popup
        offset={[0, -10]}
        on:open={async () => {
          if (!(name in cache)) {
            const resp = await fetch(`/examples/popup_remote/${name}`);
            const result = await resp.json();
            cache[name] = result;
            // trigger reactivity
            cache = cache;
          }
        }}
      >
        {#if name in cache}
          {@const result = cache[name]}
          <div class="text-lg font-bold">{name}</div>
          <img alt="kitten" src={`http://placekitten.com/${result.width}/${result.height}`} />
        {:else}
          <div>Loading...</div>
        {/if}
      </Popup>
    </DefaultMarker>
  {/each}
</MapLibre>

<CodeSample {code} />
<CodeSample code={serverCode} language="typescript" startBoundary="" endBoundary="" />
