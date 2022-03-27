import { flatten } from 'lodash';

import {
  createQueryFromObjectValueSelector,
  ObjectValueSelector,
  PipeOperator
} from '../..';
import { FunctionApplicationExpression } from '../../expressions/function-application';
import {
  getContainerFunctionKeys,
  publicFunctionContainers
} from '../../functions/main';
import { createObjectFromArray } from '../../helpers/utils';
import {
  FuncFields,
  UnionToIntersection
} from '../../types/utils';
import { apply } from '../basic';

type FlattenedFunctions = {
  [TMember in FuncFields<UnionToIntersection<typeof publicFunctionContainers[keyof typeof publicFunctionContainers]>> & string]:
  UnionToIntersection<typeof publicFunctionContainers[keyof typeof publicFunctionContainers]>[TMember]
};

const flattenedFunctionContainers: {
  [TFunc in FuncFields<UnionToIntersection<typeof publicFunctionContainers[keyof typeof publicFunctionContainers]>> & string]: keyof typeof publicFunctionContainers
} = createObjectFromArray(
  flatten(
    Object
      .entries(publicFunctionContainers)
      .map(([containerKey, container]) => getContainerFunctionKeys(container).map((funcKey) => ({ containerKey, funcKey })))
  ),
  (x) => x.funcKey,
  (x) => x.containerKey
) as any;

type PipeOperators<TIn, TArgs extends unknown[]> =
    TArgs extends [infer TFirst, ...infer TRest]
    ? [PipeOperator<TIn, TFirst>, ...PipeOperators<TIn, TRest>]
    : [];

export function func<TIn, TFunc extends keyof FlattenedFunctions>(
  key: TFunc,
  ...args: PipeOperators<TIn, Parameters<FlattenedFunctions[TFunc]>>
): PipeOperator<TIn, ReturnType<FlattenedFunctions[TFunc]>> {
  return apply((input) => new FunctionApplicationExpression(
    publicFunctionContainers[flattenedFunctionContainers[key]],
    key,
    args.map((selector) => createQueryFromObjectValueSelector(selector as ObjectValueSelector).instantiate(input))
  )) as any;
}

