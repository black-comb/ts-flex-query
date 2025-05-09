import { flatten } from 'lodash';

import {
  Expression,
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

const flattenedFunctionContainers: Record<FuncFields<UnionToIntersection<typeof publicFunctionContainers[keyof typeof publicFunctionContainers]>> & string, keyof typeof publicFunctionContainers> =
  createObjectFromArray(
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

export function customFunc<TIn, TContainer extends Record<any, (...xs: any) => any>, TMember extends keyof NoInfer<TContainer> & string>(
  container: TContainer,
  member: TMember,
  ...args: PipeOperators<NoInfer<TIn>, Parameters<NoInfer<TContainer>[NoInfer<TMember>]>>

): TContainer[TMember] extends (...xs: any) => any ? PipeOperator<TIn, ReturnType<TContainer[TMember]>> : never {
  return apply((input) => new FunctionApplicationExpression(
    container,
    member,
    args.map((selector) => selector.instantiate(input as Expression<TIn>))
  )) as any;
}

export function func<TIn, TFunc extends keyof FlattenedFunctions>(
  key: TFunc,
  ...args: PipeOperators<NoInfer<TIn>, Parameters<FlattenedFunctions[NoInfer<TFunc>]>>
): PipeOperator<TIn, ReturnType<FlattenedFunctions[TFunc]>> {
  return customFunc(publicFunctionContainers[flattenedFunctionContainers[key]], key as any, ...args);
}
