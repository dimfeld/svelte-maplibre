<script lang="ts">
  import { mapContext } from './context';
  import maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  const { map } = mapContext();

  export let position: maplibregl.ControlPosition = 'bottom-left';
  export let maxWidth: number | undefined = undefined;
  export let unit: 'imperial' | 'metric' | 'nautical' = 'metric';

  let control: maplibregl.ScaleControl | null = null;
  $: if ($map && !control) {
    control = new maplibregl.ScaleControl({
      maxWidth,
      unit,
    });
    $map.addControl(control, position);
  }

  onDestroy(() => {
    if ($map?.loaded() && control) {
      $map.removeControl(control);
    }
  });
</script>
