<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import NavigationControl from '$lib/NavigationControl.svelte';
  import RasterTileSource from '$lib/RasterTileSource.svelte';
  import RasterLayer from '$lib/RasterLayer.svelte';
  import FullscreenControl from '$lib/FullscreenControl.svelte';
  import TerrainControl from '$lib/TerrainControl.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';
  import type { PageData } from './$types';
  import type { StyleSpecification } from 'maplibre-gl';

  export let data: PageData;

  const tiles: string = 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png';
  let opacity: number = 0.5;

  const terrainTiles = 'https://demotiles.maplibre.org/terrain-tiles/{z}/{x}/{y}.png';
  const terrainTileSize = 256;

  const terrainExaggeration: number = 1.0;
  const hillshadeExaggeration: number = 1.0;

  const style: StyleSpecification = {
    version: 8,
    center: [11.39085, 47.27574],
    zoom: 12,
    sources: {
      // Use a different source for terrain and hillshade layers, to improve render quality
      terrainSource: {
          type: 'raster-dem',
          // url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
          tiles: [terrainTiles],
          tileSize: terrainTileSize
      },
      hillshadeSource: {
        type: 'raster-dem',
        tiles: [terrainTiles],
        tileSize: terrainTileSize,
      }
    },
    layers: [
      {
        id: 'hills',
        type: 'hillshade',
        source: 'hillshadeSource',
        layout: {visibility: 'visible'},
        paint: { // https://maplibre.org/maplibre-style-spec/layers/#hillshade
            'hillshade-illumination-anchor': "map", // default "viewport"
            'hillshade-illumination-direction': 300, // default 335
            'hillshade-highlight-color': '#ffffff', // default "#FFFFFF"
            'hillshade-accent-color': '#000000', // default "#000000"
            'hillshade-shadow-color': '#000000', // default "#000000"
            'hillshade-exaggeration': hillshadeExaggeration // default 0.5
        }
      }, 
    ],
    terrain: {
      source: 'terrainSource',
      exaggeration: terrainExaggeration
    }
  };


</script>

<MapLibre
  style={style}
  class="relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full"
  diffStyleUpdates={true}
>
  <NavigationControl visualizePitch={true} />
  <FullscreenControl />
  <TerrainControl source={'terrainSource'} exaggeration={terrainExaggeration} />
  <RasterTileSource tiles={[tiles]} tileSize={256} id="rgbSource">
    <RasterLayer
      paint={{
        'raster-opacity': opacity,
      }}
    />
  </RasterTileSource>
</MapLibre>

<div>
  <label>
    RGB opacity
    <input type="number" bind:value={opacity} min="0.0" max="1.0" step="0.01">
    <input type="range" min="0.0" max="1.0" step="0.01" bind:value={opacity} id="rgb-opacity">
  </label>
</div>


<CodeSample {code} startBoundary="<script"/>