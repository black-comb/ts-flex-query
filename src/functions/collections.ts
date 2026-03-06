import { uniq } from 'lodash';

import { isDefined } from '../helpers/utils';

export const collections = {
  any(collection: unknown[] | undefined): boolean {
    return isDefined(collection) && collection.length > 0;
  },

  distinct(collection: unknown[]): unknown[] {
    return uniq(collection);
  },

  first(collection: unknown[] | undefined): unknown {
    return collection?.[0];
  },

  in(value: unknown, collection: unknown[] | undefined): boolean {
    return isDefined(collection) && collection.includes(value);
  }
};
