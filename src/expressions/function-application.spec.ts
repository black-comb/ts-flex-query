import { comparison } from '../functions/comparison';
import { evaluateExpression } from '../helpers/evaluate-expression';
import { emptyContext } from '../helpers/evaluation-context-utils';
import { expectType } from '../helpers/utils';
import { constant } from './constant';
import {
  func,
  funcs
} from './function-application';

describe('FunctionApplicationExpression', () => {
  it('equal', () => {
    const expr1 = func(comparison, 'equal', constant(42), constant(42));
    const expr2 = func(comparison, 'equal', constant(41), constant(42));
    const expr3 = funcs.equal(constant(42), constant(42));
    const result1 = evaluateExpression(expr1, emptyContext);
    const result2 = evaluateExpression(expr2, emptyContext);
    const result3 = evaluateExpression(expr3, emptyContext);

    expect(result1).toBe(true);
    expect(result2).toBe(false);
    expect(result3).toBe(true);

    expectType<boolean>()(result1, true);
    expectType<boolean>()(result2, true);
    expectType<boolean>()(result3, true);
  });

  it('upperCase', () => {
    const expr = funcs.upperCase(constant('test'));
    const result = evaluateExpression(expr, emptyContext);

    expect(result).toBe('TEST');

    expectType<string | undefined>()(result, true);
  });
});
