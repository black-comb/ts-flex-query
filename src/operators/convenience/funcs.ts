import {
  flatten,
  merge
} from 'lodash';

import {
  createQueryFromObjectValueSelector,
  ObjectValueSelector,
  ObjectValueSelectorType,
  PipeOperator,
  QueryFactory
} from '../..';
import { constant } from '../../expressions';
import { FunctionApplicationExpression } from '../../expressions/function-application';
import { publicFunctionContainers } from '../../functions/main';
import { createObjectFromArray } from '../../helpers/utils';
import { SampleType1 } from '../../tests/types/sample-type-1';
import {
  ArrayOf,
  FuncFields,
  UnionToIntersection
} from '../../types/utils';
import {
  apply,
  filter,
  map
} from '../basic';

export type ObjectValueSelectorArray<TArgs extends unknown[], TBase> = ArrayOf<TArgs, ObjectValueSelector<TBase>>;

type ContainerMemberFunction<TContainer, TMember extends FuncFields<TContainer> & string, TBase> =
  TContainer extends { [TKey in TMember]: (...args: any) => any }
  ? (args: ObjectValueSelectorArray<Parameters<TContainer[TMember]>, unknown>) => PipeOperator<TBase, ReturnType<TContainer[TMember]>>
  : never;

function createOperatorFactory<TContainer, TMember extends FuncFields<TContainer> & string>(
  container: TContainer,
  member: TMember
): ContainerMemberFunction<TContainer, TMember, any> {
  return ((args: ObjectValueSelector<any>[]) => apply((input) => new FunctionApplicationExpression(
    container,
    member,
    args.map((s) => createQueryFromObjectValueSelector(s).instantiate(input))
  ))) as any;
}

function createOperatorFactories<TContainer extends Record<string, any>>(container: TContainer): {
  [TMember in FuncFields<TContainer> & string]: ContainerMemberFunction<TContainer, TMember, any>
} {
  const relevantKeys = [...Object.keys(container), ...Object.getOwnPropertyNames(container)]
    .filter((key) => typeof key === 'string' && typeof container[key] === 'function');
  return createObjectFromArray(
    relevantKeys,
    (key) => key,
    (key) => createOperatorFactory(container, key as any)
  ) as any;
}

function createOperatorFactoriesForContainers<TContainerSpec extends Record<string, any>>(
  spec: TContainerSpec
): { [TMember in FuncFields<UnionToIntersection<TContainerSpec[keyof TContainerSpec]>> & string]: ContainerMemberFunction<UnionToIntersection<TContainerSpec[keyof TContainerSpec]>, TMember, any> } {
  const factories = {};
  return merge(factories, ...Object.values(spec).map(createOperatorFactories)) as any;
}

export const funcs = createOperatorFactoriesForContainers(publicFunctionContainers);

//type TFuncKeys = FuncFields<UnionToIntersection<(typeof publicFunctionContainers)[keyof typeof publicFunctionContainers]>>;
// export function func<TIn, TFunc extends keyof typeof funcs, TOut>(
//   key: TFunc,
//   ...args: ArrayOf<Parameters<(typeof funcs)[TFunc]>[0], ObjectValueSelector<TIn>>
// ): ReturnType<typeof funcs[TFunc]> extends PipeOperator<any, infer TOut> ? PipeOperator<TIn, TOut> : never {
//   return funcs[key](args as any) as any;
// }

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
      .map(([containerKey, container]) => Object.keys(container).map((funcKey) => ({ containerKey, funcKey })))
  ),
  (x) => x.funcKey,
  (x) => x.containerKey
) as any;

type ObjectValueSelectorTypes<T extends ObjectValueSelector[], TBase> =
    T extends [infer TFirst, ...infer TRest]
    ? TFirst extends ObjectValueSelector
    ? TRest extends ObjectValueSelector[]
    ? [ObjectValueSelectorType<TBase, TFirst>, ...ObjectValueSelectorTypes<TRest, TBase>]
    : never
    : never
    : [];

type ParameterErrorType<TExpected extends unknown[], TActual extends unknown[]> =
  TExpected extends [infer TExpectedFirst, ...infer TExpectedRest]
  ? TActual extends [infer TActualFirst, ...infer TActualRest]
  // ? TActual extends TExpected
  // ? [never, ...ParameterErrorType<TExpectedRest, TActualRest>]
  ? [{ expected: TExpectedFirst, actual: TActualFirst }, ...ParameterErrorType<TExpectedRest, TActualRest>]
  : never
  : [];

export function func<TIn, TFunc extends keyof FlattenedFunctions, TArgs extends ArrayOf<Parameters<FlattenedFunctions[TFunc]>, ObjectValueSelector<TIn>>>(
  key: TFunc,
  // ...args: TArgs
  ...args: ObjectValueSelectorTypes<TArgs, TIn> extends Parameters<FlattenedFunctions[TFunc]>
    ? TArgs
    : ArrayOf<TArgs, ['Invalid function argument types. Expected:', ...Parameters<FlattenedFunctions[TFunc]>]> //ParameterErrorType<Parameters<FlattenedFunctions[TFunc]>, ObjectValueSelectorTypes<TArgs, TIn>>
): PipeOperator<TIn, ReturnType<FlattenedFunctions[TFunc]>> {
  //return funcs[key](args as any) as any;
  return apply((input) => new FunctionApplicationExpression(
    publicFunctionContainers[flattenedFunctionContainers[key]],
    key,
    args.map((selector) => createQueryFromObjectValueSelector(selector as ObjectValueSelector).instantiate(input))
  )) as any;
}

const q = new QueryFactory<SampleType1[]>().create(
  filter(func('equal', 'field1', () => constant(42)))
  //filter(func('equal', 'field1'))
  //map(func('getLength', 'field2'))
);
