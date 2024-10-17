<!-- A component to render a style selection prompt, including a thumbnail
preview of the style content.

Currently a thumbnail is render only for raster style types.
We should be able to handle:
  - RasterDEMSourceSpecification
  - RasterSourceSpecification
  - VectorSourceSpecification

To achieve this and make it more flexible, it would probably be best
to render a MapLibre minimap for each style, allowing the library
to handle the parsing of URLs and rendering. The zoom could be
set to the minZoom to display a thumbnail image.

E.g.
```
map = new Map({
  container: div,
  style: uri,
  attributionControl: false,
  interactive: false
});
``` -->

<script lang="ts">
  import { onDestroy } from 'svelte';
  import { mapContext } from './context';
  import Control from '$lib/Control.svelte';
  import ControlButton from '$lib/ControlButton.svelte';

  export let position: maplibregl.ControlPosition = 'top-right';
  export let expandDirection: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
  export let extraStyles: maplibregl.StyleSpecification[] = [];

  const { map } = mapContext();
  let allStyles: MapLibreStylePlusMetadata[] | [] = [];
  let selectedStyleUrl: string | undefined = undefined;
  let isClosed = true;

  $: if (extraStyles.length > 0) {
    fetchStyleInfo();
  } else {
    allStyles = [];
  }

  type MapLibreStylePlusMetadata = maplibregl.StyleSpecification & {
    metadata: {
      thumbnail?: string;
    };
  };

  /**
   * Extract the raster thumbnail root tile, or return an empty string.
   */
  function getRasterThumbnailUrl(style: maplibregl.StyleSpecification): string {
    const rasterSource = Object.values(style.sources).find((source) => source.type === 'raster') as
      | maplibregl.RasterSourceSpecification
      | undefined;

    if (!rasterSource || !rasterSource.tiles?.length) {
      const placeholderSvg = `
        data:image/svg+xml,<svg id="map_placeholder" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 105.93 122.88">
        <defs><style>.cls-1{fill-rule:evenodd;}</style></defs><title>map</title><path class="cls-1" 
        d="M56.92,73.14a1.62,1.62,0,0,1-1.86.06A65.25,65.25,0,0,1,38.92,58.8,51.29,51.29,0,0,1,28.06,35.37C26.77,27.38,28,19.7,32,13.45a27,27,
        0,0,1,6-6.66A29.23,29.23,0,0,1,56.36,0,26,26,0,0,1,73.82,7.12a26,26,0,0,1,4.66,5.68c4.27,7,5.19,16,3.31,25.12A55.29,55.29,0,0,1,56.92,
        73.14Zm-19,.74V101.7l30.15,13V78.87a65.17,65.17,0,0,0,6.45-5.63v41.18l25-12.59v-56l-9.61,3.7a61.61,61.61,0,0,0,2.38-7.81l9.3-3.59A3.22,
        3.22,0,0,1,105.7,40a3.18,3.18,0,0,1,.22,1.16v62.7a3.23,3.23,0,0,1-2,3L72.72,122.53a3.23,3.23,0,0,1-2.92,0l-35-15.17L4.68,122.53a3.22,
        3.22,0,0,1-4.33-1.42A3.28,3.28,0,0,1,0,119.66V53.24a3.23,3.23,0,0,1,2.32-3.1L18.7,43.82a58.63,58.63,0,0,0,2.16,6.07L6.46,
        55.44v59l25-12.59V67.09a76.28,76.28,0,0,0,6.46,6.79ZM55.15,14.21A13.72,13.72,0,1,1,41.43,27.93,13.72,13.72,0,0,1,55.15,14.21Z"/></svg>`;
      return placeholderSvg;
    }

    const firstTileUrl = rasterSource.tiles[0];
    const minzoom = rasterSource.minzoom || 0;

    return firstTileUrl.replace('{x}', '0').replace('{y}', '0').replace('{z}', minzoom.toString());
  }

  /**
   * Process the style to add metadata and return it.
   */
  function processStyle(style: maplibregl.StyleSpecification): MapLibreStylePlusMetadata {
    const thumbnailUrl = getRasterThumbnailUrl(style);
    return {
      ...style,
      metadata: {
        ...style.metadata,
        thumbnail: thumbnailUrl,
      },
    };
  }

  /**
   * Fetch styles and prepare them with thumbnails.
   */
  async function fetchStyleInfo() {
    const currentMapStyle = $map?.getStyle();
    if (currentMapStyle) {
      const processedStyle = processStyle(currentMapStyle);
      selectedStyleUrl = processedStyle?.metadata?.thumbnail || undefined;
      allStyles = [processedStyle];
    }

    const extraProcessedStyles = await Promise.all(
      extraStyles.map(async (style) => {
        if (typeof style === 'string') {
          const styleResponse = await fetch(style);
          const styleJson = await styleResponse.json();
          return processStyle(styleJson);
        } else {
          return processStyle(style);
        }
      })
    );

    allStyles = allStyles.concat(extraProcessedStyles);
  }

  function selectStyle(style: MapLibreStylePlusMetadata) {
    selectedStyleUrl = style.metadata.thumbnail;
    $map?.setStyle(style);
    isClosed = true;
  }

  onDestroy(() => {
    allStyles = [];
    selectedStyleUrl = undefined;
    isClosed = true;
  });
</script>

<Control {position}>
  <div
    tabindex="-1"
    role="button"
    class={`style-control ${expandDirection} ${isClosed ? 'closed' : 'open'}`}
    on:mouseenter={() => (isClosed = false)}
    on:mouseleave={() => (isClosed = true)}
  >
    {#each allStyles as style, _}
      <button
        class="style-selector {selectedStyleUrl === style.metadata.thumbnail ? 'active' : ''}"
        on:click={() => selectStyle(style)}
      >
        <ControlButton style="border-radius: 50%;">
          <img src={style.metadata.thumbnail} alt="Style Thumbnail" class="basemap" />
          <span class="tooltip {position.includes('top') ? 'tooltip-bottom' : 'tooltip-top'}">
            {style.name}
          </span>
        </ControlButton>
      </button>
    {/each}
  </div>
</Control>

<style>
  .style-control {
    display: flex;
    position: relative;
  }

  .style-control.right {
    flex-direction: row;
  }

  .style-control.left {
    flex-direction: row-reverse;
  }

  .style-control.bottom {
    flex-direction: column;
  }

  .style-control.top {
    flex-direction: column-reverse;
  }

  .style-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin: 0.625rem;
    border-radius: 50%;
    position: relative;
  }

  .style-selector .basemap {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    box-shadow: 0 0.0625rem 0.3125rem rgba(0, 0, 0, 0.65);
    border: 0.125rem solid #ccc;
  }

  .style-selector.active .basemap {
    border-color: orange;
    box-shadow: 0.125rem 0.125rem 0.25rem #000;
  }

  .style-selector:hover .basemap {
    box-shadow: 0.125rem 0.125rem 0.25rem #000;
  }

  .style-selector:hover .tooltip {
    opacity: 1;
  }

  .style-selector .tooltip {
    opacity: 0;
    transition: opacity 0.3s ease;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    background-color: white;
    border: 0.0625rem solid #ddd;
    box-shadow: 0.0625rem 0.0625rem 0.0625rem #ddd;
    border-radius: 0.25rem;
    padding: 0.25rem;
    z-index: 100;
    pointer-events: none;
  }

  .tooltip-top {
    bottom: 110%;
  }

  .tooltip-bottom {
    top: 110%;
  }

  .style-control.closed .style-selector:not(.active) {
    display: none;
  }

  .style-control.open .style-selector {
    display: flex;
  }
</style>
