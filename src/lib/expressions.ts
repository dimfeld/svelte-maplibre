import type { ExpressionSpecification } from 'maplibre-gl';

/** Use an image loaded into the map, falling back to another image if it does not exist. */
export function imageWithFallback(
  imageId: string | ExpressionSpecification,
  fallbackId: string
): ExpressionSpecification {
  return ['coalesce', ['image', imageId], ['image', fallbackId]];
}

/** Create an interpolation that changes with the map's zoom level. */
export function zoomTransition(
  start: number,
  startValue: number | ExpressionSpecification,
  end: number,
  endValue: number | ExpressionSpecification
): ExpressionSpecification {
  // let actualStart = typeof startValue === 'number' ? ['literal', startValue];
  return ['interpolate', ['linear'], ['zoom'], start, startValue, end, endValue];
}
