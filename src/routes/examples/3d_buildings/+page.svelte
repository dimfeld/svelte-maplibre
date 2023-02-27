<script lang="ts">
  import Map from '$lib/Map.svelte';
  import { mapClasses, streetsStyle, hasMaptilerKey } from '../styles.js';
  import code from './+page.svelte?raw';
  import CodeSample from '$site/CodeSample.svelte';
  import FillExtrusionLayer from '$lib/FillExtrusionLayer.svelte';
</script>

{#if !hasMaptilerKey}
  <h2 class="text-red-500">
    Please set the PUBLIC_MAPTILER_KEY environment variable to your MapTiler API key to run this
    example.
  </h2>
{/if}

<p>
  This example uses a FillExtrusionLayer to show a 3D view of buildings, with shorter buildings in
  green and taller buildings in red.<br /> Hold down Ctrl and drag the mouse to rotate on a computer.
</p>
<Map
  style={streetsStyle}
  class={mapClasses}
  standardControls
  center={[-74.0066, 40.7135]}
  zoom={15.5}
  pitch={45}
  bearing={-17.6}
  filterLayers={(l) => {
    // Hide the built-in 3D building layer since we're doing our own.
    return l.id !== 'building-3d';
  }}
>
  <!-- The source and sourceLayer are specific to the map style. You
  will want to look into the style JSON data for your style to see
  the appropriate values. -->
  <FillExtrusionLayer
    source="maptiler_planet"
    sourceLayer="building"
    beforeLayerType={(l) => l.type === 'symbol' && !!l.paint?.['text-color']}
    minzoom={14}
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
        14,
        0,
        14.05,
        ['get', 'render_height'],
      ],
      'fill-extrusion-base': [
        'interpolate',
        ['linear'],
        ['zoom'],
        14,
        0,
        14.05,
        ['get', 'render_min_height'],
      ],
      'fill-extrusion-opacity': 0.6,
    }}
  />
</Map>

<CodeSample {code} />
