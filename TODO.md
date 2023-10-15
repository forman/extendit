## TODO

### Design

* Review logging
  * Use logger names "extend-me/core" etc
* Clean up `framework/contrib`
  * Every point should gets its own sub-folder, split into
    * `types.ts`, `point.ts`, `get.ts`, `hooks.ts`
  * A `hooks.ts` in each submodule requires React
* Get rid of globals, instead instantiate `Framework` class that
  contains the configuration, the store, the API, and provides hook factories.
* Allow using the package without React.
  Move react-dependent modules into `framework/react/core`
  and `framework/react/contrib`
* Split modules into packages:
  * `@extend-me/core` (incl. `util`)
  * `@extend-me/contrib`
* Schema validation should be optional.
  Add framework option `validateSchema: (jsonValue) => [boolean, errors]`

### Before Deployment

* Demo: switching views seems slow, but React devtools
  say components update within millis. Check!
* Setup CI
* Add TSDoc at to all types, classes, members, methods,
  functions, and constants.
* Add badges in README.md for test result, docs, API docs, coverage,
  and package.
* Write `getting started` section in README.md
* Implement remaining unit-tests
* Find out how to test React hooks using `vitest`
* Enhance the demo:
  - Add explanations what's going on
  - Add submenus demo
* Deploy package `extend-me`

## DONE

* Get rid of `registerAppExtension`, just use `registerExtension` with
  options:
  - `pathResolver`
  - `module`
* Move log levels from `levels` into `LogLevel`.
* Check why in the demo the app commands are not shown
* Turn `react` into a peer dependency
* Use global module imports with "@"
* Understand how to dynamically import from any
  depths in the source tree. See
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import
  --> Use trailing slash.
* Use Zustand's vanilla store for `framework/core`. See
  https://github.com/pmndrs/zustand#using-zustand-without-react
  --> Implemented
* Logger improvements
  - `warnOnce()`
  - `log()` without level --> use logger level
* Enhance the demo:
  - Demo command enablement
  - Demo menu when clauses
  - Add a little more CSS
* Configure TypeDoc to generate an API reference.
* Add TSDoc to user-facing types, classes, members, methods,
  functions, and constants.
* Expand the ESLint configuration `.eslintrc.cjs`, see section below
