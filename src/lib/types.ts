import type { Feature, Point } from 'geojson';
import type { MapLibreEvent, MapMouseEvent, Marker } from 'maplibre-gl';

export type {
  ControlPosition,
  ExpressionSpecification,
  Feature,
  LayerSpecification,
  LngLatBoundsLike,
  LngLatLike,
  Map,
  Offset,
  PointLike,
  PositionAnchor,
  StyleSpecification,
  GeolocateControl as GeolocateControlInterface,
} from 'maplibre-gl';

export type MapMoveEvent = MapLibreEvent<MouseEvent | TouchEvent | WheelEvent | undefined>;

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
  event: MapMouseEvent;
  clusterId: string | undefined;
  layer: string;
  source: string;
  features: Feature[];
}

export interface MarkerClickInfo {
  map: maplibregl.Map;
  marker: Marker;
  lngLat: [number, number];
  features: Feature<Point>[];
}

export interface MarkerLayerEventInfo extends MarkerClickInfo {
  source: string;
  feature: Feature<Point>;
}

export type DeckGlAccessor<DATA, RETVAL> = RETVAL | ((data: DATA) => RETVAL);
export type DeckGlColorAccessor<DATA> = DeckGlAccessor<DATA, number[]>;

export type Scheme = 'xyz' | 'tms';

export interface CommonLayerProps {
  id?: any;
  /** Set the source for this layer. This can be omitted when the Layer is created in the slot
   * of a source component. */
  source?: string | undefined;
  /** When setting up a layer for a vector tile source, the source layer to which this layer corresponds. */
  sourceLayer?: string | undefined;
  /** Draw this layer under another layer. This is only evaluated when the component is created. */
  beforeId?: string | undefined;
  /** Draw this layer all layers of this type. This is only evaluated when the component is created. */
  beforeLayerType?: string | ((layer: maplibregl.LayerSpecification) => boolean) | undefined;
  filter?: maplibregl.ExpressionSpecification | undefined;
  minzoom?: number | undefined;
  maxzoom?: number | undefined;
  /** Set the cursor style to this value when the mouse is over the layer. */
  hoverCursor?: string | undefined;
  /** Enable to use hoverStateFilter or filter on `hover-state`. Features must have an `id` property for this to work. */
  manageHoverState?: boolean;
  hovered?: Feature;
  eventsIfTopMost?: boolean;
  /** Handle mouse events on this layer. */
  interactive?: boolean;

  children?: import('svelte').Snippet;

  onclick?: (e: LayerClickInfo) => void;
  ondblclick?: (e: LayerClickInfo) => void;
  oncontextmenu?: (e: LayerClickInfo) => void;
  onmouseenter?: (e: LayerClickInfo) => void;
  onmousemove?: (e: LayerClickInfo) => void;
  onmouseleave?: (e: Pick<LayerClickInfo, 'map' | 'layer' | 'source'>) => void;
}
