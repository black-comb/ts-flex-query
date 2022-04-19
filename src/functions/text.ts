import { isDefined } from '../helpers/utils';

export class Text {
  public static startsWith(v1: string | undefined, v2: string | undefined): boolean {
    return isDefined(v1) && isDefined(v2) && v1.startsWith(v2);
  }
  public static endsWith(v1: string | undefined, v2: string | undefined): boolean {
    return isDefined(v1) && isDefined(v2) && v1.endsWith(v2);
  }
  public static upperCase(v: string | undefined): string | undefined {
    return v?.toLocaleUpperCase();
  }
  public static lowerCase(v: string | undefined): string | undefined {
    return v?.toLocaleLowerCase();
  }
  public static concat(v1: string | undefined, v2: string | undefined): string {
    return (v1 ?? '') + (v2 ?? '');
  }
  public static contains(v1: string | undefined, v2: string | undefined): boolean {
    return isDefined(v1) && isDefined(v2) && v1.indexOf(v2) >= 0;
  }
  public static indexOf(v1: string | undefined, v2: string | undefined): number {
    return isDefined(v1) && isDefined(v2) ? v1.indexOf(v2) : -1;
  }
  public static getLength(v: string | undefined): number {
    return (v ?? '').length;
  }
}
