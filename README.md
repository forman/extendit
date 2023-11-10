[![CI](https://github.com/forman/extendit/actions/workflows/node.js.yml/badge.svg)](https://github.com/forman/extendit/actions/workflows/node.js.yml)
[![License: MIT](https://badgen.net/static/license/MIT/blue)](https://mit-license.org/)
[![](https://badgen.net/npm/types/tslib)](https://www.typescriptlang.org/)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

![image](docs/images/extendit.png)


ExtendIt.js is a framework and library that is used to create extensible and
scalable TypeScript/JavaScript applications.

At its core ExtendIt.js provides the means for a host application to dynamically
import JavaScript modules - extensions - that add new features and capabilities
to the application.

An extension comprises a `package.json` and optionally some JavaScript code. The
JavaScript code may export an extension-specific API that other, dependent
extensions may consume.

Both the host application and an extension can also define contribution points.
Extensions provide contributions to one or more contribution points and the host
application or host extension can consume them. Contributions are encoded in
the `contributes` object of an extension's `package.json`. A contribution may be
either fully specified by the JSON data in the `contributes` object, or it may
require also JavaScript to be loaded and executed. Examples are commands and UI
components. Such code contributions are loaded lazily: Only the first time a
code contribution is needed by a consumer, the contributing extension will be
loaded and activated.

`ExtendIt.js` provides some
useful [React hooks](https://react.dev/reference/react) for developing user
interfaces. However, the core library is designed to be used independently of 
React. 

The core API of `ExtendIt.js` has been largely inspired by the
[Extension API](https://code.visualstudio.com/api)
of [Visual Studio Code](https://code.visualstudio.com/).

`ExtendIt.js` currently depends on the two awesome libraries

* [zustand](https://github.com/pmndrs/zustand) for state management, and
* [Ajv](https://ajv.js.org/) for JSON validation.

### Development

Get sources and install dependencies first:

```bash
$ git clone https://github.com/forman/extendit
$ cd extendit
$ npm install
```

Now the following scripts are available that can be started with `npm run`:

* `dev` - run the UI demo in development mode
* `build` - build the library, outputs to `./dist`
* `lint` - run `eslint` on project sources
* `test` - run project unit tests
* `coverage` - generate project coverage report in `./coverage`
* `typedoc` - generate project API docs in `./docs/api`

### Coding style

Most of the code is formatted to default settings of
[prettier](https://prettier.io/), see its [configuration](./.prettierrc.json).
Since `prettier` is un-opinionated regarding the order of imports, we try to 
stick to the following order: 

1. React dependencies
2. Other 3rd party dependencies
3. Dependencies on our own packages
4. Dependencies on our own modules higher up in the hierarchy 
   using source prefix `@`
5. Dependencies on submodules that are in the same module folder 
   further down the hierarchy using source prefix `./`

If we also have resource dependencies (`*.css`, `*.json`, `*.svg`, ...), 
we first import TypeScript source dependencies, then separated by a 
newline, insert resource dependencies in the same order as source dependencies.
