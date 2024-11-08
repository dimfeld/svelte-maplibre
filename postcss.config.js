import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import tailwindConfig from './tailwind.config.js';

const config = {
  plugins: [
    //Some plugins, like tailwindcss/nesting, need to run before Tailwind,
    tailwindcss({
      config: tailwindConfig,
    }),
    //But others, like autoprefixer, need to run after,
    autoprefixer,
  ],
};

export default config;
