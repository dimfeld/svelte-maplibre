// Hand-written structure for the API docs. Everything else comes from the source code.

export const componentCategories: Record<string, string[]> = {
  Map: ['MapLibre', 'MapEvents', 'ZoomRange', 'Terrain'],
  Sources: [
    'GeoJSON',
    'TopoJSON',
    'VectorTileSource',
    'RasterTileSource',
    'RasterDEMTileSource',
    'ImageSource',
    'JoinedData',
  ],
  Layers: [
    'Layer',
    'BackgroundLayer',
    'CircleLayer',
    'FillLayer',
    'FillExtrusionLayer',
    'HeatmapLayer',
    'HillshadeLayer',
    'LineLayer',
    'RasterLayer',
    'SymbolLayer',
    'MarkerLayer',
    'DeckGlLayer',
  ],
  'Markers and Popups': ['Marker', 'DefaultMarker', 'Popup'],
  Controls: [
    'NavigationControl',
    'GeolocateControl',
    'FullscreenControl',
    'ScaleControl',
    'AttributionControl',
    'TerrainControl',
    'Control',
    'ControlGroup',
    'ControlButton',
  ],
};

export const OTHER_CATEGORY = 'Other';

/** The non-component modules exported from `src/lib/index.ts`, in display order. */
export const modules: { file: string; slug: string; title: string; description: string }[] = [
  {
    file: 'expressions.ts',
    slug: 'expressions',
    title: 'Expressions',
    description: 'Helpers that create MapLibre style expressions.',
  },
  {
    file: 'filters.ts',
    slug: 'filters',
    title: 'Filters',
    description: 'Helpers that create and combine MapLibre filter expressions.',
  },
  {
    file: 'source.ts',
    slug: 'source',
    title: 'Source Helpers',
    description:
      'Functions that add and remove map sources safely. These are useful when you write your own source components.',
  },
  {
    file: 'context.svelte.ts',
    slug: 'context',
    title: 'Context',
    description:
      'The Svelte context that the components use to communicate. Use these to write your own components that work with the map.',
  },
  {
    file: 'types.ts',
    slug: 'types',
    title: 'Types',
    description: 'TypeScript types used by the components, and types re-exported from MapLibre.',
  },
];
