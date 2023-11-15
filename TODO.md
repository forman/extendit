# TODO

## For first stable version

* Adhere to community standards
  - Write `CONTRIBUTING.md`
  - Write PR template
* Implement a GH action that builds documentation in `./docs` including 
  API docs, so we don't have to include generated API docs pages in source code.
* Add TSDoc to all types, classes, members, methods,
  functions, and constants also in `util` and `contrib`.
* Review and adjust logging, check for consistent use of logger names 
  and log levels.
* Add coverage badge in `README.md`.

## Potential design changes for later versions

* Make `contrib` an own toplevel subpackage
  - Every contribution point should go into a separate submodule.
  - Every submodule should be exported, so points can
    be imported independently of each other and so tree-shaking
    becomes possible during build.
  - Every submodule should have its own `index` and comprise implementation
    modules `types`, `point`, `get`, `hooks`, and optionally others.
  - Add unit tests for each module of a submodule.
  - Allow using the contrib module without React.
    Export React-dependent modules from `contrib/<point>/react`
* Decide whether to export `utils` at all or make it an implementation detail.
  Some exports of current `framework/util` are used by public `core` and
  `contrib` APIs. These elements may then be re-exported by `core` and
  `contrib` to hide an extra `utils` package.
* Split exported modules into separate packages:
  - Use [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces).
  - Turn single-package repo into monorepo comprising multiple 
    [scoped packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages),
    see https://github.com/adiun/vite-monorepo.
  - Workspaces would potentially output the following packages: 
    + `@<scope-name>/core`
    + `@<scope-name>/contrib` or `@<scope-name>/ui`
    + `@<scope-name>/demo`
* JSON Schema validation and use of [`ajv`](https://ajv.js.org/) 
  should be optional. Therefore, add framework option 
  `validateSchema?: "ajv" | (jsonValue: JsonValue) => [boolean, string[]]`.
  If `"ajv"` is passed, then `ajv` will be used for validation.
* Turn the core API including the store and global functions into a single
  `Framework` interface add a factory for it that returns instances of that 
  interface (implemented by a plain object or class).
  - Pros: 
    + cleaner design for ExtendIt.js lib implementation.
    + cleaner design for user apps since only a single framework 
      must be passed around.
    + unit testing is easier as framework instances can be created, configured 
      and disposed for individual tests instead of dealing with a global state 
      object.
    + user extensions could create new framework instances to maintain their
      own extension environment (well, this should be a rare use case).
  - Cons:
    + in user apps, the framework instance must be passed around where a simple
      function import would suffice.
    + in user extensions, framework instance must now be passed to 
      activators and React hooks. This forces the framework instance to be a 
      global variable in an application.
    + in user extensions, framework instance must also be passed to React hooks.
    + in user apps, extra step for creating and exporting the framework 
      instance.
