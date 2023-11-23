# 0.2.0 (in development)

## Breaking changes

* Changed type parameter name from `Data` to `Value`. [#24]
  Corresponding to this change, also changed property name `data`
  into `value` in type `CodeContribution<Value>`.

## Fixes

* Fixed the `registerCodeContribution` function to be fully reactive. [#23]
* Fixed and enhanced API doc of `compileWhenClause` function. [#16]

## Other enhancements

* Enhanced API docs for React Hooks. [#27]
* Log levels may also be given as strings. [#20]
* Import logging classes directly from `util`:
  `import { Logger, LogLevel } from "@forman2/extendit/util"`.
* Clarified effect of `extensionDependencies` in `README.md`.
* Addressed all `eslint` warnings in code and GitHub CI now also
  runs `npm run lint`. [#28]


# 0.1.0 (from 18.11.2023)

Initial version.
