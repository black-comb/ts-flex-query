import {
  TsFlexQueryTypeMarker,
  TsFlexQueryTypeProperty
} from './ts-flex-query-type';
import {
  IfObject,
  IfPrimitive,
  PickPrimitiveFields
} from './utils';

export type EvaluatedResultType<T, TExpandObjects = false> =
  IfPrimitive<
    T,
    T,
    T extends (infer TElement)[]
    ? EvaluatedResultType<TElement>[]
    : IfObject<
      T,
      T extends TsFlexQueryTypeMarker<'record'>
      ? { [TKey in Exclude<keyof T, TsFlexQueryTypeProperty>]: EvaluatedResultType<T[TKey]> }
      : T extends undefined
      ? undefined
      : TExpandObjects extends true
      ? { [TKey in Exclude<keyof T, TsFlexQueryTypeProperty>]: EvaluatedResultType<T[TKey]> }
      :  PickPrimitiveFields<T>,
      T
    >
  >;
