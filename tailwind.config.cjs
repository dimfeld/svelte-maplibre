const { join } = require('path');
const { skeleton }  = require('@skeletonlabs/tw-plugin');

const config = {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}'),
  ],

  darkMode: 'class',
  theme: {
    extend: {},
  },

  plugins: [
    skeleton({
      themes: {
        preset: ['rocket'],
      },
    }),
  ],
};

export default config;
