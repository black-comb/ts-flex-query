import { Expression } from '../../core';
import {
  ConstantExpression,
  FieldExpression,
  FunctionApplicationExpression,
  VariableExpression
} from '../../expressions';
import { unexpected } from '../../helpers/utils';
import {
  isODataSerializable,
  ODataSerializable
} from '../helpers/definitions';
import { FunctionSerializer } from './function-serializer';
import { SerializedVariableValues } from './types';

export class ExpressionSerializer {
  /**
   * Serializes an expression to an OData expression.
   * @param serializedVariableValues Maps variable symbols to serialized values or null if this variable represents the current base object.
   * @returns The expression string, or null if the expression refers to the current base object (represented by a variable with serializedVariableValues[V] = null).
   */
  public static serializeExpression(expression: Expression, serializedVariableValues: SerializedVariableValues): string | null {
    if (expression instanceof ConstantExpression) {
      if (!isODataSerializable(expression.value)) {
        throw new Error(`Unserializable value: ${expression.value}`);
      }
      return ExpressionSerializer.serializeValue(expression.value);
    }
    if (expression instanceof FieldExpression) {
      const inputResult: string | null = ExpressionSerializer.serializeExpression(expression.input, serializedVariableValues);
      return inputResult ? `${inputResult}/${expression.field}` : expression.field;
    }
    if (expression instanceof FunctionApplicationExpression) {
      const serializer = new FunctionSerializer((expr, variables) => ExpressionSerializer.serializeExpression(expr, variables), serializedVariableValues);
      return `(${serializer.serialize(expression)})`;
    }
    if (expression instanceof VariableExpression) {
      const variableValue: string | undefined | null = (serializedVariableValues)[expression.symbol];
      if (variableValue === undefined) {
        throw new Error(`Access to undefined variable: ${expression.symbol.toString()}`);
      }
      return variableValue;
    }

    throw new Error(`Unsupported expression: ${expression.constructor.name}`);
  }

  private static serializeValue(value: ODataSerializable): string {
    switch (typeof value) {
      case 'string':
        return `'${value}'`;
      case 'symbol':
        return `'${String(value)}'`;
      case 'number':
      case 'bigint':
      case 'boolean':
        return value.toString();
      case 'object':
        if (value === null) {
          return 'null';
        } else if (value instanceof Date) {
          return value.toISOString();
        }
        if (Array.isArray(value)) {
          return `(${value.map(ExpressionSerializer.serializeValue).join(',')})`;
        }
        return unexpected(value);
      case 'undefined':
        return 'null';
      default:
        return unexpected(value);
    }
  }
}
