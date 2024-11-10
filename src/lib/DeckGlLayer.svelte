<script lang="ts" generics="DATA">
  import { onMount, onDestroy } from 'svelte';
  import {
    getId,
    mapContext,
    setMapContext,
    updatedLayerContext,
    type DeckGlMouseEvent,
  } from './context';
  import { readable, writable } from 'svelte/store';

  interface Props {
    id?: any;
    minzoom?: number | undefined;
    maxzoom?: number | undefined;
    visible?: boolean;
    /** Handle mouse events on this layer. */
    interactive?: boolean;
    /** This indicates the currently hovered feature. Setting this attribute has no effect. */
    hovered?: DATA;
    /** The deck.gl layer class to create */
    type: any;
    data: DATA[];
    children?: import('svelte').Snippet;

    onclick?: (e: DeckGlMouseEvent<DATA>) => void;
    onmousemove?: (e: DeckGlMouseEvent<DATA>) => void;
    onmouseleave?: (e: DeckGlMouseEvent<DATA>) => void;

    [key: string]: any;
  }

  let {
    id = getId('deckgl-layer'),
    minzoom = undefined,
    maxzoom = undefined,
    visible = true,
    interactive = true,
    hovered = $bindable(),
    type,
    data,
    children,

    onclick = undefined,
    onmousemove = undefined,
    onmouseleave = undefined,

    ...rest
  }: Props = $props();

  const context = mapContext();
  const { map, minzoom: minZoomContext, maxzoom: maxZoomContext } = context;

  let deckgl: typeof import('@deck.gl/mapbox') = $state();
  onMount(async () => {
    deckgl = await import('@deck.gl/mapbox');
  });

  let layerEvent = writable<DeckGlMouseEvent | undefined>();
  let layerId = writable(id);
  setMapContext({
    ...context,
    popupTarget: readable(),
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

    onclick?.(e);
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
    hovered = e.object ?? undefined;
    const handler = type === 'mousemove' ? onmousemove : onmouseleave;
    handler?.(e);
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
  $effect(() => {
    $layerId = id;
  });
  let actualMinZoom = $derived(minzoom ?? $minZoomContext);
  let actualMaxZoom = $derived(maxzoom ?? $maxZoomContext);
  let visibility = $derived(visible && zoom >= actualMinZoom && zoom <= actualMaxZoom);
  let options = $derived({
    ...rest,
    visible: visibility,
    data,
    pickable: interactive,
    onClick: handleClick,
    onHover: handleHover,
  });
  $effect(() => {
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
  $effect(() => {
    layer?.setProps(options);
  });
</script>

{#if layer}
  {@render children?.()}
{/if}
