<script lang="ts">
  import { getMapContext } from './context.svelte.js';
  import { onDestroy } from 'svelte';

  const { map, loaded } = $derived(getMapContext());

  interface Props {
    source?: string;
    exaggeration?: number;
  }

  let { source = undefined, exaggeration = undefined }: Props = $props();

  $effect(() => {
    if (source && loaded && map) {
      let specification = { source: source, exaggeration: exaggeration };
      map.setTerrain(specification);
    }
  });

  onDestroy(() => {
    if (loaded && source && map) {
      map.setTerrain(null);
    }
  });
</script>

<!-- @component
Show 3D terrain on the map. Set `source` to the ID of a `RasterDEMTileSource`.

`exaggeration` sets the vertical scale of the terrain. The component removes the terrain when it is destroyed. It must be inside a `MapLibre` component and does not render anything.
-->
