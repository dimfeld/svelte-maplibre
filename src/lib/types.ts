import type { Feature } from 'geojson';

export interface ClusterOptions {
  /** The minimum number of points required to form a cluster.
   * This can not be changed after the source is created.
   * @default 2 */
  minPoints?: number;
  /** Maximum zoom at which to perform clustering. */
  maxZoom?: number;
  /** Radius of each cluster when clustering points.
   * @default 50 */
  radius?: number;
  /** Aggregations to peform on the cluster points.
   * This can not be changed after the source is created. */
  properties?: Record<string, maplibregl.ExpressionSpecification>;
}

export interface CustomImageUrlSpec {
  id: string;
  url: string;
  options?: Partial<maplibregl.StyleImageMetadata>;
}

export interface CustomImageDataSpec {
  id: string;
  data:
    | HTMLImageElement
    | ImageBitmap
    | ImageData
    | { width: number; height: number; data: Uint8Array | Uint8ClampedArray }
    | maplibregl.StyleImageInterface;
  options?: Partial<maplibregl.StyleImageMetadata>;
}

export type CustomImageSpec = CustomImageUrlSpec | CustomImageDataSpec;

export interface LayerClickInfo {
  map: maplibregl.Map;
  clusterId: string | undefined;
  layer: string;
  source: string;
  features: Feature[];
}
