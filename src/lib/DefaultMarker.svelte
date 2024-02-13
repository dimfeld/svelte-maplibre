<script lang="ts">
  import maplibre, { type LngLatLike, type PointLike } from 'maplibre-gl';
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { updatedMarkerContext } from './context';
  import type { MarkerClickInfo } from './types';
  import type * as GeoJSON from 'geojson';
  import flush from 'just-flush';

  export let lngLat: LngLatLike;
  let classNames: string | undefined = undefined;
  export { classNames as class };
  /** Handle mouse events */
  export let draggable = false;
  /** A GeoJSON Feature related to the point. This is only actually used to send an ID and set of properties along with
   * the event, and can be safely omitted. The `lngLat` prop controls the marker's location even if this is provided. */
  export let feature: GeoJSON.Feature | null = null;
  /** An offset in pixels to apply to the marker. */
  export let offset: PointLike | undefined = undefined;
  /** The rotation angle of the marker (clockwise, in degrees) */
  export let rotation: number = 0;
  /** The opacity of the marker */
  export let opacity: number = 1;

  const dispatch = createEventDispatcher();
  const { map, layerEvent, self: marker } = updatedMarkerContext();

  const dragStartListener = () => sendEvent('dragstart');
  const dragListener = () => {
    propagateLngLatChange();
    sendEvent('drag');
  };
  const dragEndListener = () => {
    propagateLngLatChange();
    sendEvent('dragend');
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
    .addTo($map);
  if (draggable) {
    $marker.on('dragstart', dragStartListener);
    $marker.on('drag', dragListener);
    $marker.on('dragend', dragEndListener);
  }

  onDestroy(() => $marker?.remove());

  $: $marker?.setLngLat(lngLat);
  $: $marker?.setOffset(offset ?? [0, 0]);
  $: $marker?.setRotation(rotation);
  $: $marker?.setOpacity(opacity.toString());

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

  function sendEvent(eventName: string) {
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

    dispatch(eventName, data);
  }
</script>

<slot />
