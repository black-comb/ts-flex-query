import { QueryFactory } from 'ts-flex-query';
import { funcs } from 'ts-flex-query/expressions';
import {
  aggregateValue,
  groupAndAggregate
} from 'ts-flex-query/operators';
import { EvaluatedQueryType } from 'ts-flex-query/types';

import { Node } from './model';

const groupAndAggregateQuery = new QueryFactory<Node[]>().create(
  groupAndAggregate({
    MasterNode: { Id: true }
  }, {
    count: funcs.count,
    minId: aggregateValue('Id', funcs.minimum)
  })
);

const x: EvaluatedQueryType<typeof groupAndAggregateQuery> = undefined as any;

const groupAndAggregateQueryForCount = new QueryFactory<Node[]>().create(
  groupAndAggregate({}, {
    count: funcs.count
  })
);
