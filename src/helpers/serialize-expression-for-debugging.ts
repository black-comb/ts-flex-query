import { Expression } from '../core';

/**
 * Serializes an expression to JSON for debugging purposes.
 * Uses the expression's constructor name to identify their type.
 * Therefore, this method is not useful for minified JS code with changed class names.
 */
export function serializeExpressionForDebugging(expression: Expression): string {
  let nextSymbolIndex = 1;
  const knownSymbols: Partial<Record<symbol, number>> = {};
  return JSON.stringify(expression, (_, value) => {
    if (typeof value === 'object' && value && value.constructor !== Object) {
      return {
        // eslint-disable-next-line @typescript-eslint/naming-convention -- By design.
        __type: value.constructor.name,
        ...value
      };
    }
    if (typeof value === 'symbol') {
      const index = knownSymbols[value] ?? nextSymbolIndex++;
      knownSymbols[value] = index;
      return `${index}: ${value.toString()}`;
    }
    return value;
  });
}
