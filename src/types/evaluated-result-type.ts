import { PipeOperator } from '../core';
import { QueryResultType } from './query-result-type';
import {
  TsFlexQueryTypeMarker,
  TsFlexQueryTypeProperty
} from './ts-flex-query-type';
import {
  ExpandRecursively,
  IfObject,
  IfPrimitive,
  PickPrimitiveFields
} from './utils';

export type EvaluatedResultType<T, TExpandObjects = false> =
  IfPrimitive<
    T,
    T,
    T extends (infer TElement)[]
    ? EvaluatedResultType<TElement, TExpandObjects>[]
    : IfObject<
      T,
      T extends TsFlexQueryTypeMarker<'record'>
      ? { [TKey in Exclude<keyof T, TsFlexQueryTypeProperty>]: EvaluatedResultType<T[TKey], TExpandObjects> }
      : T extends undefined
      ? undefined
      : TExpandObjects extends true
      ? ExpandRecursively<Omit<T, TsFlexQueryTypeProperty>>
      : PickPrimitiveFields<T>,
      T
    >
  >;

export type EvaluatedQueryType<T extends PipeOperator> = EvaluatedResultType<QueryResultType<T>>;
