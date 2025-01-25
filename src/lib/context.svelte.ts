import type { LngLatLike, Map as MapLibre, MapMouseEvent, Marker } from 'maplibre-gl';
import { getContext, setContext } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';
import type { ClusterOptions, MarkerClickInfo } from './types';
import type { PickingInfo } from '@deck.gl/core';

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

export class Box<T> {
  value = $state() as T;

  constructor(initialValue: T) {
    this.value = initialValue;
  }
}

export class MapContext {
  map = $state() as MapLibre;
  loaded = $state(false);
  // cluster: Box<ClusterOptions | undefined>;
  /** A list of images that have been successfully loaded. */
  loadedImages = new SvelteSet<string>();
  minzoom = $state(0);
  maxzoom = $state(24);

  // Information about every layer in the system.
  layerInfo = new Map<string, LayerInfo>();

  private eventTracker = new WeakMap<Event, string | undefined>();
  private _eventTopMost(event: MapMouseEvent): string | undefined {
    let id = this.eventTracker.get(event.originalEvent);
    if (id !== undefined) {
      return id;
    }

    let features = event.target.queryRenderedFeatures(event.point);
    let topId = features.find((f) => this.layerInfo.get(f.layer.id)?.interactive)?.layer.id;

    this.eventTracker.set(event.originalEvent, topId);

    return topId;
  }

  eventTopMost: (event: MapMouseEvent) => string | undefined;

  /** Subscribe to marker clicks globally. Marker clicks intentionally do not propagate their events
   * to the map, but some internal components such as Popups need to know when any click happens, on the
   * map or on a marker, and MarkerClickManager facilitates that functionality. */
  markerClickManager = new MarkerClickManager();

  constructor() {
    // Do it this way so that we can destructure the MapContext and still use eventTopMost
    this.eventTopMost = this._eventTopMost.bind(this);
  }
}

export class ZoomRange {
  minzoomSetting: number | undefined = $state();
  maxzoomSetting: number | undefined = $state();
  parent: { minzoom: number; maxzoom: number };

  minzoom: number;
  maxzoom: number;

  constructor(
    minzoom: number | undefined,
    maxzoom: number | undefined,
    parent: { minzoom: number; maxzoom: number }
  ) {
    this.minzoomSetting = minzoom;
    this.maxzoomSetting = maxzoom;
    this.parent = parent;
    const minzoomD = $derived(this.minzoomSetting ?? this.parent?.minzoom ?? 0);
    const maxzoomD = $derived(this.maxzoomSetting ?? this.parent?.maxzoom ?? 24);
    this.minzoom = minzoomD;
    this.maxzoom = maxzoomD;
  }
}

export function setLayer(value: Box<string | undefined>) {
  setContext(LAYER_KEY, value);
}

export function getLayer(): Box<string> | undefined {
  return getContext(LAYER_KEY);
}

export function setSource(value: Box<string | undefined>) {
  setContext(SOURCE_KEY, value);
}

export function getSource(): Box<string> | undefined {
  return getContext(SOURCE_KEY);
}

export function setPopupTarget(value: Box<Marker | string | undefined>) {
  setContext(POPUP_TARGET_KEY, value);
}

export function getPopupTarget(): Box<Marker | string> | undefined {
  return getContext(POPUP_TARGET_KEY);
}

export function setCluster(value: Box<ClusterOptions | undefined>) {
  setContext(CLUSTER_KEY, value);
}

export function getCluster(): Box<ClusterOptions | undefined> | undefined {
  return getContext(CLUSTER_KEY);
}

export function setZoomLimits(min: number | undefined, max: number | undefined) {
  const existing = getZoomLimits();
  return setContext(ZOOM_KEY, new ZoomRange(min, max, existing));
}

export function getZoomLimits(): { minzoom: number; maxzoom: number } {
  return getContext<ZoomRange>(ZOOM_KEY) || getMapContext();
}

export function getLayerEvent(): Box<LayerEvent | undefined> {
  return getContext(LAYER_EVENT_KEY);
}

export function setLayerEvent(value: Box<LayerEvent | undefined>) {
  setContext(LAYER_EVENT_KEY, value);
}

export function setLngLatContext(value: Box<LngLatLike | undefined>) {
  setContext(LNG_LAT_KEY, value);
}

export function getLngLatContext(): Box<LngLatLike | undefined> | undefined {
  return getContext(LNG_LAT_KEY);
}

export type MarkerMouseEvent = MarkerClickInfo & { layerType: 'marker'; type: string };

export interface DeckGlMouseEvent<DATA = unknown> extends PickingInfo<DATA> {
  layerType: 'deckgl';
  type: 'click' | 'mouseenter' | 'mouseleave' | 'mousemove';
}

export type LayerEvent = DeckGlMouseEvent<unknown> | MarkerMouseEvent;

const MAP_CONTEXT_KEY = Symbol.for('svelte-maplibre');
const POPUP_TARGET_KEY = Symbol.for('svelte-maplibre.popup-target');
const LAYER_KEY = Symbol.for('svelte-maplibre.layer');
const SOURCE_KEY = Symbol.for('svelte-maplibre.source');
const CLUSTER_KEY = Symbol.for('svelte-maplibre.cluster');
const ZOOM_KEY = Symbol.for('svelte-maplibre.zoom');
const LAYER_EVENT_KEY = Symbol.for('svelte-maplibre.layer-event');
const LNG_LAT_KEY = Symbol.for('svelte-maplibre.lng-lat');

export function getMapContext(): MapContext {
  return getContext(MAP_CONTEXT_KEY);
}

export function createMapContext(): MapContext {
  return setContext(MAP_CONTEXT_KEY, new MapContext());
}

export function updatedSourceContext() {
  const source = new Box<string | undefined>(undefined);
  const cluster = new Box<ClusterOptions | undefined>(undefined);
  setSource(source);
  setCluster(cluster);

  return {
    source,
    cluster,
  };
}

export function updatedLayerContext(interactive = true) {
  const layer = new Box<string | undefined>(undefined);
  const layerEvent = new Box<LayerEvent | undefined>(undefined);
  setLayer(layer);

  if (interactive) {
    setPopupTarget(layer);
    setLayerEvent(layerEvent);
  }

  return {
    layer,
    layerEvent,
  };
}

export function updatedDeckGlContext() {
  const layer = new Box<string | undefined>(undefined);
  const layerEvent = new Box<LayerEvent | undefined>(undefined);
  setLayer(layer);
  setLayerEvent(layerEvent);

  return {
    layer,
    layerEvent,
  };
}

export function updatedMarkerContext() {
  const marker = new Box<Marker | undefined>(undefined);
  const layerEvent = new Box<LayerEvent | undefined>(undefined);
  setPopupTarget(marker);
  setLayerEvent(layerEvent);

  return {
    marker,
    layerEvent,
  };
}

export function updatedZoomRangeContext(minzoom: number | undefined, maxzoom: number | undefined) {
  let currentZoom = getZoomLimits();

  minzoom ??= currentZoom.minzoom;
  maxzoom ??= currentZoom.maxzoom;

  setZoomLimits(minzoom, maxzoom);
  return {
    originalMinZoom: currentZoom.minzoom,
    originalMaxZoom: currentZoom.maxzoom,
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
