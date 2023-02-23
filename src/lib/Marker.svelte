<script lang="ts">
  import maplibre, { type LngLatLike } from 'maplibre-gl';
  import { onDestroy, createEventDispatcher } from 'svelte';
  import { createMarkerHoverContext, updatedMarkerContext } from './context';
  import type { MarkerClickInfo } from './types';

  export let lngLat: LngLatLike;
  let classNames: string | undefined = undefined;
  export { classNames as class };
  /** If interactive is true (default), it will render as a `button`. If not,
   * if will render as a `div` element. */
  export let interactive = true;

  const dispatch = createEventDispatcher();
  const { map, self: marker } = updatedMarkerContext();

  let hovered = createMarkerHoverContext();

  let el: HTMLDivElement;
  $: if ($map && el && !$marker) {
    $marker = new maplibre.Marker(el).setLngLat(lngLat).addTo($map);
  }

  onDestroy(() => $marker?.remove());

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

    let data: MarkerClickInfo = {
      map: $map!,
      marker: $marker!,
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [loc.lng, loc.lat],
          },
        },
      ],
    };

    dispatch(eventName, data);
  }
</script>

<div bind:this={el}>
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <div
    class={classNames}
    tabindex={interactive ? 0 : undefined}
    role={interactive ? 'button' : undefined}
    on:click={() => sendEvent('click')}
    on:mouseenter={() => {
      $hovered = true;
      sendEvent('mouseenter');
    }}
    on:mouseleave={() => {
      $hovered = false;
      sendEvent('mouseleave');
    }}
    on:mousemove={() => sendEvent('mousemove')}
    on:keydown={handleKeyDown}
  >
    <slot />
  </div>
</div>
