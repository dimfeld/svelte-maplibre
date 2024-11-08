<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let styles = $state([
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  ]);

  function swapStyle() {
    styles = [...styles].reverse();
  }
</script>

<button class="variant-filled btn mb-4" type="button" onclick={swapStyle}>Swap Style</button>

<MapLibre
  style={styles[0]}
  class="relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full"
  standardControls
/>

<CodeSample {code} startBoundary="let styles" endBoundary="/>" />
