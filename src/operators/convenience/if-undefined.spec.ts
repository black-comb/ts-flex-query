import { constant } from '../../expressions';
import {
  evaluateExpression,
  pipeExpression
} from '../../helpers';
import { expectType } from '../../helpers/utils';
import { sample1 } from '../../tests/sample-1';
import { field } from '../basic';
import { ifUndefined } from './if-undefined';

describe('ifUndefined', () => {
  it('for undefined', () => {
    const expr = pipeExpression(
      constant(sample1.obj1),
      field('field3'),
      ifUndefined(constant(55))
    );
    const result = evaluateExpression(expr);

    expect(result).toEqual(55);
    expectType<number>()(result, true);
  });

  it('for defined', () => {
    const expr = pipeExpression(
      constant(sample1.obj1s[1]),
      field('field3'),
      ifUndefined(constant(55))
    );
    const result = evaluateExpression(expr);

    expect(result).toEqual(sample1.obj1s[1].field3);
    expectType<number>()(result, true);
  });
});
