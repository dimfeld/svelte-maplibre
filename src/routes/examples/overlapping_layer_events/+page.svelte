<script lang="ts">
  import MapLibre from '$lib/MapLibre.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';
  import GeoJson from '$lib/GeoJSON.svelte';
  import CircleLayer from '$lib/CircleLayer.svelte';
  import { hoverStateFilter } from '$lib/filters';
  import Popup from '$lib/Popup.svelte';

  type PointFeature = GeoJSON.Feature<GeoJSON.Point, { radius: number; color: string }>;

  function randomCircle(color: string): PointFeature {
    const lng = Math.random() * 360 - 180;
    const lat = Math.random() * 180 - 90;
    const radius = Math.random() * 50;

    return {
      type: 'Feature',
      properties: {
        radius,
        color,
      },
      geometry: {
        type: 'Point',
        coordinates: [lng, lat],
      },
    };
  }

  const layer1 = Array.from({ length: 20 }, () => randomCircle('red'));
  const layer2 = Array.from({ length: 20 }, () => randomCircle('green'));
  const layer3 = Array.from({ length: 20 }, () => randomCircle('blue'));

  const layers = [
    { data: layer1, color: 'red', hoverCursor: 'help' },
    { data: layer2, color: 'green', hoverCursor: '' },
    { data: layer3, color: 'blue', hoverCursor: 'not-allowed' },
  ];

  const lastEvent: (GeoJSON.Feature<GeoJSON.Point> | undefined)[] = $state([]);

  function labelFeature(f: GeoJSON.Feature<GeoJSON.Point> | undefined) {
    if (!f) {
      return 'None';
    }

    return f.geometry.coordinates.map((c) => c.toFixed(4)).join(' ,');
  }

  let eventsIfTopMost = $state(true);
  let openIfTopMost = $state(true);
  let openOn: 'click' | 'dblclick' | 'contextmenu' | 'hover' = $state('hover');
  let allowOn: 'all' | 'red' | 'green' | 'blue' = $state('all');
</script>

<div class="mx-auto mb-2 flex flex-col items-start gap-1">
  <label>
    <input type="checkbox" bind:checked={eventsIfTopMost} />
    When layers overlap, only fire events for top-most layer
  </label>

  <label>
    <input type="checkbox" bind:checked={openIfTopMost} />
    When layers overlap, only activate the popup for top-most layer
  </label>

  <fieldset class="flex gap-x-4">
    <legend>Show popup on</legend>
    <label><input type="radio" bind:group={openOn} value="hover" /> Hover</label>
    <label><input type="radio" bind:group={openOn} value="click" /> Click</label>
    <label><input type="radio" bind:group={openOn} value="dblclick" /> Double Click</label>
    <label
      ><input type="radio" bind:group={openOn} value="contextmenu" /> Context Menu (right-click)</label
    >
  </fieldset>

  <fieldset class="flex gap-4">
    <legend>Allow popup on</legend>
    <label><input type="radio" bind:group={allowOn} value="all" /> All Colors</label>
    <label><input type="radio" bind:group={allowOn} value="red" /> Only Red</label>
    <label><input type="radio" bind:group={allowOn} value="green" /> Only Green</label>
    <label><input type="radio" bind:group={allowOn} value="blue" /> Only Blue</label>
  </fieldset>

  <div class="grid grid-cols-[auto_1fr] gap-x-2">
    {#each layers as layer, i}
      <span class="flex-none">Last Event for {layer.color} layer: </span>
      <span class="w-64">{labelFeature(lastEvent[i])}</span>
    {/each}
  </div>
</div>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class="relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full"
  standardControls
  zoomOnDoubleClick={openOn !== 'dblclick'}
>
  {#each layers as { data, color, hoverCursor }, i}
    <GeoJson id="layer{i + 1}" data={{ type: 'FeatureCollection', features: data }} generateId>
      <CircleLayer
        {eventsIfTopMost}
        manageHoverState
        {hoverCursor}
        paint={{
          'circle-color': color,
          'circle-radius': ['get', 'radius'],
          'circle-opacity': hoverStateFilter(1.0, 0.5),
        }}
        onclick={(e) => {
          lastEvent[i] = e.features?.[0] as PointFeature;
        }}
        onmouseleave={(e) => {
          lastEvent[i] = undefined;
        }}
        onmousemove={(e) => {
          lastEvent[i] = e.features?.[0] as PointFeature;
        }}
      >
        <Popup
          {openOn}
          {openIfTopMost}
          canOpen={(features) => allowOn === 'all' || features?.[0]?.properties?.color === allowOn}
        >
          {#snippet children({ features })}
            <div style:background={color} style:color="white">
              <p>{features?.length} features from {color} layer</p>
              {#if color == 'red'}
                <p>extra padding for lowest red layer</p>
                <p>extra padding for lowest red layer</p>
              {/if}
              {#if color == 'green'}
                <p>extra padding for middle green layer</p>
              {/if}
            </div>
          {/snippet}
        </Popup>
      </CircleLayer>
    </GeoJson>
  {/each}
</MapLibre>

<CodeSample {code} />
