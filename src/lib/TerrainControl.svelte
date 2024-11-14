<script lang="ts">
  import { mapContext } from './context.svelte.js';
  import maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  const { map } = mapContext();

  interface Props {
    position?: maplibregl.ControlPosition;
    source: string;
    exaggeration: number;
  }

  let { position = 'top-left', source, exaggeration }: Props = $props();

  let control: maplibregl.TerrainControl | undefined = $state();
  $effect(() => {
    if (!control) {
      control = new maplibregl.TerrainControl({ source: source, exaggeration: exaggeration });
      map.addControl(control, position);
    }
  });

  onDestroy(() => {
    if (map.loaded() && control) {
      map.removeControl(control);
    }
  });
</script>
