import { merge } from 'lodash';

/** Internal functions are not exported by the funcs constant. */
export const internal = {
  ifUndefined(val: unknown, fallback: unknown): unknown {
    return val ?? fallback;
  },

  mergeObjects(obj1: Record<PropertyKey, any>, obj2: Record<PropertyKey, any>): Record<PropertyKey, any> {
    return merge({}, obj1, obj2);
  }
};
