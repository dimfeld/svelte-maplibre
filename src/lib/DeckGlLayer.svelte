<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  import {
    getId,
    mapContext,
    setMapContext,
    updatedLayerContext,
    type DeckGlMouseEvent,
  } from './context';
  import { MapboxLayer } from '@deck.gl/mapbox';
  import { readable, writable } from 'svelte/store';

  export let id = getId('deckgl-layer');
  export let minzoom: number | undefined = undefined;
  export let maxzoom: number | undefined = undefined;
  export let visible = true;
  export let pickable = true;

  /** This indicates the currently hovered feature. Setting this attribute has no effect. */
  export let hovered: DATA | null = null;

  export type DATA = $$Generic;

  /** The deck.gl layer class to create */
  export let type: any;
  export let data: DATA[];

  const dispatch = createEventDispatcher();

  const context = mapContext();
  const { map, minzoom: minZoomContext, maxzoom: maxZoomContext } = context;

  let layerEvent = writable<DeckGlMouseEvent | null>(null);
  let layerId = writable(id);
  setMapContext({
    ...context,
    popupTarget: readable(null),
    layer: layerId,
    layerEvent,
  });

  $: $layerId = id;

  $: actualMinZoom = minzoom ?? $minZoomContext;
  $: actualMaxZoom = maxzoom ?? $maxZoomContext;

  let zoom = $map?.getZoom() ?? 1;
  $: visibility = visible && zoom >= actualMinZoom && zoom <= actualMaxZoom;

  $: options = {
    ...$$restProps,
    visible: visibility,
    data,
    pickable,
    onClick: handleClick,
    onHover: handleHover,
  };

  function handleZoom() {
    if ($map) {
      zoom = $map.getZoom();
    }
  }

  // Need a way to pass events down to the popup.
  // Don't set popupTarget and instead set some kind of event store
  // that will set the event the popup is handling. Consider moving
  // all popup event handling to this model.
  // Convert marker to use layer event instead of special hover store
  function handleClick(e: DeckGlMouseEvent<DATA>) {
    dispatch('click', e);
    $layerEvent = {
      ...e,
      layerType: 'deckgl',
      type: 'click',
    };
  }

  function handleHover(e: DeckGlMouseEvent<DATA>) {
    const type = e.index !== -1 ? 'mousemove' : 'mouseleave';
    hovered = e.object ?? null;
    dispatch(type, e);
    $layerEvent = {
      ...e,
      layerType: 'deckgl',
      type,
    };
  }

  let layer: MapboxLayer;
  $: if ($map && !layer) {
    $map.on('zoom', handleZoom);
    $map.on('zoomend', handleZoom);
    handleZoom();

    layer = new MapboxLayer({
      id,
      type,
      ...options,
    });
    $map.addLayer(layer);
  }

  $: layer?.setProps(options);

  onDestroy(() => {
    if ($map?.loaded() && layer) {
      $map.removeLayer(id);
      $map.off('zoom', handleZoom);
      $map.off('zoomend', handleZoom);
    }
  });
</script>

{#if layer}
  <slot />
{/if}
