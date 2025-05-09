import { PipeOperator } from '../../core/pipe-operator';
import { pipeExpression } from '../../helpers/pipe-expression';
import { QueryFactory } from '../../helpers/query-factory';
import { field } from '../basic/field';
import {
  groupBy,
  GroupOperator
} from '../basic/group';
import { map } from '../basic/map';
import {
  merge,
  MergeOutType
} from './merge';
import { noOp } from './no-op';
import {
  createOperatorForSchema,
  SchemaSpec,
  SchemaType,
  SpecificSchemaSpec,
  ValidSchemaSpec
} from './query-schema';
import {
  record,
  RecordOutType,
  RecordSpec
} from './record';

type GroupAndAggregateOutType<TIn, TSchema extends SchemaSpec, TAggregations extends RecordSpec<TIn[]> | undefined> =
  SchemaType<TIn, TSchema> extends Record<string, any>
    ? (undefined extends TAggregations
      ? SchemaType<TIn, TSchema>
      : MergeOutType<
        SchemaType<TIn, TSchema>,
        RecordOutType<TIn[], NonNullable<TAggregations>>
      >)[]
    : never;

export function groupAndAggregate<TIn, TSchema extends SpecificSchemaSpec<TIn, null>, TAggregations extends RecordSpec<NoInfer<TIn>[]> | undefined>(
  groupValueSchema: TSchema extends infer T ? T extends ValidSchemaSpec<NoInfer<TIn>, TSchema> ? TSchema : ValidSchemaSpec<NoInfer<TIn>, TSchema> : never,
  aggregates?: TAggregations
): PipeOperator<TIn[], GroupAndAggregateOutType<TIn, TSchema, TAggregations>> {
  return new QueryFactory<TIn[]>().create(
    groupBy(createOperatorForSchema(groupValueSchema, null)),
    map((group) => pipeExpression(
      group,
      field(GroupOperator.groupValueField),
      aggregates
        ? merge(pipeExpression(
          group,
          field(GroupOperator.elementsField),
          record(aggregates)
        ))
        : noOp()
    ))
  ) as any;
}
