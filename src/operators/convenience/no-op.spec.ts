import { constant } from '../../expressions/constant';
import {
  emptyContext,
  evaluateExpression,
  pipeExpression,
  QueryFactory
} from '../../helpers';
import { sample1 } from '../../tests/sample-1';
import { SampleType1 } from '../../tests/types/sample-type-1';
import { field } from '../basic/field';
import { noOp } from './no-op';

describe('noOp', () => {
  it('object input', () => {
    const q = new QueryFactory<SampleType1>().create(
      noOp()
    );
    const result = evaluateExpression(pipeExpression(constant(sample1.obj1), q), emptyContext);

    expect(result).toBe(sample1.obj1);
  });

  it('primitive input', () => {
    const q = new QueryFactory<SampleType1>().create(
      field('field2'),
      noOp()
    );
    const result = evaluateExpression(pipeExpression(constant(sample1.obj1), q), emptyContext);

    expect(result).toBe('ABC');
  });
});
