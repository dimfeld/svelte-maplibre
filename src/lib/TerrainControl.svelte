<script lang="ts">
  import { run } from 'svelte/legacy';

  import { mapContext } from './context.js';
  import maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  const { map } = mapContext();

  interface Props {
    position?: maplibregl.ControlPosition;
    source: string;
    exaggeration: number;
  }

  let { position = 'top-left', source, exaggeration }: Props = $props();

  let control: maplibregl.TerrainControl | null = $state(null);
  run(() => {
    if ($map && !control) {
      (control = new maplibregl.TerrainControl({ source: source, exaggeration: exaggeration })),
        $map.addControl(control, position);
    }
  });

  onDestroy(() => {
    if ($map?.loaded() && control) {
      $map.removeControl(control);
    }
  });
</script>
