import { FunctionContainer } from '../types/function-container';
import { Aggregation } from './aggregation';
import { Boolean } from './boolean';
import { Collections } from './collections';
import { Comparison } from './comparison';
import { Internal } from './internal';
import { Mathematics } from './mathematics';
import { Text } from './text';

export const publicFunctionContainers = {
  Aggregation,
  Boolean,
  Collections,
  Comparison,
  Mathematics,
  Text
} as const;

export const functionContainers = {
  ...publicFunctionContainers,
  Internal
} as const;

export function getContainerFunctionKeys(container: Record<string, any>): string[] {
  return [...Object.keys(container), ...Object.getOwnPropertyNames(container)]
    .filter((key) => typeof key === 'string' && typeof container[key] === 'function');
}

/** Gets the name of the given known function container, or undefined if not found. */
export function getFunctionContainerName(container: FunctionContainer): keyof typeof functionContainers | undefined {
  return Object.entries(functionContainers).find((entry) => entry[1] === container)?.[0] as keyof typeof functionContainers | undefined;
}
