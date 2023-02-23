<script lang="ts">
  import { mapContext } from './context';
  import maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  const { map } = mapContext();

  export let position: maplibregl.ControlPosition = 'bottom-right';
  export let compact = false;
  export let customAttribution: string | string[] | undefined = undefined;

  let control: maplibregl.AttributionControl | null = null;
  $: if ($map && !control) {
    control = new maplibregl.AttributionControl({
      compact,
      customAttribution,
    });
    $map.addControl(control, position);
  }

  onDestroy(() => {
    if ($map?.loaded() && control) {
      $map.removeControl(control);
    }
  });
</script>
