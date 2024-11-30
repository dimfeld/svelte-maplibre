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
    if (source) {
      let specification = { source: source, exaggeration: exaggeration };
      map.setTerrain(specification);
    }
  });

  onDestroy(() => {
    if (loaded && source) {
      map.setTerrain(null);
    }
  });
</script>
