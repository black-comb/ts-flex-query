import { Axios } from 'axios';
import {
  sortBy,
  uniq
} from 'lodash';
import {
  firstValueFrom,
  from,
  switchMap
} from 'rxjs';

import { constant } from '../../expressions/constant';
import { funcs } from '../../expressions/function-application';
import { pipeExpression } from '../../helpers/pipe-expression';
import { field } from '../../operators/basic/field';
import { filter } from '../../operators/basic/filter';
import { orderBy } from '../../operators/basic/sort';
import { groupAndAggregate } from '../../operators/convenience/group-and-aggregate';
import { includeCount } from '../../operators/convenience/include-count';
import { querySchema } from '../../operators/convenience/query-schema';
import { slice } from '../../operators/convenience/slice';
import { oDataCollection } from '../expressions/odata-collection';
import { ODataExecutor } from './odata-executor';

interface Address {
  Address: string | null;
  City: {
    Name: string;
    CountryRegion: string;
    Region: string;
  } | null;
}

interface Person {
  UserName: string;
  FirstName: string;
  LastName: string;
  MiddleName: string | null;
  Gender: 'Female' | 'Male';
  Age: number | null;
  Emails: string[];
  FavoriteFeature: string;
  AddressInfo: Address[];
  HomeAddress: Address | null;
  Friends: Person[];
}

const unexpandableFieldChains: string[][] = [['HomeAddress']];

const collections = {
  People: oDataCollection<Person>('People')
};

describe('ODataExecutor Reference Service Tests', () => {
  const executor = new ODataExecutor((collectionName, queryText) => {
    console.log('OData request', collectionName, queryText);
    const axios = new Axios({});
    return from(axios.get(`https://services.odata.org/TripPinRESTierService/(S(lxf30xinakqfcqprslqo1ph0))/${collectionName}?${queryText}`)).pipe(
      switchMap(async (response) => {
        if (response.status < 200 || response.status >= 300) {
          throw new Error(`Status code: ${response.status} / Response: ${response.data}`);
        }
        const result = JSON.parse(response.data);
        console.log('OData response', result);
        return result;
      })
    );
  }, unexpandableFieldChains);

  it('People: select', async () => {
    const expr = pipeExpression(
      collections.People,
      slice(0, 5),
      querySchema([{
        UserName: true,
        Gender: true
      }])
    );
    const result = await firstValueFrom(executor.execute(expr));

    expect(result.length).toEqual(5);
    expect(sortBy(uniq(result.map((p) => p.Gender)))).toEqual(['Female', 'Male']);
  });

  it('People: orderby, count and select', async () => {
    const expr = pipeExpression(
      collections.People,
      orderBy('LastName', 'FirstName'),
      includeCount((e) => pipeExpression(
        e,
        slice(0, 5),
        querySchema([{
          UserName: true,
          Gender: true
        }])
      ))
    );
    const result = await firstValueFrom(executor.execute(expr));

    expect(result.elements.length).toEqual(5);
    expect(result.count).toBeGreaterThan(15);
  });

  it('People: filter and expand', async () => {
    const expr = pipeExpression(
      collections.People,
      filter((p) => funcs.startsWith(pipeExpression(p, field('FirstName')), constant('A'))),
      querySchema([{
        UserName: true,
        FirstName: true,
        Friends: [{
          Friends: [{
            FirstName: true,
            LastName: true
          }]
        }]
      }])
    );
    const result = await firstValueFrom(executor.execute(expr));

    expect(result[0].Friends[0].Friends[0].FirstName).toBeDefined();
    expect(result[0].Friends[0].Friends[0].LastName).toBeDefined();
    expect(uniq(result.map((p) => p.FirstName[0]))).toEqual(['A']);
  });

  it('People: group and aggregate', async () => {
    const expr = pipeExpression(
      collections.People,
      groupAndAggregate({
        Gender: true
      }, {
        count: funcs.count
      })
    );
    const result = await firstValueFrom(executor.execute(expr));

    expect(result.length).toBe(2);
    expect(result.map(r => r.Gender).sort()).toEqual(['Female', 'Male']);
    expect(result[0].count).toBeGreaterThan(5);
    expect(result[0].count).toBeGreaterThan(5);
  });

  it('People: filter and expand all', async () => {
    const expr = pipeExpression(
      collections.People,
      filter((p) => funcs.startsWith(pipeExpression(p, field('FirstName')), constant('A'))),
      querySchema([{
        UserName: true,
        FirstName: true,
        // HomeAddress: 'expand', // Would occur in the select query part because of its appearance in the unexpandableFieldChains configuration of the ODataExecutor.
        Friends: [{
          Friends: ['expand']
        }]
      }])
    );
    const result = await firstValueFrom(executor.execute(expr));

    expect(result[0].Friends[0].Friends[0].FirstName).toBeDefined();
    expect(result[0].Friends[0].Friends[0].LastName).toBeDefined();
    expect(result[0].Friends[0].Friends[0].Age).toBeDefined();
    expect(uniq(result.map((p) => p.FirstName[0]))).toEqual(['A']);
  });
});

