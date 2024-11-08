import { join } from 'path';
import { fileURLToPath } from 'url';
import { skeleton } from '@skeletonlabs/tw-plugin';

const config = {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    join(
      fileURLToPath(import.meta.resolve('@skeletonlabs/skeleton')),
      '../**/*.{html,js,svelte,ts}'
    ),
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
