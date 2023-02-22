import type { ExpressionSpecification } from 'maplibre-gl';

/** Use an image loaded into the map, falling back to another image if it does not exist. */
export function imageWithFallback(
  imageId: string | ExpressionSpecification,
  fallbackId: string
): ExpressionSpecification {
  return ['coalesce', ['image', imageId], ['image', fallbackId]];
}
