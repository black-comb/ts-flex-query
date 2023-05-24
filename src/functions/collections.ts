import { uniq } from 'lodash';

import { isDefined } from '../helpers/utils';

export const collections = {
  distinct(collection: unknown[]): unknown[] {
    return uniq(collection);
  },

  in(value: unknown, collection: unknown[] | undefined): boolean {
    return isDefined(collection) && collection.includes(value);
  },

  first(collection: unknown[] | undefined): unknown {
    return collection?.[0];
  }
}
