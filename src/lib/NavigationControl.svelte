<script lang="ts">
  import { mapContext } from './context';
  import maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  const { map } = mapContext();

  export let position: maplibregl.ControlPosition = 'top-left';
  export let showCompass = true;
  export let showZoom = true;
  export let visualizePitch = false;

  let control: maplibregl.NavigationControl | null = null;
  $: if ($map && !control) {
    (control = new maplibregl.NavigationControl({ showCompass, showZoom, visualizePitch })),
      $map.addControl(control, position);
  }

  onDestroy(() => {
    if ($map?.loaded() && control) {
      $map.removeControl(control);
    }
  });
</script>
