import { geojson as fgbGeojson } from 'flatgeobuf';
import type { Rect, HeaderMeta } from 'flatgeobuf';
import type {
  FeatureCollection,
  Feature,
  Polygon,
  Geometry,
  GeoJsonProperties,
  Position,
} from 'geojson';

type bboxType = [number, number, number, number];

/**
 * Type guard to check if extent is a Polygon.
 */
function isPolygon(extent: bboxType | Polygon): extent is Polygon {
  return (extent as Polygon).type === 'Polygon' && Array.isArray((extent as Polygon).coordinates);
}

/**
 * Converts a bounding box array or GeoJSON Polygon to a Rect format required by FlatGeobuf.
 *
 * @param {bboxType | Polygon} extent - The extent to convert, either as a bounding box array
 *        [minX, minY, maxX, maxY] or a GeoJSON Polygon object.
 *
 * @returns {Rect} - An object with minX, minY, maxX, maxY representing the bounding box.
 * @throws {Error} - Throws an error if the extent is not a valid bbox array or Polygon.
 */
function extentToFgbRect(extent: bboxType | Polygon): Rect {
  // Check if extent is a bounding box array [minX, minY, maxX, maxY]
  if (
    Array.isArray(extent) &&
    extent.length === 4 &&
    extent.every((coord) => typeof coord === 'number')
  ) {
    return {
      minX: extent[0],
      minY: extent[1],
      maxX: extent[2],
      maxY: extent[3],
    };
  }
  // Check if extent is a Polygon and calculate Rect
  else if (isPolygon(extent)) {
    const [firstRing] = extent.coordinates;
    const xCoords = firstRing.map((coord: Position) => coord[0]);
    const yCoords = firstRing.map((coord: Position) => coord[1]);

    return {
      minX: Math.min(...xCoords),
      minY: Math.min(...yCoords),
      maxX: Math.max(...xCoords),
      maxY: Math.max(...yCoords),
    };
  } else {
    throw new Error(
      'The extent parameter must be a bbox array [minX, minY, maxX, maxY] or a Polygon GeoJSON object.'
    );
  }
}

/**
 * Extracts the first geometry from GeometryCollections.
 * Useful when each geometry is wrapped in a GeometryCollection,
 * such as with using ST_ForceCollection on PostGIS output.
 *
 * @param {Feature} feature - The feature to process.
 *
 * @returns {Feature} - The feature with a single geometry instead of a GeometryCollection.
 */
function stripGeometryCollection(feature: Feature): Feature {
  // Skip if not a GeometryCollection
  if (feature.geometry.type !== 'GeometryCollection') {
    return feature;
  }

  return {
    ...feature,
    geometry: feature.geometry.geometries[0],
  };
}

/**
 * Calculates the centroid of a geometry.
 * Supports Point, LineString, and Polygon geometries.
 *
 * @param {Geometry} geom - The geometry to calculate the centroid for.
 * @returns {[number, number] | null} - The centroid coordinates as [x, y], or null if unsupported geometry type.
 */
function calculateCentroid(geom: Geometry): [number, number] | null {
  switch (geom.type) {
    case 'Point':
      return geom.coordinates as [number, number];
    case 'LineString': {
      const coords = geom.coordinates as [number, number][];
      const [sumX, sumY] = coords.reduce(([accX, accY], [x, y]) => [accX + x, accY + y], [0, 0]);
      return [sumX / coords.length, sumY / coords.length];
    }
    case 'Polygon': {
      const coords = geom.coordinates[0] as [number, number][];
      const [sumX, sumY] = coords.reduce(([accX, accY], [x, y]) => [accX + x, accY + y], [0, 0]);
      return [sumX / coords.length, sumY / coords.length];
    }
    default:
      return null;
  }
}

/**
 * Checks if a point is within a polygon using the ray-casting algorithm.
 *
 * @param {number[]} point - The [x, y] coordinates of the point to test.
 * @param {number[][]} polygon - The coordinates of the polygon.
 * @returns {boolean} - True if the point is within the polygon, otherwise false.
 */
function pointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Checks if a geometry's centroid is within a bounding Polygon.
 *
 * @param {Geometry} geom - The geometry to test.
 * @param {Polygon} extent - The polygon extent to check within.
 * @returns {boolean} - True if the geometry's centroid is within the extent, otherwise false.
 */
function centroidWithin(geom: Geometry, extent: Polygon): boolean {
  const centroid = calculateCentroid(geom);
  if (!centroid) return false;

  return pointInPolygon(centroid, extent.coordinates[0] as [number, number][]);
}

/**
 * Filters a FeatureCollection for features where their centroids
 * fall within the provided Polygon boundary.
 *
 * @param {FeatureCollection<Geometry>} featcol - The FeatureCollection to filter.
 * @param {Polygon} extent - The polygon area to filter by.
 * @returns {FeatureCollection<Geometry>} - Filtered FeatureCollection.
 */
export function filterGeomsCentroidsWithin(
  featcol: FeatureCollection<Geometry>,
  extent: Polygon
): FeatureCollection<Geometry> {
  const filteredFeatures = featcol.features.filter((feature) =>
    centroidWithin(feature.geometry, extent)
  );

  return {
    type: 'FeatureCollection',
    features: filteredFeatures,
  };
}

/**
 * Deserializes FlatGeobuf data to a GeoJSON object, optionally filtering by an extent.
 * If extent is null, returns null. If extent is undefined, fetches all data.
 *
 * @param {string} url - The URL of the FlatGeobuf file.
 * @param {bboxType | Polygon | null | undefined} extent - Optional extent to filter geometries by.
 *        Will be converted to a bounding box Rect if provided.
 * @param {(headerMetadata: HeaderMeta) => void | undefined} metadataFunc - Callback for processing header metadata.
 * @param {boolean} [extractGeomCols=true] - Whether to extract the first geometry from GeometryCollections.
 *
 * @returns {Promise<FeatureCollection<Geometry, GeoJsonProperties> | null>} - A Promise resolving to a GeoJSON object
 *          filtered by the extent or null if extent is null.
 */
export async function flatgeobufToGeoJson(
  url: string,
  extent: bboxType | Polygon | null | undefined,
  metadataFunc: ((headerMetadata: HeaderMeta) => void) | undefined,
  extractGeomCols: boolean = true
): Promise<FeatureCollection<Geometry, GeoJsonProperties> | null> {
  // Return null if extent is explicitly set to null, meaning no data should be fetched
  // For example the user only wants data to display on clicking an area
  if (extent === null) {
    return null;
  }

  let bbox: Rect | undefined;
  if (extent !== undefined) {
    bbox = extentToFgbRect(extent);
  }
  let geojsonData: FeatureCollection<Geometry, GeoJsonProperties> = {
    type: 'FeatureCollection',
    features: [],
  };

  if (!bbox) {
    // Set a bbox for the entire globe, else 'n3 is undefined' error
    bbox = { minX: -180, minY: -90, maxX: 180, maxY: 90 };
  }
  const iterable = fgbGeojson.deserialize(url, bbox, metadataFunc);
  let index = 0;

  for await (let feature of iterable) {
    if (extractGeomCols) {
      feature = stripGeometryCollection(feature);
    }

    geojsonData.features.push({
      id: feature.properties?.id ?? index,
      ...feature,
    });

    index += 1;
  }

  return geojsonData;
}
