<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { GeoJSONSource, SourceSpecification } from 'maplibre-gl';
  import type { GeoJSON, Polygon, FeatureCollection } from 'geojson';
  import type { HeaderMeta } from 'flatgeobuf';

  import { onDestroy } from 'svelte';

  import MapLibreGeoJSON from './GeoJSON.svelte';
  import { addSource, removeSource } from './source';
  import { getId, updatedSourceContext } from './context';
  import { flatgeobufToGeoJson, filterGeomsCentroidsWithin } from './flatgeobuf';

  type bboxType = [number, number, number, number];
  interface Props {
    id?: string;
    url: string;
    extent?: bboxType | Polygon | null;
    extractGeomCols: boolean;
    metadataFunc?: (headerMetadata: HeaderMeta) => void;
    promoteId?: string;
    maxzoom: number | undefined;
    attribution: string | undefined;
    buffer: number | undefined;
    tolerance: number | undefined;
    children?: Snippet;
  }

  let {
    // Props for the flatgeobuf
    id = getId('flatgeobuf'),
    url,
    extent,
    extractGeomCols = false,
    promoteId = undefined,
    metadataFunc,
    // Props to pass on to GeoJSON component
    maxzoom,
    attribution,
    buffer,
    tolerance,
    children,
  }: Props = $props();

  const { map, self: sourceId } = updatedSourceContext();
  let sourceObj: GeoJSONSource | undefined = $state();
  let first = $state(true);
  let geojsonData: GeoJSON = $state({ type: 'FeatureCollection', features: [] });

  // Set currentSourceId as reactive property once determined from context
  let currentSourceId: string | undefined = $state();
  $effect(() => {
    currentSourceId = $sourceId;
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

    currentSourceId = id;
    addSourceToMap();
  }

  $effect(() => {
    updateGeoJSONData();
  });

  function addSourceToMap() {
    if (!$map) return;

    const initialData: SourceSpecification = {
      type: 'geojson',
      data: geojsonData,
      promoteId,
    };

    // Use the currentSourceId in addSource
    addSource(
      $map,
      currentSourceId!,
      initialData,
      (sourceId) => sourceId === currentSourceId,
      () => {
        sourceObj = $map?.getSource(currentSourceId!) as GeoJSONSource;
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
    if (sourceObj && $map) {
      removeSource($map, currentSourceId!, sourceObj);
      currentSourceId = undefined;
      sourceObj = undefined;
    }
  });
</script>

<MapLibreGeoJSON
  id={currentSourceId}
  data={geojsonData}
  {promoteId}
  {maxzoom}
  {attribution}
  {buffer}
  {tolerance}
>
  {@render children?.()}
</MapLibreGeoJSON>
