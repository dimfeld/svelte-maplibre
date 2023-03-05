<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import GeoJSON from '$lib/GeoJSON.svelte';
  import type { Feature } from 'geojson';
  import FillLayer from '$lib/FillLayer.svelte';
  import LineLayer from '$lib/LineLayer.svelte';
  import { mapClasses } from '../styles.js';
  import code from './+page.svelte?raw';
  import CodeSample from '$site/CodeSample.svelte';
  import states from '$site/states.json?url';
  import { contrastingColor } from '$site/colors.js';
  import { hoverStateFilter } from '$lib/filters.js';

  let showBorder = true;
  let showFill = true;
  let fillColor = '#006600';
  let borderColor = '#003300';

  // START EXTRACT
  let map: maplibregl.Map | undefined;
  let loaded: boolean;
  let textLayers: maplibregl.LayerSpecification[] = [];
  $: if (map && loaded) {
    textLayers = map.getStyle().layers.filter((layer) => layer['source-layer'] === 'place');
  }

  $: colors = contrastingColor(fillColor);
  $: if (map && loaded) {
    for (let layer of textLayers) {
      map.setPaintProperty(layer.id, 'text-color', colors.textColor);
      map.setPaintProperty(layer.id, 'text-halo-color', colors.textOutlineColor);
    }
  }
  // END EXTRACT
</script>

<div class="self-start w-full max-w-md grid gap-y-2 items-center">
  <label><input type="checkbox" bind:checked={showFill} /> Show fill</label>
  <label><input type="color" bind:value={fillColor} /> Fill Color </label>
  <label><input type="checkbox" bind:checked={showBorder} /> Show border</label>
  <label><input type="color" bind:value={borderColor} /> Border Color </label>
</div>

<MapLibre
  bind:map
  bind:loaded
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class={mapClasses}
  standardControls
  center={[-98.137, 40.137]}
  zoom={4}
>
  <GeoJSON id="states" data={states} promoteId="STATEFP">
    {#if showFill}
      <FillLayer
        paint={{
          'fill-color': hoverStateFilter(fillColor, colors.hoverBgColor),
          'fill-opacity': 0.5,
        }}
        beforeLayerType="symbol"
      />
    {/if}
    {#if showBorder}
      <LineLayer
        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
        paint={{ 'line-color': borderColor, 'line-width': 3 }}
        beforeLayerType="symbol"
      />
    {/if}
  </GeoJSON>
</MapLibre>

<CodeSample
  {code}
  startBoundary="// START EXTRACT"
  endBoundary="// END EXTRACT"
  omitStartBoundary
  omitEndBoundary
/>
<CodeSample {code} />

<style>
  .grid {
    grid-template-columns: repeat(auto-fill, 150px);
  }
</style>
