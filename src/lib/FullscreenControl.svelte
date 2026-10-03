<script lang="ts">
  import { getMapContext } from './context.svelte.js';
  import * as maplibregl from 'maplibre-gl';
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
    if (map && !control) {
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
      map?.removeControl(control);
    }
  });
</script>

<!-- @component
Add the MapLibre fullscreen control to the map. This control shows a button that toggles fullscreen mode.

Put it inside the `MapLibre` component. Set `container` to an element or a CSS selector to make that element fullscreen instead of the map. The component uses the props only when it creates the control.
-->
