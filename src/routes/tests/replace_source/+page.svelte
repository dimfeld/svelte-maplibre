<script lang="ts">
  import { MapLibre, GeoJSON, LineLayer, FillLayer, Marker } from '$lib/index.js';
  import { onMount } from 'svelte';

  const lngLat = [174.863783, -36.871099];

  let size = $state(20);

  onMount(() => {
    let timeout = setInterval(() => {
      switch (size) {
        case 20:
          size = 10;
          break;
        case 10:
          size = 0;
          break;
        case 0:
          size = 20;
          break;
      }
    }, 2000);

    return () => clearInterval(timeout);
  });

  let data = $derived(
    size === 0
      ? null
      : ({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [size, size],
                    [-size, size],
                    [-size, -size],
                    [size, -size],
                    [size, size],
                  ],
                ],
              },
            },
          ],
        } satisfies GeoJSON.FeatureCollection)
  );
</script>

<p>Should see the box cycle between large, small, and absent.</p>

<MapLibre
  standardControls
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  center={[0, 0]}
  zoom={3}
  class="relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full"
>
  {#if data}
    {#key data}
      <GeoJSON id="layer_1" {data}>
        <LineLayer
          layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          paint={{ 'line-color': 'black', 'line-width': 3 }}
        />
      </GeoJSON>
    {/key}
  {/if}
</MapLibre>
