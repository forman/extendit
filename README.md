
![image](docs/images/extend-me.png)


... is a framework and library that is used to create extensible and scalable
TypeScript/JavaScript applications.

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
interfaces. However, the library can be used independently of React. React is a
peer dependency.

The core API of `ExtendMe!` has been largely inspired by the
[Extension API](https://code.visualstudio.com/api)
of [Visual Studio Code](https://code.visualstudio.com/).

`ExtendMe!` currently depends on the two awesome libraries

* [zustand](https://github.com/pmndrs/zustand) for state management, and
* [Ajv](https://ajv.js.org/) for JSON validation.

`ExtendMe!` is small: `extend-me.js` 34 kB │ gzip: 10 kB.

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and
some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md)
  uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc)
  uses [SWC](https://swc.rs/) for Fast Refresh

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the
configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
   parserOptions: {
    ecmaVersion: 'latest',
        sourceType
:
    'module',
        project
:
    ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir
:
    __dirname,
}
,
```

- Replace `plugin:@typescript-eslint/recommended`
  to `plugin:@typescript-eslint/recommended-type-checked`
  or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
-

Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react)
and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends`
list
