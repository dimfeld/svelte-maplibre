<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';

  let styles = $state([
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  ]);

  function swapStyle() {
    styles = [...styles].reverse();
  }
</script>

<button
  class="bg-primary text-primary-foreground hover:bg-primary/90 mb-4 inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-xs transition-colors"
  type="button"
  onclick={swapStyle}>Swap Style</button
>

<MapLibre
  style={styles[0]}
  class="relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full"
  standardControls
/>

<CodeSample {code} startBoundary="let styles" endBoundary="/>" />
