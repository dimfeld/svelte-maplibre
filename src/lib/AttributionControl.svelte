<script lang="ts">
  import { getMapContext } from './context.svelte.js';
  import maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  const { map, loaded } = $derived(getMapContext());

  interface Props {
    position?: maplibregl.ControlPosition;
    compact?: boolean;
    customAttribution?: string | string[] | undefined;
  }

  let {
    position = 'bottom-right',
    compact = false,
    customAttribution = undefined,
  }: Props = $props();

  let control: maplibregl.AttributionControl | undefined = $state();
  $effect(() => {
    if (!control) {
      control = new maplibregl.AttributionControl({
        compact,
        customAttribution,
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
