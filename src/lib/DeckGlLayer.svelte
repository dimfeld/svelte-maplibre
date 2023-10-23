<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import {
    getId,
    mapContext,
    setMapContext,
    updatedLayerContext,
    type DeckGlMouseEvent,
  } from './context';
  import { readable, writable } from 'svelte/store';

  export let id = getId('deckgl-layer');
  export let minzoom: number | undefined = undefined;
  export let maxzoom: number | undefined = undefined;
  export let visible = true;
  /** Whether to handle mouse events on this layer.
   * @deprecated Use `interactive` instead. */
  export let pickable: boolean | undefined = undefined;
  /** Handle mouse events on this layer. */
  export let interactive = true;

  /** This indicates the currently hovered feature. Setting this attribute has no effect. */
  export let hovered: DATA | null = null;

  export type DATA = $$Generic;

  /** The deck.gl layer class to create */
  export let type: any;
  export let data: DATA[];

  const dispatch = createEventDispatcher();

  const context = mapContext();
  const { map, minzoom: minZoomContext, maxzoom: maxZoomContext } = context;

  let deckgl: typeof import('@deck.gl/mapbox');
  onMount(async () => {
    deckgl = await import('@deck.gl/mapbox');
  });

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
    pickable: pickable ?? interactive,
    onClick: handleClick,
    onHover: handleHover,
  };

  function handleZoom() {
    if ($map) {
      zoom = $map.getZoom();
    }
  }

  function handleClick(e: DeckGlMouseEvent<DATA>) {
    if (!interactive) {
      return;
    }

    dispatch('click', e);
    $layerEvent = {
      ...e,
      layerType: 'deckgl',
      type: 'click',
    };
  }

  function handleHover(e: DeckGlMouseEvent<DATA>) {
    if (!interactive) {
      return;
    }

    const type = e.index !== -1 ? 'mousemove' : 'mouseleave';
    hovered = e.object ?? null;
    dispatch(type, e);
    $layerEvent = {
      ...e,
      layerType: 'deckgl',
      type,
    };
  }

  let layer: typeof import('@deck.gl/mapbox').MapboxLayer;
  $: if ($map && deckgl && !layer) {
    $map.on('zoom', handleZoom);
    $map.on('zoomend', handleZoom);
    handleZoom();

    layer = new deckgl.MapboxLayer({
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
