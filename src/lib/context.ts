import type { Map, Marker, MapMouseEvent } from 'maplibre-gl';
import type { Feature } from 'geojson';
import { getContext, setContext } from 'svelte';
import { readable, writable, type Readable, type Writable } from 'svelte/store';
import type { ClusterOptions, LayerClickInfo } from './types';

// Choose current time instead of 0 to avoid possible reuse during HMR.
export let nextId = Date.now();
/** Return an ID to use for a source or layer, in case you don't care about
 * the name. */
export function getId(prefix: string) {
  return `${prefix}-${nextId++}`;
}

export interface MapContext {
  map: Readable<Map | null>;
  source: Readable<string | null>;
  layer: Readable<string | null>;
  cluster: Writable<ClusterOptions | undefined>;
  popupTarget: Readable<Marker | string | null>;
  /** A list of images that have been successfully loaded. */
  loadedImages: Writable<Set<string>>;
  minzoom: Writable<number>;
  maxzoom: Writable<number>;
}

const MAP_CONTEXT_KEY = Symbol.for('svelte-maplibre');
const MARKER_HOVER_CONTEXT_KEY = Symbol.for('svelte-maplibre-marker-hover');

export function markerHoverContext(): Readable<boolean> | undefined {
  return getContext(MARKER_HOVER_CONTEXT_KEY);
}

export function createMarkerHoverContext(): Writable<boolean> {
  return setContext(MARKER_HOVER_CONTEXT_KEY, writable(false));
}

export function mapContext(): MapContext {
  return getContext(MAP_CONTEXT_KEY);
}

export function setMapContext(context: MapContext): MapContext {
  return setContext(MAP_CONTEXT_KEY, context);
}

export function createMapContext(): MapContext {
  return setContext(MAP_CONTEXT_KEY, {
    map: writable<Map | null>(null),
    source: readable(null),
    layer: readable(null),
    popupTarget: readable(null),
    cluster: writable(),
    loadedImages: writable(new Set()),
    minzoom: writable(0),
    maxzoom: writable(24),
  });
}

/** Make sure inner components can't accidentally change their parent stores. */
function readableFromWritable<T>(writable: Readable<T>): Readable<T> {
  return {
    subscribe: writable.subscribe,
  };
}

export interface UpdatedContext<TYPE> extends MapContext {
  self: Writable<TYPE | null>;
}

/** Replace one or more elements of the map context with a new store. */
function updatedContext<T extends string | Marker>(
  key: 'source' | 'layer' | 'popupTarget',
  setPopupTarget = false,
  setCluster = false
): UpdatedContext<T> {
  let currentContext = mapContext();

  let newValue = writable<T | null>(null);
  let ctxValue = readableFromWritable(newValue);
  let newCtx = {
    ...currentContext,
    [key]: readableFromWritable(newValue),
  };

  if (setPopupTarget) {
    // This type also becomes a popup target in addition to whatever else it was.
    newCtx.popupTarget = ctxValue;
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
  return updatedContext<string>('source', false, true);
}

export function updatedLayerContext(): UpdatedContext<string> {
  return updatedContext<string>('layer', true);
}

export function updatedMarkerContext(): UpdatedContext<Marker> {
  return updatedContext<Marker>('popupTarget', true);
}

export function updatedZoomRangeContext(
  initialMinZoom: number | undefined,
  initialMaxZoom: number | undefined
) {
  let currentContext = mapContext();
  let minzoom = writable(initialMinZoom);
  let maxzoom = writable();
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

export function eventTracker(mouseEvent: Writable<LayerClickInfo | null>) {}
