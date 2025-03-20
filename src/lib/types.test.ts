import { describe, it, expect } from 'vitest';
import { convertBoundsToUserFormat } from './types';
import { LngLat, LngLatBounds } from 'maplibre-gl';

describe('convertBoundsToUserFormat', () => {
  const sw = new LngLat(-10, -20);
  const ne = new LngLat(10, 20);
  const bounds = new LngLatBounds(sw, ne);

  it('returns flat array when input is flat array', () => {
    const result = convertBoundsToUserFormat(bounds, [-10, -20, 10, 20]);
    expect(result).toEqual([-10, -20, 10, 20]);
  });

  it('returns array of LngLat when input is array of LngLat', () => {
    const result = convertBoundsToUserFormat(bounds, [sw, ne]);
    expect(result).toEqual([sw, ne]);
  });

  it('returns nested array when input is nested array', () => {
    const result = convertBoundsToUserFormat(bounds, [
      [-10, -20],
      [10, 20],
    ]);
    expect(result).toEqual([
      [-10, -20],
      [10, 20],
    ]);
  });

  it('returns original bounds when input is undefined', () => {
    const result = convertBoundsToUserFormat(bounds, undefined);
    expect(result).toBe(bounds);
  });

  it('returns original bounds when input is LngLatBounds', () => {
    const result = convertBoundsToUserFormat(bounds, bounds);
    expect(result).toBe(bounds);
  });
});
