<script lang="ts">
  import type { Feature } from 'geojson';
  import maplibregl, {
    MapMouseEvent,
    type MapLayerMouseEvent,
    type MapLayerTouchEvent,
  } from 'maplibre-gl';
  import { onDestroy, onMount, tick } from 'svelte';
  import { mapContext, type DeckGlMouseEvent, type LayerEvent } from './context.js';

  /** Show the built-in close button. By default the close button will be shown
   * only if closeOnClickOutside and closeOnClickInside are not set. */
  export let closeButton: boolean | undefined = undefined;
  /** Close on click outside the popup. */
  export let closeOnClickOutside = true;
  /** Close on click inside the popup. This should only be used for non-interactive popups. */
  export let closeOnClickInside = false;
  /** Close the popup when the map moves. */
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

  const { map, popupTarget, layerEvent } = mapContext();

  $: actualCloseButton = closeButton ?? (!closeOnClickOutside && !closeOnClickInside);

  let popup: maplibregl.Popup;
  $: if (!popup) {
    popup = new maplibregl.Popup({
      closeButton: actualCloseButton,
      // We handle this ourselves to improve behavior on mobile.
      closeOnClick: false,
      closeOnMove,
      focusAfterOpen,
      maxWidth,
      className: popupClass,
      anchor,
      offset,
    });

    popupElement = popup.getElement();

    popup.on('open', () => {
      open = true;
      setPopupClickHandler();
    });

    popup.on('close', (e) => {
      open = false;
    });
  }

  let hoveringOnPopup = false;
  let popupElement: HTMLElement | undefined;
  function setPopupClickHandler() {
    if (!popup) {
      return;
    }

    let el = popup.getElement();
    if (!el || el === popupElement) {
      return;
    }

    popupElement = el;

    if (openOn === 'hover') {
      popupElement.style.pointerEvents = 'none';
    }

    popupElement.addEventListener(
      'mouseenter',
      () => {
        hoveringOnPopup = true;
      },
      { passive: true }
    );

    popupElement.addEventListener(
      'mouseleave',
      () => {
        hoveringOnPopup = false;
      },
      { passive: true }
    );

    // The popup element has some padding, so we need to place it here instead of on the
    // content element that we manage.
    popupElement.addEventListener(
      'click',
      () => {
        if (closeOnClickInside) {
          open = false;
        }
      },
      { passive: true }
    );
  }

  $: if (popup && $popupTarget instanceof maplibregl.Marker) {
    if (openOn === 'click') {
      $popupTarget.setPopup(popup);
    } else if ($popupTarget.getPopup() === popup) {
      $popupTarget.setPopup(undefined);
    }
  }

  onMount(() => {
    if (!$map) {
      return;
    }

    $map.on('click', globalClickHandler);
    if (typeof $popupTarget === 'string') {
      $map.on('click', $popupTarget, handleLayerClick);
      $map.on('mousemove', $popupTarget, handleLayerMouseMove);
      $map.on('mouseleave', $popupTarget, handleLayerMouseLeave);
      $map.on('touchstart', $popupTarget, handleLayerTouchStart);
      $map.on('touchend', $popupTarget, handleLayerTouchEnd);
    }

    return () => {
      if ($map?.loaded()) {
        popup?.remove();
        $map.off('click', globalClickHandler);

        if ($popupTarget instanceof maplibregl.Marker) {
          if ($popupTarget.getPopup() === popup) {
            $popupTarget.setPopup(undefined);
          }
        } else if (typeof $popupTarget === 'string') {
          $map.off('click', $popupTarget, handleLayerClick);
          $map.off('mousemove', $popupTarget, handleLayerMouseMove);
          $map.off('mouseleave', $popupTarget, handleLayerMouseLeave);
          $map.off('touchstart', $popupTarget, handleLayerTouchStart);
          $map.off('touchend', $popupTarget, handleLayerTouchEnd);
        }
      }
    };
  });

  let features: Feature[] | null = null;
  let touchOpenState: 'normal' | 'opening' | 'justOpened' = 'normal';
  function handleLayerClick(e: MapLayerMouseEvent | LayerEvent) {
    if (openOn !== 'click') {
      return;
    }
    if ('layerType' in e) {
      if (e.layerType === 'deckgl') {
        lngLat = e.coordinate;
        features = e.object ? [e.object] : null;
      } else {
        lngLat = e.lngLat;
        features = e.features ?? [];
      }
    } else {
      lngLat = e.lngLat;
      features = e.features ?? [];
    }
    // Wait a tick in case closeOnClick is set. Then the map will close the popup and we'll reopen it
    // just after.
    setTimeout(() => (open = true));
  }

  let touchStartCoords: MapLayerTouchEvent['point'] | null = null;
  function handleLayerTouchStart(e: MapLayerTouchEvent) {
    touchStartCoords = e.point;
  }

  function handleLayerTouchEnd(e: MapLayerTouchEvent) {
    if (!touchStartCoords || openOn !== 'hover') {
      return;
    }

    let distance = touchStartCoords.dist(e.point);
    touchStartCoords = null;
    if (distance < 3) {
      lngLat = e.lngLat;
      features = e.features ?? [];

      if (popup.isOpen()) {
        // Pretend we just opened again to avoid the click handler closing the popup.
        touchOpenState = 'justOpened';
      } else {
        touchOpenState = 'opening';
        open = true;
      }
    }
  }

  function handleLayerMouseLeave(e: MapLayerMouseEvent) {
    if (openOn !== 'hover' || touchStartCoords || touchOpenState !== 'normal') {
      return;
    }

    open = false;
    features = null;
  }

  function handleLayerMouseMove(e: MapLayerMouseEvent) {
    if (openOn !== 'hover' || touchStartCoords || touchOpenState !== 'normal') {
      return;
    }

    open = true;
    features = e.features ?? [];
    lngLat = e.lngLat;
  }

  function globalClickHandler(e: MapMouseEvent) {
    if (touchOpenState === 'justOpened') {
      touchOpenState = 'normal';
      return;
    }

    if (!closeOnClickOutside) {
      return;
    }

    let checkElements = [
      popupElement,
      $popupTarget instanceof maplibregl.Marker ? $popupTarget?.getElement() : null,
    ];

    if (
      open &&
      popup.isOpen() &&
      !checkElements.some((el) => el?.contains(e.originalEvent.target as Node))
    ) {
      open = false;
    }
  }

  $: if (openOn === 'click' && $layerEvent?.type === 'click') {
    handleLayerClick($layerEvent);
    $layerEvent = null;
  }

  $: hoveringOnLayer =
    openOn === 'hover' && ($layerEvent?.type === 'mousemove' || $layerEvent?.type === 'mouseenter');
  $: if (openOn === 'hover' && layerEvent) {
    if (hoveringOnLayer && $layerEvent) {
      if ($layerEvent.layerType === 'deckgl') {
        lngLat = $layerEvent.coordinate;
        features = $layerEvent.object ? [$layerEvent.object] : null;
      } else {
        lngLat = $layerEvent.lngLat;
        features = $layerEvent.features ?? [];
      }
    }
    open = (hoveringOnLayer || hoveringOnPopup) ?? false;
  }

  $: if (popupEl) {
    popup.setDOMContent(popupEl);
  } else if (html) {
    popup.setHTML(html);
  }

  $: if (lngLat) popup.setLngLat(lngLat);

  $: if ($map) {
    let isOpen = popup.isOpen();
    if (open && !isOpen) {
      popup.addTo($map);
      if (touchOpenState === 'opening') {
        touchOpenState = 'justOpened';
      }
    } else if (!open && isOpen) {
      popup.remove();
    }
  }

  let popupEl: HTMLDivElement | undefined;
</script>

{#if $$slots.default}
  <div bind:this={popupEl}>
    {#if features || $popupTarget instanceof maplibregl.Marker}
      <slot {features} data={features?.[0]} map={$map} close={() => (open = false)} />
    {/if}
  </div>
{/if}
