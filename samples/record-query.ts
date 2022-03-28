import { QueryFactory } from 'ts-flex-query';
import {
  chain,
  field,
  first,
  map,
  orderBy,
  pipe,
  record
} from 'ts-flex-query/operators';

import { Node } from './model';

const recordQuery = new QueryFactory<Node[]>().create(
  map(record({
    id: 'Id',
    masterNodeId: chain('MasterNode', 'Id'),
    firstProviderId: pipe(field('Providers'), orderBy('BusinessId'), first(), field('Id'))
  }))
);
