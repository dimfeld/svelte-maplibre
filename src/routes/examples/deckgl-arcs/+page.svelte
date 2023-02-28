<script lang="ts">
  import MapLibre from '$lib/Map.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';
  import { geoCentroid } from 'd3-geo';
  import clamp from 'just-clamp';
  import states from '$site/states.json';
  import type { PageData } from './$types';
  import type { FeatureCollection } from 'geojson';
  import DeckGlLayer from '$lib/DeckGlLayer.svelte';
  import { ArcLayer } from '@deck.gl/layers';
  import Popup from '$lib/Popup.svelte';

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
        fromName: from.properties.NAME,
        toName: to.properties.NAME,
        source: centers.get(from.properties.GEOID),
        target: centers.get(to.properties.GEOID),
        sourceColor: [255, 128, 0],
        targetColor: [0, 125, 255],
      };
    });
  }

  const arcs = calculateArcs(states);

  let zoom = 3;
  let height = 1;

  $: arcHeight = clamp(height * 1, 0, 1);

  let hovered = null;
</script>

<p>This is still experimental and may have some bugs.</p>

<label class="flex items-center mb-4">
  Arc Height: {height}
  <input
    class="w-48 max-w-full ml-4"
    type="range"
    bind:value={height}
    min="0"
    max="1"
    step="0.01"
  />
</label>
<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  pitch={30}
  center={[-100, 40]}
  bind:zoom
  class="relative w-full aspect-[9/16] max-h-[70vh] sm:max-h-full sm:aspect-video"
  standardControls
>
  <DeckGlLayer
    type={ArcLayer}
    data={arcs}
    bind:hovered
    getSourcePosition={(d) => d.source}
    getTargetPosition={(d) => d.target}
    getSourceColor={(d) => d.sourceColor}
    getTargetColor={(d) => d.targetColor}
    autoHighlight={true}
    highlightColor={[30, 255, 30]}
    getWidth={10}
    getHeight={arcHeight}
  >
    <Popup openOn="click" let:data>
      From {data.fromName} to {data.toName}
    </Popup>
  </DeckGlLayer>
</MapLibre>

<h4>
  {#if hovered}
    From {hovered.fromName} to {hovered.toName}
  {:else}
    Hover over an arc to see the locations
  {/if}
</h4>

<CodeSample {code} startBoundary="<MapLibre" endBoundary="</MapLibre>" />
