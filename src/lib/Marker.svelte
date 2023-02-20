<script lang="ts">
  import maplibre, { type LngLatLike } from 'maplibre-gl';
  import { onDestroy } from 'svelte';
  import { updatedMarkerContext } from './context';

  export let lngLat: LngLatLike;

  const { map, self: marker } = updatedMarkerContext();

  let el: HTMLButtonElement;
  $: if ($map && el && !$marker) {
    $marker = new maplibre.Marker(el).setLngLat(lngLat).addTo($map);
  }

  onDestroy(() => $marker?.remove());

  $: $marker?.setLngLat(lngLat);
</script>

<button bind:this={el} tabindex="0" on:click>
  <slot />
</button>

<style>
  button {
    all: unset;
  }
</style>
