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
const executor = new ODataExecutor({
  execute: (collection, queryString) =>
    from(fetch(`https://odata-backend.com/${collection}?${queryString}`)).pipe(
      switchMap((response) => response.json())
    )
});

// 3. Define the query:
const query = new QueryFactory<Person[]>().create(
  filter(func('contains', field('name'), value('Müller'))),
  orderBy('name'),
  querySchema([{ id: true, name: true, city: { name: true } }]) // Compile error if non-existing fields are queried.
);

// 4. Apply the query to a collection:
const expression = pipeExpression(oDataCollection<Person>('Persons'), query);

// 5. Execute the query and work with the result:
executor.execute(expression).subscribe((persons) => {
  // Work with the result.
  // eslint-disable-next-line no-console -- OK in sample.
  persons.forEach((person) => console.log(`${person.name} is living in ${person.city.name}.`)); // OK
  // @ts-expect-error age is not part of the query.
  // eslint-disable-next-line no-console -- OK in sample
  persons.forEach((person) => console.log(`${person.name} is ${person.age} years old.`)); // Compile error because age is not part of the query.
});
