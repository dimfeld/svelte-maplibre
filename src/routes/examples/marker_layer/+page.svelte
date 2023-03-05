<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import GeoJSON from '$lib/GeoJSON.svelte';
  import { mapClasses } from '../styles.js';
  import code from './+page.svelte?raw';
  import CodeSample from '$site/CodeSample.svelte';
  import states from '$site/states.json?url';
  import MarkerLayer from '$lib/MarkerLayer.svelte';
  import Popup from '$lib/Popup.svelte';
</script>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class={mapClasses}
  standardControls
  center={[-98.137, 40.137]}
  zoom={4}
>
  <GeoJSON id="states" data={states} promoteId="STATEFP">
    <MarkerLayer interactive let:feature>
      <div class="bg-gray-200 rounded-full p-2 shadow">
        <div class="text-sm font-bold">{feature.properties.NAME}</div>
      </div>
      <Popup openOn="hover">
        {feature.properties.NAME} has FIPS code {feature.properties.STATEFP}
      </Popup>
    </MarkerLayer>
  </GeoJSON>
</MapLibre>

<CodeSample {code} />
