import {
  flatten,
  isEqual
} from 'lodash';

import { Expression } from '../../core/expression';
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
import { SpecifyTypeExpression } from '../../expressions/specify-type';
import { VariableExpression } from '../../expressions/variable';
import { aggregation } from '../../functions/aggregation';
import { internal } from '../../functions/internal';
import { getFunctionContainerName } from '../../functions/main';
import {
  assertIsDefined,
  nameOf
} from '../../helpers/utils';
import { unwrapLetIfDefined } from '../../operators';
import { GroupOperator } from '../../operators/basic/group';
import { isExpansionDataType } from '../../types';
import {
  isODataRootExpression,
  ODataRootExpression
} from '../expressions/odata-root-expression';
import {
  ODataAggregate,
  ODataAggregateElement,
  ODataApply,
  oDataDataSetAggregationFunctions,
  oDataFieldAggregationFunctions,
  ODataFilter,
  ODataGroupBy,
  ODataOrderBy,
  ODataRequest,
  SelectAndExpandRequest
} from '../helpers/definitions';
import { ExpressionSerializer } from '../serialization/expression-serializer';
import {
  ExpressionHandlerResult,
  ODataExpressionHandler
} from './odata-expression-handler';

interface RequestBuilderParams {
  expressionHandler?: ODataExpressionHandler;
}

export class RequestBuilder {

  public result: ODataRequest = {};

  #rootExpression: ODataRootExpression | undefined;
  public get rootExpression(): ODataRootExpression | undefined {
    return this.#rootExpression;
  }

  public constructor(private readonly params: RequestBuilderParams) {
  }

  public buildWithPossibleIncludeCount(expression: Expression): { countFieldName: string, elementsFieldName: string } | void {
    // Detect "include count" pattern:
    if (
      expression instanceof LetExpression
      && expression.body instanceof RecordExpression
      && Object.keys(expression.body.fields).length === 2
    ) {
      const entries = Object.entries(expression.body.fields);
      const countFieldIndex: number = entries.findIndex(
        ([_, value]) =>
          value instanceof FunctionApplicationExpression
          && value.container === aggregation
          && value.member === nameOf<typeof aggregation>()('count')
      );
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
    while (!isODataRootExpression(currentExpression)) {
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
      } else if (currentExpression instanceof SpecifyTypeExpression) {
        currentExpression = currentExpression.input;
      } else {
        const customResult: ExpressionHandlerResult | null | undefined = this.params.expressionHandler?.({ expression: currentExpression, currentRequest: this.result });
        if (customResult) {
          currentExpression = customResult.innerExpression;
          this.result = customResult.newRequest;
        } else {
          throw new Error(`Unsupported expression: ${currentExpression.constructor.name}`);
        }
      }
    }

    this.#rootExpression = currentExpression;
  }

  private applyFilter(expression: FilterExpression): void {
    const value: string | null = ExpressionSerializer.serializeExpression(expression.body, { [expression.variableSymbol]: null });
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

    const request = this.createRequestFromRecord(expression.body, expression.variableSymbol);
    Object.assign(this.result, request);
    return expression.input;
  }

  private applyGroup(expression: GroupExpression, mapBody: Expression, mapVariable: symbol): Expression {
    return this.applyGroupForValue(expression, expression.groupValue, expression.variableSymbol, mapBody, mapVariable);
  }

  private applyGroupForValue(expression: GroupExpression, groupValue: Expression, groupVariableSymbol: symbol, mapBody: Expression, mapVariable: symbol): Expression {
    const unwrapLetIfDefinedResult = unwrapLetIfDefined(groupValue);
    if (unwrapLetIfDefinedResult) {
      RequestBuilder.assertExpectedFieldChain(unwrapLetIfDefinedResult.baseExpression, groupVariableSymbol);
      return this.applyGroupForValue(
        expression,
        unwrapLetIfDefinedResult.body,
        unwrapLetIfDefinedResult.baseExpressionVariableSymbol,
        mapBody,
        mapVariable
      );
    }

    if (!(groupValue instanceof RecordExpression)) {
      throw new Error('Only records are allowed as group values.');
    }

    if (mapBody instanceof FieldExpression && mapBody.field === expression.groupValueField) {
      RequestBuilder.assertExpectedFieldChain(mapBody.input, mapVariable);
      const apply: ODataGroupBy = this.createODataApplyForGroupValue(groupValue, groupVariableSymbol);
      if (apply.fields.length) {
        this.result.apply = [
          apply,
          ...(this.result.apply ?? [])
        ];
      }
    } else if (isFunctionApplication(mapBody, internal, 'mergeObjects')) {
      RequestBuilder.assertExpectedFieldChain(mapBody.args[0], mapVariable, GroupOperator.groupValueField);
      const mergeArgument: Expression = mapBody.args[1];
      if (!(mergeArgument instanceof RecordExpression)) {
        throw new Error('GroupExpression is mapped to a mergeObjects application with unsupported arguments. Use the groupAndAggregate operator to support OData.');
      }
      const groupBy: ODataGroupBy = this.createODataApplyForGroupValue(groupValue, groupVariableSymbol);
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
        ];
      }
    } else {
      throw new Error(`GroupExpression is mapped to unsupported expression ${mapBody.constructor.name}.`);
    }
    return expression.input;
  }

  private createODataApplyForGroupValue(groupValue: RecordExpression, groupVariable: symbol): ODataGroupBy {
    const recordRequest: SelectAndExpandRequest = this.createRequestFromRecord(groupValue, groupVariable);
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
          throw new Error(`Aggregation values must be built using a FunctionApplicationExpression, but was ${value.constructor.name}`);
        }
        const containerName = getFunctionContainerName(value.container);
        if (!containerName) {
          throw new Error(`Unsupported aggregation function container: ${containerName}`);
        }
        const dataSetAggregationFunction: string | undefined = (oDataDataSetAggregationFunctions as any)[containerName][value.member];
        if (dataSetAggregationFunction) {
          RequestBuilder.assertExpectedFieldChain(value.args[0], groupMapVariable, GroupOperator.elementsField);
          return {
            name,
            aggregationFunction: dataSetAggregationFunction,
            field: null
          };
        }
        const aggregationFunction: string | undefined = (oDataFieldAggregationFunctions as any)[containerName][value.member];
        if (!aggregationFunction) {
          throw new Error(`Unsupported aggregation function: ${containerName}.${value.member}`);
        }
        const aggregationFunctionArg: Expression = value.args[0];
        if (!(aggregationFunctionArg instanceof MapExpression)) {
          throw new Error(`Expected a MapExpression as argument for aggregation function ${containerName}.${value.member}.`);
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
      const serializedValue: string | null = ExpressionSerializer.serializeExpression(spec.value, { [expression.variableSymbol]: null });
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

  private createRequestFromRecord(record: RecordExpression, baseObjectVariableSymbol: symbol, ...expectedFieldChain: string[]): SelectAndExpandRequest {
    const result: SelectAndExpandRequest = {
      select: [],
      expand: {}
    };
    Object.entries(record.fields).forEach(([field, subExpression]) => {
      if (!subExpression) {
        return;
      }
      const fieldChain: string[] = [...expectedFieldChain, field];
      const fieldResult: ODataRequest | 'select' | 'expand' | null = this.createFieldRequestFromExpression(subExpression, baseObjectVariableSymbol, ...fieldChain);
      if (fieldResult === 'select') {
        result.select.push(field);
      } else {
        result.expand[field] = fieldResult === 'expand' ? null : fieldResult;
      }
    });
    return result;
  }


  private createFieldRequestFromExpression(expression: Expression, baseObjectVariableSymbol: symbol, ...expectedFieldChain: string[]): ODataRequest | 'select' | 'expand' | null {
    const underlyingExpression: Expression = RequestBuilder.getUnderlyingExpression(expression);
    if (underlyingExpression instanceof FieldExpression || underlyingExpression instanceof VariableExpression) {
      RequestBuilder.assertExpectedFieldChain(underlyingExpression, baseObjectVariableSymbol, ...expectedFieldChain);
      return isExpansionDataType(expression.dataType) && (expression.dataType.isExpandable ?? true)
        ? 'expand'
        : 'select';
    }

    const unwrapLetIfDefinedResult = unwrapLetIfDefined(underlyingExpression);
    if (unwrapLetIfDefinedResult) {
      RequestBuilder.assertExpectedFieldChain(unwrapLetIfDefinedResult.baseExpression, baseObjectVariableSymbol, ...expectedFieldChain);
      return this.createFieldRequestFromExpression(unwrapLetIfDefinedResult.body, unwrapLetIfDefinedResult.baseExpressionVariableSymbol);
    }

    if (underlyingExpression instanceof LetExpression) {
      return RequestBuilder.applyLet(underlyingExpression, baseObjectVariableSymbol, expectedFieldChain, this.createFieldRequestFromExpression.bind(this));
    }

    if (underlyingExpression instanceof RecordExpression) {
      return this.createRequestFromRecord(underlyingExpression, baseObjectVariableSymbol, ...expectedFieldChain);
    }

    const fieldRequestBuilder = new RequestBuilder(this.params);
    fieldRequestBuilder.build(underlyingExpression);
    if (!fieldRequestBuilder.rootExpression) {
      throw new Error(`Root expression for ${underlyingExpression.constructor.name} was expected.`);
    }
    RequestBuilder.assertExpectedFieldChain(fieldRequestBuilder.rootExpression, baseObjectVariableSymbol, ...expectedFieldChain);
    return fieldRequestBuilder.result;
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

  private static getUnderlyingExpression<T extends Expression>(expression: T): Exclude<T, SpecifyTypeExpression> {
    return (expression instanceof SpecifyTypeExpression ? RequestBuilder.getUnderlyingExpression(expression.input) : expression) as Exclude<T, SpecifyTypeExpression>;
  }

  private static applyLet<T>(
    expression: LetExpression,
    baseObjectVariableSymbol: symbol,
    currentExpectedFieldChain: string[],
    continuation: (body: Expression, baseObjectVariableSymbol: symbol, ...expectedFieldChain: string[]) => T
  ): T {
    RequestBuilder.assertExpectedFieldChain(expression.input, baseObjectVariableSymbol, ...currentExpectedFieldChain);
    return continuation(expression.body, expression.variableSymbol);
  }
}
