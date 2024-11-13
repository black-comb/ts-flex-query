import { merge } from 'lodash';

import { Expression } from '../core/expression';
import {
  getContainerFunctionKeys,
  publicFunctionContainers
} from '../functions/main';
import { evaluateExpression } from '../helpers/evaluate-expression';
import { createObjectFromArray } from '../helpers/utils';
import {
  DataType,
  DataTypeType
} from '../types/data-type';
import { EvaluationContext } from '../types/evaluation-context';
import { FunctionContainer } from '../types/function-container';
import {
  ExpressionArray,
  FuncFields,
  UnionToIntersection
} from '../types/utils';

export class FunctionApplicationExpression implements Expression {
  public readonly dataType: DataType = { type: DataTypeType.unknown };

  public constructor(
    public readonly container: FunctionContainer,
    public readonly member: string,
    public readonly args: Expression[]
  ) {
  }

  public evaluate(context: EvaluationContext): any {
    return this.container[this.member](...this.args.map((arg) => evaluateExpression(arg, context)));
  }
}

type ContainerMemberFunction<TContainer, TMember extends FuncFields<TContainer> & string> =
  TContainer extends Record<TMember, (...args: any) => any>
    ? (...args: ExpressionArray<Parameters<TContainer[TMember]>>) => Expression<ReturnType<TContainer[TMember]>>
    : never;

export function func<TContainer extends FunctionContainer, TMember extends FuncFields<TContainer> & string>(
  container: TContainer,
  member: TMember,
  ...args: TContainer extends Record<TMember, (...xs: any) => any> ? ExpressionArray<Parameters<TContainer[TMember]>> : never
): TContainer extends Record<TMember, (...xs: any) => any> ? Expression<ReturnType<TContainer[TMember]>> : never {
  return new FunctionApplicationExpression(container, member, args) as any;
}

function createFunctionExpressionFactory<TContainer extends FunctionContainer, TMember extends FuncFields<TContainer> & string>(
  container: TContainer,
  member: TMember
): ContainerMemberFunction<TContainer, TMember> {
  return ((...args: Expression<any>[]) => func(container, member, ...(args as any))) as any;
}

function createFunctionExpressionFactories<TContainer extends FunctionContainer>(container: TContainer): {
  [TMember in FuncFields<TContainer> & string]: ContainerMemberFunction<TContainer, TMember>
} {
  const relevantKeys = getContainerFunctionKeys(container);
  return createObjectFromArray(
    relevantKeys,
    (key) => key,
    (key) => createFunctionExpressionFactory(container, key as any)
  ) as any;
}

function createFunctionExpressionFactoriesForContainers<TContainerSpec extends Record<string, FunctionContainer>>(
  spec: TContainerSpec
): { [TMember in FuncFields<UnionToIntersection<TContainerSpec[keyof TContainerSpec]>> & string]: ContainerMemberFunction<UnionToIntersection<TContainerSpec[keyof TContainerSpec]>, TMember> } {
  const factories = {};
  return merge(factories, ...Object.values(spec).map(createFunctionExpressionFactories)) as any;
}

export const funcs = createFunctionExpressionFactoriesForContainers(publicFunctionContainers);

export function isFunctionApplication<TContainer>(expr: Expression, container: TContainer, member: keyof TContainer): expr is FunctionApplicationExpression {
  return expr instanceof FunctionApplicationExpression && expr.container === container && expr.member === member;
}
