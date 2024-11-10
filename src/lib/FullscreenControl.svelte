<script lang="ts">
  import { mapContext } from './context.js';
  import maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  const { map } = mapContext();

  interface Props {
    position?: maplibregl.ControlPosition;
    container?: HTMLElement | string | undefined;
  }

  let { position = 'top-left', container = undefined }: Props = $props();

  let control: maplibregl.FullscreenControl | undefined = $state();

  let containerEl = $derived.by(() => {
    if (!$map) {
      return;
    }

    if (typeof container === 'string') {
      return (document.querySelector(container) as HTMLElement) ?? undefined;
    } else {
      return container;
    }
  });

  $effect(() => {
    if ($map && containerEl && !control) {
      control = new maplibregl.FullscreenControl({
        container: containerEl,
      });
      $map.addControl(control, position);
    }
  });

  onDestroy(() => {
    if ($map?.loaded() && control) {
      $map.removeControl(control);
    }
  });
</script>
