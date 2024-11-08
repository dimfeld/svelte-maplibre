<script lang="ts">
  import { run, stopPropagation, preventDefault } from 'svelte/legacy';

  import maplibre, { type LngLatLike, type PointLike } from 'maplibre-gl';
  import { createEventDispatcher } from 'svelte';
  import { updatedMarkerContext } from './context';
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
    feature?: GeoJSON.Feature | null;
    /** An offset in pixels to apply to the marker. */
    offset?: PointLike | undefined;
    /** The z-index of the marker. This can also be set via CSS classes using the `class` prop */
    zIndex?: number | undefined;
    /** The rotation angle of the marker (clockwise, in degrees) */
    rotation?: number;
    /** The opacity of the marker */
    opacity?: number;
    children?: import('svelte').Snippet<[any]>;
  }

  let {
    marker: markerProp = $bindable(undefined),
    lngLat = $bindable(),
    class: classNames = undefined,
    interactive = true,
    asButton = false,
    draggable = false,
    feature = null,
    offset = undefined,
    zIndex = undefined,
    rotation = 0,
    opacity = 1,
    children,
  }: Props = $props();

  const dispatch = createEventDispatcher<{
    drag: MarkerClickInfo;
    dragstart: MarkerClickInfo;
    dragend: MarkerClickInfo;
    click: MarkerClickInfo;
    dblclick: MarkerClickInfo;
    contextmenu: MarkerClickInfo;
    mouseenter: MarkerClickInfo;
    mouseleave: MarkerClickInfo;
    mousemove: MarkerClickInfo;
  }>();
  const { map, layerEvent, self: marker, markerClickManager } = updatedMarkerContext();

  function addMarker(node: HTMLDivElement) {
    $marker = new maplibre.Marker({
      element: node,
      rotation,
      draggable,
      offset,
      opacity: opacity.toString(),
    })
      .setLngLat(lngLat)
      .addTo($map!);
    markerProp = $marker;

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
      $marker.on('dragstart', dragStartListener);
      $marker.on('drag', dragListener);
      $marker.on('dragend', dragEndListener);
    }

    return {
      destroy() {
        if (draggable) {
          $marker?.off('dragstart', dragStartListener);
          $marker?.off('drag', dragListener);
          $marker?.off('dragend', dragEndListener);
        }
        markerProp = undefined;
        $marker?.remove();
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

  run(() => {
    $marker?.setLngLat(lngLat);
  });
  run(() => {
    $marker?.setOffset(offset ?? [0, 0]);
  });
  run(() => {
    $marker?.setRotation(rotation);
  });
  run(() => {
    $marker?.setOpacity(opacity.toString());
  });

  function propagateLngLatChange() {
    let newPos = $marker?.getLngLat();
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

  function sendEvent(eventName: Parameters<typeof dispatch>[0]) {
    if (!interactive) {
      return;
    }

    let loc = $marker?.getLngLat();
    if (!loc) {
      return;
    }

    const lngLat: [number, number] = [loc.lng, loc.lat];
    let data: MarkerClickInfo = {
      map: $map!,
      marker: $marker!,
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

    $layerEvent = {
      ...data,
      layerType: 'marker',
      type: eventName,
    };

    dispatch(eventName, data);
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  use:addMarker
  use:manageClasses={classNames}
  style:z-index={zIndex}
  tabindex={asButton ? 0 : undefined}
  role={asButton ? 'button' : undefined}
  onclick={stopPropagation(() => sendEvent('click'))}
  ondblclick={stopPropagation(() => sendEvent('dblclick'))}
  oncontextmenu={stopPropagation(
    preventDefault(() => {
      sendEvent('contextmenu');
    })
  )}
  onmouseenter={() => {
    sendEvent('mouseenter');
  }}
  onmouseleave={() => {
    sendEvent('mouseleave');
  }}
  onmousemove={() => sendEvent('mousemove')}
  onkeydown={handleKeyDown}
>
  {@render children?.({ marker: $marker })}
</div>
