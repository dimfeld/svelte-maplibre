<script lang="ts">
  import { getMapContext } from './context.svelte.js';
  import maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  const { map, loaded } = $derived(getMapContext());

  interface Props {
    position?: maplibregl.ControlPosition;
    positionOptions?: PositionOptions | undefined;
    fitBoundsOptions?: maplibregl.FitBoundsOptions | undefined;
    trackUserLocation?: boolean;
    showAccuracyCircle?: boolean;
    showUserLocation?: boolean;
    control?: maplibregl.GeolocateControl;
  }

  let {
    position = 'top-left',
    positionOptions = undefined,
    fitBoundsOptions = undefined,
    trackUserLocation = false,
    showAccuracyCircle = true,
    showUserLocation = true,
    control = $bindable(),
  }: Props = $props();
  $effect(() => {
    if (map && !control) {
      control = new maplibregl.GeolocateControl({
        positionOptions,
        fitBoundsOptions,
        trackUserLocation,
        showAccuracyCircle,
        showUserLocation,
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
