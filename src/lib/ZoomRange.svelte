<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { mapContext, setMapContext } from './context';

  interface Props {
    minzoom?: number | undefined;
    maxzoom?: number | undefined;
    /** If true, only instantiate the slot contents when the map zoom is in range. If false,
     * the layers themselves will handle it. Usually you will want this to be false. */
    enforce?: boolean;
    children?: import('svelte').Snippet;
  }

  let { minzoom = undefined, maxzoom = undefined, enforce = false, children }: Props = $props();

  const context = mapContext();
  const map = context.map;
  const originalMinZoom = context.minzoom;
  const originalMaxZoom = context.maxzoom;

  const minZoom = writable(minzoom ?? $originalMinZoom);
  const maxZoom = writable(maxzoom ?? $originalMaxZoom);

  $effect(() => {
    minZoom.set(minzoom ?? $originalMinZoom);
  });
  $effect(() => {
    maxZoom.set(maxzoom ?? $originalMaxZoom);
  });

  setMapContext({
    ...context,
    minzoom: minZoom,
    maxzoom: maxZoom,
  });

  let zoom = $state($map?.getZoom() ?? 0);
  function handleZoom() {
    zoom = $map.getZoom();
  }

  onMount(() => {
    $map.on('zoom', handleZoom);
    return () => {
      if ($map?.loaded()) {
        $map.off('zoom', handleZoom);
      }
    };
  });
</script>

<!-- @component
Set `minzoom` and `maxzoom` for all components inside the slot. By default this only propagates the value
to the inner layers.

You can set `enforce` to `true` to tear down the slot contents when the zoom
is outside the range. This is usually bad for performance, so it is not recommended for use with map layers,
but can have other uses such as creating and removing map controls or other behaviors depending on zoom level.
-->

{#if !enforce || ($minZoom <= zoom && zoom <= $maxZoom)}
  {@render children?.()}
{/if}
