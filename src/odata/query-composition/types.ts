import { ODataRequest } from '../helpers/definitions';

export type SerializableType = string | number | boolean;

export interface DefaultQueryParts {
  apply: string;
  count: boolean;
  filter: string;
  orderBy: string;
  skip: number;
  top: number;
  select: string;
  expand: string;
}

export type PrefixedDefaultQueryParts = {
  [TKey in keyof DefaultQueryParts as `$${TKey}`]: DefaultQueryParts[TKey];
};

export type QueryParts = PrefixedDefaultQueryParts & Record<string, SerializableType>;

interface CustomQueryComposerParams {
  /** The processed ODataRequest. */
  request: ODataRequest;
  /** The query parts created by the default composer. */
  defaultParts: Partial<QueryParts>;
}

/** A custom query composer. */
/**
   * Creates the query parts.
   * This is usually the defaultParts created by the default composer and contained in the CustomQueryComposerParams,
   * extended with additional parameters.
   */
export type ODataCustomQueryComposer = (params: CustomQueryComposerParams) => Partial<QueryParts>;
