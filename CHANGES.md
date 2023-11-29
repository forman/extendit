# 0.2.0 (from 29.11.2023)

## Breaking changes

* Renamed `DataViewProvider.createDataView()` into
  `DataViewProvider.getDataView()` because it should cover singleton views too.
  It can now be called with arbitrary arguments. Typically, such arguments 
  specify some data source to be displayed in the data view instance.
* Changed the generic type parameter name from `Data` to `Value` for a 
  number of functions and interfaces. [#24]
  Corresponding to this change, also changed property name `data`
  into `value` in type `CodeContribution<Value>`.

## Fixes

* Fixed the `registerCodeContribution` function to be fully reactive. [#23]
* Fixed and enhanced API doc of `compileWhenClause` function. [#16]

## Other changes

* Exporting version number from `core` module.
* A new function `getDataViewType(viewType: string): DataViewType`
  is exported from `extendit/contrib`.
* Included the compiled `when` clause in `ToolView` interface to better 
  support [#30].
* Enhanced API docs for React Hooks. [#27]
* Log levels may also be given as strings. [#20]
* Import logging classes directly from `util`:
  `import { Logger, LogLevel } from "@forman2/extendit/util"`.
* Clarified effect of `extensionDependencies` in `README.md`.
* Addressed all `eslint` warnings in code and GitHub CI now also
  runs `npm run lint`. [#28]


# 0.1.0 (from 18.11.2023)

Initial version.
