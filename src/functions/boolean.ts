export class Boolean {
  public static and(v1: boolean | undefined, v2: boolean | undefined): boolean {
    return (v1 && v2) ?? false;
  }
  public static or(v1: boolean | undefined, v2: boolean | undefined): boolean {
    return (v1 || v2) ?? false;
  }
  public static xor(v1: boolean | undefined, v2: boolean | undefined): boolean {
    return (v1 ?? false) !== (v2 ?? false);
  }
  public static not(v: boolean | undefined): boolean {
    return !v;
  }
}
