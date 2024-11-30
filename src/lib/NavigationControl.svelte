<script lang="ts">
  import { getMapContext } from './context.svelte.js';
  import maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  const { map, loaded } = $derived(getMapContext());

  interface Props {
    position?: maplibregl.ControlPosition;
    showCompass?: boolean;
    showZoom?: boolean;
    visualizePitch?: boolean;
  }

  let {
    position = 'top-left',
    showCompass = true,
    showZoom = true,
    visualizePitch = false,
  }: Props = $props();

  let control: maplibregl.NavigationControl | undefined = $state();
  $effect(() => {
    if (map && !control) {
      control = new maplibregl.NavigationControl({ showCompass, showZoom, visualizePitch });
      map.addControl(control, position);
    }
  });

  onDestroy(() => {
    if (loaded && control) {
      map.removeControl(control);
    }
  });
</script>
