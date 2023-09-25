<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import VectorTileSource from '$lib/VectorTileSource.svelte';
  import { mapClasses } from '../styles.js';
  import code from './+page.svelte?raw';
  import CodeSample from '$site/CodeSample.svelte';
  import LineLayer from '$lib/LineLayer.svelte';
</script>

<p>
  This map shows how to use <a href="https://protomaps.com/docs/pmtiles" target="__blank">PMTile</a>
  sources on a map.
</p>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class={mapClasses}
  standardControls
  center={[-87.622088, 41.878781]}
  zoom={10}
>
  <VectorTileSource
    url={'pmtiles://https://r2-public.protomaps.com/protomaps-sample-datasets/cb_2018_us_zcta510_500k.pmtiles'}
  >
    <LineLayer
      paint={{
        'line-opacity': 0.6,
        'line-color': 'rgb(53, 175, 109)',
        'line-width': 2,
      }}
      sourceLayer={'zcta'}
    />
  </VectorTileSource>
</MapLibre>

<CodeSample {code} />

<style>
  .grid {
    grid-template-columns: repeat(auto-fill, 150px);
  }
</style>
