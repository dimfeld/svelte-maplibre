<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import GeoJSON from '$lib/GeoJSON.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';
  import { mapClasses } from '../styles';
  import CircleLayer from '$lib/CircleLayer.svelte';
  import SymbolLayer from '$lib/SymbolLayer.svelte';
  import { hoverStateFilter } from '$lib/filters';

  import quakeImageUrl from '$site/earthquake.png';
  import tsunamiImageUrl from '$site/tsunami.png';
  import earthquakes from '$site/earthquakes.geojson?url';
  import type { GeoJsonProperties } from 'geojson';

  let clickedFeature: GeoJsonProperties | undefined = $state();
</script>

<p>
  Data from <a href="https://maplibre.org/maplibre-gl-js-docs/example/cluster/"
    >MapLibre cluster Example.</a
  >
</p>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class={mapClasses}
  standardControls
  images={[
    { id: 'quake', url: quakeImageUrl },
    { id: 'tsunami', url: tsunamiImageUrl },
  ]}
>
  {#snippet children({ allImagesLoaded })}
    <GeoJSON
      id="earthquakes"
      data={earthquakes}
      cluster={{
        radius: 500,
        maxZoom: 14,
        properties: {
          // Sum the `mag` property from all the points in each cluster.
          total_mag: ['+', ['get', 'mag']],
        },
      }}
    >
      <CircleLayer
        applyToClusters
        hoverCursor="pointer"
        paint={{
          // Use step expressions (https://maplibre.org/maplibre-gl-js-docs/style-spec/#expressions-step)
          // with three steps to implement three types of circles:
          //   * Blue, 20px circles when point count is less than 100
          //   * Yellow, 30px circles when point count is between 100 and 750
          //   * Pink, 40px circles when point count is greater than or equal to 750
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            100,
            '#f1f075',
            750,
            '#f28cb1',
          ],
          'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
          'circle-stroke-color': '#f00',
          'circle-stroke-width': 1,
          'circle-stroke-opacity': hoverStateFilter(0, 1),
        }}
        manageHoverState
        onclick={(e) => (clickedFeature = e.features?.[0]?.properties)}
      />

      <SymbolLayer
        applyToClusters
        layout={{
          'text-field': [
            'format',
            ['get', 'point_count_abbreviated'],
            {},
            '\n',
            {},
            [
              'number-format',
              ['/', ['get', 'total_mag'], ['get', 'point_count']],
              {
                'max-fraction-digits': 2,
              },
            ],
            { 'font-scale': 0.8 },
          ],
          'text-size': 12,
          'text-offset': [0, -0.1],
        }}
      />

      <SymbolLayer
        applyToClusters={false}
        hoverCursor="pointer"
        layout={{
          'icon-image': ['case', ['==', ['get', 'tsunami'], 0], 'quake', 'tsunami'],
          'icon-allow-overlap': true,
          'text-field': '{mag}',
          'text-offset': [0, -2],
          'text-size': 12,
        }}
        onclick={(e) => (clickedFeature = e.features?.[0]?.properties)}
      />
    </GeoJSON>
  {/snippet}
</MapLibre>

{#if clickedFeature}
  {#if clickedFeature.cluster}
    <p>
      Number of Earthquakes:
      <span class="font-bold text-gray-800">{clickedFeature['point_count']}</span>
    </p>
    <p>
      Average Magnitude:
      <span class="font-bold text-gray-800">
        {(clickedFeature.total_mag / clickedFeature.point_count).toFixed(2)}
      </span>
    </p>
  {:else}
    <p>Magnitude: <span class="font-bold text-gray-800">{clickedFeature.mag}</span></p>
  {/if}
{/if}

<!-- ENDEMBED -->

<p>
  Symbol images are embedded into the map and rendered via webGL. This makes them faster but less
  flexible. For more rendering flexibility such as using SVG, see the <a
    href="/examples/custom_marker">Custom Marker</a
  > example.
</p>

<CodeSample {code} endBoundary="<!-- ENDEMBED" omitEndBoundary />

<footer class="self-start">
  <p>
    <a
      class="text-sm"
      href="https://www.flaticon.com/free-icons/earthquake"
      title="earthquake icons">Earthquake icons created by Freepik - Flaticon</a
    >
  </p>
  <p>
    <a class="text-sm" href="https://www.flaticon.com/free-icons/tsunami" title="tsunami icons"
      >Tsunami icons created by surang - Flaticon</a
    >
  </p>
</footer>
