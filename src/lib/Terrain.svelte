<script lang="ts">
  import { mapContext } from './context';
  import maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  const { map } = mapContext();

  interface Props {
    source?: string | undefined;
    exaggeration?: number | undefined;
  }

  let { source = undefined, exaggeration = undefined }: Props = $props();

  let specification: maplibregl.TerrainSpecification | null = $state(null);
  $effect(() => {
    if ($map && source) {
      specification = { source: source, exaggeration: exaggeration };
      $map.setTerrain(specification);
    }
  });

  onDestroy(() => {
    if ($map?.loaded() && specification) {
      $map.setTerrain(null);
    }
  });
</script>
