import type { Map, SourceSpecification } from 'maplibre-gl';
import { tick } from 'svelte';
import { get, type Readable } from 'svelte/store';

/**
 * Add a source to the map.
 *
 * @param map - The map instance
 * @param sourceId - The ID of the source to add
 * @param source - The source specification object
 * @param okToAdd - Callback to check if the source should still be added
 * @param cb - Callback when the source has been added
 *
 * This properly handles the case where an old source with the same ID is still being removed.
 */
export function addSource(
  map: Map,
  sourceId: string,
  source: SourceSpecification,
  okToAdd: (sourceId: string) => boolean,
  cb: () => void
) {
  // If there was an old source with the same ID, then remove it. This can happen when removing a source
  // and adding a new source in quick succession.
  let removed = false;
  if (map.getSource(sourceId)) {
    removed = true;
    map.removeSource(sourceId);
  }

  const doAddSource = () => {
    if (!okToAdd(sourceId)) {
      // in case the component was destroyed or the id changed while waiting to call this
      return;
    }

    map.addSource(sourceId, source);
    cb();
  };

  if (removed) {
    // Source removal happens quickly but asynchronously, and we have no way to really interlock on when it happens,
    // so just loop until it does.
    const waitForRemoval = () => {
      if (!sourceId) {
        return;
      }

      if (map.getSource(sourceId)) {
        // The source hasn't been removed yet, so keep waiting.
        setTimeout(waitForRemoval, 1);
      } else {
        doAddSource();
      }
    };

    waitForRemoval();
  } else {
    // If we don't have an existing source to remove (i.e. the normal case) then
    // just add the source right away.
    doAddSource();
  }
}

/**
 * A helper function that removes a source from the map after all of the layers inside it have
 * had a chance to remove themselves.
 *
 * @param {Readable<Map|null>} mapStore - The store containing the Map instance
 * @param {string} sourceId - The ID of the source to remove
 * @param {unknown} sourceObj - The source object that was originally added
 *
 * Waits one tick to ensure layers have a chance to be removed, then checks if the
 * source with the given ID is still the same object as was originally added.
 *
 * If so, it removes the source from the map. This avoids removing a source that was
 * already replaced by another source reusing the same ID.
 */
export function removeSource(mapStore: Readable<Map | null>, sourceId: string, sourceObj: unknown) {
  tick().then(() => {
    // Wait a tick so that the layers inside this source can all be removed.
    // But make sure that the source wasn't already replaced with another source with the same ID.
    let map = get(mapStore);
    if (!map) {
      // Catch when map is unloaded
      return;
    }

    let remainingSource = map.getSource(sourceId);
    if (remainingSource === sourceObj) {
      map.removeSource(sourceId);
    }
  });
}
