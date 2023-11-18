# How to contribute

The [ExtendIt.js](README.md) project welcomes contributions of any form
as long as you respect our [code of conduct](CODE_OF_CONDUCT.md) and stay 
in line with the following instructions and guidelines.

If you have suggestions, ideas, feature requests, or if you have identified
a malfunction or error, then please 
[post an issue](https://github.com/forman/extendit/issues). 

If you'd like to submit code or documentation changes, we ask you to provide a 
[pull request](https://github.com/forman/extendit/pulls) (PR) 
[here]((https://github.com/forman/extendit/pulls)). 
For code and configuration changes, your PR must be linked to a 
corresponding issue. 

To ensure that your code contributions are consistent with our project’s
coding guidelines, please make sure all applicable items of the following 
checklist are addressed in your PR.  

**PR checklist**

* Use language [TypeScript](https://www.typescriptlang.org/) using the same
  [configuration](tsconfig.json) as we do.
* Format code using [prettier](https://prettier.io/) using the same 
  [configuration](.prettierrc.json) as we do. Check also section
  [coding style](#coding-style) below.
* Inspect code using [eslint](https://eslint.org/) using the same 
  [configuration](.eslintrc.cjs) as we do.
  `npm run lint` must run without errors.
* Your change shall not break existing unit tests.
  `npm run test` must run without errors.
* Add unit tests for any new code not yet covered by tests
  using [vitest](https://vitest.dev/). 
  If you add new modules make sure you add a test module 
  `<name>.test.ts` for each next to it.
* Make sure test coverage is at 100% for any change.
  Use `npm run coverage` to verify.
* If you add or change new public API components, add or change API 
  documentation accordingly using 
  [TSDoc](https://tsdoc.org/). 
  `npm run typedoc` must run without errors.
* If your change affects the current project documentation,
  (currently only the [README](README.md) file)
  please adjust it and include the change in the PR.

## Coding style

Most of the code is formatted to default settings of
[prettier](https://prettier.io/), see its [configuration](.prettierrc.json).
Since `prettier` is un-opinionated regarding the order of imports, we try to
stick to the following order:

1. React dependencies
2. Other 3rd-party dependencies
3. Dependencies on our own packages
4. Dependencies on our own modules higher up in the hierarchy
   using source prefix `@`
5. Dependencies on submodules that are in the same module folder
   further down the hierarchy using source prefix `./`

If we also have resource dependencies (`*.css`, `*.json`, `*.svg`, ...),
we first import TypeScript source dependencies, then separated by a
newline, insert resource dependencies in the same order as source dependencies.
