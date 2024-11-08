<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import NavigationControl from '$lib/NavigationControl.svelte';
  import AttributionControl from '$lib/AttributionControl.svelte';
  import RasterTileSource from '$lib/RasterTileSource.svelte';
  import RasterDEMTileSource from '$lib/RasterDEMTileSource.svelte';
  import RasterLayer from '$lib/RasterLayer.svelte';
  import HillshadeLayer from '$lib/HillshadeLayer.svelte';
  import Terrain from '$lib/Terrain.svelte';
  import TerrainControl from '$lib/TerrainControl.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';
  import type { PageData } from './$types';
  import type { PropertyValueSpecification } from 'maplibre-gl';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let terrainExaggeration: number = $state(1.0);
  let hillshadeExaggeration: number = $state(0.5);
  let illuminationAnchor: PropertyValueSpecification<'map' | 'viewport'> = $state('map');
</script>

<p>
  This map shows how to use 3D terrain with hillshading on the map. Data from <a
    href="https://github.com/maplibre/demotiles"
    target="_blank">MapLibre Demo Tiles</a
  >. Tutorial based on
  <a href="https://maplibre.org/maplibre-gl-js/docs/examples/3d-terrain/" target="_blank"
    >MapLibre GL JS 3D Terrain</a
  >.
</p>

<fieldset class="flex gap-x-4">
  <legend>Hillshade illumination anchor</legend>
  <label><input type="radio" bind:group={illuminationAnchor} value="map" /> Map</label>
  <label
    ><input type="radio" bind:group={illuminationAnchor} value="viewport" /> Viewport (default)</label
  >
</fieldset>

<fieldset class="flex gap-x-4">
  <legend>Exaggeration</legend>
  <label>
    Hillshade: {hillshadeExaggeration.toFixed(2)}
    <input
      type="range"
      min="0.0"
      max="1.0"
      step="0.01"
      bind:value={hillshadeExaggeration}
      id="hillshade-exaggeration"
    />
  </label>
  <label>
    Terrain: {terrainExaggeration.toFixed(1)}
    <input
      type="range"
      min="0.0"
      max="5.0"
      step="0.1"
      bind:value={terrainExaggeration}
      id="terrain-exaggeration"
    />
  </label>
</fieldset>

<MapLibre
  style={{
    version: 8,
    center: [11.39085, 47.3],
    zoom: 12,
    pitch: 52,
    sources: {},
    layers: [],
  }}
  class="relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full"
  attributionControl={false}
  diffStyleUpdates={true}
>
  <NavigationControl visualizePitch={true} position={'top-right'} />
  <AttributionControl
    customAttribution={`Map data © <a href=https://www.openstreetmap.org/copyright>OpenStreetMap</a> Contributors | Terrain data <a href="https://earth.jaxa.jp/en/data/policy/">AW3D30 (JAXA)</a> | <a href=https://maplibre.org>MapLibre</a>`}
  />
  <RasterTileSource tiles={['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png']} tileSize={256}>
    <RasterLayer paint={{}} />
  </RasterTileSource>
  <!-- Use a different source for terrain and hillshade layers, to improve render quality -->
  <RasterDEMTileSource
    tiles={['https://demotiles.maplibre.org/terrain-tiles/{z}/{x}/{y}.png']}
    tileSize={256}
    id="terrainSource"
  />
  <RasterDEMTileSource
    tiles={['https://demotiles.maplibre.org/terrain-tiles/{z}/{x}/{y}.png']}
    tileSize={256}
    id="hillshadeSource"
  >
    <HillshadeLayer
      id={'hills'}
      layout={{ visibility: 'visible' }}
      paint={{
        'hillshade-exaggeration': hillshadeExaggeration,
        'hillshade-illumination-anchor': illuminationAnchor,
        'hillshade-shadow-color': '#473B24',
      }}
    />
  </RasterDEMTileSource>
  <Terrain source={'terrainSource'} exaggeration={terrainExaggeration} />
  <TerrainControl
    source={'terrainSource'}
    exaggeration={terrainExaggeration}
    position={'top-right'}
  />
</MapLibre>

<CodeSample {code} startBoundary="<MapLibre" />
