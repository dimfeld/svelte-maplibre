<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { getId, mapContext } from './context';

  export let id = getId('deckgl-layer');
  export let data;

  let deck;
  onMount(() => {
    Promise.all([
      import('@deck.gl/core'),
      import('@deck.gl/layers'),
      import('@deck.gl/mapbox'),
    ]).then(([core, layers, mapbox]) => {
      deck = {
        ...core,
        ...layers,
        ...mapbox,
      };
    });
  });

  const { map } = mapContext();

  let layer;
  $: if ($map && deck) {
    layer = new deck.MapboxLayer({
      id,
      type: deck.ArcLayer,
      data,
      getSourcePosition: (d) => d.source,
      getTargetPosition: (d) => d.target,
      getSourceColor: (d) => d.sourceColor,
      getTargetColor: (d) => d.targetColor,
      getWidth: 1.5,
      getHeight: 0.1,
    });

    $map.addLayer(layer);
  }

  onDestroy(() => {
    if ($map && layer) {
      $map.removeLayer(id);
    }
  });
</script>
