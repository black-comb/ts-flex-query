import { isDefined } from '../helpers/utils';

export const collections = {
  in(value: unknown, collection: unknown[] | undefined): boolean {
    return isDefined(collection) && collection.includes(value);
  },

  first(collection: unknown[] | undefined): unknown {
    return collection?.[0];
  }
}
