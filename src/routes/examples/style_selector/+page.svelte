<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import { mapClasses } from '../styles.js';
  import code from './+page.svelte?raw';
  import CodeSample from '$site/CodeSample.svelte';
  import StyleSelectControl from '$lib/StyleSelectControl.svelte';

  const osmStyle = {
    id: 'OSM Raster',
    version: 8,
    name: 'OpenStreetMap',
    sources: {
      osm: {
        type: 'raster',
        tiles: [
          'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
        ],
        minzoom: 0,
        maxzoom: 19,
        attribution:
          '© <a target="_blank" rel="noopener" href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      },
    },
    layers: [
      {
        id: 'background',
        type: 'raster',
        source: 'osm',
        layout: {
          visibility: 'visible',
        },
      },
    ],
  };

  let stamenStyle = {
    id: 'Stamen Raster',
    version: 8,
    name: 'Black & White',
    sources: {
      stamen: {
        type: 'raster',
        tiles: ['https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png'],
        minzoom: 0,
        maxzoom: 19,
        attribution: `© <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> <a href="https://stamen.com/" target="_blank">
               © Stamen Design</a> 
               © <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a>
               `,
      },
    },
    layers: [
      {
        id: 'background',
        type: 'raster',
        source: 'stamen',
        layout: {
          visibility: 'visible',
        },
      },
    ],
  };

  let esriStyle = {
    id: 'ESRI Raster',
    version: 8,
    name: 'ESRI',
    sources: {
      esri: {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        ],
        minzoom: 0,
        maxzoom: 19,
        attribution: '© ESRI',
      },
    },
    layers: [
      {
        id: 'background',
        type: 'raster',
        source: 'esri',
        layout: {
          visibility: 'visible',
        },
      },
    ],
  };
</script>

<p>Select a different style by hovering over the map thumbnail.</p>

<MapLibre style={osmStyle} class={mapClasses} center={[-120, 50]} zoom={2} standardControls>
  <StyleSelectControl
    position="bottom-left"
    expandDirection="right"
    extraStyles={[
      esriStyle,
      stamenStyle,
      'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    ]}
  />
</MapLibre>

<CodeSample {code} />
