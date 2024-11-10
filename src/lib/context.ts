import type { Map as MapLibre, MapMouseEvent, Marker } from 'maplibre-gl';
import { getContext, setContext } from 'svelte';
import { readable, writable, type Readable, type Writable } from 'svelte/store';
import type { ClusterOptions, MarkerClickInfo } from './types';

// Choose current time instead of 0 to avoid possible reuse during HMR.
export let nextId = Date.now();
/** Return an ID to use for a source or layer, in case you don't care about
 * the name. */
export function getId(prefix: string) {
  return `${prefix}-${nextId++}`;
}

export interface LayerInfo {
  interactive: boolean;
}

export interface MapContext {
  map: Readable<MapLibre | undefined>;
  source: Readable<string | undefined>;
  layer: Readable<string | undefined>;
  cluster: Writable<ClusterOptions | undefined>;
  popupTarget: Readable<Marker | string | undefined>;
  /** A list of images that have been successfully loaded. */
  loadedImages: Writable<Set<string>>;
  minzoom: Writable<number>;
  maxzoom: Writable<number>;

  // Information about every layer in the system.
  layerInfo: Map<string, LayerInfo>;

  eventTopMost: (event: MapMouseEvent) => string;

  layerEvent: Writable<LayerEvent | undefined>;
  /** Subscribe to marker clicks globally. Marker clicks intentionally do not propagate their events
   * to the map, but some internal components such as Popups need to know when any click happens, on the
   * map or on a marker, and MarkerClickManager facilitates that functionality. */
  markerClickManager: MarkerClickManager;
}

export type MarkerMouseEvent = MarkerClickInfo & { layerType: 'marker'; type: string };

export interface DeckGlMouseEvent<DATA = unknown> {
  layerType: 'deckgl';
  type: 'click' | 'mouseenter' | 'mouseleave';
  coordinate: [number, number];
  object?: DATA;
  index: number;
  picked: boolean;
  color: Uint8Array | null;
  pixel: [number, number];
  x: number;
  y: number;
}

export type LayerEvent = DeckGlMouseEvent<unknown> | MarkerMouseEvent;

const MAP_CONTEXT_KEY = Symbol.for('svelte-maplibre');

export function mapContext(): MapContext {
  return getContext(MAP_CONTEXT_KEY);
}

export function setMapContext(context: MapContext): MapContext {
  return setContext(MAP_CONTEXT_KEY, context);
}

function eventTopMost(layerInfo: Map<string, LayerInfo>): (event: MapMouseEvent) => string {
  let tracker = new WeakMap<Event, string | undefined>();
  return (event: MapMouseEvent) => {
    let id = tracker.get(event.originalEvent);
    if (id !== undefined) {
      return id;
    }

    let features = event.target.queryRenderedFeatures(event.point);
    let topId = features.find((f) => layerInfo.get(f.layer.id)?.interactive)?.layer.id;

    tracker.set(event.originalEvent, topId);

    return topId;
  };
}

export function createMapContext(): MapContext {
  let layerInfo = new Map();
  return setContext(MAP_CONTEXT_KEY, {
    map: writable<MapLibre | undefined>(),
    source: readable(),
    layer: readable(),
    popupTarget: readable(),
    cluster: writable(),
    loadedImages: writable(new Set()),
    minzoom: writable(0),
    maxzoom: writable(24),
    layerEvent: writable(),
    layerInfo,
    eventTopMost: eventTopMost(layerInfo),
    markerClickManager: new MarkerClickManager(),
  });
}

/** Make sure inner components can't accidentally change their parent stores. */
function readableFromWritable<T>(writable: Readable<T>): Readable<T> {
  return {
    subscribe: writable.subscribe,
  };
}

export interface UpdatedContext<TYPE> extends MapContext {
  self: Writable<TYPE | undefined>;
}

interface UpdatedContextOptions {
  key: 'source' | 'layer' | 'popupTarget';
  setPopupTarget?: boolean;
  setCluster?: boolean;
  setMouseEvent?: boolean;
}

/** Replace one or more elements of the map context with a new store. */
function updatedContext<T extends string | Marker>({
  key,
  setPopupTarget = false,
  setCluster = false,
  setMouseEvent = false,
}: UpdatedContextOptions): UpdatedContext<T> {
  let currentContext = mapContext();

  let newValue = writable<T | undefined>();
  let ctxValue = readableFromWritable(newValue);
  let newCtx = {
    ...currentContext,
    [key]: readableFromWritable(newValue),
  };

  if (setPopupTarget) {
    // This type also becomes a popup target in addition to whatever else it was.
    newCtx.popupTarget = ctxValue;
  }

  if (setMouseEvent) {
    let layerEvent = writable();
    newCtx.layerEvent = layerEvent;
    currentContext.layerEvent = layerEvent;
  }

  if (setCluster) {
    newCtx.cluster = writable();
  }

  setContext(MAP_CONTEXT_KEY, newCtx);

  return {
    ...currentContext,
    self: newValue,
  };
}

export function updatedSourceContext(): UpdatedContext<string> {
  return updatedContext<string>({ key: 'source', setCluster: true });
}

export function updatedLayerContext(interactive = true): UpdatedContext<string> {
  return updatedContext<string>({
    key: 'layer',
    setPopupTarget: interactive,
    setMouseEvent: interactive,
  });
}

export function updatedDeckGlContext(): UpdatedContext<string> {
  return updatedContext<string>({ key: 'layer', setMouseEvent: true });
}

export function updatedMarkerContext(): UpdatedContext<Marker> {
  return updatedContext<Marker>({ key: 'popupTarget', setPopupTarget: true, setMouseEvent: true });
}

export function updatedZoomRangeContext(
  initialMinZoom: number | undefined,
  initialMaxZoom: number | undefined
) {
  let currentContext = mapContext();
  let minzoom = writable(initialMinZoom);
  let maxzoom = writable(initialMaxZoom);
  setContext(MAP_CONTEXT_KEY, {
    ...currentContext,
    minzoom: readableFromWritable(minzoom),
    maxzoom: readableFromWritable(maxzoom),
  });
  return {
    originalMinZoom: currentContext.minzoom,
    originalMaxZoom: currentContext.maxzoom,
    minzoom,
    maxzoom,
  };
}

export function isDeckGlMouseEvent(
  event: MapMouseEvent | DeckGlMouseEvent
): event is DeckGlMouseEvent<unknown> {
  return 'layerType' in event && event.layerType === 'deckgl';
}

type MarkerClickCallback = (event: MarkerClickInfo) => void;

class MarkerClickManager {
  private _handlers: Set<MarkerClickCallback> = new Set();

  add(markerClickInfo: MarkerClickCallback) {
    this._handlers.add(markerClickInfo);
  }

  remove(markerClickInfo: MarkerClickCallback) {
    this._handlers.delete(markerClickInfo);
  }

  handleClick(event: MarkerClickInfo) {
    for (const handler of this._handlers) {
      handler(event);
    }
  }
}
