<script lang="ts">
  import { mapContext } from './context';
  import maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';

  const { map } = mapContext();

  export let position: maplibregl.ControlPosition = 'top-left';
  export let positionOptions: PositionOptions | undefined = undefined;
  export let fitBoundsOptions: maplibregl.FitBoundsOptions | undefined = undefined;
  export let trackUserLocation = false;
  export let showAccuracyCircle = true;
  export let showUserLocation = true;

  let control: maplibregl.GeolocateControl | null = null;
  $: if ($map && !control) {
    control = new maplibregl.GeolocateControl({
      positionOptions,
      fitBoundsOptions,
      trackUserLocation,
      showAccuracyCircle,
      showUserLocation,
    });
    $map.addControl(control, position);
  }

  onDestroy(() => {
    if ($map?.loaded() && control) {
      $map.removeControl(control);
    }
  });
</script>
