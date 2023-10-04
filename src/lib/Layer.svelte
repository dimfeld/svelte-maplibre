<script lang="ts">
  import { getId, updatedLayerContext } from './context.js';
  import { diffApplier } from './compare.js';
  import { combineFilters, isClusterFilter } from './filters.js';
  import type { LayerClickInfo } from './types.js';
  import flush from 'just-flush';
  import { onDestroy, createEventDispatcher } from 'svelte';
  import { MapMouseEvent, type MapGeoJSONFeature } from 'maplibre-gl';

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
  /** Enable to use hoverStateFilter. */
  export let manageHoverState = false;
  /** The feature currently being hovered. */
  export let hovered: GeoJSON.Feature | null = null;

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
  } = updatedLayerContext();

  $: actualMinZoom = minzoom ?? $minZoomContext;
  $: actualMaxZoom = maxzoom ?? $maxZoomContext;

  onDestroy(() => {
    if ($layer && $map) {
      $map?.removeLayer($layer);
    }
  });

  $: actualSource = source || $sourceName;

  let hoverFeatureId: string | number | undefined = undefined;

  $: if ($map && $layer !== id && actualSource) {
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

    function handleClick(e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) {
      if (!$layer || !$map) {
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

    $map.on('click', $layer, handleClick);
    $map.on('dblclick', $layer, handleClick);
    $map.on('contextmenu', $layer, handleClick);

    $map.on('mouseenter', $layer, (e) => {
      if (!$layer || !$map) {
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
    });

    $map.on('mousemove', $layer, (e) => {
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
    });

    $map.on('mouseleave', $layer, (e) => {
      if (!$layer || !$map) {
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
    });
  }

  $: applyPaint = $layer
    ? diffApplier((key, value) => $map?.setPaintProperty($layer!, key, value))
    : undefined;
  $: applyLayout = $layer
    ? diffApplier((key, value) => $map?.setLayoutProperty($layer!, key, value))
    : undefined;

  $: applyPaint?.(paint);
  $: applyLayout?.(layout);
  $: if ($layer) $map?.setLayerZoomRange($layer, actualMinZoom, actualMaxZoom);
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
