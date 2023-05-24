import { Expression } from '../../core/expression';
import { FunctionApplicationExpression } from '../../expressions/function-application';
import {
  functionContainers,
  getFunctionContainerName
} from '../../functions/main';
import {
  ArrayOf,
  FuncFields
} from '../../types/utils';
import { oDataDataSetAggregationFunctions } from '../helpers/definitions';
import { SerializedVariableValues } from './types';

type FunctionSerializerFunction<TFunc extends (...args: any) => any> =
  ((...args: ArrayOf<Parameters<TFunc>, string>) => string) | null;
type ContainerSerializers<TContainer> = {
  [TMember in FuncFields<TContainer>]: TContainer extends { [TKey in TMember]: (...args: any) => any }
  ? FunctionSerializerFunction<TContainer[TMember]>
  : never
};

const serializers: { [TContainer in keyof typeof functionContainers]: ContainerSerializers<(typeof functionContainers)[TContainer]> } = {
  aggregation: {
    count: (collection) => (collection ? `${collection}/` : '') + oDataDataSetAggregationFunctions.aggregation?.count ?? '',
    maximum: null,
    minimum: null,
    average: null,
    countDistinct: null,
    sum: null
  },
  boolean: {
    and: (v1, v2) => `${v1} and ${v2}`,
    or: (v1, v2) => `${v1} or ${v2}`,
    not: (v) => `not ${v}`,
    xor: (v1, v2) => `(${v1} and not ${v2}) or (not ${v1} and ${v2})`
  },
  collections: {
    in: (v1, v2) => `${v1} in ${v2}`,
    distinct: null,
    first: null
  },
  comparison: {
    equal: (v1, v2) => `${v1} eq ${v2}`,
    notEqual: (v1, v2) => `${v1} ne ${v2}`,
    greater: (v1, v2) => `${v1} gt ${v2}`,
    greaterOrEqual: (v1, v2) => `${v1} ge ${v2}`,
    has: (v1, v2) => `${v1} has ${v2}`,
    lower: (v1, v2) => `${v1} lt ${v2}`,
    lowerOrEqual: (v1, v2) => `${v1} le ${v2}`
  },
  internal: {
    ifUndefined: null,
    mergeObjects: null
  },
  mathematics: {
    add: (v1, v2) => `${v1} add ${v2}`,
    subtract: (v1, v2) => `${v1} sub ${v2}`,
    multiply: (v1, v2) => `${v1} mul ${v2}`,
    divide: (v1, v2) => `${v1} divby ${v2}`,
    divideInteger: (v1, v2) => `${v1} div ${v2}`,
    modulo: (v1, v2) => `${v1} mod ${v2}`
  },
  text: {
    concat: (v1, v2) => `concat(${v1}, ${v2})`,
    startsWith: (v1, v2) => `startswith(${v1}, ${v2})`,
    endsWith: (v1, v2) => `endswith(${v1}, ${v2})`,
    lowerCase: (v) => `tolower(${v})`,
    upperCase: (v) => `toupper(${v})`,
    contains: (v1, v2) => `contains(${v1}, ${v2})`,
    indexOf: (v1, v2) => `indexof(${v1}, ${v2})`,
    getLength: (v) => `length(${v})`
  }
};

export class FunctionSerializer {

  public constructor(
    private readonly baseSerializer: (expr: Expression, variables: SerializedVariableValues) => string | null,
    private readonly initialVariables: SerializedVariableValues
  ) {
  }

  public serialize(expr: FunctionApplicationExpression): string {
    const containerName = getFunctionContainerName(expr.container);
    if (!containerName) {
      throw new Error(`Function container ${expr.container.constructor.name} is not supported. Member: ${expr.member}`);
    }
    const serializer: FunctionSerializerFunction<any> = (serializers[containerName] as any)[expr.member];
    if (!serializer) {
      throw new Error(`Function ${expr.container.constructor.name}.${expr.member} is not supported.`);
    }
    return serializer(...expr.args.map((e) => this.serializeExpectNotNull(e)));
  }

  private serializeExpectNotNull(expression: Expression, variables?: SerializedVariableValues): string {
    const result: string | null = this.baseSerializer(expression, variables ?? this.initialVariables);
    if (!result) {
      throw new Error(`Expected serialized value to be not null for expression ${expression.constructor.name}.`);
    }
    return result;
  }
}
