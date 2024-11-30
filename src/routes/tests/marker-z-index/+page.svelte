<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';
  import GeoJson from '$lib/GeoJSON.svelte';
  import MarkerLayer from '$lib/MarkerLayer.svelte';
  import Marker from '$lib/Marker.svelte';

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

<p>
  The smaller green dot should be above the red dot. If you only see the red dot it's not working.
  Since the GeoJSON source loads asynchronously, without special z-index override the markers inside
  the GeoJSON source will always load after, and be on top of, the other markers, regardless of the
  order in which they are defined.
</p>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class="relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full"
  center={[0, 0]}
  zoom={2}
  standardControls
>
  <GeoJson data={features}>
    <MarkerLayer zIndex={10}>
      <div class="h-8 w-8 rounded-full bg-red-500"></div>
    </MarkerLayer>
  </GeoJson>

  <Marker lngLat={[0, 0]} zIndex={20}>
    <div class="h-4 w-4 rounded-full bg-green-500"></div>
  </Marker>
</MapLibre>

<CodeSample {code} />
