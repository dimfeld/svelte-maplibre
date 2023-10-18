<script lang="ts">
  import { updatedLayerContext } from './context';
  export let data: Array<Record<string, string | number | undefined>>;
  export let idCol: string;
  export let sourceLayer: string | undefined = undefined;

  let lastSeenIds: Set<string | number> = new Set();

  const { map, source } = updatedLayerContext();
  $: if (data && $map && $source) {
    let seenIds: Set<string | number> = new Set();
    for (const row of data) {
      const id = row[idCol];

      if (!id) continue;

      lastSeenIds.delete(id);
      seenIds.add(id);

      const featureSelector = { id, source: $source, sourceLayer };
      const oldState = $map.getFeatureState(featureSelector);

      let needsUpdate = false;

      // Avoid updates for features which are the same
      for (const property of Object.keys(row)) {
        if (oldState[property] !== row[property]) {
          needsUpdate = true;
          break;
        }
      }

      if (needsUpdate) {
        $map.setFeatureState(featureSelector, row);
      }
    }

    for (const removeId of lastSeenIds) {
      const featureSelector = { id: removeId, source: $source, sourceLayer };

      // MapLibre manages each key in the feature state independently, and we don't want to
      // clear state set from elsewhere such as hover state, so we need to clear each key explicitly.
      const oldState = $map.getFeatureState(featureSelector);
      for (const property of Object.keys(oldState)) {
        $map.removeFeatureState(featureSelector, property);
      }
    }

    lastSeenIds = seenIds;
  }
</script>
