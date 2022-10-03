import { FunctionContainer } from '../types/function-container';
import { aggregation } from './aggregation';
import { boolean } from './boolean';
import { collections } from './collections';
import { comparison } from './comparison';
import { internal } from './internal';
import { mathematics } from './mathematics';
import { text } from './text';

export const publicFunctionContainers = {
  aggregation,
  boolean,
  collections,
  comparison,
  mathematics,
  text
} as const;

export const functionContainers = {
  ...publicFunctionContainers,
  internal
} as const;

export function getContainerFunctionKeys(container: Record<string, any>): string[] {
  return [...Object.keys(container), ...Object.getOwnPropertyNames(container)]
    .filter((key) => typeof key === 'string' && typeof container[key] === 'function');
}

/** Gets the name of the given known function container, or undefined if not found. */
export function getFunctionContainerName(container: FunctionContainer): keyof typeof functionContainers | undefined {
  return Object.entries(functionContainers).find((entry) => entry[1] === container)?.[0] as keyof typeof functionContainers | undefined;
}
