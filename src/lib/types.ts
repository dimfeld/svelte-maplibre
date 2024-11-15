import type { Feature, Point } from 'geojson';
import type { MapGeoJSONFeature, MapLibreEvent, MapMouseEvent, Marker } from 'maplibre-gl';
import type { Snippet } from 'svelte';

export type {
  ControlPosition,
  ExpressionSpecification,
  Feature,
  LayerSpecification,
  LngLatBoundsLike,
  LngLatLike,
  Map,
  MapGeoJSONFeature,
  Offset,
  PointLike,
  PositionAnchor,
  StyleSpecification,
  GeolocateControl as GeolocateControlInterface,
} from 'maplibre-gl';

export type FeatureWithId<FEATURE extends Feature> = MapGeoJSONFeature &
  FEATURE & { id: string | number };
export type MarkerClickInfoFeature<FEATURE extends Feature> = Feature<Point, FEATURE['properties']>;

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

export interface LayerClickInfo<FEATURE extends Feature = Feature> {
  map: maplibregl.Map;
  event: MapMouseEvent;
  clusterId: string | undefined;
  layer: string;
  source: string;
  features: FEATURE[];
}

export interface MarkerClickInfo<FEATURE extends Feature = Feature> {
  map: maplibregl.Map;
  marker: Marker;
  lngLat: [number, number];
  features: FEATURE[];
}

export interface MarkerLayerEventInfo<FEATURE extends Feature = Feature>
  extends MarkerClickInfo<FEATURE> {
  source: string;
  feature: FEATURE;
}

export type DeckGlAccessor<DATA, RETVAL> = RETVAL | ((data: DATA) => RETVAL);
export type DeckGlColorAccessor<DATA> = DeckGlAccessor<DATA, number[]>;

export type Scheme = 'xyz' | 'tms';

export interface CommonLayerProps<FEATURE extends Feature = Feature> {
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
  hovered?: FEATURE & MapGeoJSONFeature;
  eventsIfTopMost?: boolean;
  /** Handle mouse events on this layer. */
  interactive?: boolean;

  children?: Snippet;

  onclick?: (e: LayerClickInfo<FEATURE>) => void;
  ondblclick?: (e: LayerClickInfo<FEATURE>) => void;
  oncontextmenu?: (e: LayerClickInfo<FEATURE>) => void;
  onmouseenter?: (e: LayerClickInfo<FEATURE>) => void;
  onmousemove?: (e: LayerClickInfo<FEATURE>) => void;
  onmouseleave?: (e: Pick<LayerClickInfo<FEATURE>, 'map' | 'layer' | 'source'>) => void;
}
