import { constant } from '../../expressions/constant';
import { evaluateExpression } from '../../helpers/evaluate-expression';
import { emptyContext } from '../../helpers/evaluation-context-utils';
import { pipeExpression } from '../../helpers/pipe-expression';
import { QueryFactory } from '../../helpers/query-factory';
import { expectType } from '../../helpers/utils';
import { sample1 } from '../../tests/sample-1';
import { SampleType1 } from '../../tests/types/sample-type-1';
import {
  func,
  value
} from '../convenience';
import { field } from './field';
import {
  ifThen,
  ifThenElse
} from './if';

describe('if', () => {
  it('ifThen', () => {
    const q = new QueryFactory<SampleType1>().create(
      ifThen(func('equal', field('field1'), value(1)), field('field2'))
    );
    const result = evaluateExpression(pipeExpression(constant(sample1.obj1), q), emptyContext);

    expect(result).toEqual('ABC');

    expectType<string | undefined>()(result, true);
  });

  it('ifThenElse', () => {
    const q = new QueryFactory<SampleType1>().create(
      ifThenElse(func('equal', field('field1'), value(1)), field('field2'), field('field3'))
    );
    const result = evaluateExpression(pipeExpression(constant(sample1.obj1), q), emptyContext);

    expect(result).toEqual('ABC');

    expectType<string | number | undefined>()(result, true);
  });
});
