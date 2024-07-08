# ts-flex-query

[![npm version](https://badge.fury.io/js/ts-flex-query.svg)](https://www.npmjs.com/package/ts-flex-query)

Define flexible and type-safe data queries and execute them against in-memory JS data (arrays and objects), an OData endpoint or an arbitrary data source using a custom query executor.

## Sample

```TS
// 1. Define the query:
const query = new QueryFactory<Person[]>().create(
  filter(func('contains', field('name'), value('Müller'))),
  orderBy('name'),
  querySchema([{ id: true, name: true, city: { name: true } }]) // Compile error if non-existing fields are queried.
);

// 2. Apply the query to an input, for example an OData collection:
const expression = pipeExpression(oDataCollection<Person>('Persons'), query);

// 3. Execute the query and work with the result:
executor.execute(expression).subscribe((persons) => {
  // Work with the result.
  persons.forEach((person) => console.log(`${person.name} is living in ${person.city.name}.`)); // OK

  persons.forEach((person) => console.log(`${person.name} is ${person.age} years old.`));
  //                                                                  ~~~
  // Compile error because age is not part of the query.
});
```

## Theory

_ts-flex-query_ is based on the following basic concepts:

- An _expression_ is a specification of how to calculate a value. An expression can be _evaluated_ to the resulting value.

  Example of an atomic expression: "The value 42." It evaluates to 42.

  Example of a composite expression: "Filter the list of numbers [1, 4, 7] for those greater than 5." It evaluates to the list [7].

- A _query_ is a specification of operations to be applied to an input expression. The type of the value the input expression evaluates to is (partially) known at the time of specifying a query, but the input expression itself and the value it evaluates to are not.

  Abstract example of a query: "Filter the input, an array of strings, for those whose length is greater than 5."

- Applying a _query_ to an input _expression_ yields another _expression_.

## Getting started

### From the query to the result

The following steps will guide you from query specification over using the query result type to receiving the result:

1. Specify the query (see [Creating queries](#creating-queries)).
    ```TS
    import { QueryFactory } from 'ts-flex-query';

    const query = new QueryFactory<Node[]>().create(
      // ...
    );
    ```
    Prerequisite: You have TypeScript types (Node in this example) describing your data model, including both atomic fields and navigation and collection properties.
1. Define the query result type and work with it in your code, e.g., to convert the query result received from a server to a view model:
    ```TS
    import { EvaluatedQueryType } from 'ts-flex-query/types';

    type ResultType = EvaluatedQueryType<typeof query>;

    function convertToViewModel(serverData: ResultType): ViewModel {
      // Convert serverData to ViewModel.
    }
    ```
1. Evaluate the query (see [Evaluating queries](#evaluating-queries)) and hand the result over to your business logic code, e.g., the `convertToViewModel` function above.

These steps ensure that the whole process of specifying the data to receiving and working with that data is type-safe.

### Creating queries

Queries are basically composed of pipe operators (`PipeOperator<TIn, TOut>`). There is a bunch of predefined pipe operators (see examples below and [Operator reference](#operator-reference)), but you can also specify your own operators.

Whenever you need to create a new query, use the `QueryFactory<T>.create` method. It accepts the type parameter `T`, which is the type of the input value, and up to nine pipe operators to be applied in sequence to the input. (This method is conceptually similar to RxJs's `Observable.pipe` method.)

The type of a query is `PipeOperator<TIn, TOut>`. Therefore, a query created with `createQuery` can be used as operator again.

#### Examples of query specifications

1. Use the `filter` operator to filter an input collection:
    ```TS
    import { QueryFactory } from 'ts-flex-query';
    import { field, filter, func, value } from 'ts-flex-query/operators';

    const filterQuery = new QueryFactory<Node[]>().create(
      filter(func('equal', field('Id'), value(42)))
    );
    ```

    Besides *equal*, various other functions such as *greater*, *lower* and *contains* can be used with the func operator.
    To combine multiple conditions, you can use one of the boolean operators *and*, *or*, and *not*, e.g.:
    ```TS
    const filterQuery2 = new QueryFactory<Node[]>().create(
      filter(and(
        func('greaterOrEqual', field('Id'), value(10)),
        func('notEqual', field('Name'), value(null))
      ))
    );
    ```

1. Use the `orderBy` operator to sort the items of a collection:
    ```TS
    import { QueryFactory } from 'ts-flex-query';
    import { orderBy } from 'ts-flex-query/operators';

    const orderQuery = new QueryFactory<Node[]>().create(
      orderBy(
        ['Name', 'desc'], // first by Name descending
        chain('MasterNode', 'Id'), // then by MasterNode.Id ascending
        'Id' // then by Id ascending
      )
    );
    ```

1. Use the `field` operator to map an input object to a field:
    ```TS
    import { QueryFactory } from 'ts-flex-query';
    import { field } from 'ts-flex-query/operators';

    const fieldQuery = new QueryFactory<Node>().create(
      field('Name') // compile error if Node does not have a field 'Name'
    );
    ```

    To access a nested field, you can either pipe multiple `field` operators or use the `chain` operator:
    ```TS
    import { QueryFactory } from 'ts-flex-query';
    import { chain, field } from 'ts-flex-query/operators';

    const fieldQuery2 = new QueryFactory<Node>().create(
      // field('MasterNode'), field('Id')
      // or equivalently:
      chain('MasterNode', 'Id')
    );
    ```

1. Use the `pipe` operator to apply multiple operators in sequence where the signature allows only one operator:
    ```TS
    import { QueryFactory } from 'ts-flex-query';
    import { field, orderBy, pipe } from 'ts-flex-query/operators';

    const orderQuery2 = new QueryFactory<Node[]>().create(
      orderBy(
        pipe(field('MasterNode'), field('Id')) // Order by MasterNode.Id.
        // equivalent to:
        // chain('MasterNode', 'Id')
      )
    );
    ```

1. Use the `querySchema` operator to select parts of an object tree:
    ```TS
    import { pipeExpression, QueryFactory } from 'ts-flex-query';
    import { orderBy, querySchema, slice } from 'ts-flex-query/operators';
    import { EvaluatedQueryType } from 'ts-flex-query/types/evaluated-result-type';

    const querySchemaQuery = new QueryFactory<Node[]>().create(
      querySchema([{ // A collection schema is an array with one object schema element.
        Id: true, // Pick the primitive field 'Id'.
        MasterNode: { // Define a sub object schema for the field 'MasterNode'.
          Id: true // Pick MasterNode's primitive field 'Id'.
        },
        AlternativeMasterNode: 'expand', // Pick all primitive fields of the sub object 'AlternativeMasterNode'.
        MainFacility: 'select', // Like 'expand', but when used with the ODataExecutor, this field will be included only in the $select clause, not in the $expand clause.
        Facilities: [{ // Define a sub collection schema for the field 'Facilities'.
          BusinessId: true // Pick the primitive field 'BusinessId' of all facilities.
        }],
        AlternativeFacilities: ['expand'], // Pick all primitive fields of all alternative facilities.
        Providers: (p) => pipeExpression( // Order the providers by BusinessId, take the first one and query only the Id.
          p,
          orderBy('BusinessId'),
          slice(0, 1),
          querySchema([{ Id: true }])
        )
      }])
    );
    ```

    This will result in the following query result type (where `PickPrimitiveFields<T>` is a helper type which removes all non-primitive fields from `T`):
    ```TS
    {
      Id: number;
      MasterNode: {
          Id: number;
      };
      AlternativeMasterNode: PickPrimitiveFields<MasterNode>;
      Facilities: {
          BusinessId: number;
      }[];
      AlternativeFacilities: PickPrimitiveFields<Facility>[];
      Providers: {
          Id: number;
      }[];
    }[]
    ```

1. Use the `record` operator to create records with custom fields and values:
    ```TS
    import { QueryFactory } from 'ts-flex-query';
    import { chain, field, first, map, orderBy, pipe, record } from 'ts-flex-query/operators';

    const recordQuery = new QueryFactory<Node[]>().create(
      map(record({
        id: 'Id',
        masterNodeId: chain('MasterNode', 'Id'), // MasterNode.Id
        firstProviderId: pipe(field('Providers'), orderBy('BusinessId'), first(), field('Id')) // first provider's (when ordered by BusinessId) Id
      }))
    );
    ```

1. Use the `groupAndAggregate` operator to group by a record value and optionally merge aggregation values into this result record:
    ```TS
    import { QueryFactory } from 'ts-flex-query';
    import { funcs } from 'ts-flex-query/expressions';
    import { aggregateValue, groupAndAggregate } from 'ts-flex-query/operators';

    const groupAndAggregateQuery = new QueryFactory<Node[]>().create(
      groupAndAggregate({
        MasterNode: { Id: true }
      }, {
        count: funcs.count,
        minId: aggregateValue('Id', funcs.minimum)
      })
    );
    ```
    The result type will be:
    ```TS
    {
        MasterNode: { // This is the group key identifying the group.
            Id: number;
        };
        count: number; // Aggregation value.
        minId: number | undefined; // Aggregation value.
    }[]
    ```

    You can also use `groupAndAggregate` to aggregate over all entries in an OData-compatible way:
    ```TS
    const groupAndAggregateQueryForCount = new QueryFactory<Node[]>().create(
      groupAndAggregate({}, {
        count: funcs.count // Get the number of all items.
      })
    );
    ```
    The result will be an array with exactly one group (the group representing all elements). The result type will be:
    ```TS
    {
        count: number; // Aggregation value.
    }[]
    ```

> NOTE: In general, the order of operators in a query matters. Even if semantically equivalent, another operator order might affect performance. The following rules should be obeyed in this regard:
> * *Filter early*: The `filter` operator reduces the number of elements. Therefore, it should be applied as early as possible in the pipeline and particularly before sorting.
> * *Expand late*: The `querySchema` and also the `record` operator should be applied as late as possible in the pipeline because all fields in the resulting records may be evaluated in the backend before further operators are applied.

### Evaluating queries

Two steps are required to evaluate a query against an input:

1. Apply the query to an input expression thereby yielding a self-contained evluatable expression:
    ```TS
    import { pipeExpression } from 'ts-flex-query';
    const expr = pipeExpression(input, query);
    ```
    The type of the `input` expression depends on the evaluator to be used (see below).
2. Evaluate the expression using an evaluator (see below).

#### The JS evaluator

All (non-custom) queries are evaluatable using the implicitly available JS evaluator. You can use it like this:

```TS
import { evaluateExpression, pipeExpression } from 'ts-flex-query';
import { constant } from 'ts-flex-query/expressions';

const listOfNodes: Node[] = /* Your data goes here. */;
const expr = pipeExpression(constant(listOfNodes), query);
const result = evaluateExpression(expr);
// Work with the result.
```

The JS evaluator requires a `constant` expression to be used as input to your query.

#### The OData evaluator

```TS
// 1. Apply the query to an oDataCollection input expression:
const expr = pipeExpression(oDataCollection<Node>('Nodes'), query);

// 2. Evaluate the query:
const evaluator = new ODataExecutor((collectionName, queryText) => {
  // Go to your OData endpoint here using collectionName and queryText and return an Observable of the raw OData result.
});
evaluator.execute(expr).subscribe((result) => {
  // Work with the result.
});
```

You may want to create a singleton instance of the `ODataExecutor` and re-use it for multiple queries. In the function provided to the `ODataExecutor` constructor, use an HTTP client of your choice to contact your OData endpoint. Build the URL from the provided parameters `collectionName` and `queryText` (which does not contain the questionmark "?").

> NOTE: Not all expressions and operators are compatible with the OData evaluator. Particularly, have a look at the "OData-compatible" column in the section [Operator reference](#operator-reference).

#### Custom evaluators

It is possible to define custom evaluators. Typically, an evaluator definition also comes with a special type of input expression to which a query can be applied (similarly to the `oDataCollection` expression for the OData evaluator).

Requirements a custom evaluator must fulfill:
* It takes an expression and evaluates it according to the semantics of the expression and the expressions nested therein. It must be able to cope with all expression types assignable to `FrameworkExpression` and the special input expression type defined for that evaluator. It must throw an error when detecting unknown expression types.
* The type of the result value must be assignable to `EvaluatedResultType<T>` where `T` is the generic type parameter of the evaluated expression.
* The result may be provided either synchronously or asychronously as `Observable<EvaluatedResultType<T>>` or `Promise<EvaluatedResultType<T>>`.

## Operator reference

| Name | Description | OData-compatible |
|---|---|---|
| aggregateValue | Aggregate a selected value of the input elements using a specified function. | ✅ |
| and, or, not | Boolean operators | ✅ |
| apply | Apply a function to the input expression yielding another expression. |  |
| chain | Access a nested field. | ✅ |
| count | Count the number of elements in the input collection. 0 if the input is undefined. | ✅ |
| customFunc | Apply a custom value-level function. |  |
| distinct | Remove duplicates from the input collection. |  |
| expression | Ignore the input and switch to the provided expression. |  |
| field | Map the input object to the value of one of its fields. | ✅ |
| filter | Filter a collection based on a predicate. | ✅ |
| filterDefined | Filter a collection for only defined entries (exclude null and undefined). | ✅ |
| first | Extract the first element of a collection. |  |
| flatMap | Map each element of the input array to a collection and flatten the result. |  |
| func | Apply a predefined value-level function. | ✅ |
| groupAndAggregate | Group the collection elements and optionally merge the group key record with calculated aggregation values. | ✅ |
| groupBy | Group collection elements. |  |
| includeCount | Create a record with a count field and an elements field. | ✅ |
| ifThen | Evaluate the then operator if the condition operator evaluates to true. Otherwise, return undefined. |  |
| ifThenElse | Evaluate the then operator if the condition operator evaluates to true and the else operator otherwise. |  |
| ifUndefined | Apply a fallback value if the input is undefined or null. |  |
| letIfDefined | Save the input before continuing with further steps for better performance. Evaluate the selector only if the input value is defined, i.e., not null or undefined. |  |
| letIn | Save the input before continuing with further steps for better performance. | ✅ |
| map | Map each element of the input collection to another value. | ✅ |
| merge | Recursively merge two records. |  |
| noOp | No operation. Return the input as-is. | ✅ |
| orderBy | Sort the collection elements by provided criteria. | ✅ |
| pipe | Apply multiple operators. |  |
| querySchema | Select parts of an object tree. | ✅ |
| record | Specify a record. |  |
| slice | Skip and take elements from the input collection. | ✅ |
| value | Ignore the input and return the provided value. | ✅ |

## Dependency versions

List of supported dependency versions by ts-flex-query version (from 0.4.0):

| ts-flex-query | TypeScript  | RxJS    |
|---------------|-------------|---------|
| ~1.4.0        | >=4.7 <5.6  | ^7.8.1  |
| ~1.3.0        | >=4.7 <5.1  | ^7.8.1  |
| 1.1.0-1.2.0   | >=4.7 <5.1  | ^7.6.0  |
| ~1.0.0        | >=4.7 <5.1  | ^7.5.7  |
| ~0.4.0        | ~4.6.4      | ^7.5.7  |


# ts-flex-query development notes


## Publishing a new version

* In the [package.json](./package.json), set the desired new version.

* In the [CHANGELOG.md](./CHANGELOG.md), add an entry for the new version.

* In this README file, update the [Dependency versions](#dependency-versions) table for the new version if it is a new feature or major version.

* Run the script `do-publish`.

## TypeScript update

* Add a new package alias `"typescript-[OLD_MINOR_VERSION]": "npm:typescript@~[OLD_VERSION]"` to the devDependencies in the [package.json](./package.json) file.

  Example: `"typescript-4.8": "npm:typescript@~4.8.4"`

* Update the typescript version in devDependencies to `"~[NEW_VERSION]"`.

  Example: `"typescript": "~4.9.3"`

* Add a new script `"tsc-[OLD_MINOR_VERSION]"` to the [package.json](./package.json) file which will invoke the old tsc.

  Example: `"tsc-4.8": "node ./node_modules/typescript-4.8/bin/tsc"`

* Extend the `build-with-samples` script to build the samples using the newly created tsc script.

  Example: `npm run tsc-4.8 -- -p ./samples/tsconfig.json`

* By running `npm run build-with-samples`, determine if old TypeScript versions are still building. If not, remove the respective TypeScript versions from the package.json (package alias, script, build-samples script part).

* In this README.md file, update the [Dependency Versions](#dependency-versions) table.

These steps will ensure that, for future changes, compatibility with old TypeScript versions is ensured. If compatibilty with an old version breaks, a new major version of ts-flex-query needs to be released according to the following section.

Immediately publishing a new version of ts-flex-query is only required if changes were necessary to build with the new TypeScript version.
