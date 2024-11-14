<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import VectorTileSource from '$lib/VectorTileSource.svelte';
  import { mapClasses } from '../styles.js';
  import code from './+page.svelte?raw';
  import CodeSample from '$site/CodeSample.svelte';
  import LineLayer from '$lib/LineLayer.svelte';
</script>

<p>This map shows how to use vector sources (MVT) on the map.</p>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class={mapClasses}
  standardControls
  center={[-87.622088, 41.878781]}
  zoom={10}
>
  <VectorTileSource
    tiles={[
      'https://tiles.mapillary.com/maps/vtp/mly1_public/2/{z}/{x}/{y}?access_token=MLY|4142433049200173|72206abe5035850d6743b23a49c41333',
    ]}
  >
    <LineLayer
      paint={{
        'line-opacity': 0.6,
        'line-color': 'rgb(53, 175, 109)',
        'line-width': 2,
      }}
      sourceLayer={'sequence'}
    />
  </VectorTileSource>
</MapLibre>

<CodeSample {code} />
