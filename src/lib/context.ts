import type { Map } from 'maplibre-gl';
import { getContext, setContext } from 'svelte';
import { writable, type Readable, type Writable } from 'svelte/store';

export interface MapContext {
  map: Readable<Map | null>;
}

const MAP_CONTEXT_KEY = Symbol.for('svelte-maplibre');

export function mapContext(): MapContext {
  return getContext(MAP_CONTEXT_KEY);
}

export function createMapContext(): MapContext {
  return setContext(MAP_CONTEXT_KEY, {
    map: writable<Map | null>(null),
  });
}

/** Make sure inner components can't accidentally change their parent stores. */
function readableFromWritable<T>(writable: Readable<T>): Readable<T> {
  return {
    subscribe: writable.subscribe,
  };
}

export interface UpdatedContext extends MapContext {
  // TODO the right type for this...
  self: Writable<Map | null>;
}

/** Replace one or more elements of the map context with a new store. */
export function updateMapContext(...keys: (keyof MapContext)[]): UpdatedContext {
  let currentContext = mapContext();

  let newCtx = { ...currentContext };
  let newValue = writable<Map | null>(null);
  let passDown = readableFromWritable(newValue);
  for (const key of keys) {
    newCtx[key] = passDown;
  }

  setContext(MAP_CONTEXT_KEY, newCtx);

  return {
    ...currentContext,
    self: newValue,
  };
}
