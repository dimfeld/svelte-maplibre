<script lang="ts">
  import { getSource, getMapContext } from './context.svelte.js';
  interface Props {
    data: Array<Record<string, string | number | undefined>>;
    idCol: string;
    sourceLayer?: string | undefined;
  }

  let { data, idCol, sourceLayer = undefined }: Props = $props();

  let lastSeenIds: Set<string | number> = new Set();

  const { map } = $derived(getMapContext());
  const source = getSource();
  $effect(() => {
    if (data && map && source?.value) {
      let seenIds: Set<string | number> = new Set();
      for (const row of data) {
        const id = row[idCol];

        if (!id) continue;

        lastSeenIds.delete(id);
        seenIds.add(id);

        const featureSelector = { id, source: source.value, sourceLayer };
        const oldState = map.getFeatureState(featureSelector);

        let needsUpdate = false;

        // Avoid updates for features which are the same
        for (const property of Object.keys(row)) {
          if (oldState[property] !== row[property]) {
            needsUpdate = true;
            break;
          }
        }

        if (needsUpdate) {
          map.setFeatureState(featureSelector, row);
        }
      }

      for (const removeId of lastSeenIds) {
        const featureSelector = { id: removeId, source: source.value, sourceLayer };

        // MapLibre manages each key in the feature state independently, and we don't want to
        // clear state set from elsewhere such as hover state, so we need to clear each key explicitly.
        const oldState = map.getFeatureState(featureSelector);
        for (const property of Object.keys(oldState)) {
          map.removeFeatureState(featureSelector, property);
        }
      }

      lastSeenIds = seenIds;
    }
  });
</script>
