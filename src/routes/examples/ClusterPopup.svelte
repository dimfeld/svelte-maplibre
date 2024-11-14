<script lang="ts">
  import { mapContext } from '$lib/context.svelte.js';
  import type { Feature } from 'geojson';

  const { map, source } = mapContext();

  interface Props {
    feature: Feature | undefined;
  }

  let { feature }: Props = $props();

  let innerFeaturesPromise = $derived.by(async () => {
    if (!map || !source.value || !feature) {
      return [];
    }

    const features = await map
      .getSource(source.value)
      .getClusterLeaves(feature.properties.cluster_id, 10000, 0);

    features.sort((a, b) => {
      return b.properties.time - a.properties.time;
    });

    return features;
  });

  // Use this instead of an await template tag to avoid flickering
  let innerFeatures: Feature[] = $state([]);
  $effect(() => innerFeaturesPromise.then((f) => (innerFeatures = f)));
</script>

<p>Most recent quakes</p>
{#each innerFeatures.slice(0, 10) as feat}
  <div class="text-sm">
    {new Date(feat.properties.time).toLocaleDateString()} - {feat.properties.mag}
  </div>
{/each}
