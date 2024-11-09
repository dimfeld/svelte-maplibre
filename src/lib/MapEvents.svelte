<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { mapContext } from './context';
  import maplibregl from 'maplibre-gl';
  import type { MapEventType, MapLayerEventType } from 'maplibre-gl';

  const dispatch = createEventDispatcher<{
    click: maplibregl.MapMouseEvent & { map: maplibregl.Map };
    dblclick: maplibregl.MapMouseEvent & { map: maplibregl.Map };
    contextmenu: maplibregl.MapMouseEvent & { map: maplibregl.Map };
    movestart: maplibregl.MapMouseEvent & { map: maplibregl.Map };
    moveend: maplibregl.MapMouseEvent & { map: maplibregl.Map };
    zoomstart: maplibregl.MapLibreZoomEvent & { map: maplibregl.Map };
    zoom: maplibregl.MapLibreZoomEvent & { map: maplibregl.Map };
    zoomend: maplibregl.MapLibreZoomEvent & { map: maplibregl.Map };
  }>();

  interface Props {
    /** Limit the event handlers to a certain layer. */
    layer?: string | undefined;
  }

  let { layer = undefined }: Props = $props();

  const { map } = mapContext();

  function sendEvent(e: maplibregl.MapLibreEvent<unknown>) {
    dispatch(
      // @ts-expect-error
      e.type,
      { ...e, map }
    );
  }

  const layerEvents: Array<keyof MapLayerEventType> = [
    'click',
    'dblclick',
    'mousedown',
    'mouseup',
    'mousemove',
    'mouseenter',
    'mouseleave',
    'contextmenu',
    'mouseover',
    'mouseout',
  ];

  const mapEvents: Array<keyof MapEventType> = [
    'click',
    'dblclick',
    'contextmenu',
    'mousemove',
    'movestart',
    'moveend',
    'zoomstart',
    'zoom',
    'zoomend',
  ];

  $effect(() => {
    if ($map) {
      if (layer) {
        for (const eventName of layerEvents) {
          $map.on(eventName, layer, sendEvent);
        }
      } else {
        for (const eventName of mapEvents) {
          $map.on(eventName, sendEvent);
        }
      }
    }
  });

  onDestroy(() => {
    if ($map) {
      if (layer) {
        for (const eventName of layerEvents) {
          $map.off(eventName, layer, sendEvent);
        }
      } else {
        for (const eventName of mapEvents) {
          $map.off(eventName, sendEvent);
        }
      }
    }
  });
</script>
