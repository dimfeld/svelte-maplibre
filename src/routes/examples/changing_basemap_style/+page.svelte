<script lang="ts">
  import { SymbolLayer, MapLibre, GeoJSON, FillLayer, LineLayer } from '$lib';
  import { mapClasses } from '../styles.js';
  import code from './+page.svelte?raw';
  import CodeSample from '$site/CodeSample.svelte';
  import states from '$site/states.json?url';
  import type { FeatureCollection } from 'geojson';
  import quakeImageUrl from '$site/earthquake.png';
  import tsunamiImageUrl from '$site/tsunami.png';

  let showPoints = true;
  let selected: 'light' | 'dark' = 'light';
  $: style =
    selected === 'light'
      ? 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
      : 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  const coloradoPolygon = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-109, 37],
              [-102, 37],
              [-102, 41],
              [-109, 41],
              [-109, 37],
            ],
          ],
        },
      },
    ],
  } as FeatureCollection;
  const pointsData = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { image: 'quake' },
        geometry: {
          type: 'Point',
          coordinates: [-127.5, 45.5],
        },
      },
      {
        type: 'Feature',
        properties: { image: 'tsunami' },
        geometry: {
          type: 'Point',
          coordinates: [-91.6, 28.7],
        },
      },
    ],
  } as FeatureCollection;

  let dataOption: 'states' | 'colorado' = 'states';
  $: dataset = dataOption === 'states' ? states : coloradoPolygon;
</script>

<div class="controls">
  <select class="controls-select" bind:value={selected}>
    <option value="light">Light</option>
    <option value="dark">dark</option>
  </select>

  <select class="controls-select" bind:value={dataOption}>
    <option value="states">States Dataset</option>
    <option value="colorado">Colorado Dataset</option>
  </select>

  <label>Show symbols: <input type="checkbox" bind:checked={showPoints} /></label>
</div>

<MapLibre
  {style}
  class={mapClasses}
  standardControls
  center={[-98.137, 40.137]}
  zoom={4}
  images={[
    { id: 'quake', url: quakeImageUrl },
    { id: 'tsunami', url: tsunamiImageUrl },
  ]}
>
  <GeoJSON id="states" data={dataset} promoteId="STATEFP">
    <FillLayer
      paint={{
        'fill-color': '#006600',
        'fill-opacity': 0.5,
      }}
      beforeLayerType="symbol"
    />
    <LineLayer
      layout={{ 'line-cap': 'round', 'line-join': 'round' }}
      paint={{ 'line-color': '#003300', 'line-width': 3 }}
      beforeLayerType="symbol"
    />
  </GeoJSON>
  <GeoJSON data={pointsData}>
    {#if showPoints}
      <SymbolLayer
        layout={{
          'icon-image': ['get', 'image'],
        }}
      />
    {/if}
  </GeoJSON>
</MapLibre>

<CodeSample {code} />

<style>
  .controls {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    padding: 0.5rem;
  }

  .controls-select {
    box-sizing: border-box;
    padding: 10px 20px;
  }
</style>
