import {
  pipeExpression,
  QueryFactory
} from 'ts-flex-query';
import {
  field,
  filter,
  func,
  noOp,
  querySchema,
  slice,
  value
} from 'ts-flex-query/operators';
import { Facility } from './model';


const q = new QueryFactory<Facility[]>().create(
  slice(0, 1),
  // Error expected because no container argument is available on root level:
  // querySchema((x, c) => pipeExpression(x, noOp())),
  querySchema((x) => pipeExpression(x, noOp())),
  querySchema([{
    Node: {
      Id: true,
      Facilities: (f, c) => pipeExpression(
        f,
        filter(func('equal', field('Id'), value(42))),
        querySchema([{
          Node: () => c
        }])
      )
    }
  }])
);
