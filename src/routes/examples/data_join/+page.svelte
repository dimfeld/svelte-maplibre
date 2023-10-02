<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import VectorTileSource from '$lib/VectorTileSource.svelte';
  import { mapClasses } from '../styles.js';
  import code from './+page.svelte?raw';
  import CodeSample from '$site/CodeSample.svelte';
  import FillLayer from '$lib/FillLayer.svelte';
  import JoinedData from '$lib/JoinedData.svelte';
  import { hoverStateFilter } from '$lib';
  let dataSet = 0;
  function changeData() {
    if (dataSet === 0) {
      dataSet = 1;
    } else {
      dataSet = 0;
    }
  }
</script>

<p>
  This map shows how to join data to a vector tile layer on the map. The JoinedData tag takes an
  array of records and joins them using the provided idCol to the source at run time. These can then
  be accessed in styling using the ['feature-state', colName] function.
  <br />
  This should work on PMTiles, MVT and GeoJSON sources
  <br />
  Just ensure that you use promoteId to set the id of the feature in the source that you are trying to
  target and provide a sourceLayer in the case you are trying to join to PMTiles or MVT tiles.
</p>

<button
  class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
  on:click={changeData}
>
  Change Data
</button>

<p>Showing data set {dataSet}</p>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class={mapClasses}
  standardControls
  center={[-87.622088, 41.878781]}
  zoom={10}
>
  <VectorTileSource
    url={'pmtiles://https://r2-public.protomaps.com/protomaps-sample-datasets/cb_2018_us_zcta510_500k.pmtiles'}
    promoteId={'GEOID10'}
  >
    <FillLayer
      paint={{
        'fill-opacity': hoverStateFilter(0.7, 0.4),
        'fill-color': ['coalesce', ['feature-state', 'color'], '#102020'],
      }}
      sourceLayer={'zcta'}
      manageHoverState
    />
    <JoinedData
      data={dataSet === 1
        ? [
            {
              color: '#ff0000',
              geoid: 60628,
            },
            {
              color: '#00fF00',
              geoid: 60608,
            },
          ]
        : [
            {
              color: '#ff0000',
              geoid: 60628,
            },
          ]}
      idCol="geoid"
      sourceLayer="zcta"
    />
  </VectorTileSource>
</MapLibre>

<CodeSample {code} />
