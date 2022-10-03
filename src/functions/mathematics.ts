import { isDefined } from '../helpers/utils';

export const mathematics = {
  add(v1: number | undefined, v2: number | undefined): number | undefined {
    return isDefined(v1) && isDefined(v2) ? v1 + v2 : undefined;
  },

  subtract(v1: number | undefined, v2: number | undefined): number | undefined {
    return isDefined(v1) && isDefined(v2) ? v1 - v2 : undefined;
  },

  multiply(v1: number | undefined, v2: number | undefined): number | undefined {
    return isDefined(v1) && isDefined(v2) ? v1 * v2 : undefined;
  },

  divide(v1: number | undefined, v2: number | undefined): number | undefined {
    return isDefined(v1) && isDefined(v2) ? v1 / v2 : undefined;
  },

  divideInteger(v1: number | undefined, v2: number | undefined): number | undefined {
    return isDefined(v1) && isDefined(v2) ? Math.floor(v1 / v2) : undefined;
  },

  modulo(v1: number | undefined, v2: number | undefined): number | undefined {
    return isDefined(v1) && isDefined(v2) ? v1 % v2 : undefined;
  }
}
