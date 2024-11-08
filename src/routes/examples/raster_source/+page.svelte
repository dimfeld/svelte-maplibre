<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import RasterTileSource from '$lib/RasterTileSource.svelte';
  import RasterLayer from '$lib/RasterLayer.svelte';
  import { mapClasses } from '../styles.js';
  import code from './+page.svelte?raw';
  import CodeSample from '$site/CodeSample.svelte';
  import LineLayer from '$lib/LineLayer.svelte';

  let pollutant = $state('PM25_viridis');
  let url = $derived(
    `https://ukair.maps.rcdo.co.uk/ukairserver/services/aq_amb_2021/${pollutant}/MapServer/WMSServer?bbox={bbox-epsg-3857}&request=GetMap&version=1.3.0&format=image%2Fpng&crs=EPSG%3A3857&width=256&height=256&styles=&layers=20`
  );
</script>

<p>
  This map shows how to use raster sources on the map. Data from <a
    href="https://uk-air.defra.gov.uk/data/wms-services"
    target="_blank">UK-AIR</a
  >.
</p>

<fieldset class="flex gap-x-4">
  <legend>Pollution layer</legend>
  <label><input type="radio" bind:group={pollutant} value="PM25_viridis" /> PM2.5</label>
  <label><input type="radio" bind:group={pollutant} value="PM10_viridis" /> PM10</label>
  <label><input type="radio" bind:group={pollutant} value="NOx_viridis" /> NO2</label>
</fieldset>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class={mapClasses}
  standardControls
  bounds={[-5.96, 49.89, 2.31, 55.94]}
>
  <RasterTileSource tiles={[url]} tileSize={256}>
    <RasterLayer
      paint={{
        'raster-opacity': 0.5,
      }}
    />
  </RasterTileSource>
</MapLibre>

<CodeSample {code} />
