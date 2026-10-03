<script lang="ts">
  import { getMapContext } from './context.svelte.js';
  import * as maplibregl from 'maplibre-gl';
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
      map?.removeControl(control);
    }
  });
</script>

<!-- @component
Add the MapLibre geolocate control to the map. This control shows a button that moves the map to the location of the user.

Put it inside the `MapLibre` component. The component uses the props only when it creates the control. Changes to the props after that have no effect. Bind to `control` to get the `GeolocateControl` instance, for example to call `trigger()` on it. If you supply a `control`, the component adds that control and does not make a new one.
-->
