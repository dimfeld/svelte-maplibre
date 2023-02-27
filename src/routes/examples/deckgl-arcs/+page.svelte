<script lang="ts">
  import MapLibre from '$lib/Map.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';
  import { geoCentroid } from 'd3-geo';
  import states from '$site/states.json';
  import type { PageData } from './$types';
  import type { FeatureCollection } from 'geojson';
  import DeckGlLayer from '$lib/DeckGlLayer.svelte';

  export let data: PageData;

  function calculateArcs(fc: FeatureCollection) {
    let centers = new Map(fc.features.map((f) => [f.properties.GEOID, geoCentroid(f)]));

    let indexes = Array.from({ length: 50 }, (_, i) => [
      Math.ceil(Math.random() * (fc.features.length - 1)),
      Math.ceil(Math.random() * (fc.features.length - 1)),
    ]);

    return indexes.map(([fromIndex, toIndex]) => {
      let from = fc.features[fromIndex];
      let to = fc.features[toIndex];
      return {
        source: centers.get(from.properties.GEOID),
        target: centers.get(to.properties.GEOID),
        sourceColor: [255, 128, 0],
        targetColor: [0, 125, 255],
      };
    });
  }

  const arcs = calculateArcs(states);
</script>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  pitch={30}
  center={[-100, 45]}
  zoom={3}
  class="relative w-full aspect-[9/16] max-h-[70vh] sm:max-h-full sm:aspect-video"
  standardControls
>
  <DeckGlLayer data={arcs} />
</MapLibre>

<CodeSample {code} startBoundary="<MapLibre" endBoundary="</MapLibre>" />
