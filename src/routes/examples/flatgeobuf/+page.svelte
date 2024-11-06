<script lang="ts">
  import type { Map } from 'maplibre';

  import MapLibre from '$lib/MapLibre.svelte';
  import FlatGeobuf from '$lib/FlatGeobuf.svelte';
  import FillLayer from '$lib/FillLayer.svelte';
  import { mapClasses } from '../styles.js';
  import code from './+page.svelte?raw';
  import CodeSample from '$site/CodeSample.svelte';

  // START EXTRACT
  // Note that each geometry in this fgb is wrapped in a GeometryCollection
  // Extraction can be achieved with prop extractGeomCols={true}
  import kathmanduFgbData from '$site/kathmandu.fgb?url';

  let map: Map | undefined;
  let loaded: boolean;

  // Load a standard XYZ map, else the polygons render underneath the style?
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
        id: 'osm',
        type: 'raster',
        source: 'osm',
        layout: {
          visibility: 'visible',
        },
      },
    ],
  };
  // END EXTRACT
</script>

<!-- extent={taskStore.selectedTaskGeom} -->
<MapLibre
  bind:map
  bind:loaded
  style={osmStyle}
  class={mapClasses}
  standardControls
  center={[85.302386, 27.71245]}
  zoom={16}
>
  <FlatGeobuf id="entities" url={kathmanduFgbData} promoteId="id">
    <FillLayer
      paint={{
        'fill-color': '#006600',
        'fill-opacity': 0.5,
      }}
      beforeLayerType="symbol"
      manageHoverState
    />
  </FlatGeobuf>
</MapLibre>

<CodeSample
  {code}
  startBoundary="// START EXTRACT"
  endBoundary="// END EXTRACT"
  omitStartBoundary
  omitEndBoundary
  language="javascript"
/>
<CodeSample {code} />

<style>
  .grid {
    grid-template-columns: repeat(auto-fill, 150px);
  }
</style>
