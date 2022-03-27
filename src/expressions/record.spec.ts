import { evaluateExpression } from '../helpers/evaluate-expression';
import { emptyContext } from '../helpers/evaluation-context-utils';
import { pipeExpression } from '../helpers/pipe-expression';
import { apply } from '../operators/basic/apply';
import { field } from '../operators/basic/field';
import { map } from '../operators/basic/map';
import { sample1 } from '../tests/sample-1';
import { SampleType1 } from '../tests/types/sample-type-1';
import {
  DataType,
  DataTypeType
} from '../types/data-type';
import { constant } from './constant';
import { MapExpression } from './map';
import {
  record,
  RecordExpression
} from './record';

describe('record', () => {
  it('map array to record', () => {
    const expr1 = constant<SampleType1[]>([sample1.obj1]);
    const expr2 = pipeExpression(
      expr1,
      map((x) => record({
        a: constant(3),
        field2: pipeExpression(x, field('field2')),
        x: pipeExpression(x, field('field3'))
      }))
    );
    const result = evaluateExpression(expr2, emptyContext);
    const expectedType: DataType = {
      type: DataTypeType.array,
      elementType: {
        type: DataTypeType.object, fields: { a: { type: DataTypeType.number }, field2: { type: DataTypeType.string }, x: { type: DataTypeType.undefined } }
      }
    };

    expect(expr2 instanceof MapExpression).toBeTruthy();
    expect(expr2.dataType).toEqual(expectedType);
    expect(result).toEqual([{ a: 3, field2: 'ABC', x: undefined }]);
  });

  it('map object to record', () => {
    const expr1 = constant<SampleType1>(sample1.obj1);
    const expr2 = pipeExpression(
      expr1,
      apply(() => record({ a: constant(3) }))
    );
    const result = evaluateExpression(expr2, emptyContext);
    const expectedType: DataType = { type: DataTypeType.object, fields: { a: { type: DataTypeType.number } } };

    expect(expr2 instanceof RecordExpression).toBeTruthy();
    expect(expr2.dataType).toEqual(expectedType);
    expect(result).toEqual({ a: 3 });
  });
});
