export const boolean = {
  and(v1: boolean | undefined, v2: boolean | undefined): boolean {
    return (v1 && v2) ?? false;
  },
  or(v1: boolean | undefined, v2: boolean | undefined): boolean {
    return (v1 || v2) ?? false;
  },
  xor(v1: boolean | undefined, v2: boolean | undefined): boolean {
    return (v1 ?? false) !== (v2 ?? false);
  },
  not(v: boolean | undefined): boolean {
    return !v;
  }
};
