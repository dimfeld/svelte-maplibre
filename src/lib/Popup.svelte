<script lang="ts" generics="DATA = Feature">
  import type { Feature } from 'geojson';
  import maplibregl, {
    type MapMouseEvent,
    type MapLayerMouseEvent,
    type MapLayerTouchEvent,
  } from 'maplibre-gl';
  import { onDestroy, onMount, type Snippet } from 'svelte';
  import {
    getMapContext,
    type LayerEvent,
    isDeckGlMouseEvent,
    getLayer,
    getLayerEvent,
    getPopupTarget,
  } from './context.svelte.js';
  import type { MarkerClickInfo } from './types.js';

  interface Props {
    /** Show the built-in close button. By default the close button will be shown
     * only if closeOnClickOutside and closeOnClickInside are not set. */
    closeButton?: boolean;
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
    anchor?: maplibregl.PositionAnchor;
    offset?: maplibregl.Offset;
    /** Classes to apply to the map's popup container */
    popupClass?: string;
    maxWidth?: string;
    /** Where to show the popup. */
    lngLat?: maplibregl.LngLatLike;
    /** If set and the slot is omitted, use this string as HTML to pass into the popup. */
    html?: string;
    /** Whether the popup is open or not. Can be set to manualy open the popup at `lngLat`. */
    open?: boolean;
    children?: Snippet<
      [
        {
          features: Array<DATA> | undefined;
          data: DATA | undefined;
          map: maplibregl.Map | undefined;
          close: () => void;
        },
      ]
    >;

    onopen?: (popup: maplibregl.Popup) => void;
    onclose?: (popup: maplibregl.Popup) => void;
    onhover?: (popup: maplibregl.Popup) => void;
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

    onopen = undefined,
    onclose = undefined,
    onhover = undefined,
  }: Props = $props();

  const { map, eventTopMost, markerClickManager, loaded } = $derived(getMapContext());
  const layer = getLayer();
  const layerEvent = getLayerEvent();
  const popupTarget = getPopupTarget();

  const clickEvents = ['click', 'dblclick', 'contextmenu'];

  let popup: maplibregl.Popup | undefined = $state();

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
    if (!map) {
      return;
    }

    map.on('click', globalClickHandler);
    map.on('contextmenu', globalClickHandler);
    markerClickManager.add(globalMarkerClickHandler);
    if (typeof popupTarget?.value === 'string') {
      map.on('click', popupTarget.value, handleLayerClick);
      map.on('dblclick', popupTarget.value, handleLayerClick);
      map.on('contextmenu', popupTarget.value, handleLayerClick);
      map.on('mousemove', popupTarget.value, handleLayerMouseMove);
      map.on('mouseleave', popupTarget.value, handleLayerMouseLeave);
      map.on('touchstart', popupTarget.value, handleLayerTouchStart);
      map.on('touchend', popupTarget.value, handleLayerTouchEnd);
    }

    return () => {
      if (loaded) {
        popup?.remove();
        map.off('click', globalClickHandler);
        map.off('contextmenu', globalClickHandler);
        markerClickManager.remove(globalMarkerClickHandler);

        if (popupTarget?.value instanceof maplibregl.Marker) {
          if (popupTarget.value.getPopup() === popup) {
            popupTarget.value.setPopup(undefined);
          }
        } else if (typeof popupTarget?.value === 'string') {
          map.off('click', popupTarget.value, handleLayerClick);
          map.off('dblclick', popupTarget.value, handleLayerClick);
          map.off('contextmenu', popupTarget.value, handleLayerClick);
          map.off('mousemove', popupTarget.value, handleLayerMouseMove);
          map.off('mouseleave', popupTarget.value, handleLayerMouseLeave);
          map.off('touchstart', popupTarget.value, handleLayerTouchStart);
          map.off('touchend', popupTarget.value, handleLayerTouchEnd);
        }
      }
    };
  });

  function skipHandlingEvent(e: MapLayerMouseEvent | LayerEvent) {
    if (!openIfTopMost) {
      return false;
    }
    // Marker clicks are always only on the top-most marker. Otherwise check for the top-most layer.
    return !('marker' in e) && !isDeckGlMouseEvent(e) && eventTopMost(e) !== layer?.value;
  }

  let features: DATA[] | undefined = $state();
  let touchOpenState: 'normal' | 'opening' | 'justOpened' = $state('normal');

  function handleLayerEvent(e: MapLayerMouseEvent | LayerEvent) {
    if ('layerType' in e && e.layerType === 'deckgl') {
      lngLat = e.coordinate as [number, number];
      features = e.object ? [e.object as DATA] : undefined;
    } else {
      lngLat = e.lngLat;
      features = (e.features ?? []) as DATA[];
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

  let touchStartCoords: MapLayerTouchEvent['point'] | undefined = undefined;
  function handleLayerTouchStart(e: MapLayerTouchEvent) {
    touchStartCoords = e.point;
  }

  function handleLayerTouchEnd(e: MapLayerTouchEvent) {
    if (!touchStartCoords || openOn !== 'hover') {
      return;
    }

    let distance = touchStartCoords.dist(e.point);
    touchStartCoords = undefined;
    if (distance < 3) {
      lngLat = e.lngLat;
      features = (e.features ?? []) as DATA[];

      if (popup?.isOpen()) {
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
    features = undefined;
  }

  function handleLayerMouseMove(e: MapLayerMouseEvent) {
    if (openOn !== 'hover' || touchStartCoords || touchOpenState !== 'normal') {
      return;
    }

    if (skipHandlingEvent(e)) {
      open = false;
      features = undefined;
      return;
    }

    open = true;
    features = (e.features ?? []) as DATA[];
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
      popupTarget?.value instanceof maplibregl.Marker ? popupTarget.value?.getElement() : undefined,
    ];

    if (
      open &&
      popup?.isOpen() &&
      !checkElements.some((el) => el?.contains(e.originalEvent.target as Node))
    ) {
      if ((e.type === 'contextmenu' && openOn === 'contextmenu') || e.type !== 'contextmenu') {
        open = false;
      }
    }
  }

  function globalMarkerClickHandler(info: MarkerClickInfo) {
    // Markers don't propagate clicks to the map, so we handle it separately here.
    if (closeOnClickOutside && open && popup?.isOpen() && info.marker !== popupTarget?.value) {
      open = false;
    }
  }

  onDestroy(() => {
    if (loaded && popup?.isOpen()) {
      popup.remove();
    }
  });

  let popupEl: HTMLDivElement | undefined = $state();
  let actualCloseButton = $derived(closeButton ?? (!closeOnClickOutside && !closeOnClickInside));
  $effect(() => {
    if (!popup) {
      let fullPopupClass = popupClass ? `${popupClass} sv-maplibregl-popup` : 'sv-maplibregl-popup';
      popup = new maplibregl.Popup({
        closeButton: actualCloseButton,
        // We handle this ourselves to improve behavior on mobile.
        closeOnClick: false,
        closeOnMove,
        focusAfterOpen,
        maxWidth,
        className: fullPopupClass,
        anchor,
        offset,
      });

      popupElement = popup.getElement();

      popup.on('open', () => {
        open = true;
        setPopupClickHandler();
        onopen?.(popup!);
      });

      popup.on('close', () => {
        open = false;
        onclose?.(popup!);
      });

      if (onhover) {
        popup.on('hover', () => {
          onhover?.(popup!);
        });
      }
    }
  });

  $effect(() => {
    if (popup && popupTarget?.value instanceof maplibregl.Marker) {
      if (openOn === 'click') {
        popupTarget.value.setPopup(popup);
      } else if (popupTarget.value.getPopup() === popup) {
        popupTarget.value.setPopup(undefined);
      }
    }
  });

  $effect(() => {
    if (clickEvents.includes(openOn) && layerEvent.value?.type === openOn) {
      handleLayerClick(layerEvent.value);
      layerEvent.value = undefined;
    }
  });

  let hoveringOnLayer = $derived(
    openOn === 'hover' &&
      (layerEvent.value?.type === 'mousemove' || layerEvent.value?.type === 'mouseenter')
  );

  $effect(() => {
    if (openOn === 'hover' && layerEvent) {
      if (hoveringOnLayer && layerEvent.value) {
        handleLayerEvent(layerEvent.value);
      }
      open = (hoveringOnLayer || hoveringOnPopup) ?? false;
    }
  });

  $effect(() => {
    if (popupEl) {
      popup?.setDOMContent(popupEl);
    } else if (html) {
      popup?.setHTML(html);
    }
  });

  $effect(() => {
    if (lngLat) popup?.setLngLat(lngLat);
  });

  $effect(() => {
    if (map && popup) {
      let isOpen = popup.isOpen();
      if (open && !isOpen) {
        popup.addTo(map);
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
  <div bind:this={popupEl} class="sv-popup">
    {#if features?.length || popupTarget?.value instanceof maplibregl.Marker || (!popupTarget && open)}
      {@render children?.({
        features,
        data: features?.[0] ?? undefined,
        map: map,
        close: () => (open = false),
      })}
    {/if}
  </div>
{/if}

<style>
  :global(.sv-maplibregl-popup) {
    z-index: 200;
  }
</style>
