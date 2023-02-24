#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

for (let key in packageJson.devDependencies) {
  if (!key.startsWith('@types/') || key.startsWith('@types/d3')) {
    delete packageJson.devDependencies[key];
  }
}
writeFileSync('./dist/package.json', JSON.stringify(packageJson, null, 2));
