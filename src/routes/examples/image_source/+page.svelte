<script lang="ts">
  import code from './+page.svelte?raw';
  import CodeSample from '$site/CodeSample.svelte';
  import MapLibre from '$lib/MapLibre.svelte';
  import { mapClasses } from '../styles';
  import ImageSource from '$lib/ImageSource.svelte';
  import RasterLayer from '$lib/RasterLayer.svelte';
  import Marker from '$lib/Marker.svelte';
  import quakeImageUrl from '$site/earthquake.png';

  let topLeft = { lng: -49.0, lat: 1.9 };
  let bottomRight = { lng: -73.6, lat: -17.9 };
  let opacity = 80;
</script>

<div class="mx-auto mb-2 flex flex-col items-start gap-1">
  <label>
    Opacity:
    <input type="range" bind:value={opacity} min={0} max={100} />
  </label>
</div>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class={mapClasses}
  standardControls
>
  <ImageSource
    url={quakeImageUrl}
    coordinates={[
      [topLeft.lng, topLeft.lat],
      [bottomRight.lng, topLeft.lat],
      [bottomRight.lng, bottomRight.lat],
      [topLeft.lng, bottomRight.lat],
    ]}
  >
    <RasterLayer
      paint={{
        'raster-fade-duration': 0,
        'raster-opacity': opacity / 100.0,
      }}
    />
  </ImageSource>
  <Marker bind:lngLat={topLeft} draggable>
    <span class="dot" />
  </Marker>
  <Marker bind:lngLat={bottomRight} draggable>
    <span class="dot" />
  </Marker>
</MapLibre>

<CodeSample {code} />

<style>
  .dot {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: inline-block;
    background-color: blue;
  }
</style>
