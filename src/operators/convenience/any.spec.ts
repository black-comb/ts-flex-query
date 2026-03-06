import { constant } from '../../expressions/constant';
import { evaluateExpression } from '../../helpers/evaluate-expression';
import { emptyContext } from '../../helpers/evaluation-context-utils';
import { pipeExpression } from '../../helpers/pipe-expression';
import { QueryFactory } from '../../helpers/query-factory';
import { expectType } from '../../helpers/utils';
import { sample1 } from '../../tests/sample-1';
import { SampleType1 } from '../../tests/types/sample-type-1';
import {
  field,
  filter
} from '../basic';
import { any } from './any';
import { func } from './func';
import { value } from './value';

describe('any', () => {
  it('with elements', () => {
    const q = new QueryFactory<SampleType1[]>().create(
      filter(func('lower', field('field1'), value(42))),
      any()
    );
    const result = evaluateExpression(pipeExpression(constant(sample1.obj1s), q), emptyContext);

    expectType<boolean>()(result, true);
    expect(result).toEqual(true);
  });

  it('without elements', () => {
    const q = new QueryFactory<SampleType1[]>().create(
      filter(func('lower', field('field1'), value(1))),
      any()
    );
    const result = evaluateExpression(pipeExpression(constant(sample1.obj1s), q), emptyContext);

    expectType<boolean>()(result, true);
    expect(result).toEqual(false);
  });
});
