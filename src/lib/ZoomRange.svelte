<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import { getMapContext, setZoomLimits } from './context.svelte.js';

  interface Props {
    minzoom?: number | undefined;
    maxzoom?: number | undefined;
    /** If true, only instantiate the slot contents when the map zoom is in range. If false,
     * the layers themselves will handle it. Usually you will want this to be false. */
    enforce?: boolean;
    children?: Snippet;
  }

  let { minzoom = undefined, maxzoom = undefined, enforce = false, children }: Props = $props();

  const { map, loaded } = $derived(getMapContext());

  let zoomLimits = setZoomLimits(minzoom, maxzoom);
  $effect.pre(() => {
    zoomLimits.minzoomSetting = minzoom;
    zoomLimits.maxzoomSetting = maxzoom;
  });

  // svelte-ignore state_referenced_locally
  let zoom = $state(map.getZoom() ?? 0);
  function handleZoom() {
    zoom = map.getZoom();
  }

  onMount(() => {
    map.on('zoom', handleZoom);
    return () => {
      if (loaded) {
        map.off('zoom', handleZoom);
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

{#if !enforce || (zoomLimits.minzoom <= zoom && zoom <= zoomLimits.maxzoom)}
  {@render children?.()}
{/if}
