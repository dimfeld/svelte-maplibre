# svelte-maplibre

Svelte wrapper for the [maplibre](https://maplibre.org/projects/maplibre-gl-js/) mapping library.

This library is functional, but I'm still experimenting with extra features to make advanced functionality easier to use. It also needs proper documentation. In the meantime, the [demo site](https://svelte-maplibre.vercel.app) includes code for all the examples, and is a good place to start.

## Developing

You should create a `.env` file to configure the environment. See the `.env.example` file for the
necessary settings.

Currently the only environment variable is a MapTiler API key, required for the 3D Buildings example.
If you don't have one, you can set this to a blank value to use the other examples.
