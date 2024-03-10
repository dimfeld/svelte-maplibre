import { test, expect } from '@playwright/test';
import { getMap } from './util';

test.describe('Default Markers', async () => {
  test('render 6 markers', async ({ page }) => {
    await page.goto('/examples/marker');
    const map = getMap(page);
    const markers = await map.locator('div.maplibregl-marker');
    await expect(markers).toHaveCount(6);
  });
});
