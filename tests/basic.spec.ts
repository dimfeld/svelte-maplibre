import { test, expect } from '@playwright/test';
import { getMapContainer, getMapCanvas } from './util';

test.describe('Basic', async () => {
  test('render basic map', async ({ page }) => {
    await page.goto('/examples/basic');
    const mapContainer = getMapContainer(page);
    await expect(mapContainer).toBeVisible();
    const mapCanvas = getMapCanvas(page);
    await expect(mapCanvas).toBeVisible();
  });
});
