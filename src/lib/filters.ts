import type { ExpressionSpecification } from 'maplibre-gl';

export function combineFilters(
  join: 'all' | 'any',
  ...filters: (ExpressionSpecification | null | undefined)[]
): ExpressionSpecification | undefined {
  let outputFilters: ['all' | 'any', ...ExpressionSpecification[]] = [join];

  for (let fil of filters) {
    if (!fil) {
      continue;
    } else if (Array.isArray(fil)) {
      if (fil[0] === join) {
        // Simplify the filter if this filter is already a join of the same type.
        outputFilters.push(...fil.slice(1));
      } else {
        outputFilters.push(fil);
      }
    } else {
      outputFilters.push(fil);
    }
  }

  if (outputFilters.length === 1) {
    return undefined;
  } else if (outputFilters.length === 2) {
    return outputFilters[1];
  }

  return outputFilters;
}

export function hoverStateFilter(
  defaultValue: string | number | boolean,
  hoverValue: string | number | boolean
): ExpressionSpecification {
  return ['case', ['boolean', ['feature-state', 'hover'], false], hoverValue, defaultValue];
}
