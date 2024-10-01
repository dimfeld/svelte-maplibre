<script lang="ts">
  import { getId, updatedLayerContext } from './context.js';
  import { diffApplier } from './compare.js';
  import { combineFilters, isClusterFilter } from './filters.js';
  import type { LayerClickInfo } from './types.js';
  import flush from 'just-flush';
  import { onDestroy, createEventDispatcher } from 'svelte';
  import type { MapMouseEvent, MapGeoJSONFeature } from 'maplibre-gl';
  import type * as GeoJSON from 'geojson';

  export let id = getId('layer');
  /** Set the source for this layer. This can be omitted when the Layer is created in the slot
   * of a source component. */
  export let source: string | undefined = undefined;
  /** When setting up a layer for a vector tile source, the source layer to which this layer corresponds. */
  export let sourceLayer: string | undefined = undefined;

  /** Draw this layer under another layer. This is only evaluated when the component is created. */
  export let beforeId: string | undefined = undefined;
  /** Calculate beforeId so that this layer appears below all layers of a particular type.
   * If this is a function, this layer will be added before the first layer for which
   * the function returns true.*/
  export let beforeLayerType:
    | string
    | ((layer: maplibregl.LayerSpecification) => boolean)
    | undefined = undefined;
  export let type: maplibregl.LayerSpecification['type'];
  export let paint: object | undefined = undefined;
  export let layout: object | undefined = undefined;
  export let filter: maplibregl.ExpressionSpecification | undefined = undefined;
  export let applyToClusters: boolean | undefined = undefined;
  export let minzoom: number | undefined = undefined;
  export let maxzoom: number | undefined = undefined;
  /** Enable to use hoverStateFilter or filter on `hover-state`. Features must have an `id` property for this to work. */
  export let manageHoverState = false;
  /** The feature currently being hovered. */
  export let hovered: GeoJSON.Feature | null = null;
  /** Handle mouse events on this layer. */
  export let interactive = true;

  export let hoverCursor: string | undefined = undefined;

  export let eventsIfTopMost = false;

  const dispatch = createEventDispatcher<{
    click: LayerClickInfo;
    dblclick: LayerClickInfo;
    contextmenu: LayerClickInfo;
    mouseenter: LayerClickInfo;
    mousemove: LayerClickInfo;
    mouseleave: Pick<LayerClickInfo, 'map' | 'layer' | 'source'>;
  }>();

  $: clusterFilter = isClusterFilter(applyToClusters);
  $: layerFilter = combineFilters('all', clusterFilter, filter);

  const {
    map,
    source: sourceName,
    self: layer,
    minzoom: minZoomContext,
    maxzoom: maxZoomContext,
    eventTopMost,
    layerInfo,
  } = updatedLayerContext();

  $: actualMinZoom = minzoom ?? $minZoomContext;
  $: actualMaxZoom = maxzoom ?? $maxZoomContext;

  $: if ($layer) {
    layerInfo.set($layer, {
      interactive,
    });
  }

  onDestroy(() => {
    if ($layer && $map) {
      layerInfo.delete($layer);
      $map?.removeLayer($layer);
    }
  });

  $: actualSource = source || $sourceName;

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

    dispatch(e.type as 'click' | 'dblclick' | 'contextmenu', eventData);
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

    dispatch('mouseenter', data);
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

    dispatch('mousemove', {
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

    dispatch('mouseleave', {
      map: $map!,
      layer: $layer,
      source: actualSource!,
    });
  }

  let first = true;
  $: if ($map && $layer !== id && actualSource) {
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

  $: applyPaint = $layer
    ? diffApplier((key, value) => {
        if ($map?.style._loaded) {
          $map.setPaintProperty($layer!, key, value);
        } else {
          $map?.once('styledata', () => $map?.setPaintProperty($layer!, key, value));
        }
      })
    : void 0;

  $: applyLayout = $layer
    ? diffApplier((key, value) => {
        if ($map?.style._loaded) {
          $map.setLayoutProperty($layer!, key, value);
        } else {
          $map?.once('styledata', () => $map?.setLayoutProperty($layer!, key, value));
        }
      })
    : void 0;

  $: applyPaint?.(paint);
  $: applyLayout?.(layout);

  $: if ($layer) $map?.setLayerZoomRange($layer, actualMinZoom, actualMaxZoom);

  // Don't set the filter again after we've just created it.
  $: if ($layer) {
    if (first) {
      first = false;
    } else {
      $map?.setFilter($layer, layerFilter);
    }
  }
</script>

<!--
@component
A component that handles a generic layer. This is intended for use by other type-specific
layer components, such as FillLayer, and usually you will want to use one of those in your
code instead of directly using this component.
-->

{#if $layer}
  {#key $layer}
    <slot />
  {/key}
{/if}
