import {
  SpecificSchemaSpec,
  ValidSchemaSpec
} from '../operators/convenience/query-schema';

export class SchemaFactory<in T> {

  // eslint-disable-next-line class-methods-use-this
  public create<TSchema extends SpecificSchemaSpec<T, null>>(
    schema: TSchema extends ValidSchemaSpec<T, TSchema> ? TSchema : ValidSchemaSpec<T, TSchema>
  ): TSchema extends ValidSchemaSpec<T, TSchema> ? TSchema : ValidSchemaSpec<T, TSchema> {
    return schema;
  }

}
