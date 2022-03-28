import { of } from 'rxjs';

import { constant } from '../../expressions/constant';
import { funcs } from '../../expressions/function-application';
import { pipeExpression } from '../../helpers/pipe-expression';
import {
  func,
  map
} from '../../operators';
import { field } from '../../operators/basic/field';
import { filter } from '../../operators/basic/filter';
import { orderBy } from '../../operators/basic/sort';
import { aggregateValue } from '../../operators/convenience/aggregate-value';
import { chain } from '../../operators/convenience/chain';
import { groupAndAggregate } from '../../operators/convenience/group-and-aggregate';
import { includeCount } from '../../operators/convenience/include-count';
import { querySchema } from '../../operators/convenience/query-schema';
import { slice } from '../../operators/convenience/slice';
import { SampleType1 } from '../../tests/types/sample-type-1';
import { SampleType2 } from '../../tests/types/sample-type-2';
import { oDataCollection } from '../expressions/odata-collection';
import { oDataCountField } from '../helpers/definitions';
import { ODataExecutor } from './odata-executor';

describe('ODataExecutor', () => {
  let requests: { collectionName: string, queryText: string }[] = [];
  const executor = new ODataExecutor((collectionName, queryText) => {
    requests.push({ collectionName, queryText });
    console.log('OData request', collectionName, queryText);
    return of({ value: [], [oDataCountField]: 0 });
  });

  afterEach(() => requests = []);

  it('select fields', async () => {
    const expr = pipeExpression(
      oDataCollection<SampleType1>('test'),
      querySchema([{ field1: true, field3: true }])
    );
    console.log(JSON.stringify(expr));
    const result = await executor.execute(expr);

    expect(requests).toEqual([{ collectionName: 'test', queryText: '$select=field1,field3' }]);
  });

  it('select and expand fields', async () => {
    const expr = pipeExpression(
      oDataCollection<SampleType2>('test'),
      querySchema([{
        fieldA: true,
        fieldB: {
          field2: true
        },
        fieldD: [{
          fieldD: [{
            fieldA: true
          }]
        }]
      }])
    );
    console.log(JSON.stringify(expr));
    const result = await executor.execute(expr);

    expect(requests).toEqual([{ collectionName: 'test', queryText: '$select=fieldA,fieldB,fieldD&$expand=fieldB($select=field2),fieldD($select=fieldD;$expand=fieldD($select=fieldA))' }]);
  });

  it('order by', async () => {
    const expr = pipeExpression(
      oDataCollection<SampleType2>('test'),
      orderBy(chain('fieldB', 'field1')),
      querySchema([{ fieldA: true }])
    );
    console.log(JSON.stringify(expr));
    const result = await executor.execute(expr);

    expect(requests).toEqual([{ collectionName: 'test', queryText: '$orderBy=fieldB/field1&$select=fieldA' }]);
  });

  it('slice', async () => {
    const expr = pipeExpression(
      oDataCollection<SampleType2>('test'),
      orderBy(chain('fieldB', 'field1')),
      slice(150, 20)
    );
    console.log(JSON.stringify(expr));
    const result = await executor.execute(expr);

    expect(requests).toEqual([{ collectionName: 'test', queryText: '$orderBy=fieldB/field1&$skip=150&$top=20' }]);
  });

  it('filter', async () => {
    const expr = pipeExpression(
      oDataCollection<SampleType2>('test'),
      filter((obj) => funcs.equal(pipeExpression(obj, chain('fieldB', 'field1')), constant(42)))
    );
    console.log(JSON.stringify(expr));
    const result = await executor.execute(expr);

    expect(requests).toEqual([{ collectionName: 'test', queryText: '$filter=(fieldB/field1) eq (42)' }]);
  });

  it('group by', async () => {
    const expr = pipeExpression(
      oDataCollection<SampleType2>('test'),
      groupAndAggregate({
        fieldA: true,
        fieldB: {
          field1: true,
          field2: true
        }
      })
    );
    console.log(JSON.stringify(expr));
    const result = await executor.execute(expr);

    expect(requests).toEqual([{ collectionName: 'test', queryText: '$apply=groupby((fieldA,fieldB/field1,fieldB/field2))' }]);
  });

  it('group and aggregate', async () => {
    const expr = pipeExpression(
      oDataCollection<SampleType2>('test'),
      groupAndAggregate({
        fieldB: {
          field2: true
        }
      }, {
        //field1Max: aggregateValue(chain('fieldB', 'field1'), funcs.maximum),
        field1Max: func('maximum', map(chain('fieldB', 'field1'))),
        count: funcs.count
      })
    );
    console.log(JSON.stringify(expr));
    const result = await executor.execute(expr);

    expect(requests).toEqual([{ collectionName: 'test', queryText: '$apply=groupby((fieldB/field2),aggregate(fieldB/field1 with max as field1Max,$count as count))' }]);
  });

  it('aggregate', async () => {
    const expr = pipeExpression(
      oDataCollection<SampleType2>('test'),
      groupAndAggregate({}, {
        field1Max: aggregateValue((x) => pipeExpression(x, chain('fieldB', 'field1')), funcs.maximum),
        count: funcs.count
      })
    );
    console.log(JSON.stringify(expr));
    const result = await executor.execute(expr);

    expect(requests).toEqual([{ collectionName: 'test', queryText: '$apply=aggregate(fieldB/field1 with max as field1Max,$count as count)' }]);
  });

  it('group by and filter', async () => {
    const expr = pipeExpression(
      oDataCollection<SampleType2>('test'),
      groupAndAggregate({
        fieldA: true,
        fieldB: {
          field1: true,
          field2: true
        }
      }),
      filter((e) => funcs.equal(pipeExpression(e, field('fieldA')), constant(1)))
    );
    console.log(JSON.stringify(expr));
    const result = await executor.execute(expr);

    expect(requests).toEqual([{ collectionName: 'test', queryText: '$apply=groupby((fieldA,fieldB/field1,fieldB/field2))&$filter=(fieldA) eq (1)' }]);
  });

  it('filter, count, top and select', async () => {
    const expr = pipeExpression(
      oDataCollection<SampleType1>('test'),
      filter((e) => funcs.equal(pipeExpression(e, field('field1')), constant(1))),
      includeCount((e) => pipeExpression(e,
        slice(0, 10),
        querySchema([{
          field2: true
        }])))
    );
    console.log(JSON.stringify(expr));
    const result = await executor.execute(expr);

    expect(requests).toEqual([{ collectionName: 'test', queryText: '$count=true&$filter=(field1) eq (1)&$top=10&$select=field2' }]);
  });

});
