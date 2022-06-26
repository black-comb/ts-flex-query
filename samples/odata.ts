import {
  from,
  switchMap
} from 'rxjs';
import {
  pipeExpression,
  QueryFactory
} from 'ts-flex-query';
import {
  oDataCollection,
  ODataExecutor
} from 'ts-flex-query/odata';
import {
  field,
  filter,
  func,
  orderBy,
  querySchema,
  value
} from 'ts-flex-query/operators';

// 1. Define the data model:
interface Person {
  id: number;
  name: string;
  age: number;
  city: City;
}

interface City {
  name: string;
  x: number;
  y: number;
}

// 2. Create an ODataExecutor connecting to your OData backend:
const executor = new ODataExecutor(
  (collection, queryString) =>
    from(fetch(`https://odata-backend.com/${collection}?${queryString}`)).pipe(
      switchMap((response) => response.json())
    )
);

// 3. Define the query:
const query = new QueryFactory<Person[]>().create(
  filter(func('contains', field('name'), value('Müller'))),
  orderBy('name'),
  querySchema([{ id: true, name: true, city: { name: true } }])
);

// 4. Execute the query and work with the result:
executor.execute(pipeExpression(oDataCollection('Persons'), query)).subscribe((result) => {
  // Work with the result.
});
