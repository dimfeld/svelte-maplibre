<script lang="ts">
  import maplibre, { LngLat, type LngLatLike, type PointLike } from 'maplibre-gl';
  import { createEventDispatcher } from 'svelte';
  import { updatedMarkerContext } from './context';
  import type { MarkerClickInfo } from './types';
  import type * as GeoJSON from 'geojson';

  export let lngLat: LngLatLike;
  let classNames: string | undefined = undefined;
  export { classNames as class };
  /** Handle mouse events */
  export let interactive = true;
  /** Make markers tabbable and add the button role. */
  export let asButton = false;
  export let draggable = false;
  /** A GeoJSON Feature related to the point. This is only actually used to send an ID and set of properties along with
   * the event, and can be safely omitted. The `lngLat` prop controls the marker's location even if this is provided. */
  export let feature: GeoJSON.Feature | null = null;
  /** An offset in pixels to apply to the marker. */
  export let offset: PointLike | undefined = undefined;
  /** The z-index of the marker. This can also be set via CSS classes using the `class` prop */
  export let zIndex: number | undefined = undefined;

  const dispatch = createEventDispatcher();
  const { map, layerEvent, self: marker } = updatedMarkerContext();

  function addMarker(node: HTMLDivElement) {
    $marker = new maplibre.Marker({
      element: node,
      draggable,
      offset,
    })
      .setLngLat(lngLat)
      .addTo($map);

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

  $: $marker?.setLngLat(lngLat);
  $: $marker?.setOffset(offset ?? [0, 0]);

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

  function sendEvent(eventName: string) {
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

    $layerEvent = {
      ...data,
      layerType: 'marker',
      type: eventName,
    };

    dispatch(eventName, data);
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div
  use:addMarker
  use:manageClasses={classNames}
  style:z-index={zIndex}
  tabindex={asButton ? 0 : undefined}
  role={asButton ? 'button' : undefined}
  on:click={() => sendEvent('click')}
  on:dblclick={() => sendEvent('dblclick')}
  on:contextmenu={() => sendEvent('contextmenu')}
  on:mouseenter={(e) => {
    sendEvent('mouseenter');
  }}
  on:mouseleave={() => {
    sendEvent('mouseleave');
  }}
  on:mousemove={() => sendEvent('mousemove')}
  on:keydown={handleKeyDown}
>
  <slot />
</div>
