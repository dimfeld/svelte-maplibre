<script lang="ts">
  import { getMapContext } from './context.svelte.js';
  import * as maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  const { map, loaded } = $derived(getMapContext());

  interface Props {
    position?: maplibregl.ControlPosition;
    source: string;
    exaggeration: number;
  }

  let { position = 'top-left', source, exaggeration }: Props = $props();

  let control: maplibregl.TerrainControl | undefined = $state();
  $effect(() => {
    if (map && !control) {
      control = new maplibregl.TerrainControl({ source: source, exaggeration: exaggeration });
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
Add the MapLibre terrain control to the map. This control shows a button that turns 3D terrain on and off.

Put it inside the `MapLibre` component. Set `source` to the ID of a raster DEM source, and `exaggeration` to the terrain height multiplier. The component uses the props only when it creates the control.
-->
