import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import { apiDocs } from './src/site/api-docs/vite-plugin';

export default defineConfig({
  plugins: [tailwindcss(), apiDocs(), sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
});
