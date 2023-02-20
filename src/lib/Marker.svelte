<script lang="ts">
  import maplibre, { type LngLatLike } from 'maplibre-gl';
  import { onDestroy, createEventDispatcher } from 'svelte';
  import { updatedMarkerContext } from './context';

  export let lngLat: LngLatLike;
  let classNames: string | undefined = undefined;
  export { classNames as class };
  /** If interactive is true (default), it will render as a `button`. If not,
   * if will render as a `div` element. */
  export let interactive = true;

  const dispatch = createEventDispatcher();
  const { map, self: marker } = updatedMarkerContext();

  let el: HTMLDivElement;
  $: if ($map && el && !$marker) {
    $marker = new maplibre.Marker(el).setLngLat(lngLat).addTo($map);
  }

  onDestroy(() => $marker?.remove());

  $: $marker?.setLngLat(lngLat);

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      dispatch('click');
    }
  }
</script>

<div bind:this={el}>
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <div
    class={classNames}
    tabindex={interactive ? 0 : undefined}
    role={interactive ? 'button' : undefined}
    on:click
    on:keydown={handleKeyDown}
  >
    <slot />
  </div>
</div>
