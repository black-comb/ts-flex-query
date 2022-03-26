# ts-flex-query
Define flexible and type-safe data queries and execute them against in-memory JS data (arrays and objects), an OData endpoint or an arbitrary data source using a custom query executor.

## Theory

*ts-flex-query* is based on the following basic concepts:

* An *expression* is a specification of how to calculate a value. An expression can be *evaluated* to the resulting value.

  Example of an atomic expression: "The value 42." It evaluates to 42.

  Example of a composite expression: "Filter the list of numbers [1, 4, 7] for those greater than 5." It evaluates to the list [7].

* A *query* is a specification of operations to be applied to an input expression. The type of the value the input expression evaluates to is (partially) known at the time of specifying a query, but the input expression itself and the value it evaluates to are not.

  Abstract example of a query: "Filter the input, an array of strings, for those whose length is greater than 5."

* Applying a *query* to an input *expression* yields another *expression*.

## Getting started

### Creating queries

Queries are basically composed of pipe operators. There is a bunch of predefined pipe operators (see below), but you can also specify your own operators.

Whenever you need to create a new query, use the ```QueryFactory<T>.create``` method. It accepts the type parameter T which is the type of the input value and up to 9 pipe operators to be applied in sequence to the input. (This method is conceptually similar to RxJs's ```Observable.pipe``` method.)

The type of a query is ```PipeOperator<TIn, TOut>```. This already indicates that a query in turn can be used as parameter of the ```QueryFactory<T>.create``` method.

#### Examples

1. Use the ```field``` operator to map an input object to a field:
   ```TS
   import { QueryFactory } from 'ts-flex-query';
   import { field } from 'ts-flex-query/operators';
   const query1 = new QueryFactory<MyObject>().create(
     field('firstName') // Compile error if MyObject does not have a field 'firstName'.
   );
   ```

2. Use the ```filter``` operator
   ```TS
   ```

## Operators reference
