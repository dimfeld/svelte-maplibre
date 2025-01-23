<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';
  import Popup from '$lib/Popup.svelte';

  const features: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [0, 0],
        },
      },
    ],
  };
</script>

<p>The popup should appear and say Hello!</p>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class="relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full"
  center={[0, 0]}
  zoom={2}
  standardControls
>
  <Popup lngLat={[0, 0]} open>Hello!</Popup>
</MapLibre>

<CodeSample {code} />
