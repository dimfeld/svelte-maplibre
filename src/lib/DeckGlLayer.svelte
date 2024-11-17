<script lang="ts" generics="DATA">
  import { onMount, onDestroy } from 'svelte';
  import type { Snippet } from 'svelte';
  import {
    Box,
    getId,
    getMapContext,
    setPopupTarget,
    updatedDeckGlContext,
  } from './context.svelte.js';
  import type { PickingInfo } from '@deck.gl/core';

  interface Props {
    id?: any;
    interleaved?: boolean;
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
    beforeId?: string;
    children?: Snippet;

    onclick?: (e: PickingInfo<DATA>) => void;
    onmousemove?: (e: PickingInfo<DATA>) => void;
    onmouseleave?: (e: PickingInfo<DATA>) => void;

    [key: string]: any;
  }

  let {
    id = getId('deckgl-layer'),
    interleaved = false,
    minzoom = undefined,
    maxzoom = undefined,
    visible = true,
    interactive = true,
    hovered = $bindable(),
    type,
    data,
    beforeId = undefined,
    children,

    onclick = undefined,
    onmousemove = undefined,
    onmouseleave = undefined,

    ...rest
  }: Props = $props();

  const context = getMapContext();
  const { map, loaded, minzoom: minZoomContext, maxzoom: maxZoomContext } = $derived(context);

  let deckgl: typeof import('@deck.gl/mapbox') | undefined = $state();
  onMount(async () => {
    deckgl = await import('@deck.gl/mapbox');
  });

  const { layer: layerId, layerEvent } = updatedDeckGlContext();
  layerId.value = id;
  setPopupTarget(new Box(undefined));

  let zoom = $state(context.map.getZoom() ?? 1);

  function handleZoom() {
    zoom = map.getZoom();
  }

  function handleClick(e: PickingInfo<DATA>) {
    if (!interactive) {
      return;
    }

    onclick?.(e);
    layerEvent.value = {
      ...e,
      layerType: 'deckgl',
      type: 'click',
    };
  }

  function handleHover(e: PickingInfo<DATA>) {
    if (!interactive) {
      return;
    }

    const type = e.index !== -1 ? 'mousemove' : 'mouseleave';
    hovered = e.object ?? undefined;
    const handler = type === 'mousemove' ? onmousemove : onmouseleave;
    handler?.(e);
    layerEvent.value = {
      ...e,
      layerType: 'deckgl',
      type,
    };
  }

  let layer: import('@deck.gl/mapbox').MapboxOverlay | undefined = $state();

  onDestroy(() => {
    if (loaded && layer) {
      // @ts-expect-error Mapbox/Maplibre types don't quite match
      map.removeControl(layer);
      map.off('zoom', handleZoom);
      map.off('zoomend', handleZoom);
    }
  });

  $effect(() => {
    layerId.value = id;
  });

  let actualMinZoom = $derived(minzoom ?? minZoomContext);
  let actualMaxZoom = $derived(maxzoom ?? maxZoomContext);
  let visibility = $derived(visible && zoom >= actualMinZoom && zoom <= actualMaxZoom);
  let options = $derived({
    ...rest,
    beforeId,
    visible: visibility,
    data,
    pickable: interactive,
    onClick: handleClick,
    onHover: handleHover,
  });

  $effect(() => {
    if (loaded && map && deckgl && !layer) {
      map.on('zoom', handleZoom);
      map.on('zoomend', handleZoom);
      handleZoom();

      layer = new deckgl.MapboxOverlay({
        id,
        interleaved,
        layers: [new type(options)],
      });
      // @ts-expect-error Mapbox/Maplibre types don't quite match
      map.addControl(layer);
    }
  });
  $effect(() => {
    layer?.setProps({
      layers: [new type(options)],
    });
  });
</script>

{#if layer}
  {@render children?.()}
{/if}
