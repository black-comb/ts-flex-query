# v1.6.1 (24.06.2025)

* Removed NoInfer from problematic places.

# v1.6.0 (21.06.2025)

* Fixed letIfDefined operator having type error when used with inner operator.
* Use NoInfer in external APIs where appropriate.
* Dropped support for TypeScript 5.3.

# v1.5.0 (29.09.2024)

* New function asString.
* Dropped support for TypeScript 4.7.

# v1.4.0 (08.07.2023)

* Update: TypeScript 5.1.6. Update may be required when using the querySchema operator with TypeScript 5.1.

# v1.3.0 (25.05.2023)

* New convenience operators: distinct, filterDefined, ifUndefined.
* flatMap and orderBy now cope with possibly undefined element types.
* Additional overloads of QueryFactory.create for more steps.

# v1.2.0 (05.03.2023)

* Convenience operator count().

# v1.1.1 (04.02.2023)

* Added initial sample to README.md.

# v1.1.0 (04.12.2022)

* Dependency updates: TypeScript ~4.9.3, RxJS ^7.6.0

# v1.0.1 (19.10.2022)

* Fixed isFrameworkExpression function to consider IfExpression.

# v1.0.0 (16.10.2022)

* Updates: TypeScript 4.8.4, RxJS 7.5.7
* The keys of the functionContainers constant are now uncapitalized.
* querySchema: Now produces a LetExpression where appropriate to avoid redundant expression trees.
* New debug helper method serializeExpressionForDebugging.
* New IfExpression.
* New operators ifThen, ifThenElse, letIfDefined.

# v0.3.1 (28.09.2022)

* Exported SpecifyTypeExpression for custom converters.

# v0.3.0 (16.07.2022)

* OData: Added support for custom expression handlers and query composers.

# v0.2.4 (06.07.2022)

* Functions count and countDistinct now accepting possibly undefined arguments.

# v0.2.3 (04.07.2022)

* Fixed expression schemas not typable in schemas under nullable fields.

# v0.2.2 (16.05.2022)

* Fixed ODataExecutor not working after JS minification.

# v0.2.1 (19.04.2022)

* Functions startsWith and endsWith now accepting possibly undefined arguments.
* Fixed invalid bracketing when using OData functions.

# v0.2.0 (15.04.2022)

* The querySchema operator now supports the string "select" as object schema to indicate that the ODataExecutor should not include the respective field in the $expand clause. The ODataExecutor constructor no longer contains the parameter unexpandableFieldChains, which was originally meant to mark fields not to be included in the $expand clause.

# v0.1.0 (03.04.2022)

* Initial Version.
