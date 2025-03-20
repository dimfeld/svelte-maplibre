import type { Feature, Point } from 'geojson';
import {
  type LngLatBoundsLike,
  type MapGeoJSONFeature,
  type MapLibreEvent,
  type MapMouseEvent,
  type Marker,
} from 'maplibre-gl';
import MapLibre from 'maplibre-gl';
const { LngLatBounds, LngLat } = MapLibre;
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

export interface StyleLoadEvent {
  type: 'style.load';
  map: maplibregl.Map;
  style: maplibregl.Style;
}

function compareFloat(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.000001;
}

export function boundsEqual(
  param: LngLatBoundsLike,
  mapBounds: MapLibre.LngLatBounds | undefined
): { equal: boolean; bounds: MapLibre.LngLatBounds } {
  let paramBounds = LngLatBounds.convert(param);
  if (!mapBounds) {
    return { equal: false, bounds: paramBounds };
  }

  let abNe = paramBounds.getNorthEast();
  let bbNe = mapBounds.getNorthEast();

  if (!compareFloat(abNe.lat, bbNe.lat) || !compareFloat(abNe.wrap().lng, bbNe.wrap().lng)) {
    return { equal: false, bounds: paramBounds };
  }

  let abSw = paramBounds.getSouthWest();
  let bbSw = mapBounds.getSouthWest();

  if (!compareFloat(abSw.lat, bbSw.lat) || !compareFloat(abSw.wrap().lng, bbSw.wrap().lng)) {
    return { equal: false, bounds: paramBounds };
  }

  return { equal: true, bounds: paramBounds };
}

export function convertBoundsToUserFormat(
  bounds: MapLibre.LngLatBounds,
  param: LngLatBoundsLike | undefined
): LngLatBoundsLike {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  if (Array.isArray(param)) {
    if (param.length === 4) {
      // Flat array of numbers
      return [sw.lng, sw.lat, ne.lng, ne.lat];
    } else if (param.length === 2) {
      if (param[0] instanceof LngLat) {
        // Array of LngLat objects
        return [sw, ne];
      } else {
        // Nested array of numbers
        return [
          [sw.lng, sw.lat],
          [ne.lng, ne.lat],
        ];
      }
    }
  }

  // param is not set, or it's a LngLatBounds
  return bounds;
}
