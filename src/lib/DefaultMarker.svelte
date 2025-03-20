<script lang="ts" generics="DATA extends Feature = Feature">
  import maplibre, { type LngLatLike, type PointLike } from 'maplibre-gl';
  import { onDestroy } from 'svelte';
  import type { Snippet } from 'svelte';
  import { getMapContext, updatedMarkerContext } from './context.svelte.js';
  import type { MarkerClickInfo } from './types';
  import type { Feature, Point } from 'geojson';
  import { flush } from '$lib/flush.js';

  interface Props {
    /** The Marker instance which was added to the map */
    marker?: maplibre.Marker | undefined;
    lngLat: LngLatLike;
    class?: string | undefined;
    anchor?: maplibre.PositionAnchor;
    /** Handle mouse events */
    draggable?: boolean;
    /** A GeoJSON Feature related to the point. This is only actually used to send an ID and set of properties along with
     * the event, and can be safely omitted. The `lngLat` prop controls the marker's location even if this is provided. */
    feature?: DATA;
    /** An offset in pixels to apply to the marker. */
    offset?: PointLike | undefined;
    /** The rotation angle of the marker (clockwise, in degrees) */
    rotation?: number;
    /** The opacity of the marker */
    opacity?: number;
    children?: Snippet<[{ marker: maplibre.Marker }]>;

    ondrag?: (e: MarkerClickInfo<ClickInfoFeature>) => void;
    ondragstart?: (e: MarkerClickInfo<ClickInfoFeature>) => void;
    ondragend?: (e: MarkerClickInfo<ClickInfoFeature>) => void;
  }

  type ClickInfoFeature = Feature<Point, DATA['properties']>;

  let {
    marker: markerProp = $bindable(undefined),
    lngLat = $bindable(),
    class: classNames = undefined,
    anchor,
    draggable = false,
    feature = undefined,
    offset = undefined,
    rotation = 0,
    opacity = 1,
    children,

    ondrag = undefined,
    ondragstart = undefined,
    ondragend = undefined,
  }: Props = $props();

  const { map } = $derived(getMapContext());
  const { layerEvent, marker } = updatedMarkerContext();

  const dragStartListener = () => sendEvent(ondragstart, 'dragstart');
  const dragListener = () => {
    propagateLngLatChange();
    sendEvent(ondrag, 'drag');
  };
  const dragEndListener = () => {
    propagateLngLatChange();
    sendEvent(ondragend, 'dragend');
  };

  // svelte-ignore state_referenced_locally
  marker.value = new maplibre.Marker(
    flush({
      draggable,
      rotation,
      className: classNames,
      anchor,
      offset,
      opacity: opacity.toString(),
    })
  )
    .setLngLat(lngLat)
    .addTo(map);
  markerProp = marker.value;
  if (draggable) {
    marker.value.on('dragstart', dragStartListener);
    marker.value.on('drag', dragListener);
    marker.value.on('dragend', dragEndListener);
  }

  onDestroy(() => {
    markerProp = undefined;
    marker.value?.remove();
  });

  $effect(() => {
    marker.value?.setLngLat(lngLat);
  });
  $effect(() => {
    if (offset) {
      marker.value?.setOffset(offset);
    }
  });
  $effect(() => {
    marker.value?.setRotation(rotation);
  });
  $effect(() => {
    marker.value?.setOpacity(opacity.toString());
  });

  function propagateLngLatChange() {
    let newPos = marker.value?.getLngLat();
    if (!newPos) {
      return;
    }

    // Update the props using the same format they are already in.
    if (Array.isArray(lngLat)) {
      lngLat = [newPos.lng, newPos.lat];
    } else if (lngLat && 'lon' in lngLat) {
      lngLat = { lon: newPos.lng, lat: newPos.lat };
    } else {
      lngLat = newPos;
    }
  }

  function sendEvent(
    eventCb: ((e: MarkerClickInfo<ClickInfoFeature>) => void) | undefined,
    eventName: string
  ) {
    let loc = marker.value?.getLngLat();
    if (!loc) {
      return;
    }

    const lngLat: [number, number] = [loc.lng, loc.lat];
    let data: MarkerClickInfo<ClickInfoFeature> = {
      map: map!,
      marker: marker.value!,
      lngLat,
      features: [
        {
          type: 'Feature',

          properties: feature?.properties ?? {},
          geometry: {
            type: 'Point',
            coordinates: lngLat,
          },
        },
      ],
    };

    layerEvent.value = {
      ...data,
      layerType: 'marker',
      type: eventName,
    };

    eventCb?.(data);
  }
</script>

{#if marker.value}
  {@render children?.({ marker: marker.value })}
{/if}
