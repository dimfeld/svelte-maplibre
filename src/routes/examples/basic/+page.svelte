<script lang="ts">
  import Map from '$lib/Map.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<Map
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class="relative w-full aspect-[9/16] max-h-[70vh] sm:max-h-full sm:aspect-video"
  standardControls
/>

<CodeSample {code} startBoundary="<Map" endBoundary="/>" />
