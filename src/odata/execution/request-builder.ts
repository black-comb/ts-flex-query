import {
  flatten,
  isEqual
} from 'lodash';

import { Expression } from '../../core/expression';
import { ConstantExpression } from '../../expressions/constant';
import { FieldExpression } from '../../expressions/field';
import { FilterExpression } from '../../expressions/filter';
import {
  FunctionApplicationExpression,
  isFunctionApplication
} from '../../expressions/function-application';
import { GroupExpression } from '../../expressions/group';
import { LetExpression } from '../../expressions/let';
import { MapExpression } from '../../expressions/map';
import { RecordExpression } from '../../expressions/record';
import { SliceExpression } from '../../expressions/slice';
import { SortExpression } from '../../expressions/sort';
import { VariableExpression } from '../../expressions/variable';
import { Aggregation } from '../../functions/aggregation';
import { Internal } from '../../functions/internal';
import {
  assertIsDefined,
  nameOf,
  unexpected
} from '../../helpers/utils';
import { GroupOperator } from '../../operators/basic/group';
import {
  isODataPipeExpression,
  isODataRootExpression,
  ODataExpression
} from '../expressions/odata-expression';
import {
  isODataSerializable,
  ODataAggregate,
  ODataAggregateElement,
  ODataApply,
  oDataDataSetAggregationFunctions,
  oDataFieldAggregationFunctions,
  ODataFilter,
  ODataGroupBy,
  ODataOrderBy,
  ODataRequest,
  ODataSerializable,
  SelectAndExpandRequest
} from '../helpers/definitions';
import { SerializedVariableValues } from '../serialization/types';
import { FunctionSerializer } from './function-serializer';

export class RequestBuilder {

  public readonly result: ODataRequest = {};

  #rootExpression: ODataExpression | undefined;
  public get rootExpression(): ODataExpression | undefined {
    return this.#rootExpression;
  }

  public buildWithPossibleIncludeCount(expression: ODataExpression): { countFieldName: string, elementsFieldName: string } | void {
    // Detect "include count" pattern:
    if (
      expression instanceof LetExpression
      && expression.body instanceof RecordExpression
      && Object.keys(expression.body.fields).length === 2
    ) {
      const entries = Object.entries(expression.body.fields);
      const countFieldIndex: number = entries.findIndex(([_, value]) => value instanceof FunctionApplicationExpression && value.container === Aggregation && value.member === nameOf<typeof Aggregation>()('count'));
      if (countFieldIndex >= 0) {
        const elementsFieldIndex: number = 1 - countFieldIndex;
        const countedExpression: Expression = (entries[countFieldIndex][1] as FunctionApplicationExpression).args[0];
        if (!(countedExpression instanceof VariableExpression) || countedExpression.symbol !== expression.variableSymbol) {
          throw new Error(`Expected expression in count to refer to let variable, but was ${countedExpression.constructor.name}`);
        }
        this.build(entries[elementsFieldIndex][1] as Expression);
        assertIsDefined(this.rootExpression, 'rootExpression is not defined.');
        if (!(this.rootExpression instanceof VariableExpression) || this.rootExpression.symbol !== expression.variableSymbol) {
          throw new Error(`Expected element selector to be based on Let variable, but was ${this.rootExpression.constructor.name}`);
        }
        if (
          this.result.apply?.length
          || this.result.count
          || this.result.filter
          || this.result.orderBy?.length
        ) {
          throw new Error('Only the following operations are permitted after count: select, expand, skip, top');
        }
        this.result.count = true;
        this.build(expression.input);
        return { countFieldName: entries[countFieldIndex][0], elementsFieldName: entries[elementsFieldIndex][0] };
      }
    }

    this.build(expression);
    return undefined;
  }

  /** Applies the given expression to the request. Throws an error if the expression is not OData-compatible. */
  public build(expression: Expression): void {
    let currentExpression: Expression = expression;
    while (isODataPipeExpression(currentExpression)) {
      if (currentExpression instanceof FieldExpression) {
        this.#rootExpression = currentExpression;
        return;
      }
      if (currentExpression instanceof FilterExpression) {
        this.applyFilter(currentExpression);
        currentExpression = currentExpression.input;
      } else if (currentExpression instanceof LetExpression) {
        currentExpression = this.applyLet(currentExpression);
      } else if (currentExpression instanceof MapExpression) {
        currentExpression = this.applyMap(currentExpression);
      } else if (currentExpression instanceof SliceExpression) {
        this.applySlice(currentExpression);
        currentExpression = currentExpression.input;
      } else if (currentExpression instanceof SortExpression) {
        this.applySort(currentExpression);
        currentExpression = currentExpression.input;
      } else {
        //throw new Error(`Unsupported expression: ${currentExpression.constructor.name}`);
        unexpected(currentExpression);
      }
    }

    if (!isODataRootExpression(currentExpression)) {
      throw new Error(`Unexpected root expression: ${currentExpression.constructor.name}`);
    }

    this.#rootExpression = currentExpression;
  }

  private applyFilter(expression: FilterExpression): void {
    const value: string | null = RequestBuilder.serializeExpression(expression.body, { [expression.variableSymbol]: null });
    if (!value) {
      throw new Error('No filter value was provided.');
    }
    const filter: ODataFilter = { value };
    if (this.result.filter || this.result.apply?.length) {
      this.result.apply = [
        { type: 'filter', ...filter },
        ...(this.result.apply ?? [])
      ];
    } else {
      this.result.filter = filter;
    }
  }

  private applyLet(expression: LetExpression): Expression {
    this.build(expression.body);
    if (!(this.rootExpression instanceof VariableExpression) || this.rootExpression.symbol !== expression.variableSymbol) {
      throw new Error('Root of a let expression body must be the let variable.');
    }
    return expression.input;
  }

  private applyMap(expression: MapExpression): Expression {
    if (expression.input instanceof GroupExpression) {
      return this.applyGroup(expression.input, expression.body, expression.variableSymbol);
    }

    if (!(expression.body instanceof RecordExpression)) {
      throw new Error('MapExpression body must be a record.');
    }

    const request = RequestBuilder.createRequestFromRecord(expression.body, expression.variableSymbol);
    Object.assign(this.result, request);
    return expression.input;
  }

  private applyGroup(expression: GroupExpression, mapBody: Expression, mapVariable: symbol): Expression {
    if (!(expression.groupValue instanceof RecordExpression)) {
      throw new Error('Only records are allowed as group values.');
    }

    if (mapBody instanceof FieldExpression && mapBody.field === expression.groupValueField) {
      RequestBuilder.assertExpectedFieldChain(mapBody.input, mapVariable);
      const apply: ODataGroupBy = RequestBuilder.createODataApplyForGroupValue(expression.groupValue, expression.variableSymbol);
      if (apply.fields.length) {
        this.result.apply = [
          apply,
          ...(this.result.apply ?? [])
        ]
      }
    } else if (isFunctionApplication(mapBody, Internal, 'mergeObjects')) {
      RequestBuilder.assertExpectedFieldChain(mapBody.args[0], mapVariable, GroupOperator.groupValueField);
      const mergeArgument: Expression = mapBody.args[1];
      if (!(mergeArgument instanceof RecordExpression)) {
        throw new Error('GroupExpression is mapped to a mergeObjects application with unsupported arguments. Use the groupAndAggregate operator to support OData.');
      }
      const groupBy: ODataGroupBy = RequestBuilder.createODataApplyForGroupValue(expression.groupValue, expression.variableSymbol);
      const aggregate: ODataAggregate = RequestBuilder.createODataApplyForAggregate(mergeArgument, mapVariable);
      let consolidatedApply: ODataApply | undefined;
      if (groupBy.fields.length) {
        groupBy.groupApply = [aggregate];
        consolidatedApply = groupBy;
      } else if (aggregate.elements.length) {
        consolidatedApply = aggregate;
      }
      if (consolidatedApply) {
        this.result.apply = [
          consolidatedApply,
          ...(this.result.apply ?? [])
        ]
      }
    } else {
      throw new Error(`GroupExpression is mapped to unsupported expression ${mapBody.constructor.name}.`);
    }
    return expression.input;
  }

  private static createODataApplyForGroupValue(groupValue: RecordExpression, groupVariable: symbol): ODataGroupBy {
    const recordRequest: SelectAndExpandRequest = RequestBuilder.createRequestFromRecord(groupValue, groupVariable);
    return {
      type: 'groupby',
      fields: RequestBuilder.selectAndExpandRequestToFieldArray(recordRequest, []),
      groupApply: []
    };
  }

  private static createODataApplyForAggregate(record: RecordExpression, groupMapVariable: symbol): ODataAggregate {
    const elements: ODataAggregateElement[] = Object.entries(record.fields)
      .map(([name, value]) => {
        assertIsDefined(value, 'value is not defined.');
        if (!(value instanceof FunctionApplicationExpression)) {
          throw new Error(`Aggregation values must be built using a FunctionApplicationExpression, but was ${value.constructor.name}`)
        }
        const dataSetAggregationFunction: string | undefined = (oDataDataSetAggregationFunctions as any)[value.container.name][value.member];
        if (dataSetAggregationFunction) {
          RequestBuilder.assertExpectedFieldChain(value.args[0], groupMapVariable, GroupOperator.elementsField);
          return {
            name,
            aggregationFunction: dataSetAggregationFunction,
            field: null
          };
        }
        const aggregationFunction: string | undefined = (oDataFieldAggregationFunctions as any)[value.container.name][value.member];
        if (!aggregationFunction) {
          throw new Error(`Unsupported aggregation function: ${value.container.name}.${value.member}`);
        }
        const aggregationFunctionArg: Expression = value.args[0];
        if (!(aggregationFunctionArg instanceof MapExpression)) {
          throw new Error(`Expected a MapExpression as argument for aggregation function ${value.container.name}.${value.member}.`);
        }
        RequestBuilder.assertExpectedFieldChain(aggregationFunctionArg.input, groupMapVariable, GroupOperator.elementsField);
        const { chain, terminatingExpression } = RequestBuilder.getFieldChain(aggregationFunctionArg.body);
        if (!(terminatingExpression instanceof VariableExpression) || terminatingExpression.symbol !== aggregationFunctionArg.variableSymbol) {
          throw new Error(`Unsupported terminating expression for map in aggregation function argument: ${terminatingExpression.constructor.name}`);
        }
        return {
          name,
          aggregationFunction,
          field: chain.join('/')
        };
      });
    return {
      type: 'aggregate',
      elements
    };
  }

  private static selectAndExpandRequestToFieldArray(request: SelectAndExpandRequest, baseChain: string[]): string[] {
    return [
      ...request.select.map((field) => [...baseChain, field].join('/')),
      ...flatten(
        Object.entries(request.expand)
          .map(([field, subRequest]) => RequestBuilder.selectAndExpandRequestToFieldArray(
            { select: [], expand: {}, ...subRequest },
            [...baseChain, field]
          ))
      )
    ];
  }

  private applySlice(expression: SliceExpression): void {
    if (this.result.skip) {
      this.result.skip += expression.skip;
    } else {
      this.result.skip = expression.skip;
    }
    this.result.top = expression.take;
  }

  private applySort(expression: SortExpression): void {
    const oDataSpecs: ODataOrderBy[] = expression.specs.map((spec) => {
      const serializedValue: string | null = RequestBuilder.serializeExpression(spec.value, { [expression.variableSymbol]: null });
      if (serializedValue === null) {
        throw new Error('No sort value was provided.');
      }
      return {
        field: serializedValue,
        mode: spec.isAscending ? 'asc' : 'desc'
      };
    });
    this.result.orderBy = oDataSpecs;
  }

  private static createRequestFromRecord(record: RecordExpression, baseObjectVariableSymbol: symbol, ...expectedFieldChain: string[]): SelectAndExpandRequest {
    const result: SelectAndExpandRequest = {
      select: [],
      expand: {}
    };
    Object.entries(record.fields).forEach(([field, subExpression]) => {
      if (!subExpression) {
        return;
      }
      const fieldResult: ODataRequest | null = RequestBuilder.createFieldRequestFromExpression(subExpression, baseObjectVariableSymbol, ...expectedFieldChain, field);
      if (fieldResult) {
        result.expand[field] = fieldResult;
      } else {
        result.select.push(field);
      }
    });
    return result;
  }


  private static createFieldRequestFromExpression(expression: Expression, baseObjectVariableSymbol: symbol, ...expectedFieldChain: string[]): ODataRequest | null {
    if (expression instanceof FieldExpression || expression instanceof VariableExpression) {
      RequestBuilder.assertExpectedFieldChain(expression, baseObjectVariableSymbol, ...expectedFieldChain);
      return null;
    }

    if (expression instanceof RecordExpression) {
      return RequestBuilder.createRequestFromRecord(expression, baseObjectVariableSymbol, ...expectedFieldChain);
    }

    if (isODataPipeExpression(expression)) {
      const fieldRequestBuilder = new RequestBuilder();
      fieldRequestBuilder.build(expression);
      if (!fieldRequestBuilder.rootExpression) {
        throw new Error(`Root expression for ${expression.constructor.name} was expected.`);
      }
      RequestBuilder.assertExpectedFieldChain(fieldRequestBuilder.rootExpression, baseObjectVariableSymbol, ...expectedFieldChain);
      return fieldRequestBuilder.result;
    }

    throw new Error(`Unexpected expression: ${expression}`);
  }

  private static assertExpectedFieldChain(expression: Expression, baseObjectVariableSymbol: symbol, ...expectedFieldChain: string[]): void {
    const { chain, terminatingExpression } = RequestBuilder.getFieldChain(expression);
    if (!isEqual(chain, expectedFieldChain)) {
      throw new Error(`Expected access to field chain ${expectedFieldChain.join('.')}, but was ${chain.join('.')}`);
    }
    if (!(terminatingExpression instanceof VariableExpression) || terminatingExpression.symbol !== baseObjectVariableSymbol) {
      throw new Error(`Expected access to base object variable ${baseObjectVariableSymbol.toString()}, but was ${terminatingExpression.constructor.name}.`);
    }
  }

  private static getFieldChain(expression: Expression): { chain: string[], terminatingExpression: Expression } {
    const chain: string[] = [];
    let expr: Expression;
    for (expr = expression; expr instanceof FieldExpression; expr = expr.input) {
      chain.push(expr.field);
    }
    chain.reverse();
    return { chain, terminatingExpression: expr };
  }

  /**
   * Serializes an expression to an OData expression.
   * @param serializedVariableValues Maps variable symbols to serialized values or null if this variable represents the current base object.
   * @returns The expression string, or null if the expression refers to the current base object (represented by a variable with serializedVariableValues[V] = null).
   */
  private static serializeExpression(expression: Expression, serializedVariableValues: SerializedVariableValues): string | null {
    if (expression instanceof ConstantExpression) {
      if (!isODataSerializable(expression.value)) {
        throw new Error(`Unserializable value: ${expression.value}`);
      }
      return RequestBuilder.serializeValue(expression.value);
    }
    if (expression instanceof FieldExpression) {
      const inputResult: string | null = RequestBuilder.serializeExpression(expression.input, serializedVariableValues);
      return inputResult ? `${inputResult}/${expression.field}` : expression.field;
    }
    if (expression instanceof FunctionApplicationExpression) {
      const serializer = new FunctionSerializer((expr, variables) => this.serializeExpression(expr, variables), serializedVariableValues);
      return serializer.serialize(expression);
    }
    if (expression instanceof VariableExpression) {
      const variableValue: string | undefined | null = (serializedVariableValues as any)[expression.symbol]; // [MaMa] Remove cast to any for TypeScript 4.5.
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
          return `(${value.map(RequestBuilder.serializeValue).join(',')})`;
        }
        return unexpected(value);
      case 'undefined':
        return 'null';
      default:
        return unexpected(value);
    }
  }
}
