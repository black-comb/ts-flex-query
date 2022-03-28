import { QueryFactory } from 'ts-flex-query';
import {
  chain,
  field,
  orderBy,
  pipe
} from 'ts-flex-query/operators';

import { Node } from './model';

const orderQuery = new QueryFactory<Node[]>().create(
  orderBy(
    ['Name', 'desc'], // first by Name descending
    chain('MasterNode', 'Id'), // then by MasterNode.Id ascending
    'Id' // then by Id ascending
  )
);

const orderQuery2 = new QueryFactory<Node[]>().create(
  orderBy(
    pipe(field('MasterNode'), field('Id')) // Order by MasterNode.Id.
    // equivalent to:
    // chain('MasterNode', 'Id')
  )
);
