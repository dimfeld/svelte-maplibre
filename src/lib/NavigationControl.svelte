<script lang="ts">
  import { mapContext } from './context';
  import maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  const { map } = mapContext();

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

  let control: maplibregl.NavigationControl | null = $state(null);
  $effect(() => {
    if ($map && !control) {
      control = new maplibregl.NavigationControl({ showCompass, showZoom, visualizePitch });
      $map.addControl(control, position);
    }
  });

  onDestroy(() => {
    if ($map?.loaded() && control) {
      $map.removeControl(control);
    }
  });
</script>
