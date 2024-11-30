<script lang="ts">
  import { onDestroy } from 'svelte';
  import { getMapContext } from './context.svelte.js';
  import maplibregl from 'maplibre-gl';
  import type { MapEventType, MapLayerEventType } from 'maplibre-gl';
  import type { MapMoveEvent } from './types.js';

  interface Props {
    /** Limit the event handlers to a certain layer. */
    layer?: string | undefined;

    onclick?: (e: maplibregl.MapMouseEvent) => void;
    ondblclick?: (e: maplibregl.MapMouseEvent) => void;
    oncontextmenu?: (e: maplibregl.MapMouseEvent) => void;
    onmovestart?: (e: MapMoveEvent) => void;
    onmoveend?: (e: MapMoveEvent) => void;
    onzoomstart?: (e: maplibregl.MapLibreZoomEvent) => void;
    onzoom?: (e: maplibregl.MapLibreZoomEvent) => void;
    onzoomend?: (e: maplibregl.MapLibreZoomEvent) => void;
    onpitch?: (e: maplibregl.MapLibreEvent<MouseEvent | TouchEvent | undefined>) => void;
    onrotate?: (e: maplibregl.MapLibreEvent<MouseEvent | TouchEvent | undefined>) => void;
    onwheel?: (e: maplibregl.MapWheelEvent) => void;
    ondata?: (e: maplibregl.MapDataEvent) => void;
    onstyledata?: (e: maplibregl.MapStyleDataEvent) => void;
    onidle?: (e: maplibregl.MapLibreEvent) => void;
  }

  let { layer = undefined, ...eventCbs }: Props = $props();

  const { map } = $derived(getMapContext());

  type EventName = keyof typeof eventCbs extends `on${infer T}` ? T : never;

  function getHandler(event: EventName) {
    // @ts-expect-error Typing
    return eventCbs['on' + event];
  }

  function sendEvent(e: maplibregl.MapLibreEvent<unknown>) {
    getHandler(e.type as EventName)?.(e);
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
    'pitch',
    'rotate',
    'wheel',
    'data',
    'styledata',
    'idle',
  ];

  $effect(() => {
    if (map) {
      if (layer) {
        for (const eventName of layerEvents) {
          if (getHandler(eventName as EventName)) {
            map.on(eventName, layer, sendEvent);
          }
        }
      } else {
        for (const eventName of mapEvents) {
          if (getHandler(eventName as EventName)) {
            map.on(eventName, sendEvent);
          }
        }
      }
    }
  });

  onDestroy(() => {
    if (map) {
      if (layer) {
        for (const eventName of layerEvents) {
          if (getHandler(eventName as EventName)) {
            map.off(eventName, layer, sendEvent);
          }
        }
      } else {
        for (const eventName of mapEvents) {
          if (getHandler(eventName as EventName)) {
            map.off(eventName, sendEvent);
          }
        }
      }
    }
  });
</script>
