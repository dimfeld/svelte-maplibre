<script lang="ts">
  import { run } from 'svelte/legacy';

  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import {
    getId,
    mapContext,
    setMapContext,
    updatedLayerContext,
    type DeckGlMouseEvent,
  } from './context';
  import { readable, writable } from 'svelte/store';

  export type DATA = $$Generic;

  interface Props {
    id?: any;
    minzoom?: number | undefined;
    maxzoom?: number | undefined;
    visible?: boolean;
    /** Whether to handle mouse events on this layer.
     * @deprecated Use `interactive` instead. */
    pickable?: boolean | undefined;
    /** Handle mouse events on this layer. */
    interactive?: boolean;
    /** This indicates the currently hovered feature. Setting this attribute has no effect. */
    hovered?: DATA | null;
    /** The deck.gl layer class to create */
    type: any;
    data: DATA[];
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    id = getId('deckgl-layer'),
    minzoom = undefined,
    maxzoom = undefined,
    visible = true,
    pickable = undefined,
    interactive = true,
    hovered = $bindable(null),
    type,
    data,
    children,
    ...rest
  }: Props = $props();

  const dispatch = createEventDispatcher<{
    click: DeckGlMouseEvent<DATA>;
    mousemove: DeckGlMouseEvent<DATA>;
    mouseleave: DeckGlMouseEvent<DATA>;
  }>();

  const context = mapContext();
  const { map, minzoom: minZoomContext, maxzoom: maxZoomContext } = context;

  let deckgl: typeof import('@deck.gl/mapbox') = $state();
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

  let zoom = $state($map?.getZoom() ?? 1);

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

  let layer: typeof import('@deck.gl/mapbox').MapboxLayer = $state();

  onDestroy(() => {
    if ($map?.loaded() && layer) {
      $map.removeLayer(id);
      $map.off('zoom', handleZoom);
      $map.off('zoomend', handleZoom);
    }
  });
  run(() => {
    $layerId = id;
  });
  let actualMinZoom = $derived(minzoom ?? $minZoomContext);
  let actualMaxZoom = $derived(maxzoom ?? $maxZoomContext);
  let visibility = $derived(visible && zoom >= actualMinZoom && zoom <= actualMaxZoom);
  let options = $derived({
    ...rest,
    visible: visibility,
    data,
    pickable: pickable ?? interactive,
    onClick: handleClick,
    onHover: handleHover,
  });
  run(() => {
    if ($map && deckgl && !layer) {
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
  });
  run(() => {
    layer?.setProps(options);
  });
</script>

{#if layer}
  {@render children?.()}
{/if}
