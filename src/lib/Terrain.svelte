<script lang="ts">
  import { mapContext } from './context';
  import maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  const { map } = mapContext();

  export let source: string | undefined = undefined;
  export let exaggeration: number | undefined = undefined;

  let specification: maplibregl.TerrainSpecification | null = null;
  $: if ($map && source) {
    (specification = { source: source, exaggeration: exaggeration }),
      $map.setTerrain(specification);
  }

  onDestroy(() => {

  });
</script>
