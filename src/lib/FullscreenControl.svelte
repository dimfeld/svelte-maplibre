<script lang="ts">
  import { mapContext } from './context.js';
  import maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  const { map } = mapContext();

  export let position: maplibregl.ControlPosition = 'top-left';
  export let container: HTMLElement | string | undefined = undefined;

  let control: maplibregl.FullscreenControl | null = null;
  $: if ($map && !control) {
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

  onDestroy(() => {
    if ($map?.loaded() && control) {
      $map.removeControl(control);
    }
  });
</script>
