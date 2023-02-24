<script lang="ts">
  import Map from '$lib/Map.svelte';
  import { mapClasses, streetsStyle } from '../styles.js';
  import code from './+page.svelte?raw';
  import CodeSample from '$site/CodeSample.svelte';
  import FillExtrusionLayer from '$lib/FillExtrusionLayer.svelte';
</script>

<p>
  This example uses a FillExtrusionLayer to show a 3D view of builderings, with shorter buildings in
  green and higher buildings in red.
</p>
<Map
  style={streetsStyle}
  class={mapClasses}
  standardControls
  center={[-74.0066, 40.7135]}
  zoom={15.5}
  pitch={45}
  bearing={-17.6}
  on:load={({ detail: map }) => {
    // Hide the built-in extrusion layer since we're doing our own.
    map.setLayoutProperty('building-3d', 'visibility', 'none');
  }}
>
  <!-- The source and sourceLayer are specific to the map style. You
  will want to look into the JSON file itself for your style to see
  the appropriate values. -->
  <FillExtrusionLayer
    source="maptiler_planet"
    sourceLayer="building"
    beforeLayerType={(l) => l.type === 'symbol' && !!l.paint?.['text-color']}
    minzoom={15}
    paint={{
      // Show lower buildings in green, higher in red.
      'fill-extrusion-color': [
        'interpolate',
        ['linear'],
        ['get', 'render_height'],
        0,
        '#0a0',
        70,
        '#a00',
      ],

      // use an 'interpolate' expression to add a smooth transition effect to the
      // buildings as the user zooms in
      'fill-extrusion-height': [
        'interpolate',
        ['linear'],
        ['zoom'],
        15,
        0,
        15.05,
        ['get', 'render_height'],
      ],
      'fill-extrusion-base': [
        'interpolate',
        ['linear'],
        ['zoom'],
        15,
        0,
        15.05,
        ['get', 'render_min_height'],
      ],
      'fill-extrusion-opacity': 0.6,
    }}
  />
</Map>

<CodeSample {code} />
