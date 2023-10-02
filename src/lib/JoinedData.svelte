<script lang="ts">
  import { updatedLayerContext } from './';
  export let data: Array<Record<string, string | number | undefined>>;
  export let idCol: string;
  export let sourceLayer: string;

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
        $map.setFeatureState(featureSelector, { hover: oldState['hover'], ...row });
      }
    }

    for (const id of lastSeenIds) {
      const featureSelector = { id, source: $source, sourceLayer };
      $map.setFeatureState(featureSelector, {});
    }

    lastSeenIds = seenIds;
  }
</script>
