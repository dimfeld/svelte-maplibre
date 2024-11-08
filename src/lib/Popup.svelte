<script lang="ts">
  import { run } from 'svelte/legacy';

  import type { Feature } from 'geojson';
  import maplibregl, {
    type MapMouseEvent,
    type MapLayerMouseEvent,
    type MapLayerTouchEvent,
  } from 'maplibre-gl';
  import { onDestroy, onMount, createEventDispatcher } from 'svelte';
  import { mapContext, type LayerEvent, isDeckGlMouseEvent } from './context.js';
  import type { MarkerClickInfo } from './types.js';

  interface $$Slots {
    default: {
      features: Array<Feature> | null;
      data: Feature | null;
      map: maplibregl.Map | null;
      close: () => void;
    };
  }

  interface Props {
    /** Show the built-in close button. By default the close button will be shown
     * only if closeOnClickOutside and closeOnClickInside are not set. */
    closeButton?: boolean | undefined;
    /** Close on click outside the popup. */
    closeOnClickOutside?: boolean;
    /** Close on click inside the popup. This should only be used for non-interactive popups. */
    closeOnClickInside?: boolean;
    /** Close the popup when the map moves. */
    closeOnMove?: boolean;
    /** Define when to open the popup. If set to manual, you can open the popup programmatically by
     * setting the `open` attribute. */
    openOn?: 'hover' | 'click' | 'dblclick' | 'contextmenu' | 'manual';
    /** Only open the popup if there's no feature from a higher layer covering this one. */
    openIfTopMost?: boolean;
    focusAfterOpen?: boolean;
    anchor?: maplibregl.PositionAnchor | undefined;
    offset?: maplibregl.Offset | undefined;
    /** Classes to apply to the map's popup container */
    popupClass?: string | undefined;
    maxWidth?: string | undefined;
    /** Where to show the popup. */
    lngLat?: maplibregl.LngLatLike | undefined;
    /** If set and the slot is omitted, use this string as HTML to pass into the popup. */
    html?: string | undefined;
    /** Whether the popup is open or not. Can be set to manualy open the popup at `lngLat`. */
    open?: boolean;
    children?: import('svelte').Snippet<[any]>;
  }

  let {
    closeButton = undefined,
    closeOnClickOutside = true,
    closeOnClickInside = false,
    closeOnMove = false,
    openOn = 'click',
    openIfTopMost = true,
    focusAfterOpen = true,
    anchor = undefined,
    offset = undefined,
    popupClass = undefined,
    maxWidth = undefined,
    lngLat = $bindable(undefined),
    html = undefined,
    open = $bindable(false),
    children,
  }: Props = $props();

  const dispatch = createEventDispatcher<{
    open: maplibregl.Popup;
    close: maplibregl.Popup;
    hover: maplibregl.Popup;
  }>();

  const { map, popupTarget, layerEvent, layer, eventTopMost, markerClickManager } = mapContext();

  const clickEvents = ['click', 'dblclick', 'contextmenu'];

  let popup: maplibregl.Popup = $state();

  let hoveringOnPopup = $state(false);
  let popupElement: HTMLElement | undefined = $state();
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

  onMount(() => {
    if (!$map) {
      return;
    }

    $map.on('click', globalClickHandler);
    $map.on('contextmenu', globalClickHandler);
    markerClickManager.add(globalMarkerClickHandler);
    if (typeof $popupTarget === 'string') {
      $map.on('click', $popupTarget, handleLayerClick);
      $map.on('dblclick', $popupTarget, handleLayerClick);
      $map.on('contextmenu', $popupTarget, handleLayerClick);
      $map.on('mousemove', $popupTarget, handleLayerMouseMove);
      $map.on('mouseleave', $popupTarget, handleLayerMouseLeave);
      $map.on('touchstart', $popupTarget, handleLayerTouchStart);
      $map.on('touchend', $popupTarget, handleLayerTouchEnd);
    }

    return () => {
      if ($map?.loaded()) {
        popup?.remove();
        $map.off('click', globalClickHandler);
        $map.off('contextmenu', globalClickHandler);
        markerClickManager.remove(globalMarkerClickHandler);

        if ($popupTarget instanceof maplibregl.Marker) {
          if ($popupTarget.getPopup() === popup) {
            $popupTarget.setPopup(undefined);
          }
        } else if (typeof $popupTarget === 'string') {
          $map.off('click', $popupTarget, handleLayerClick);
          $map.off('dblclick', $popupTarget, handleLayerClick);
          $map.off('contextmenu', $popupTarget, handleLayerClick);
          $map.off('mousemove', $popupTarget, handleLayerMouseMove);
          $map.off('mouseleave', $popupTarget, handleLayerMouseLeave);
          $map.off('touchstart', $popupTarget, handleLayerTouchStart);
          $map.off('touchend', $popupTarget, handleLayerTouchEnd);
        }
      }
    };
  });

  function skipHandlingEvent(e: MapLayerMouseEvent | LayerEvent) {
    if (!openIfTopMost) {
      return false;
    }
    // Marker clicks are always only on the top-most marker. Otherwise check for the top-most layer.
    return !('marker' in e) && !isDeckGlMouseEvent(e) && eventTopMost(e) !== $layer;
  }

  let features: Feature[] | null = $state(null);
  let touchOpenState: 'normal' | 'opening' | 'justOpened' = $state('normal');

  function handleLayerEvent(e: MapLayerMouseEvent | LayerEvent) {
    if ('layerType' in e && e.layerType === 'deckgl') {
      lngLat = e.coordinate;
      features = e.object ? [e.object as Feature] : null;
    } else {
      lngLat = e.lngLat;
      features = e.features ?? [];
    }
  }

  function handleLayerClick(e: MapLayerMouseEvent | LayerEvent) {
    if (e.type !== openOn || skipHandlingEvent(e)) {
      return;
    }

    handleLayerEvent(e);

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

    if (skipHandlingEvent(e)) {
      open = false;
      features = null;
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
      if ((e.type === 'contextmenu' && openOn === 'contextmenu') || e.type !== 'contextmenu') {
        open = false;
      }
    }
  }

  function globalMarkerClickHandler(info: MarkerClickInfo) {
    // Markers don't propagate clicks to the map, so we handle it separately here.
    if (closeOnClickOutside && open && popup.isOpen() && info.marker !== $popupTarget) {
      open = false;
    }
  }

  onDestroy(() => {
    if ($map && popup?.isOpen()) {
      popup.remove();
    }
  });

  let popupEl: HTMLDivElement | undefined = $state();
  let actualCloseButton = $derived(closeButton ?? (!closeOnClickOutside && !closeOnClickInside));
  run(() => {
    if (!popup) {
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
        dispatch('open', popup);
      });

      popup.on('close', () => {
        open = false;
        dispatch('close', popup);
      });

      popup.on('hover', () => {
        dispatch('hover', popup);
      });
    }
  });
  run(() => {
    if (popup && $popupTarget instanceof maplibregl.Marker) {
      if (openOn === 'click') {
        $popupTarget.setPopup(popup);
      } else if ($popupTarget.getPopup() === popup) {
        $popupTarget.setPopup(undefined);
      }
    }
  });
  run(() => {
    if (clickEvents.includes(openOn) && $layerEvent?.type === openOn) {
      handleLayerClick($layerEvent);
      $layerEvent = null;
    }
  });
  let hoveringOnLayer = $derived(
    openOn === 'hover' && ($layerEvent?.type === 'mousemove' || $layerEvent?.type === 'mouseenter')
  );
  run(() => {
    if (openOn === 'hover' && layerEvent) {
      if (hoveringOnLayer && $layerEvent) {
        handleLayerEvent($layerEvent);
      }
      open = (hoveringOnLayer || hoveringOnPopup) ?? false;
    }
  });
  run(() => {
    if (popupEl) {
      popup.setDOMContent(popupEl);
    } else if (html) {
      popup.setHTML(html);
    }
  });
  run(() => {
    if (lngLat) popup.setLngLat(lngLat);
  });
  run(() => {
    if ($map) {
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
  });
</script>

{#if children}
  <div bind:this={popupEl}>
    {#if features?.length || $popupTarget instanceof maplibregl.Marker}
      {@render children?.({
        features,
        data: features?.[0] ?? null,
        map: $map,
        close: () => (open = false),
      })}
    {/if}
  </div>
{/if}
