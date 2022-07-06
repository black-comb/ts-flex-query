import {
  isEqual,
  uniqWith
} from 'lodash';

import { isDefined } from '../helpers/utils';

export class Aggregation {
  public static count(values: unknown[] | undefined): number {
    return values?.length ?? 0;
  }

  public static countDistinct(values: unknown[] | undefined): number {
    return values ? uniqWith(values, isEqual).length : 0;
  }

  public static maximum(values: (number | undefined)[]): number | undefined {
    return Aggregation.applyToDefinedValues(values, (v) => Math.max(...v), undefined);
  }

  public static minimum(values: (number | undefined)[]): number | undefined {
    return Aggregation.applyToDefinedValues(values, (v) => Math.min(...v), undefined);
  }

  public static sum(values: (number | undefined)[]): number {
    return values.filter(isDefined).reduce((acc, v) => acc + v, 0);
  }

  public static average(values: (number | undefined)[]): number | undefined {
    return this.applyToDefinedValues(values, (vs) => Aggregation.sum(vs) / vs.length, undefined);
  }

  private static applyToDefinedValues<T, TResult>(values: (T | undefined | null)[], func: (v: T[]) => TResult, defaultResult: TResult): TResult {
    const definedValues: T[] = values.filter(isDefined);
    return definedValues.length ? func(definedValues) : defaultResult;
  }
}
