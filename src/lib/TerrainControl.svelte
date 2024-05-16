<script lang="ts">
  import { mapContext } from './context.js';
  import maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  const { map } = mapContext();

  export let position: maplibregl.ControlPosition = 'top-left';
  export let source: string;
  export let exaggeration: number;

  let control: maplibregl.TerrainControl | null = null;
  $: if ($map && !control) {
    (control = new maplibregl.TerrainControl({ source: source, exaggeration: exaggeration })),
      $map.addControl(control, position);
  }

  onDestroy(() => {
    if ($map?.loaded() && control) {
      $map.removeControl(control);
    }
  });
</script>
