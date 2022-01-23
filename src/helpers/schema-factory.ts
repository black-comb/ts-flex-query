import { SpecificSchemaSpec, ValidSchemaSpec } from '../operators/convenience/query-schema';

export class SchemaFactory<T> {

  public create<TSchema extends SpecificSchemaSpec<T, null>>(
    schema: TSchema extends ValidSchemaSpec<T, TSchema> ? TSchema : ValidSchemaSpec<T, TSchema>
  ): TSchema extends ValidSchemaSpec<T, TSchema> ? TSchema : ValidSchemaSpec<T, TSchema> {
    return schema;
  }

}
