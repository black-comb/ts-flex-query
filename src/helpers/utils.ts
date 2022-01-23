import { IfAny } from '../types/utils';

/** Creates an object from an array with the given key and value getters. */
export function createObjectFromArray<TElement, TKey extends PropertyKey, TValue>(
  array: TElement[],
  keyGetter: (element: TElement) => TKey,
  valueGetter: (element: TElement) => TValue): { [key in TKey]: TValue };
/** Creates an object from an array with the given key getter where the value equals the respective element. */
export function createObjectFromArray<TElement, TKey extends PropertyKey>(
  array: TElement[],
  keyGetter: (element: TElement) => TKey): { [key in TKey]: TElement };
/** Creates an object from an array. */
export function createObjectFromArray<TElement, TKey extends PropertyKey, TValue = TElement>(
  array: TElement[],
  keyGetter: (element: TElement) => TKey,
  valueGetter?: (element: TElement) => TValue): { [key in TKey]: TValue } {
  return array.reduce(
    (acc, element) => {
      acc[keyGetter(element)] = valueGetter ? valueGetter(element) : element;
      return acc;
    },
    {} as any
  );
}

/** Creates a new object from the given object by rewriting values. */
export function createObjectFromObject<TKey extends PropertyKey, TOldValue, TNewValue>(
  obj: Record<TKey, Exclude<TOldValue, undefined>>,
  valueGetter: (value: Exclude<TOldValue, undefined>, key: TKey) => TNewValue
): Record<TKey, TNewValue>;
/** Creates a new object from the given object by rewriting values. */
export function createObjectFromObject<TKey extends PropertyKey, TOldValue, TNewValue>(
  obj: Partial<Record<TKey, TOldValue>>,
  valueGetter: (value: TOldValue, key: TKey) => TNewValue
): Partial<Record<TKey, TNewValue>>;
/** Creates a new object from the given object by rewriting keys and values. */
export function createObjectFromObject<TOldKey extends PropertyKey, TOldValue, TNewKey extends PropertyKey, TNewValue>(
  obj: Partial<Record<TOldKey, TOldValue>>,
  valueGetter: (value: TOldValue, key: TOldKey) => TNewValue,
  keyGetter: (key: TOldKey) => TNewKey,
): Partial<Record<TNewKey, TNewValue>>;
/** Creates a new object from the given object by rewriting keys and values. */
export function createObjectFromObject<TOldKey extends PropertyKey, TOldValue, TNewKey extends PropertyKey, TNewValue>(
  obj: Partial<Record<TOldKey, TOldValue>>,
  valueGetter: (value: TOldValue, key: TOldKey) => TNewValue,
  keyGetter?: (key: TOldKey) => TNewKey,
): Partial<Record<TNewKey, TNewValue>> {
  return createObjectFromArray(
    Object.entries(obj),
    entry => keyGetter?.(entry[0] as TOldKey) ?? entry[0] as TNewKey,
    entry => valueGetter(entry[1] as TOldValue, entry[0] as TOldKey)
  );
}

/** Produces a test function to check if a value is of a given type. */
export function typePredicate<T, U extends T>(f: (value: T) => boolean): (value: T) => value is U {
  return f as ((value: T) => value is U);
}

/**
 * Throws an error when called.
 * Used to mark code that must not be executed.
 */
export function unexpected(x: never): never {
  throw new Error('Unexpected value: ' + x);
}

/**
 * Creates a type expector method.
 * Its first argument is the value to test.
 * The second argument must be true.
 * The assertion fails if one of T and U is "any" but not both or if U does not extend T.
 */
export const expectType =
  <T>() => <U extends T>(
    value: U,
    shouldMatch: IfAny<
      U,
      IfAny<
        T,
        true,
        'Value must not have type any.'
      >,
      IfAny<
        T,
        'Value must have type any.',
        true
      >
    >) => {};

export const nameOf = <T>() => <TField extends keyof T>(field: TField) => field;

export function isDefined<T>(value: T): value is Exclude<T, undefined | null> {
  return value !== undefined && value !== null;
}

export function assertIsDefined<T>(value: T, errorMessage: string): asserts value is Exclude<T, undefined | null> {
  if (!isDefined(value)) {
    throw new Error(errorMessage);
  }
}
