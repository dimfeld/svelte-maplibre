<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';
</script>

<p>
  Enable cooperative gestures, which configures the map's zoom functionality to not override the
  usual scroll methods. The strings displayed can be changed using the `locale` option, as shown
  below.
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
  cooperativeGestures
  locale={{
    'CooperativeGesturesHandler.WindowsHelpText':
      'Utilice Ctrl + desplazamiento para hacer zoom en el mapa.',
    'CooperativeGesturesHandler.MacHelpText': 'Usa ⌘ + desplazamiento para hacer zoom en el mapa.',
    'CooperativeGesturesHandler.MobileHelpText': 'Usa dos dedos para mover el mapa.',
  }}
/>

<CodeSample {code} startBoundary="<MapLibre" endBoundary="/>" />
