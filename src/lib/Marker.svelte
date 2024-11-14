<script lang="ts">
  import maplibre, { type LngLatLike, type PointLike } from 'maplibre-gl';
  import type { Snippet } from 'svelte';
  import { mapContext, updatedMarkerContext } from './context.svelte.js';
  import type { MarkerClickInfo } from './types';
  import type * as GeoJSON from 'geojson';

  interface Props {
    /** The Marker instance which was added to the map */
    marker?: maplibre.Marker | undefined;
    lngLat: LngLatLike;
    class?: string | undefined;
    /** Handle mouse events */
    interactive?: boolean;
    /** Make markers tabbable and add the button role. */
    asButton?: boolean;
    draggable?: boolean;
    /** A GeoJSON Feature related to the point. This is only actually used to send an ID and set of properties along with
     * the event, and can be safely omitted. The `lngLat` prop controls the marker's location even if this is provided. */
    feature?: GeoJSON.Feature;
    /** An offset in pixels to apply to the marker. */
    offset?: PointLike;
    /** The z-index of the marker. This can also be set via CSS classes using the `class` prop */
    zIndex?: number;
    /** The rotation angle of the marker (clockwise, in degrees) */
    rotation?: number;
    /** The opacity of the marker */
    opacity?: number;
    children?: Snippet<[{ marker: maplibre.Marker }]>;

    ondrag?: (e: MarkerClickInfo) => void;
    ondragstart?: (e: MarkerClickInfo) => void;
    ondragend?: (e: MarkerClickInfo) => void;
    onclick?: (e: MarkerClickInfo) => void;
    ondblclick?: (e: MarkerClickInfo) => void;
    oncontextmenu?: (e: MarkerClickInfo) => void;
    onmouseenter?: (e: MarkerClickInfo) => void;
    onmouseleave?: (e: MarkerClickInfo) => void;
    onmousemove?: (e: MarkerClickInfo) => void;
  }

  let {
    marker: markerProp = $bindable(undefined),
    lngLat = $bindable(),
    class: classNames = undefined,
    interactive = true,
    asButton = false,
    draggable = false,
    feature = undefined,
    offset = undefined,
    zIndex = undefined,
    rotation = 0,
    opacity = 1,
    children,

    ...eventCbs
  }: Props = $props();

  const { map, markerClickManager } = mapContext();
  const { layerEvent, marker } = updatedMarkerContext();

  function addMarker(node: HTMLDivElement) {
    marker.value = new maplibre.Marker({
      element: node,
      rotation,
      draggable,
      offset,
      opacity: opacity.toString(),
    })
      .setLngLat(lngLat)
      .addTo(map!);
    markerProp = marker.value;

    const dragStartListener = () => sendEvent('dragstart');
    const dragListener = () => {
      propagateLngLatChange();
      sendEvent('drag');
    };
    const dragEndListener = () => {
      propagateLngLatChange();
      sendEvent('dragend');
    };

    if (draggable) {
      marker.value.on('dragstart', dragStartListener);
      marker.value.on('drag', dragListener);
      marker.value.on('dragend', dragEndListener);
    }

    return {
      destroy() {
        if (draggable) {
          marker.value?.off('dragstart', dragStartListener);
          marker.value?.off('drag', dragListener);
          marker.value?.off('dragend', dragEndListener);
        }
        markerProp = undefined;
        marker.value?.remove();
      },
    };
  }

  function manageClasses(node: HTMLDivElement, initialAddedClasses: string | undefined) {
    // These classes are added by MapLibre and we don't want to mess with them.
    const frozenClasses = node.className;

    function updateClasses(newClassNames: string | undefined) {
      if (newClassNames) {
        node.className = `${frozenClasses} ${newClassNames}`;
      } else {
        node.className = frozenClasses;
      }
    }

    updateClasses(initialAddedClasses);

    return {
      update: updateClasses,
    };
  }

  $effect(() => {
    marker.value?.setLngLat(lngLat);
  });
  $effect(() => {
    marker.value?.setOffset(offset ?? [0, 0]);
  });
  $effect(() => {
    marker.value?.setRotation(rotation);
  });
  $effect(() => {
    marker.value?.setOpacity(opacity.toString());
  });

  function propagateLngLatChange() {
    let newPos = marker.value?.getLngLat();
    if (!newPos) {
      return;
    }

    // Update the props using the same format they are already in.
    if (Array.isArray(lngLat)) {
      lngLat = [newPos.lng, newPos.lat];
    } else if (lngLat && 'lon' in lngLat) {
      lngLat = { lon: newPos.lng, lat: newPos.lat };
    } else {
      lngLat = newPos;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      sendEvent('click');
    }
  }

  function sendEvent(
    eventName:
      | 'click'
      | 'drag'
      | 'dragstart'
      | 'dragend'
      | 'dblclick'
      | 'contextmenu'
      | 'mouseenter'
      | 'mouseleave'
      | 'mousemove'
  ) {
    if (!interactive) {
      return;
    }

    let loc = marker.value?.getLngLat();
    if (!loc) {
      return;
    }

    const lngLat: [number, number] = [loc.lng, loc.lat];
    let data: MarkerClickInfo = {
      map: map!,
      marker: marker.value!,
      lngLat,
      features: [
        {
          type: 'Feature',

          properties: feature?.properties ?? {},
          geometry: {
            type: 'Point',
            coordinates: lngLat,
          },
        },
      ],
    };

    if (eventName === 'click' || eventName === 'contextmenu') {
      markerClickManager.handleClick(data);
    }

    layerEvent.value = {
      ...data,
      layerType: 'marker',
      type: eventName,
    };

    const cb = eventCbs[('on' + eventName) as keyof typeof eventCbs];
    cb?.(data);
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  use:addMarker
  use:manageClasses={classNames}
  style:z-index={zIndex}
  tabindex={asButton ? 0 : undefined}
  role={asButton ? 'button' : undefined}
  onclick={(e) => {
    e.stopPropagation();
    sendEvent('click');
  }}
  ondblclick={(e) => {
    e.stopPropagation();
    sendEvent('dblclick');
  }}
  oncontextmenu={(e) => {
    e.stopPropagation();
    e.preventDefault();
    sendEvent('contextmenu');
  }}
  onmouseenter={() => {
    sendEvent('mouseenter');
  }}
  onmouseleave={() => {
    sendEvent('mouseleave');
  }}
  onmousemove={() => sendEvent('mousemove')}
  onkeydown={handleKeyDown}
>
  {@render children?.({ marker: marker.value! })}
</div>
