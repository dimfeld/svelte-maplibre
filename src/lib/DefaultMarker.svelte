<script lang="ts">
  import maplibre, { type LngLatLike, type PointLike } from 'maplibre-gl';
  import { onDestroy } from 'svelte';
  import { updatedMarkerContext } from './context';
  import type { MarkerClickInfo } from './types';
  import type * as GeoJSON from 'geojson';
  import flush from 'just-flush';

  interface Props {
    /** The Marker instance which was added to the map */
    marker?: maplibre.Marker | undefined;
    lngLat: LngLatLike;
    class?: string | undefined;
    /** Handle mouse events */
    draggable?: boolean;
    /** A GeoJSON Feature related to the point. This is only actually used to send an ID and set of properties along with
     * the event, and can be safely omitted. The `lngLat` prop controls the marker's location even if this is provided. */
    feature?: GeoJSON.Feature | null;
    /** An offset in pixels to apply to the marker. */
    offset?: PointLike | undefined;
    /** The rotation angle of the marker (clockwise, in degrees) */
    rotation?: number;
    /** The opacity of the marker */
    opacity?: number;
    children?: import('svelte').Snippet<[any]>;

    ondrag?: (e: MarkerClickInfo) => void;
    ondragstart?: (e: MarkerClickInfo) => void;
    ondragend?: (e: MarkerClickInfo) => void;
  }

  let {
    marker: markerProp = $bindable(undefined),
    lngLat = $bindable(),
    class: classNames = undefined,
    draggable = false,
    feature = null,
    offset = undefined,
    rotation = 0,
    opacity = 1,
    children,

    ondrag = undefined,
    ondragstart = undefined,
    ondragend = undefined,
  }: Props = $props();

  const { map, layerEvent, self: marker } = updatedMarkerContext();

  const dragStartListener = () => sendEvent(ondragstart, 'dragstart');
  const dragListener = () => {
    propagateLngLatChange();
    sendEvent(ondrag, 'drag');
  };
  const dragEndListener = () => {
    propagateLngLatChange();
    sendEvent(ondragend, 'dragend');
  };

  $marker = new maplibre.Marker(
    flush({
      draggable,
      rotation,
      className: classNames,
      offset,
      opacity: opacity.toString(),
    })
  )
    .setLngLat(lngLat)
    .addTo($map!);
  markerProp = $marker;
  if (draggable) {
    $marker.on('dragstart', dragStartListener);
    $marker.on('drag', dragListener);
    $marker.on('dragend', dragEndListener);
  }

  onDestroy(() => {
    markerProp = undefined;
    $marker?.remove();
  });

  $effect(() => {
    $marker?.setLngLat(lngLat);
  });
  $effect(() => {
    $marker?.setOffset(offset ?? [0, 0]);
  });
  $effect(() => {
    $marker?.setRotation(rotation);
  });
  $effect(() => {
    $marker?.setOpacity(opacity.toString());
  });

  function propagateLngLatChange() {
    let newPos = $marker?.getLngLat();
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

  function sendEvent(eventCb: ((e: MarkerClickInfo) => void) | undefined, eventName: string) {
    let loc = $marker?.getLngLat();
    if (!loc) {
      return;
    }

    const lngLat: [number, number] = [loc.lng, loc.lat];
    let data: MarkerClickInfo = {
      map: $map!,
      marker: $marker!,
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

    $layerEvent = {
      ...data,
      layerType: 'marker',
      type: eventName,
    };

    eventCb?.(data);
  }
</script>

{@render children?.({ marker: $marker })}
