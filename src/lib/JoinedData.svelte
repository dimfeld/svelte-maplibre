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

<!-- @component
Join a table of data to the features of a source with feature state. Put this component inside a source component, such as `VectorTileSource` or `GeoJSON`.

For each row in `data`, the component finds the feature whose ID is the value of the `idCol` column, and sets the values of the row as the feature state of that feature. Use `sourceLayer` with vector tile sources. You can then use `feature-state` expressions in layer paint properties to style the features.

When a row is removed from `data`, the component removes the feature state keys for that feature. It does not change other state on the feature, such as hover state. This component does not render anything.
-->
