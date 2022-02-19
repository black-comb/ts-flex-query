import { isDefined } from '../helpers/utils';

export class Collections {
  public static in(value: unknown, collection: unknown[] | undefined): boolean {
    return isDefined(collection) && collection.includes(value);
  }
}
