import {
  PipeOperator,
  QueryFactory
} from 'ts-flex-query';
import {
  field,
  filter,
  func,
  querySchema,
  value
} from 'ts-flex-query/operators';
import { Facility } from './model';


function f(getQuery: (productionFacilityId: number) => PipeOperator<Facility[], Facility[]>): void {
  const q = new QueryFactory<Facility[]>().create(
    getQuery(1),
    querySchema([{ Id: true }])
  );
}

const q2 = new QueryFactory<Facility[]>().create(
  filter(func('greater', field('BusinessId'), value(12)))
);

f((id) => q2);
