<script lang="ts">
  import Map from '$lib/Map.svelte';
  import GeoJSON from '$lib/GeoJSON.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';
  import { mapClasses } from '../styles';
  import type { PageData } from './$types';
  import CircleLayer from '$lib/CircleLayer.svelte';
  import SymbolLayer from '$lib/SymbolLayer.svelte';

  export let data: PageData;

  const source = 'https://maplibre.org/maplibre-gl-js-docs/assets/earthquakes.geojson';
</script>

<p>
  Data and layer configuration from <a
    href="https://maplibre.org/maplibre-gl-js-docs/example/cluster/">MapLibre cluster Example.</a
  >
</p>

<Map class={mapClasses}>
  <GeoJSON id="earthquakes" data={source} cluster={{ radius: 500, maxZoom: 14 }}>
    <CircleLayer
      applyToClusters
      paint={{
        // Use step expressions (https://maplibre.org/maplibre-gl-js-docs/style-spec/#expressions-step)
        // with three steps to implement three types of circles:
        //   * Blue, 20px circles when point count is less than 100
        //   * Yellow, 30px circles when point count is between 100 and 750
        //   * Pink, 40px circles when point count is greater than or equal to 750
        'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
        'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
      }}
    />

    <SymbolLayer
      applyToClusters
      layout={{
        'text-field': '{point_count_abbreviated}',
        'text-size': 12,
      }}
    />

    <CircleLayer
      applyToClusters={false}
      paint={{
        'circle-color': '#11b4da',
        'circle-radius': 4,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff',
      }}
    />
  </GeoJSON>
</Map>

<CodeSample {code} />
