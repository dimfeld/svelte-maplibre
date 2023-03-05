<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import { mapClasses } from '../styles.js';
  import code from './+page.svelte?raw';
  import CodeSample from '$site/CodeSample.svelte';
  import Control from '$lib/Control.svelte';
  import ControlGroup from '$lib/ControlGroup.svelte';
  import ControlButton from '$lib/ControlButton.svelte';
  import NavigationControl from '$lib/NavigationControl.svelte';
  import GeolocateControl from '$lib/GeolocateControl.svelte';
  import AttributionControl from '$lib/AttributionControl.svelte';
  import ScaleControl from '$lib/ScaleControl.svelte';
  import FullscreenControl from '$lib/FullscreenControl.svelte';
</script>

<p>Click the controls in the upper right corner to fly to a location.</p>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class={mapClasses}
  center={[-120, 50]}
  zoom={2}
  attributionControl={false}
  let:map
>
  <!-- You can also set the Map's `standardControls` attribute to create these. -->
  <NavigationControl position="top-left" />
  <GeolocateControl position="top-left" fitBoundsOptions={{ maxZoom: 12 }} />
  <FullscreenControl position="top-left" />
  <ScaleControl />
  <AttributionControl
    customAttribution={`A <strong class="text-red-500">custom</strong> attribution`}
  />

  <Control class="flex flex-col gap-y-2">
    <ControlGroup>
      <ControlButton
        on:click={() => {
          map.flyTo({
            center: [-5, 54],
            zoom: 4,
          });
        }}
      >
        UK
      </ControlButton>
      <ControlButton
        on:click={() =>
          map.fitBounds([
            [-120, 50],
            [-70, 20],
          ])}
      >
        US
      </ControlButton>
      <ControlButton
        on:click={() =>
          map.fitBounds([
            [110, 20],
            [140, 0],
          ])}
      >
        PH
      </ControlButton>
    </ControlGroup>

    <ControlGroup>
      <ControlButton on:click={() => alert('!')}>!</ControlButton>
    </ControlGroup>
  </Control>
</MapLibre>

<CodeSample {code} />
