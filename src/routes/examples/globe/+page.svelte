<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';

  let projection = $state('globe');

  function toggleProjection() {
    projection = projection === 'globe' ? 'mercator' : 'globe';
  }
</script>

<button class="variant-filled btn mb-4" type="button" onclick={toggleProjection}>
  Toggle Projection
</button>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class="relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full"
  standardControls
  projection={{ type: projection }}
/>

<CodeSample {code} />
