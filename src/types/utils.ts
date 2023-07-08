import { Expression } from '../core/expression';

export type Primitive = string | number | boolean | Date | bigint;

export type IfPrimitive<T, TThen, TElse> = NonNullable<T> extends Primitive ? TThen : TElse;
export type IfObject<T, TThen, TElse> = IfPrimitive<T, TElse, IfArray<T, TElse, TThen>>;
export type IfArray<T, TThen, TElse> = NonNullable<T> extends unknown[] ? TThen : TElse;
export type IfAny<T, TThen, TElse> = (any extends T ? never : TThen) extends never ? TThen : TElse;
export type IfFunc<T, TThen, TElse> = T extends (...args: any[]) => any ? TThen : TElse;

export type PrimitiveFields<TObj> = keyof TObj extends infer T ? T extends keyof TObj ? IfPrimitive<TObj[T], T, never> : never : never;
export type ObjectFields<TObj> = keyof TObj extends infer T ? T extends keyof TObj ? IfObject<TObj[T], T, never> : never : never;
export type ArrayFields<TObj> = keyof TObj extends infer T ? T extends keyof TObj ? IfArray<TObj[T], T, never> : never : never;
export type FuncFields<TObj> = keyof TObj extends infer T ? T extends keyof TObj ? IfFunc<TObj[T], T, never> : never : never;

export type PickPrimitiveFields<TObj> = Pick<TObj, PrimitiveFields<TObj>>;

// expands object types one level deep
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// expands object types recursively
export type ExpandRecursively<T> = IfPrimitive<
  T,
  T,
  T extends object
  ? T extends infer O ? { [K in keyof O]: ExpandRecursively<O[K]> } : never
  : T
>;

export type WithAdditionalPropertyType<TObj, TAdditionalProperty, TActualObj extends TObj = TObj> =
  TActualObj & { [key in Exclude<keyof TActualObj, keyof TObj>]: TAdditionalProperty };

export type ExpressionArray<T extends unknown[]> = T extends [infer TFirst, ...infer TRest]
  ? [Expression<TFirst>, ...ExpressionArray<TRest>]
  : T extends []
  ? T
  : T extends unknown[]
  ? Expression[]
  : T;

export type ArrayOf<TBase extends unknown[], TElement> = TBase extends [any, ...infer TRest]
  ? [TElement, ...ArrayOf<TRest, TElement>]
  : TBase extends []
  ? []
  : TElement[];

const errorSymbol = Symbol('error');
export type Error<TMessage> = [TMessage] & typeof errorSymbol;

export type UnionToIntersection<T> = (T extends any ? (t: T) => void : never) extends ((u: infer U) => void) ? U : never;
