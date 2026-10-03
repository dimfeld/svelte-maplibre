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

  let zoom = $state(context.map?.getZoom() ?? 1);

  function handleZoom() {
    const currentZoom = map?.getZoom();
    if (currentZoom) {
      zoom = currentZoom;
    }
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
    if (loaded && layer && map) {
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
      map.addControl(layer);
    }
  });
  $effect(() => {
    layer?.setProps({
      layers: [new type(options)],
    });
  });
</script>

<!-- @component
Add a deck.gl layer to the map. Set `type` to the deck.gl layer class and `data` to the array of data items.

The component loads `@deck.gl/mapbox` when it mounts, and adds a `MapboxOverlay` to the map as a control. All other props go to the deck.gl layer constructor. When a prop changes, the component makes a new layer instance with the new props. Set `interleaved` to draw the layer between the MapLibre layers. This prop is only used when the overlay is created.

The layer is hidden when `visible` is `false` or when the map zoom is outside `minzoom` and `maxzoom`. When `interactive` is `true`, the layer handles clicks and hover, and `hovered` holds the data item under the mouse. Child components, such as `Popup`, render only after the overlay is created.
-->

{#if layer}
  {@render children?.()}
{/if}
