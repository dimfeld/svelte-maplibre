<script lang="ts">
  import { BackgroundLayer } from '$lib';
  import DefaultMarker from '$lib/DefaultMarker.svelte';
  import MapLibre from '$lib/MapLibre.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';
</script>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class="relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full"
  standardControls
>
  <BackgroundLayer paint={{ 'background-color': 'green', 'background-opacity': 0.5 }} />
  <DefaultMarker lngLat={[0, 0]} />
</MapLibre>

<CodeSample {code} />
