import { isDefined } from '../helpers/utils';

export class Mathematics {
  public static add(v1: number | undefined, v2: number | undefined): number | undefined {
    return isDefined(v1) && isDefined(v2) ? v1 + v2 : undefined;
  }

  public static subtract(v1: number | undefined, v2: number | undefined): number | undefined {
    return isDefined(v1) && isDefined(v2) ? v1 - v2 : undefined;
  }

  public static multiply(v1: number | undefined, v2: number | undefined): number | undefined {
    return isDefined(v1) && isDefined(v2) ? v1 * v2 : undefined;
  }

  public static divide(v1: number | undefined, v2: number | undefined): number | undefined {
    return isDefined(v1) && isDefined(v2) ? v1 / v2 : undefined;
  }

  public static divideInteger(v1: number | undefined, v2: number | undefined): number | undefined {
    return isDefined(v1) && isDefined(v2) ? Math.floor(v1 / v2) : undefined;
  }

  public static modulo(v1: number | undefined, v2: number | undefined): number | undefined {
    return isDefined(v1) && isDefined(v2) ? v1 % v2 : undefined;
  }
}
