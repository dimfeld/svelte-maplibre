<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { FeatureCollection, Feature } from 'geojson';
  import type { Topology } from 'topojson-specification';
  import type { ExpressionSpecification } from 'maplibre-gl';
  import type { ClusterOptions } from './types.js';
  import GeoJSON from './GeoJSON.svelte';

  interface Props {
    /** A TopoJSON Topology object. Mutually exclusive with `url`. */
    data?: Topology;
    /** URL to a TopoJSON file. Fetched and converted automatically. */
    url?: string;
    /** Which named object to extract. Defaults to the first object key. */
    objectName?: string;
    /** Source ID. Auto-generated if omitted. */
    id?: string;
    /** Generate a unique id for each feature. This will overwrite existing IDs. */
    generateId?: boolean;
    /** Use this property on the feature as the ID. This will overwrite existing IDs. */
    promoteId?: string | undefined;
    filter?: ExpressionSpecification | undefined;
    /** True to calculate line lengths. Required to use a line layer that
     * uses the "line-gradient" paint property. */
    lineMetrics?: boolean | undefined;
    cluster?: ClusterOptions | undefined;
    maxzoom?: number | undefined;
    attribution?: string | undefined;
    buffer?: number | undefined;
    tolerance?: number | undefined;
    /** Called with the converted FeatureCollection when data is ready. */
    ondata?: (fc: FeatureCollection) => void;
    children?: Snippet;
  }

  let {
    data = undefined,
    url = undefined,
    objectName = undefined,
    id = undefined,
    generateId = false,
    promoteId = undefined,
    filter = undefined,
    lineMetrics = undefined,
    cluster = undefined,
    maxzoom = undefined,
    attribution = undefined,
    buffer = undefined,
    tolerance = undefined,
    ondata = undefined,
    children,
  }: Props = $props();

  let geojson: FeatureCollection | undefined = $state(undefined);

  /**
   * Convert a TopoJSON Topology to a GeoJSON FeatureCollection.
   * Uses topojson-client dynamically to keep it as an optional peer dependency.
   */
  async function convert(topo: Topology, name?: string): Promise<FeatureCollection> {
    const { feature } = await import('topojson-client');
    const key = name ?? Object.keys(topo.objects)[0];
    if (!key) throw new Error('TopoJSON topology has no objects');
    const result = feature(topo, key) as unknown as FeatureCollection | Feature;
    if ('features' in result) return result as FeatureCollection;
    return { type: 'FeatureCollection' as const, features: [result] };
  }

  // Convert from `data` prop
  $effect(() => {
    if (data) {
      convert(data, objectName).then((fc) => {
        geojson = fc;
        ondata?.(fc);
      });
    }
  });

  // Fetch + convert from `url` prop
  $effect(() => {
    if (!url) return;
    let cancelled = false;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`TopoJSON fetch failed: ${res.status} ${url}`);
        return res.json();
      })
      .then((topo: Topology) => convert(topo, objectName))
      .then((fc) => {
        if (cancelled) return;
        geojson = fc;
        ondata?.(fc);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('TopoJSON:', err);
      });

    return () => {
      cancelled = true;
    };
  });
</script>

{#if geojson}
  <GeoJSON
    data={geojson}
    {id}
    {generateId}
    {promoteId}
    {filter}
    {lineMetrics}
    {cluster}
    {maxzoom}
    {attribution}
    {buffer}
    {tolerance}
  >
    {@render children?.()}
  </GeoJSON>
{/if}
