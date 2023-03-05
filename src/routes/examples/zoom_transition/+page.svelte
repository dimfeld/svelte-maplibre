<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import GeoJSON from '$lib/GeoJSON.svelte';
  import { mapClasses } from '../styles.js';
  import code from './+page.svelte?raw';
  import CodeSample from '$site/CodeSample.svelte';
  import states from '$site/states.json';
  import counties from '$site/counties.json';
  import { isTextLayer } from '$lib/filters.js';
  import FillLayer from '$lib/FillLayer.svelte';
  import SymbolLayer from '$lib/SymbolLayer.svelte';
  import LineLayer from '$lib/LineLayer.svelte';
  import { geoCentroid } from 'd3-geo';
  import type { FeatureCollection, Feature, Point } from 'geojson';
  import ZoomRange from '$lib/ZoomRange.svelte';
  import { zoomTransition } from '$lib/expressions.js';

  function calculateCenters(g: FeatureCollection): FeatureCollection {
    let centers: Feature<Point>[] = g.features.map((f) => {
      return {
        ...f,
        geometry: {
          type: 'Point',
          coordinates: geoCentroid(f),
        },
      };
    });

    return {
      type: 'FeatureCollection',
      features: centers,
    };
  }

  const stateCenters = calculateCenters(states);
  const countyCenters = calculateCenters(counties);

  let zoomThreshold = 5;
  let currentZoom = 4;
</script>

<p>
  This example uses the ZoomRange component and zoomTransition function to fade smoothly between
  states and counties as the map zooms.
</p>

<div class="self-start w-full">
  <label class="flex flex-wrap gap-x-2 w-full">
    <span>Transition at zoom level: {zoomThreshold}</span>
    <input class="w-32" type="range" bind:value={zoomThreshold} min={0} max={10} step={0.1} />
  </label>
  <p>Current Zoom: {currentZoom.toFixed(1)}</p>
</div>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class={mapClasses}
  standardControls
  center={[-98.137, 40.137]}
  zoom={4}
  on:zoomend={({ detail: { map } }) => (currentZoom = map.getZoom())}
  filterLayers={(l) => !isTextLayer(l, 'carto')}
>
  <ZoomRange maxzoom={zoomThreshold + 0.5}>
    {@const fadeStates = zoomTransition(zoomThreshold - 1, 0.8, zoomThreshold + 0.5, 0)}
    {@const fadeStatesText = zoomTransition(zoomThreshold - 1, 1, zoomThreshold, 0.2)}
    <GeoJSON id="states" data={states} promoteId="GEOID">
      <FillLayer
        paint={{
          'fill-color': 'green',
          'fill-opacity': fadeStates,
        }}
      />

      <LineLayer
        paint={{
          'line-color': 'white',
          'line-width': 1,
          'line-opacity': fadeStates,
        }}
      />
    </GeoJSON>

    <GeoJSON id="state-centers" data={stateCenters} promoteId="GEOID">
      <SymbolLayer
        filter={['!=', ['get', 'STUSPS'], 'DC']}
        paint={{
          'text-color': '#333',
          'text-opacity': fadeStatesText,
          'text-halo-color': '#eee',
          'text-halo-width': 0.5,
          'text-halo-blur': 0.5,
        }}
        layout={{
          'text-allow-overlap': true,
          'text-field': ['get', 'STUSPS'],
          'text-size': zoomTransition(3, 16, 5, 24),
        }}
      />
    </GeoJSON>
  </ZoomRange>

  <ZoomRange minzoom={zoomThreshold - 0.5}>
    {@const fadeCounties = zoomTransition(zoomThreshold - 0.5, 0, zoomThreshold + 0.5, 0.8)}
    {@const fadeCountiesText = zoomTransition(zoomThreshold, 0.2, zoomThreshold + 0.5, 1)}
    <GeoJSON id="counties" data={counties} promoteId="GEOID">
      <FillLayer
        paint={{
          'fill-color': 'orange',
          'fill-opacity': fadeCounties,
        }}
      />

      <LineLayer
        paint={{
          'line-color': 'white',
          'line-width': 1,
          'line-opacity': fadeCounties,
        }}
      />
    </GeoJSON>

    <GeoJSON id="county-centers" data={countyCenters} promoteId="GEOID">
      <SymbolLayer
        paint={{
          'text-color': 'black',
          'text-opacity': fadeCountiesText,
        }}
        layout={{
          'text-field': ['get', 'NAME'],
          'text-size': zoomTransition(5, 12, 10, 24),
        }}
      />
    </GeoJSON>
  </ZoomRange>
</MapLibre>

<CodeSample {code} />
