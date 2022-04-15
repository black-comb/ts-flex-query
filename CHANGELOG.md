# v0.2.0 (15.04.2022)

* The querySchema operator now supports the string "select" as object schema to indicate that the ODataExecutor should not include the respective field in the $expand clause. The ODataExecutor constructor no longer contains the parameter unexpandableFieldChains, which was originally meant to mark fields not to be included in the $expand clause.

# v0.1.0 (03.04.2022)

* Initial Version.
