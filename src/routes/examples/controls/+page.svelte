<script lang="ts">
  import Map from '$lib/Map.svelte';
  import { mapClasses } from '../styles.js';
  import code from './+page.svelte?raw';
  import CodeSample from '$site/CodeSample.svelte';
  import Control from '$lib/Control.svelte';
  import ControlGroup from '$lib/ControlGroup.svelte';
  import ControlButton from '$lib/ControlButton.svelte';
</script>

<Map center={[-120, 50]} zoom={2} class={mapClasses} let:map>
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
</Map>

<CodeSample {code} />
