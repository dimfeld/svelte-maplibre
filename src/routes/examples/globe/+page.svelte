<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';

  let projection = $state('globe');

  function toggleProjection() {
    projection = projection === 'globe' ? 'mercator' : 'globe';
  }
</script>

<button
  class="mb-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
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
