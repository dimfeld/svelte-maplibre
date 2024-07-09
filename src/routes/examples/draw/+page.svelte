<script lang="ts">
  // Import MapboxDraw and its CSS
  import MapboxDraw from '@mapbox/mapbox-gl-draw';
  import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

  // Also need this CSS which lets the mouse pointers work correctly with Maplibre
  // when switching modes in the draw plugin.
  // import 'svelte-maplibre/draw-plugin.css';
  import '$lib/draw-plugin.css';

  import maplibregl from 'maplibre-gl';
  import MapLibre from '$lib/MapLibre.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';
  import type { PageData } from './$types';

  export let data: PageData;

  let map: maplibregl.Map;
  let draw: MapboxDraw;

  function createMapboxDraw() {
    let draw = new MapboxDraw();
    const origOnAdd = draw.onAdd.bind(draw);

    // MapboxDraw assumes that the `mapboxgl-ctrl-group` and `mapboxgl-ctrl` CSS classes exist,
    // but Maplibre uses different names, so add them to the control element here.
    draw.onAdd = (map: maplibregl.Map) => {
      let el = origOnAdd(map);
      el.classList.add('maplibregl-ctrl-group');
      el.classList.add('maplibregl-ctrl');
      return el;
    };

    return draw;
  }

  $: if (map && !draw) {
    draw = createMapboxDraw();
    map.addControl(draw);
  }
</script>

<MapLibre
  bind:map
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class="relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full"
  standardControls
/>

<CodeSample {code} startBoundary="<scrip" endBoundary="<CodeSample" omitEndBoundary />
