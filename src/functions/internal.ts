import { merge } from 'lodash';

/** Internal functions are not exported by the funcs constant. */
export class Internal {
  public static mergeObjects(obj1: Record<PropertyKey, any>, obj2: Record<PropertyKey, any>): Record<PropertyKey, any> {
    return merge({}, obj1, obj2);
  }
}
