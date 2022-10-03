import {
  isEqual,
  uniqWith
} from 'lodash';

import { isDefined } from '../helpers/utils';

function applyToDefinedValues<T, TResult>(values: (T | undefined | null)[], func: (v: T[]) => TResult, defaultResult: TResult): TResult {
  const definedValues: T[] = values.filter(isDefined);
  return definedValues.length ? func(definedValues) : defaultResult;
}

export const aggregation = {
  count(values: unknown[] | undefined): number {
    return values?.length ?? 0;
  },

  countDistinct(values: unknown[] | undefined): number {
    return values ? uniqWith(values, isEqual).length : 0;
  },

  maximum(values: (number | undefined)[]): number | undefined {
    return applyToDefinedValues(values, (v) => Math.max(...v), undefined);
  },

  minimum(values: (number | undefined)[]): number | undefined {
    return applyToDefinedValues(values, (v) => Math.min(...v), undefined);
  },

  sum(values: (number | undefined)[]): number {
    return values.filter(isDefined).reduce((acc, v) => acc + v, 0);
  },

  average(values: (number | undefined)[]): number | undefined {
    return applyToDefinedValues(values, (vs) => aggregation.sum(vs) / vs.length, undefined);
  }
}
