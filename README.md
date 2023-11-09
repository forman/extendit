[![CI](https://github.com/forman/extend-me/actions/workflows/node.js.yml/badge.svg)](https://github.com/forman/extend-me/actions/workflows/node.js.yml)

![image](docs/images/extend-me.png)

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

ExtendMe! is a framework and library that is used to create extensible and
scalable TypeScript/JavaScript applications.

At its core ExtendMe! provides the means for a host application to dynamically
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

`ExtendMe!` provides some
useful [React hooks](https://react.dev/reference/react) for developing user
interfaces. However, the core library is designed to be used independently of 
React. 

The core API of `ExtendMe!` has been largely inspired by the
[Extension API](https://code.visualstudio.com/api)
of [Visual Studio Code](https://code.visualstudio.com/).

`ExtendMe!` currently depends on the two awesome libraries

* [zustand](https://github.com/pmndrs/zustand) for state management, and
* [Ajv](https://ajv.js.org/) for JSON validation.

`ExtendMe!` is small: `extend-me.js` 40 kB │ gzip: 11 kB.

### Development

Get sources and install dependencies first:

```bash
$ git clone https://github.com/forman/extend-me
$ cd extend-me
$ npm install
```

Now the following scripts are available:

* `npm run dev` - run the UI demo in development mode
* `npm run build` - build the `extend-me` library, outputs to `./dist`
* `npm run lint` - run `eslint` on project sources
* `npm run test` - run project unit tests
* `npm run coverage` - generate project coverage report in `./coverage`
* `npm run typedoc` - generate project API docs in `./docs/api`

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
we first import import TypeScript source dependencies, then separated by a 
newline, insert resource dependencies in the same order as source dependencies.
