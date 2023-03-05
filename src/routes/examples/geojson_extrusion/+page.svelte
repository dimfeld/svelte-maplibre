<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import GeoJSON from '$lib/GeoJSON.svelte';
  import { mapClasses } from '../styles.js';
  import code from './+page.svelte?raw';
  import CodeSample from '$site/CodeSample.svelte';
  import cbsa from '$site/cbsa.json';
  import FillExtrusionLayer from '$lib/FillExtrusionLayer.svelte';
  import Popup from '$lib/Popup.svelte';
</script>

<p>
  Map of US Metropolitan Areas. Height indicates total population and color indicates population
  density.
</p>
<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class={mapClasses}
  standardControls
  pitch={30}
  center={[-98.137, 40.137]}
  zoom={4}
>
  <GeoJSON id="cbsa" data={cbsa} promoteId="CBSAFP">
    <FillExtrusionLayer
      paint={{
        'fill-extrusion-base': 0,
        'fill-extrusion-color': [
          'interpolate',
          ['linear'],
          // Population density
          ['/', ['get', 'POPESTIMATE2020'], ['/', ['get', 'ALAND'], 1000000]],
          0,
          '#0a0',
          200,
          '#a00',
        ],
        'fill-extrusion-opacity': 0.6,
        'fill-extrusion-height': ['/', ['get', 'POPESTIMATE2020'], 20],
      }}
      beforeLayerType="symbol"
    >
      <Popup openOn="hover" let:features>
        <div class="flex flex-col gap-2">
          <div class="text-lg font-bold">{features[0].properties.NAME}</div>
          <p>Population: {features[0].properties.POPESTIMATE2020}</p>
        </div>
      </Popup>
    </FillExtrusionLayer>
  </GeoJSON>
</MapLibre>

<CodeSample {code} />
