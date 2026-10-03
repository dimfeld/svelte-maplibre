<script lang="ts">
  import { getMapContext } from './context.svelte.js';
  import * as maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  const { map, loaded } = $derived(getMapContext());

  interface Props {
    position?: maplibregl.ControlPosition;
    maxWidth?: number | undefined;
    unit?: 'imperial' | 'metric' | 'nautical';
  }

  let { position = 'bottom-left', maxWidth = undefined, unit = 'metric' }: Props = $props();

  let control: maplibregl.ScaleControl | undefined = $state();
  $effect(() => {
    if (map && !control) {
      control = new maplibregl.ScaleControl({
        maxWidth,
        unit,
      });
      map.addControl(control, position);
    }
  });

  onDestroy(() => {
    if (loaded && control) {
      map?.removeControl(control);
    }
  });
</script>

<!-- @component
Add the MapLibre scale control to the map. This control shows a scale bar for the current zoom level.

Put it inside the `MapLibre` component. The component uses the props only when it creates the control. Changes to the props after that have no effect.
-->
