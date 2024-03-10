import { type Page } from '@playwright/test';

export function getMapContainer(page: Page) {
  return page.getByTestId('map-container');
}

export function getMap(page: Page) {
  return page.getByTestId('map');
}

export function getMapCanvas(page: Page) {
  return page.getByTestId('map-canvas');
}
