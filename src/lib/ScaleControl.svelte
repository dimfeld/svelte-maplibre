<script lang="ts">
  import { getMapContext } from './context.svelte.js';
  import maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  const { map, loaded } = $derived(getMapContext());

  interface Props {
    position?: maplibregl.ControlPosition;
    maxWidth?: number | undefined;
    unit?: 'imperial' | 'metric' | 'nautical';
  }

  let { position = 'bottom-left', maxWidth = undefined, unit = 'metric' }: Props = $props();

  let control: maplibregl.ScaleControl | undefined = $state();
  $effect(() => {
    if (map && !control) {
      control = new maplibregl.ScaleControl({
        maxWidth,
        unit,
      });
      map.addControl(control, position);
    }
  });

  onDestroy(() => {
    if (loaded && control) {
      map.removeControl(control);
    }
  });
</script>
