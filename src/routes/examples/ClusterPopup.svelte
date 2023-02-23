<script lang="ts">
  import { mapContext } from '$lib/context.js';
  import type { Feature } from 'geojson';

  const { map, source } = mapContext();

  export let feature: Feature | undefined;

  let innerFeatures: Feature[] = [];
  $: if ($map && $source && feature) {
    $map
      ?.getSource($source)
      ?.getClusterLeaves(feature.properties.cluster_id, 10000, 0, (err, features) => {
        innerFeatures = features;
      });
  }

  $: innerFeatures.sort((a, b) => {
    return b.properties.time - a.properties.time;
  });
</script>

<p>Most recent quakes</p>
{#each innerFeatures.slice(0, 10) as feat}
  <div class="text-sm">
    {new Date(feat.properties.time).toLocaleDateString()} - {feat.properties.mag}
  </div>
{/each}
