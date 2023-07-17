import { isDefined } from '../helpers/utils';

export const comparison = {
  equal(v1: unknown, v2: unknown): boolean {
    if (v1 instanceof Date && v2 instanceof Date) {
      return v1.getTime() === v2.getTime();
    }
    return v1 === v2;
  },
  notEqual(v1: unknown, v2: unknown): boolean {
    return v1 !== v2;
  },
  greater(v1: number | bigint | Date | undefined, v2: number | bigint | Date | undefined): boolean {
    return isDefined(v1) && isDefined(v2) && v1 > v2;
  },
  greaterOrEqual(v1: number | bigint | Date | undefined, v2: number | bigint | Date | undefined): boolean {
    return isDefined(v1) && isDefined(v2) && v1 >= v2;
  },
  lower(v1: number | bigint | Date | undefined, v2: number | bigint | Date | undefined): boolean {
    return isDefined(v1) && isDefined(v2) && v1 < v2;
  },
  lowerOrEqual(v1: number | bigint | Date | undefined, v2: number | bigint | Date | undefined): boolean {
    return isDefined(v1) && isDefined(v2) && v1 <= v2;
  },
  has(v1: unknown, v2: unknown): boolean {
    return isDefined(v1) && isDefined(v2)
      && (
        (typeof v1 === 'string' && typeof v2 === 'string' && v1.split(/\s*,\s*/).includes(v2))
        || (typeof v1 === 'number' && typeof v2 === 'number' && (v1 & v2) === v2)
      );
  }
};
