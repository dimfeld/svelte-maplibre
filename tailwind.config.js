import { join } from 'path';
import { fileURLToPath } from 'url';
import { skeleton } from '@skeletonlabs/tw-plugin';

const skeletonUrl = fileURLToPath(import.meta.resolve('@skeletonlabs/skeleton'));
console.log(skeletonUrl);

const config = {
  content: ['./src/**/*.{html,js,svelte,ts}', join(skeletonUrl, '../**/*.{html,js,svelte,ts}')],

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
