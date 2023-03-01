<script lang="ts">
  import maplibre, { type LngLatLike } from 'maplibre-gl';
  import { createEventDispatcher } from 'svelte';
  import { updatedMarkerContext } from './context';
  import type { MarkerClickInfo } from './types';

  export let lngLat: LngLatLike;
  let classNames: string | undefined = undefined;
  export { classNames as class };
  /** If interactive is true (default), it will render as a `button`. If not,
   * it will render as a `div` element. */
  export let interactive = true;
  export let feature: GeoJSON.Feature | null = null;

  const dispatch = createEventDispatcher();
  const { map, layerEvent, self: marker } = updatedMarkerContext();

  function addMarker(node: HTMLDivElement) {
    $marker = new maplibre.Marker({ element: node }).setLngLat(lngLat).addTo($map);

    return {
      destroy() {
        $marker?.remove();
      },
    };
  }

  $: $marker?.setLngLat(lngLat);

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      sendEvent('click');
    }
  }

  function sendEvent(eventName: string) {
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
  class={classNames}
  tabindex={interactive ? 0 : undefined}
  role={interactive ? 'button' : undefined}
  on:click={() => sendEvent('click')}
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
