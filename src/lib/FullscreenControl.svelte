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

  let control: maplibregl.FullscreenControl | null = $state(null);
  $effect(() => {
    if ($map && !control) {
      let containerEl: HTMLElement | undefined;
      if (typeof container === 'string') {
        containerEl = (document.querySelector(container) as HTMLElement) ?? undefined;
      } else {
        containerEl = container;
      }

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
