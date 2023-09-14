<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./static/logos/svelte-maplibre-logo-color-for-dark.svg">
  <img alt="svelte-maplibre logo" height="60px" src="./static/logos/svelte-maplibre-logo-color-for-light.svg" />
</picture>

</p>
<p align="center">Svelte wrapper for the <a href="https://maplibre.org/projects/maplibre-gl-js/">maplibre</a> mapping library.
</p>

---

This library is functional, but I'm still experimenting with extra features to make advanced functionality easier to use. It also needs proper documentation. In the meantime, the [demo site](https://svelte-maplibre.vercel.app) includes code for all the examples, and is a good place to start.

[Changelog](./CHANGELOG.md)

## Installation

```
npm install svelte-maplibre
```

## Usage

```svelte
<script>
  import { MapLibre } from 'svelte-maplibre';
</script>

<MapLibre 
  center={[50,20]}
  zoom={7}
  class="map"
  standardControls
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />

<style>
  :global(.map) {
    height: 500px;
  }
</style>
```

## Developing

You should create a `.env` file to configure the environment. See the `.env.example` file for the
necessary settings.

Currently the only environment variable is a MapTiler API key, required for the 3D Buildings example.
If you don't have one, you can set this to a blank value to use the other examples.

## Credits

Logo created by [Bruce Wayyn](https://github.com/brucewayyn)
