<script lang="ts">
  import type maplibregl from 'maplibre-gl';
  import { getId, updatedLayerContext } from './context.js';
  import { diffApplier } from './compare.js';
  import { combineFilters, isClusterFilter } from './filters.js';
  import type { CommonLayerProps, LayerClickInfo } from './types.js';
  import flush from 'just-flush';
  import { onDestroy } from 'svelte';
  import type { MapMouseEvent, MapGeoJSONFeature } from 'maplibre-gl';

  interface Props extends CommonLayerProps {
    type: maplibregl.LayerSpecification['type'];
    paint?: object | undefined;
    layout?: object | undefined;
    applyToClusters?: boolean;
  }

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

  const {
    map,
    source: sourceName,
    self: layer,
    minzoom: minZoomContext,
    maxzoom: maxZoomContext,
    eventTopMost,
    layerInfo,
  } = updatedLayerContext();

  onDestroy(() => {
    if ($layer && $map) {
      layerInfo.delete($layer);
      $map?.removeLayer($layer);
    }
  });

  let hoverFeatureId: string | number | undefined = undefined;

  function handleClick(e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) {
    if (!interactive || !$layer || !$map) {
      return;
    }

    if (eventsIfTopMost && eventTopMost(e) !== $layer) {
      return;
    }

    let features = e.features ?? [];
    let clusterId = features[0]?.properties?.cluster_id;
    let eventData: LayerClickInfo = {
      event: e,
      map: $map!,
      clusterId,
      layer: $layer,
      source: actualSource!,
      features,
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

  function handleMouseEnter(e: MapMouseEvent) {
    if (!interactive || !$layer || !$map) {
      return;
    }

    if (eventsIfTopMost && eventTopMost(e) !== $layer) {
      return;
    }

    if (hoverCursor) {
      $map.getCanvas().style.cursor = hoverCursor;
    }

    let features = e.features ?? [];
    hovered = features[0] ?? null;
    let clusterId = features[0]?.properties?.cluster_id;

    let data: LayerClickInfo = {
      event: e,
      map: $map!,
      clusterId,
      layer: $layer!,
      source: actualSource!,
      features,
    };

    onmouseenter?.(data);
  }

  function handleMouseMove(e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) {
    if (!interactive || !$map) {
      return;
    }

    if (eventsIfTopMost && eventTopMost(e) !== $layer) {
      hovered = null;
      if (manageHoverState && hoverFeatureId !== undefined) {
        $map?.setFeatureState(
          { source: actualSource!, sourceLayer, id: hoverFeatureId },
          { hover: false }
        );
        hoverFeatureId = undefined;
      }

      return;
    }

    // This may get out of sync, if this layer regains focus from a higher layer.
    $map.getCanvas().style.cursor = hoverCursor;

    let features = e.features ?? [];

    let clusterId = features[0]?.properties?.cluster_id;

    let featureId = features[0]?.id;

    if (featureId !== hoverFeatureId) {
      if (manageHoverState) {
        if (hoverFeatureId !== undefined) {
          $map?.setFeatureState(
            { source: actualSource!, id: hoverFeatureId, sourceLayer },
            { hover: false }
          );
        }
        $map?.setFeatureState(
          { source: actualSource!, id: featureId, sourceLayer },
          { hover: true }
        );
      }

      hoverFeatureId = featureId;
      hovered = features[0] ?? null;
    }

    onmousemove?.({
      event: e,
      map: $map!,
      clusterId,
      layer: $layer!,
      source: actualSource!,
      features,
    });
  }

  function handleMouseLeave(e: MapMouseEvent) {
    if (!interactive || !$layer || !$map) {
      return;
    }

    if (hoverCursor) {
      $map.getCanvas().style.cursor = '';
    }

    hovered = null;
    if (manageHoverState && hoverFeatureId !== undefined) {
      const featureSelector = { source: actualSource!, id: hoverFeatureId, sourceLayer };
      $map?.setFeatureState(featureSelector, { hover: false });
      hoverFeatureId = undefined;
    }

    onmouseleave?.({
      map: $map!,
      layer: $layer,
      source: actualSource!,
    });
  }

  let first = $state(true);

  function unsubEvents(layerName: string) {
    if (!$map) {
      return;
    }

    $map.off('click', layerName, handleClick);
    $map.off('dblclick', layerName, handleClick);
    $map.off('contextmenu', layerName, handleClick);
    $map.off('mouseenter', layerName, handleMouseEnter);
    $map.off('mousemove', layerName, handleMouseMove);
    $map.off('mouseleave', layerName, handleMouseLeave);
  }

  onDestroy(() => {
    if ($map && $layer) {
      unsubEvents($layer);
    }
  });

  let clusterFilter = $derived(isClusterFilter(applyToClusters));
  let layerFilter = $derived(combineFilters('all', clusterFilter, filter));
  let actualMinZoom = $derived(minzoom ?? $minZoomContext);
  let actualMaxZoom = $derived(maxzoom ?? $maxZoomContext);
  let actualSource = $derived(source || $sourceName);
  $effect(() => {
    if ($map && $layer !== id && actualSource) {
      if ($layer) {
        unsubEvents($layer);
        layerInfo.delete($layer);
      }

      let actualBeforeId = beforeId;
      if (!beforeId && beforeLayerType) {
        let layers = $map.getStyle().layers;
        let layerFunc =
          typeof beforeLayerType === 'function'
            ? beforeLayerType
            : (l: maplibregl.LayerSpecification) => l.type === beforeLayerType;
        let beforeLayer = layers?.find(layerFunc);
        if (beforeLayer) {
          actualBeforeId = beforeLayer.id;
        }
      }

      $layer = id;
      $map.addLayer(
        flush({
          id: $layer,
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

      $map.on('click', $layer, handleClick);
      $map.on('dblclick', $layer, handleClick);
      $map.on('contextmenu', $layer, handleClick);
      $map.on('mouseenter', $layer, handleMouseEnter);
      $map.on('mousemove', $layer, handleMouseMove);
      $map.on('mouseleave', $layer, handleMouseLeave);
    }
  });
  $effect(() => {
    if ($layer) {
      layerInfo.set($layer, {
        interactive,
      });
    }
  });
  let applyPaint = $derived(
    $layer
      ? diffApplier((key, value) => {
          if ($map?.style._loaded) {
            $map.setPaintProperty($layer!, key, value);
          } else {
            $map?.once('styledata', () => $map?.setPaintProperty($layer!, key, value));
          }
        })
      : void 0
  );
  let applyLayout = $derived(
    $layer
      ? diffApplier((key, value) => {
          if ($map?.style._loaded) {
            $map.setLayoutProperty($layer!, key, value);
          } else {
            $map?.once('styledata', () => $map?.setLayoutProperty($layer!, key, value));
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
    if ($layer) $map?.setLayerZoomRange($layer, actualMinZoom, actualMaxZoom);
  });
  // Don't set the filter again after we've just created it.
  $effect(() => {
    if ($layer) {
      if (first) {
        first = false;
      } else {
        $map?.setFilter($layer, layerFilter);
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

{#if $layer}
  {#key $layer}
    {@render children?.()}
  {/key}
{/if}
