<script lang="ts">
  import { run } from 'svelte/legacy';

  // imports start
  import MapLibre from '$lib/MapLibre.svelte';
  import DeckGlLayer from '$lib/DeckGlLayer.svelte';
  // Importing from `@deck.gl/layers` so that we can do a direct import
  // that works even in SSR, as opposed to importing from `deck.gl` which does not.
  import { ArcLayer } from '@deck.gl/layers';
  // imports end
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';
  import { geoCentroid } from 'd3-geo';
  import clamp from 'just-clamp';
  import counties from '$site/counties.json';
  import states from '$site/states.json';
  import type { PageData } from './$types';
  import type { FeatureCollection } from 'geojson';
  import Popup from '$lib/Popup.svelte';
  import FillLayer from '$lib/FillLayer.svelte';
  import GeoJson from '$lib/GeoJSON.svelte';
  import { hoverStateFilter } from '$lib';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  function calculateArcs(fc: FeatureCollection) {
    let centers = new Map(fc.features.map((f) => [f.properties.GEOID, geoCentroid(f)]));

    let count = fc.features.length > 100 ? 5000 : 100;

    let indexes = Array.from({ length: count }, (_, i) => [
      Math.ceil(Math.random() * (fc.features.length - 1)),
      Math.ceil(Math.random() * (fc.features.length - 1)),
    ]);

    return indexes.map(([fromIndex, toIndex]) => {
      let from = fc.features[fromIndex];
      let to = fc.features[toIndex];
      return {
        fromName: from.properties.NAME,
        toName: to.properties.NAME,
        fromState: from.properties.STATEFP,
        toState: to.properties.STATEFP,
        source: centers.get(from.properties.GEOID),
        target: centers.get(to.properties.GEOID),
        sourceColor: [255, 128, 0],
        targetColor: [0, 125, 255],
      };
    });
  }

  let zoom = $state(3);
  let hovered = $state(null);

  let mode: 'showAll' | 'showOne' = $state('showOne');
  let arcs = $derived(calculateArcs(mode === 'showAll' ? states : counties));
  let activeState;
  run(() => {
    activeState = arcs[0].fromState;
  });
</script>

<p>A deck.gl ArcLayer integrated into a MapLibre map, with hover and popup support.</p>

<fieldset class="mb-2 self-start border border-gray-400 p-2">
  <legend>View Mode</legend>
  <div class="flex flex-wrap gap-2">
    <label>
      <input type="radio" bind:group={mode} value="showOne" />
      Show county arcs for hovered state
    </label>
    <label>
      <input type="radio" bind:group={mode} value="showAll" />
      Show state arcs
    </label>
  </div>
</fieldset>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  pitch={30}
  center={[-100, 40]}
  maxZoom={5}
  bind:zoom
  class="relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full"
  standardControls
>
  <GeoJson id="states-base" data={states} promoteId="GEOID">
    <!-- We use the base map to provide the visuals, but this gives something to click. -->
    <FillLayer
      id="counties-click"
      hoverCursor="pointer"
      paint={{
        'fill-color': '#000',
        'fill-opacity': mode === 'showOne' ? hoverStateFilter(0, 0.1) : 0,
      }}
      manageHoverState
      on:mousemove={(e) => {
        if (mode === 'showOne') {
          let newGeoId = e.detail.features[0]?.properties?.STATEFP;
          if (newGeoId !== activeState) {
            activeState = newGeoId;
            hovered = null;
          }
        }
      }}
    />
  </GeoJson>

  <DeckGlLayer
    type={ArcLayer}
    data={arcs.filter((a, i) => {
      if (mode === 'showAll') return i < 50000;
      return a.fromState === activeState || a.toState === activeState;
    })}
    bind:hovered
    getSourcePosition={(d) => d.source}
    getTargetPosition={(d) => d.target}
    getSourceColor={(d) => d.sourceColor}
    getTargetColor={(d) => d.targetColor}
    autoHighlight={mode === 'showAll'}
    highlightColor={[30, 255, 30]}
    getWidth={mode === 'showAll' ? 5 : 1}
    getHeight={clamp(3 / zoom, 0, 1)}
  >
    <Popup openOn="click"
      >{#snippet children({ data })}
        From {data.fromName} to {data.toName}
      {/snippet}
    </Popup>
  </DeckGlLayer>
</MapLibre>

<h4>
  {#if hovered && mode === 'showAll'}
    From {hovered.fromName} to {hovered.toName}
  {:else if mode === 'showOne'}
    {states.features.find((f) => f.properties.STATEFP === activeState).properties.NAME}
  {:else}
    Hover over an arc to see its endpoints
  {/if}
</h4>

<CodeSample
  {code}
  language="javascript"
  startBoundary="// imports start"
  endBoundary="// imports end"
  omitStartBoundary
  omitEndBoundary
/>
<CodeSample {code} startBoundary="<MapLibre" endBoundary="</MapLibre>" />
