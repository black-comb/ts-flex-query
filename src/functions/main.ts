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
