<script lang="ts">
  import type { Feature } from 'geojson';
  import maplibregl, { type MapLayerMouseEvent } from 'maplibre-gl';
  import { onDestroy, tick } from 'svelte';
  import { mapContext, markerHoverContext } from './context.js';

  /** Show the built-in close button. This defaults to true if openOn is 'click' or 'manual',
   * and to false if openOn is 'hover'. */
  export let closeButton: boolean | undefined = undefined;
  export let closeOnClick = true;
  export let closeOnMove = false;

  /** Define when to open the popup. If set to manual, you can open the popup programmatically by
   * setting the `open` attribute. */
  export let openOn: 'hover' | 'click' | 'manual' = 'click';

  export let focusAfterOpen = true;
  export let anchor: maplibregl.PositionAnchor | undefined = undefined;
  export let offset: maplibregl.Offset | undefined = undefined;
  /** Classes to apply to the map's popup container */
  export let popupClass: string | undefined = undefined;
  export let maxWidth: string | undefined = undefined;

  /** Where to show the popup. */
  export let lngLat: maplibregl.LngLatLike | undefined = undefined;

  /** If set and the slot is omitted, use this string as HTML to pass into the popup. */
  export let html: string | undefined = undefined;

  /** Whether the popup is open or not. Can be set to manualy open the popup at `lngLat`. */
  export let open = false;

  const { map, popupTarget } = mapContext();
  const markerHover = markerHoverContext();

  $: actualCloseButton = closeButton ?? openOn !== 'hover';

  let popup: maplibregl.Popup;
  $: {
    popup = new maplibregl.Popup({
      closeButton: actualCloseButton,
      closeOnClick,
      closeOnMove,
      focusAfterOpen,
      maxWidth,
      className: popupClass,
      anchor,
      offset,
    });

    popup.on('open', () => {
      open = true;
    });

    popup.on('close', () => {
      open = false;
    });
  }

  onDestroy(() => {
    if ($map?.loaded()) {
      popup?.remove();

      if ($popupTarget instanceof maplibregl.Marker) {
        $popupTarget.setPopup(undefined);
      } else if (typeof $popupTarget === 'string') {
        $map.off('click', $popupTarget, handleLayerClick);
        $map.off('mouseleave', $popupTarget, handleLayerMouseLeave);
        $map.off('mousemove', $popupTarget, handleLayerMouseMove);
      }
    }
  });

  let features: Feature[] | null = null;
  function handleLayerClick(e: MapLayerMouseEvent) {
    if (openOn !== 'click') {
      return;
    }

    lngLat = e.lngLat;
    features = e.features ?? [];
    // Wait a tick in case closeOnClick is set. Then the map will close the popup and we'll reopen it
    // just after.
    setTimeout(() => (open = true));
  }

  function handleLayerMouseLeave(e: MapLayerMouseEvent) {
    if (openOn !== 'hover') {
      return;
    }

    open = false;
    features = null;
  }

  function handleLayerMouseMove(e: MapLayerMouseEvent) {
    if (openOn !== 'hover') {
      return;
    }

    open = true;
    features = e.features ?? [];
    lngLat = e.lngLat;
  }

  $: if ($popupTarget instanceof maplibregl.Marker) {
    $popupTarget.setPopup(popup);
  } else if ($map && typeof $popupTarget === 'string') {
    $map.on('mousemove', $popupTarget, handleLayerMouseMove);
    $map.on('mouseleave', $popupTarget, handleLayerMouseLeave);
    $map.on('click', $popupTarget, handleLayerClick);
  }

  $: if (openOn === 'hover' && markerHover) {
    if ($popupTarget instanceof maplibregl.Marker) {
      lngLat = $popupTarget.getLngLat();
    }
    open = $markerHover ?? false;
  }

  $: if (popupEl) {
    popup.setDOMContent(popupEl);
  } else if (html) {
    popup.setHTML(html);
  }

  $: if (lngLat) popup.setLngLat(lngLat);

  $: if ($map) {
    if (open && !popup.isOpen()) {
      popup.addTo($map);
    } else if (!open && popup.isOpen()) {
      popup.remove();
    }
  }

  let popupEl: HTMLDivElement | undefined;
</script>

{#if $$slots.default}
  <div bind:this={popupEl}>
    {#if features || $popupTarget instanceof maplibregl.Marker}
      <slot {features} map={$map} close={() => (open = false)} />
    {/if}
  </div>
{/if}
