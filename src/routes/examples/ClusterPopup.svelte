<script lang="ts">
  import { mapContext } from '$lib/context.js';
  import type { Feature } from 'geojson';

  const { map, source } = mapContext();

  interface Props {
    feature: Feature | undefined;
  }

  let { feature }: Props = $props();

  let innerFeatures: Feature[] = $state([]);
  $effect(() => {
    if ($map && $source && feature) {
      $map
        ?.getSource($source)
        ?.getClusterLeaves(feature.properties.cluster_id, 10000, 0)
        .then((features) => {
          features.sort((a, b) => {
            return b.properties.time - a.properties.time;
          });
          innerFeatures = features;
        });
    }
  });
</script>

<p>Most recent quakes</p>
{#each innerFeatures.slice(0, 10) as feat}
  <div class="text-sm">
    {new Date(feat.properties.time).toLocaleDateString()} - {feat.properties.mag}
  </div>
{/each}
