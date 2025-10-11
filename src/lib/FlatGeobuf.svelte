<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { GeoJSONSource, SourceSpecification } from 'maplibre-gl';
  import type { ExpressionSpecification } from 'maplibre-gl';
  import type { GeoJSON, Polygon, FeatureCollection } from 'geojson';
  import type { HeaderMeta } from 'flatgeobuf';
  import { onDestroy } from 'svelte';

  import type { ClusterOptions } from '$lib/types.js';
  import MapLibreGeoJSON from '$lib/GeoJSON.svelte';
  import { addSource, removeSource } from '$lib/source.js';
  import { getMapContext, getId, updatedSourceContext } from '$lib/context.svelte.js';
  import { flatgeobufToGeoJson, filterGeomsCentroidsWithin } from '$lib/flatgeobuf.js';

  type bboxType = [number, number, number, number];
  interface Props {
    id?: string;
    url: string;
    extent?: bboxType | Polygon | null;
    extractGeomCols?: boolean;
    metadataFunc?: (headerMetadata: HeaderMeta) => void;
    generateId?: boolean;
    promoteId?: string | undefined;
    filter?: ExpressionSpecification | undefined;
    lineMetrics?: boolean | undefined;
    cluster?: ClusterOptions | undefined;
    maxzoom?: number | undefined;
    attribution?: string | undefined;
    buffer?: number | undefined;
    tolerance?: number | undefined;
    children?: Snippet;
  }

  let {
    // Props for the flatgeobuf
    id = getId('flatgeobuf'),
    url,
    extent,
    extractGeomCols = false,
    metadataFunc,
    // Props to pass on to GeoJSON component
    generateId = false,
    promoteId = undefined,
    filter = undefined,
    lineMetrics = undefined,
    cluster = undefined,
    maxzoom = undefined,
    attribution = undefined,
    buffer = undefined,
    tolerance = undefined,
    children,
  }: Props = $props();

  const { map } = getMapContext();
  const { source: sourceBox } = updatedSourceContext();
  
  let sourceObj: GeoJSONSource | undefined = $state();
  let first = $state(true);
  let geojsonData: GeoJSON = $state({ type: 'FeatureCollection', features: [] });

  // Set the source ID in the context
  $effect(() => {
    sourceBox.value = id;
  });

  // Deserialise flatgeobuf to GeoJSON, reactive to bbox/extent changes
  async function updateGeoJSONData() {
    const featcol: FeatureCollection | null = await flatgeobufToGeoJson(
      url,
      extent,
      metadataFunc,
      extractGeomCols
    );

    // If there is no data, set to an empty FeatureCollection to avoid
    // re-adding layer if the bbox extent is updated
    if (!featcol) {
      geojsonData = {
        type: 'FeatureCollection',
        features: [],
      };
    } else if (extent && 'type' in extent && extent.type === 'Polygon') {
      geojsonData = filterGeomsCentroidsWithin(featcol, extent);
    } else {
      geojsonData = featcol;
    }

    addSourceToMap();
  }

  $effect(() => {
    updateGeoJSONData();
  });

  function addSourceToMap() {
    if (!map) return;

    const initialData: SourceSpecification = {
      type: 'geojson',
      data: geojsonData,
      promoteId,
    };

    addSource(
      map,
      id,
      initialData,
      (sourceId) => sourceId === id,
      () => {
        sourceObj = map?.getSource(id) as GeoJSONSource;
        first = true;
      }
    );
  }

  // Update data only if source already exists
  $effect(() => {
    if (sourceObj && geojsonData) {
      if (first) {
        first = false;
      } else {
        sourceObj.setData(geojsonData);
      }
    }
  });

  onDestroy(() => {
    if (sourceObj && map) {
      removeSource(map, id, sourceObj);
      sourceBox.value = undefined;
      sourceObj = undefined;
    }
  });
</script>

<MapLibreGeoJSON
  {id}
  data={geojsonData}
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
</MapLibreGeoJSON>
