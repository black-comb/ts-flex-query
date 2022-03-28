import { QueryFactory } from 'ts-flex-query';
import {
  chain,
  field
} from 'ts-flex-query/operators';

import { Node } from './model';

const fieldQuery = new QueryFactory<Node>().create(
  field('Name') // compile error if Node does not have a field 'Name'
);

const fieldQuery2 = new QueryFactory<Node>().create(
  // field('MasterNode'), field('Id')
  // or equivalently:
  chain('MasterNode', 'Id')
);
