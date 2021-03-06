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
