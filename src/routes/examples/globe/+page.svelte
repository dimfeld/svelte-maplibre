<script lang="ts">
  import * as maplibregl from 'maplibre-gl';
  import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
  import MapLibre from '$lib/MapLibre.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';

  maplibregl.setWorkerUrl(maplibreWorkerUrl);

  let projection = $state('globe');

  function toggleProjection() {
    projection = projection === 'globe' ? 'mercator' : 'globe';
  }
</script>

<button
  class="bg-primary text-primary-foreground hover:bg-primary/90 mb-4 inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-xs transition-colors"
  type="button"
  onclick={toggleProjection}
>
  Toggle Projection
</button>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class="relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full"
  standardControls
  projection={{ type: projection }}
/>

<CodeSample {code} />
