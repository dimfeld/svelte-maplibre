<script lang="ts">
  import { getMapContext } from './context.svelte.js';
  import * as maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  const { map, loaded } = $derived(getMapContext());

  interface Props {
    position?: maplibregl.ControlPosition;
    compact?: boolean;
    customAttribution?: string | string[] | undefined;
  }

  let {
    position = 'bottom-right',
    compact = false,
    customAttribution = undefined,
  }: Props = $props();

  let control: maplibregl.AttributionControl | undefined = $state();
  $effect(() => {
    if (map && !control) {
      control = new maplibregl.AttributionControl({
        compact,
        customAttribution,
      });
      map.addControl(control, position);
    }
  });

  onDestroy(() => {
    if (loaded && control && map) {
      map.removeControl(control);
    }
  });
</script>

<!-- @component
Add the MapLibre attribution control to the map. This control shows the attribution text for the map sources.

Put it inside the `MapLibre` component. Use `customAttribution` to add your own text, and `compact` to show a compact control. The component uses the props only when it creates the control.
-->
