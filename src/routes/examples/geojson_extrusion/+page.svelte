<script lang="ts">
  import Map from '$lib/Map.svelte';
  import GeoJSON from '$lib/GeoJSON.svelte';
  import { mapClasses } from '../styles.js';
  import code from './+page.svelte?raw';
  import CodeSample from '$site/CodeSample.svelte';
  import cbsa from '$site/cbsa.json';
  import FillExtrusionLayer from '$lib/FillExtrusionLayer.svelte';
  import Popup from '$lib/Popup.svelte';

  function generateData() {
    for (let feature of cbsa.features) {
      // Placeholder until I get real data in here.
      feature.properties['population'] = Math.ceil(Math.random() * 1000);
    }

    return cbsa;
  }
</script>

<p>
  Population for US Metropolitan Areas. Population values are currently random, pending import of
  real data.
</p>
<Map
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class={mapClasses}
  standardControls
  pitch={30}
  center={[-98.137, 40.137]}
  zoom={4}
>
  <GeoJSON id="cbsa" data={generateData()} promoteId="CBSAFP">
    <FillExtrusionLayer
      paint={{
        'fill-extrusion-base': 0,
        'fill-extrusion-color': [
          'interpolate',
          ['linear'],
          ['get', 'population'],
          0,
          '#aaa',
          1000,
          '#0a0',
        ],
        'fill-extrusion-opacity': 0.6,
        'fill-extrusion-height': ['*', ['get', 'population'], 100],
      }}
      beforeLayerType="symbol"
    >
      <Popup openOn="hover" let:features>
        <div class="flex flex-col gap-2">
          <div class="text-lg font-bold">{features[0].properties.NAME}</div>
          <p>Population: {features[0].properties.population}</p>
        </div>
      </Popup>
    </FillExtrusionLayer>
  </GeoJSON>
</Map>

<CodeSample {code} />
<CodeSample {code} />
