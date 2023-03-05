<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import GeoJSON from '$lib/GeoJSON.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';
  import { mapClasses } from '../styles';
  import CircleLayer from '$lib/CircleLayer.svelte';
  import SymbolLayer from '$lib/SymbolLayer.svelte';
  import { hoverStateFilter } from '$lib/filters';
  import Popup from '$lib/Popup.svelte';
  import ClusterPopup from '../ClusterPopup.svelte';
  import clusterPopupCode from '../ClusterPopup.svelte?raw';

  const source = 'https://maplibre.org/maplibre-gl-js-docs/assets/earthquakes.geojson';

  let clickedFeature: Record<string, any> | null = null;

  let openOn: 'click' | 'hover' = 'hover';
</script>

<p>
  Data and layer configuration derived from <a
    href="https://maplibre.org/maplibre-gl-js-docs/example/cluster/">MapLibre cluster Example.</a
  >
</p>

<fieldset class="border border-gray-300 self-start px-2 flex gap-x-4 mb-2">
  <legend>Show popup on</legend>
  <label><input type="radio" bind:group={openOn} value="hover" />Hover</label>
  <label><input type="radio" bind:group={openOn} value="click" />Click</label>
</fieldset>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class={mapClasses}
  standardControls
>
  <GeoJSON
    id="earthquakes"
    data={source}
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
        'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
        'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
        'circle-stroke-color': '#f00',
        'circle-stroke-width': 1,
        'circle-stroke-opacity': hoverStateFilter(0, 1),
      }}
      on:click={(e) => (clickedFeature = e.detail.features?.[0]?.properties)}
    >
      <Popup {openOn} closeOnClickInside let:features>
        <ClusterPopup feature={features?.[0]} />
      </Popup>
    </CircleLayer>

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

    <CircleLayer
      applyToClusters={false}
      hoverCursor="pointer"
      paint={{
        'circle-color': '#11b4da',
        'circle-radius': 4,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff',
      }}
      on:click={(e) => (clickedFeature = e.detail.features?.[0]?.properties)}
    >
      <Popup {openOn} closeOnClickInside let:features>
        {@const props = features?.[0]?.properties}
        <p>
          Date: <span class="font-medium text-gray-800"
            >{new Date(props.time).toLocaleDateString()}</span
          >
        </p>
        <p>Magnitude: <span class="font-medium text-gray-800">{props.mag}</span></p>
        <p>
          Tsunami: <span class="font-medium text-gray-800">{props.tsunami ? 'Yes' : 'No'}</span>
        </p>
      </Popup>
    </CircleLayer>
  </GeoJSON>
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

<CodeSample {code} endBoundary="<CodeSample" omitEndBoundary />
<CodeSample
  code={clusterPopupCode}
  filename="ClusterPopup.svelte"
  startBoundary=""
  endBoundary=""
/>
