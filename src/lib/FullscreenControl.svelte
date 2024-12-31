<script lang="ts">
  import { getMapContext } from './context.svelte.js';
  import maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  const { map, loaded } = $derived(getMapContext());

  interface Props {
    position?: maplibregl.ControlPosition;
    container?: HTMLElement | string | undefined;
  }

  let { position = 'top-left', container = undefined }: Props = $props();

  let control: maplibregl.FullscreenControl | undefined = $state();

  let containerEl = $derived.by(() => {
    if (typeof container === 'string') {
      return (document.querySelector(container) as HTMLElement) ?? undefined;
    } else {
      return container;
    }
  });

  $effect(() => {
    if (!control) {
      if (containerEl) {
        control = new maplibregl.FullscreenControl({
          container: containerEl,
        });
      } else {
        control = new maplibregl.FullscreenControl();
      }
      map.addControl(control, position);
    }
  });

  onDestroy(() => {
    if (loaded && control) {
      map.removeControl(control);
    }
  });
</script>
