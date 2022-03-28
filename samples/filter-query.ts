import { QueryFactory } from 'ts-flex-query';
import {
  and,
  field,
  filter,
  func,
  value
} from 'ts-flex-query/operators';

import { Node } from './model';

const filterQuery = new QueryFactory<Node[]>().create(
  filter(func('equal', field('Id'), value(42)))
);

const filterQuery2 = new QueryFactory<Node[]>().create(
  filter(and(
    func('greaterOrEqual', field('Id'), value(10)),
    func('notEqual', field('Name'), value(null))
  ))
);
