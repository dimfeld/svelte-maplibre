import { PUBLIC_MAPTILER_KEY } from '$env/static/public';

export const hasMaptilerKey = PUBLIC_MAPTILER_KEY && PUBLIC_MAPTILER_KEY !== 'key';
export const streetsStyle = `https://api.maptiler.com/maps/streets-v2/style.json?key=${PUBLIC_MAPTILER_KEY}`;

export const mapClasses =
  'relative w-full aspect-[9/16] max-h-[70vh] sm:max-h-full sm:aspect-video';
