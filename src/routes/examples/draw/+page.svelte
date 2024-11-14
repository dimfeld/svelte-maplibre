<script lang="ts">
  // Import MapboxDraw and its CSS
  import MapboxDraw from '@mapbox/mapbox-gl-draw';
  import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

  // Also need this CSS which lets the mouse pointers work correctly with Maplibre
  // when switching modes in the draw plugin.
  // import 'svelte-maplibre/draw-plugin.css';
  import '$lib/draw-plugin.css';

  import type maplibregl from 'maplibre-gl';
  import MapLibre from '$lib/MapLibre.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';

  let map: maplibregl.Map | undefined = $state();

  function createMapboxDraw() {
    let draw = new MapboxDraw();
    const origOnAdd = draw.onAdd.bind(draw);

    // MapboxDraw assumes that the `mapboxgl-ctrl-group` and `mapboxgl-ctrl` CSS classes exist,
    // but Maplibre uses different names, so add them to the control element here.
    //
    // @ts-expect-error draw's onadd expects a mapboxgl.Map but we have a maplibregl.Map, which has close enough to the
    // same API.
    draw.onAdd = (map: maplibregl.Map) => {
      // @ts-expect-error Same as above
      let el = origOnAdd(map);
      el.classList.add('maplibregl-ctrl-group');
      el.classList.add('maplibregl-ctrl');
      return el;
    };

    return draw;
  }

  let draw = createMapboxDraw();
  $effect(() => {
    // @ts-expect-error
    map.addControl(draw);
  });
</script>

<MapLibre
  bind:map
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class="relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full"
  standardControls
/>

<CodeSample {code} startBoundary="<scrip" endBoundary="<CodeSample" omitEndBoundary />
