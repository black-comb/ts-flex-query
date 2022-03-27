import { constant } from '../../expressions/constant';
import { funcs } from '../../expressions/function-application';
import { evaluateExpression } from '../../helpers/evaluate-expression';
import { emptyContext } from '../../helpers/evaluation-context-utils';
import { pipeExpression } from '../../helpers/pipe-expression';
import { QueryFactory } from '../../helpers/query-factory';
import { sample1 } from '../../tests/sample-1';
import { SampleType1 } from '../../tests/types/sample-type-1';
import { field } from '../basic/field';
import { aggregateValue } from './aggregate-value';
import { func } from './func';
import { groupAndAggregate } from './group-and-aggregate';
import { noOp } from './no-op';
import { value } from './value';

describe('groupAndAggregate', () => {
  it('group by single-field record', () => {
    const q = new QueryFactory<SampleType1[]>().create(
      groupAndAggregate(
        { field1: true },
        {
          // field3Max: aggregateValue('field3', funcs.maximum),
          // Equivalent:
          field3Max: aggregateValue(func('subtract', field('field3'), value(0)), func('add', value(0), func('maximum', noOp()))),
          field3Min: aggregateValue('field3', funcs.minimum),
          count: funcs.count
        }
      )
    );
    const result = evaluateExpression(pipeExpression(constant(sample1.obj1s), q), emptyContext);

    expect(result).toEqual([
      {
        field1: 1,
        field3Min: undefined,
        field3Max: undefined,
        count: 1
      },
      {
        field1: 42,
        field3Min: 13,
        field3Max: 15,
        count: 2
      },
      {
        field1: 41,
        field3Min: 11,
        field3Max: 11,
        count: 1
      }
    ])
  });

  it('group by rempty record', () => {
    const q = new QueryFactory<SampleType1[]>().create(
      groupAndAggregate({}, {
        count: funcs.count,
        field1Max: aggregateValue('field1', funcs.maximum)
      })
    );
    const result = evaluateExpression(pipeExpression(constant(sample1.obj1s), q), emptyContext);

    expect(result).toEqual([{
      count: 4,
      field1Max: 42
    }]);
  });
});
