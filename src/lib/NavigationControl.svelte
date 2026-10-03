<script lang="ts">
  import { getMapContext } from './context.svelte.js';
  import * as maplibregl from 'maplibre-gl';
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
  $effect.pre(() => {
    if (map && !control) {
      control = new maplibregl.NavigationControl({ showCompass, showZoom, visualizePitch });
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
Add the MapLibre navigation control to the map. This control shows zoom buttons and a compass.

Put it inside the `MapLibre` component. The component uses the props only when it creates the control. Changes to the props after that have no effect. The component removes the control when it is destroyed.
-->
