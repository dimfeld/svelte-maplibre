<script lang="ts">
  import { getMapContext } from './context.svelte.js';
  import maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  const { map, loaded } = $derived(getMapContext());

  interface Props {
    source?: string | undefined;
    exaggeration?: number | undefined;
  }

  let { source = undefined, exaggeration = undefined }: Props = $props();

  let specification: maplibregl.TerrainSpecification | undefined = $state();
  $effect(() => {
    if (source) {
      specification = { source: source, exaggeration: exaggeration };
      map.setTerrain(specification ?? null);
    }
  });

  onDestroy(() => {
    if (loaded && specification) {
      map.setTerrain(null);
    }
  });
</script>
