import type { Map } from 'maplibre-gl';

// Adapted from https://github.com/maplibre/maplibre-gl-js/blob/5d7e6d52000a8569ac2308a9aef14c98933eb0d8/src/ui/hash.ts
export function getViewportHash(map: Map): string {
  let center = map.getCenter();
  let zoom = Math.round(map.getZoom() * 100) / 100;
  // derived from equation: 512px * 2^z / 360 / 10^d < 0.5px
  let precision = Math.ceil((zoom * Math.LN2 + Math.log(512 / 360 / 0.5)) / Math.LN10);
  let m = Math.pow(10, precision);
  let lat = Math.round(center.lat * m) / m;
  let lng = Math.round(center.lng * m) / m;
  let hash = `${zoom}/${lat}/${lng}`;

  let bearing = map.getBearing();
  let pitch = map.getPitch();
  if (bearing || pitch) {
    hash += `/${Math.round(bearing * 10) / 10}`;
  }
  if (pitch) {
    hash += `/${Math.round(pitch)}`;
  }
  return `#${hash}`;
}

// Returns [zoom, center lat, center lng, optionally bearing, optionally pitch]
export function parseViewportHash(hash: string): number[] {
  const parts = hash.replace('#', '').split('/').map(parseFloat);
  return parts.some(isNaN) ? [] : parts;
}
