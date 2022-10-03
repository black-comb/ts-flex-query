import { isDefined } from '../helpers/utils';

export const text = {
  startsWith(v1: string | undefined, v2: string | undefined): boolean {
    return isDefined(v1) && isDefined(v2) && v1.startsWith(v2);
  },
  endsWith(v1: string | undefined, v2: string | undefined): boolean {
    return isDefined(v1) && isDefined(v2) && v1.endsWith(v2);
  },
  upperCase(v: string | undefined): string | undefined {
    return v?.toLocaleUpperCase();
  },
  lowerCase(v: string | undefined): string | undefined {
    return v?.toLocaleLowerCase();
  },
  concat(v1: string | undefined, v2: string | undefined): string {
    return (v1 ?? '') + (v2 ?? '');
  },
  contains(v1: string | undefined, v2: string | undefined): boolean {
    return isDefined(v1) && isDefined(v2) && v1.indexOf(v2) >= 0;
  },
  indexOf(v1: string | undefined, v2: string | undefined): number {
    return isDefined(v1) && isDefined(v2) ? v1.indexOf(v2) : -1;
  },
  getLength(v: string | undefined): number {
    return (v ?? '').length;
  }
}
