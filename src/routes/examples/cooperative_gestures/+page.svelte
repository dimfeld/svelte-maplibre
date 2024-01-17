<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<p>
  Enable cooperative gestures with a specific language. Set to <code>true</code> or use custom help-text
  like below.
</p>
<p>
  Scroll the map to see it in action. <a
    href="https://maplibre.org/maplibre-gl-js/docs/examples/cooperative-gestures/">MapLibre docs.</a
  >
</p>
<br />

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class="relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full"
  cooperativeGestures={{
    windowsHelpText: 'Utilice Ctrl + desplazamiento para hacer zoom en el mapa.',
    macHelpText: 'Use ⌘ + desplazamiento para hacer zoom en el mapa.',
    mobileHelpText: 'Usa dos dedos para mover el mapa.',
  }}
/>

<CodeSample {code} startBoundary="<MapLibre" endBoundary="/>" />
