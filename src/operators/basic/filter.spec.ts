import { constant } from '../../expressions/constant';
import { evaluateExpression } from '../../helpers/evaluate-expression';
import { emptyContext } from '../../helpers/evaluation-context-utils';
import { pipeExpression } from '../../helpers/pipe-expression';
import { QueryFactory } from '../../helpers/query-factory';
import { expectType } from '../../helpers/utils';
import { sample1 } from '../../tests/sample-1';
import { SampleType1 } from '../../tests/types/sample-type-1';
import { SampleType2 } from '../../tests/types/sample-type-2';
import { not } from '../convenience/boolean';
import { chain } from '../convenience/chain';
import { func } from '../convenience/func';
import { value } from '../convenience/value';
import { field } from './field';
import {
  filter,
  filterDefined
} from './filter';

describe('filter', () => {
  it('by equality', () => {
    const q = new QueryFactory<SampleType1[]>().create(
      filter(func('equal', field('field1'), value(42)))
    );
    const result: SampleType1[] = evaluateExpression(pipeExpression(constant(sample1.obj1s), q), emptyContext);

    expect(result).toEqual([sample1.obj1s[1], sample1.obj1s[3]]);
  });

  it('by equality for chain', () => {
    const q = new QueryFactory<SampleType2[]>().create(
      filter(func('equal', chain('fieldB', 'field1'), value(1)))
    );
    const result: SampleType2[] = evaluateExpression(pipeExpression(constant(sample1.obj2s), q), emptyContext);

    expect(result).toEqual(sample1.obj2s);
  });

  it('by negated startsWith', () => {
    const q = new QueryFactory<SampleType1[]>().create(
      filter(not(func('startsWith', field('field2'), value('A'))))
    );
    const result: SampleType1[] = evaluateExpression(pipeExpression(constant(sample1.obj1s), q), emptyContext);

    expect(result).toEqual([sample1.obj1s[1], sample1.obj1s[2], sample1.obj1s[3]]);
  });

  describe('filterDefined', () => {
    it('filters correctly', () => {
      const expr = pipeExpression(constant([undefined, sample1.obj1]), filterDefined());
      const result = evaluateExpression(expr);

      expect(result).toEqual([sample1.obj1]);
      expectType<SampleType1[]>()(result, true);
    });
  });
});
