<script lang="ts" generics="FEATURE extends Feature = Feature">
  import { flush } from '$lib/flush.js';
  import type { Feature } from 'geojson';
  import type maplibregl from 'maplibre-gl';
  import type { MapGeoJSONFeature, MapMouseEvent } from 'maplibre-gl';
  import { onDestroy } from 'svelte';
  import { diffApplier } from './compare.js';
  import { getId, getSource, getMapContext, updatedLayerContext } from './context.svelte.js';
  import { combineFilters, isClusterFilter } from './filters.js';
  import type { CommonLayerProps, LayerClickInfo } from './types.js';

  interface Props extends CommonLayerProps<FEATURE> {
    type: maplibregl.LayerSpecification['type'];
    paint?: object | undefined;
    layout?: object | undefined;
    applyToClusters?: boolean;
    requireSource?: boolean;
  }

  type FeatureFromMap = MapGeoJSONFeature & FEATURE;

  let {
    id = getId('layer'),
    source = undefined,
    sourceLayer = undefined,
    beforeId = undefined,
    beforeLayerType = undefined,
    type,
    paint = undefined,
    layout = undefined,
    filter = undefined,
    applyToClusters = undefined,
    requireSource = true,
    minzoom = undefined,
    maxzoom = undefined,
    manageHoverState = false,
    hovered = $bindable(),
    interactive = true,
    hoverCursor = undefined,
    eventsIfTopMost = false,
    children = undefined,

    onclick = undefined,
    ondblclick = undefined,
    oncontextmenu = undefined,
    onmouseenter = undefined,
    onmousemove = undefined,
    onmouseleave = undefined,
  }: Props = $props();

  const sourceName = getSource();
  const { loaded } = $derived(getMapContext());
  const { layer } = updatedLayerContext();
  const {
    map,
    eventTopMost,
    layerInfo,
    minzoom: minzoomContext,
    maxzoom: maxzoomContext,
  } = $derived(getMapContext());

  onDestroy(() => {
    if (layer.value) {
      layerInfo.delete(layer.value);
      map.removeLayer(layer.value);
    }
  });

  let hoverFeatureId: string | number | undefined = undefined;

  function handleClick(e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) {
    if (!interactive || !layer.value || !map) {
      return;
    }

    if (eventsIfTopMost && eventTopMost(e) !== layer.value) {
      return;
    }

    let features = e.features ?? [];
    let clusterId = features[0]?.properties?.cluster_id;
    let eventData: LayerClickInfo<FeatureFromMap> = {
      event: e,
      map,
      clusterId,
      layer: layer.value,
      source: actualSource!,
      features: features as FeatureFromMap[],
    };

    switch (e.type) {
      case 'click':
        onclick?.(eventData);
        break;
      case 'dblclick':
        ondblclick?.(eventData);
        break;
      case 'contextmenu':
        oncontextmenu?.(eventData);
        break;
    }
  }

  function handleMouseEnter(e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) {
    if (!interactive || !layer.value) {
      return;
    }

    if (eventsIfTopMost && eventTopMost(e) !== layer.value) {
      return;
    }

    if (hoverCursor) {
      map.getCanvas().style.cursor = hoverCursor;
    }

    let features = (e.features ?? []) as FeatureFromMap[];
    hovered = features[0] ?? undefined;
    let clusterId = features[0]?.properties?.cluster_id;

    let data: LayerClickInfo<FEATURE> = {
      event: e,
      map,
      clusterId,
      layer: layer.value!,
      source: actualSource!,
      features,
    };

    onmouseenter?.(data);
  }

  function handleMouseMove(e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) {
    if (!interactive) {
      return;
    }

    if (eventsIfTopMost && eventTopMost(e) !== layer.value) {
      hovered = undefined;
      if (manageHoverState && hoverFeatureId !== undefined) {
        map.setFeatureState(
          { source: actualSource!, sourceLayer, id: hoverFeatureId },
          { hover: false }
        );
        hoverFeatureId = undefined;
      }

      return;
    }

    // This may get out of sync, if this layer regains focus from a higher layer.
    if (hoverCursor) {
      map.getCanvas().style.cursor = hoverCursor;
    }

    let features = (e.features ?? []) as FeatureFromMap[];

    let clusterId = features[0]?.properties?.cluster_id;

    let featureId = features[0]?.id;

    if (featureId !== hoverFeatureId) {
      if (manageHoverState) {
        if (hoverFeatureId !== undefined) {
          map.setFeatureState(
            { source: actualSource!, id: hoverFeatureId, sourceLayer },
            { hover: false }
          );
        }
        map.setFeatureState({ source: actualSource!, id: featureId, sourceLayer }, { hover: true });
      }

      hoverFeatureId = featureId;
      hovered = features[0] ?? undefined;
    }

    onmousemove?.({
      event: e,
      map,
      clusterId,
      layer: layer.value!,
      source: actualSource!,
      features,
    });
  }

  function handleMouseLeave(e: MapMouseEvent) {
    if (!interactive || !layer.value || !map) {
      return;
    }

    if (hoverCursor) {
      map.getCanvas().style.cursor = '';
    }

    hovered = undefined;
    if (manageHoverState && hoverFeatureId !== undefined) {
      const featureSelector = { source: actualSource!, id: hoverFeatureId, sourceLayer };
      map.setFeatureState(featureSelector, { hover: false });
      hoverFeatureId = undefined;
    }

    onmouseleave?.({
      map,
      layer: layer.value!,
      source: actualSource!,
    });
  }

  let first = $state(true);

  function unsubEvents(layerName: string) {
    map.off('dblclick', layerName, handleClick);
    map.off('contextmenu', layerName, handleClick);
    map.off('mouseenter', layerName, handleMouseEnter);
    map.off('mousemove', layerName, handleMouseMove);
    map.off('mouseleave', layerName, handleMouseLeave);
  }

  onDestroy(() => {
    if (layer.value) {
      unsubEvents(layer.value);
    }
  });

  let clusterFilter = $derived(isClusterFilter(applyToClusters));
  let layerFilter = $derived(combineFilters('all', clusterFilter, filter));
  let actualMinZoom = $derived(minzoom ?? minzoomContext);
  let actualMaxZoom = $derived(maxzoom ?? maxzoomContext);
  let actualSource = $derived(source || sourceName?.value);
  $effect(() => {
    if (layer.value !== id && loaded && (actualSource || !requireSource)) {
      if (layer.value) {
        unsubEvents(layer.value);
        layerInfo.delete(layer.value);
      }

      let actualBeforeId = beforeId;
      if (!beforeId && beforeLayerType) {
        let layers = map.getStyle().layers;
        let layerFunc =
          typeof beforeLayerType === 'function'
            ? beforeLayerType
            : (l: maplibregl.LayerSpecification) => l.type === beforeLayerType;
        let beforeLayer = layers?.find(layerFunc);
        if (beforeLayer) {
          actualBeforeId = beforeLayer.id;
        }
      }

      layer.value = id;
      map.addLayer(
        // @ts-expect-error Maplibre types try to match the `type` to the `paint` and `layout` but since
        // we're generic here it complains. That's ok.
        flush({
          id: layer.value,
          type,
          source: actualSource,
          'source-layer': sourceLayer,
          filter: layerFilter,
          paint,
          layout,
          minzoom: actualMinZoom,
          maxzoom: actualMaxZoom,
        }),
        actualBeforeId
      );
      first = true;

      map.on('click', layer.value!, handleClick);
      map.on('dblclick', layer.value!, handleClick);
      map.on('contextmenu', layer.value!, handleClick);
      map.on('mouseenter', layer.value!, handleMouseEnter);
      map.on('mousemove', layer.value!, handleMouseMove);
      map.on('mouseleave', layer.value!, handleMouseLeave);
    }
  });
  $effect(() => {
    if (layer.value) {
      layerInfo.set(layer.value, {
        interactive,
      });
    }
  });
  let applyPaint = $derived(
    layer.value
      ? diffApplier((key, value) => {
          if (map.style._loaded) {
            map.setPaintProperty(layer.value!, key, value);
          } else {
            map.once('styledata', () => map.setPaintProperty(layer.value!, key, value));
          }
        })
      : void 0
  );
  let applyLayout = $derived(
    layer.value
      ? diffApplier((key, value) => {
          if (map.style._loaded) {
            map.setLayoutProperty(layer.value!, key, value);
          } else {
            map.once('styledata', () => map.setLayoutProperty(layer.value!, key, value));
          }
        })
      : void 0
  );
  $effect(() => {
    applyPaint?.(paint);
  });
  $effect(() => {
    applyLayout?.(layout);
  });
  $effect(() => {
    if (layer.value) map.setLayerZoomRange(layer.value, actualMinZoom, actualMaxZoom);
  });
  // Don't set the filter again after we've just created it.
  $effect(() => {
    if (layer.value) {
      if (first) {
        first = false;
      } else {
        map.setFilter(layer.value, layerFilter);
      }
    }
  });
</script>

<!--
@component
A component that handles a generic layer. This is intended for use by other type-specific
layer components, such as FillLayer, and usually you will want to use one of those in your
code instead of directly using this component.
-->

{#if layer.value}
  {#key layer.value}
    {@render children?.()}
  {/key}
{/if}
