[![CI](https://github.com/forman/extendit/actions/workflows/ci.yml/badge.svg)](https://github.com/forman/extendit/actions/workflows/ci.yml)
[![License: MIT](https://badgen.net/static/license/MIT/blue)](https://mit-license.org/)
[![](https://badgen.net/npm/types/tslib)](https://www.typescriptlang.org/)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
![npm](https://img.shields.io/npm/v/%40forman2/extendit)

![image](logo.png)

ExtendIt.js is a framework and library that is used to create extensible and
scalable JavaScript applications. Its 
[core API](https://forman.github.io/extendit/modules/core.html) 
design is largely inspired by 
the [Extension API](https://code.visualstudio.com/api)
of [Visual Studio Code](https://code.visualstudio.com/).

ExtendIt.js provides the means for a host application to dynamically
import JavaScript modules - _extensions_ - that add new features and 
capabilities to the application.

ExtendIt.js has been designed to efficiently work with 
[React](https://react.dev/), for this purpose it provides a number of reactive 
[React hooks](https://react.dev/reference/react/hooks). 
However, the library can be used without 
React too. It's just a peer dependency.

# Highlights

* Simple, low-level API allowing for complex, loosely coupled 
  application designs offered by dependency inversion.
* Manages _extensions_, which are JavaScript packages with a minor
  `package.json` enhancement.
* Lets applications and extensions define _contribution points_ that
  specify the type of contribution that applications and extensions 
  can provide.
* Lets applications and extensions provide _contributions_ to a given 
  contribution point. Contributions can be  
  - JSON entries in the extension's `package.json` and/or
  - JavaScript values registered programmatically in code. 
* Allows dynamic loading of code:
  - Extensions may be installed at runtime or bound statically.
  - Code contributions are loaded on demand only, while JSON entries 
    can be used right after extension installation.
* Provides optional utilities for Web UI development:
  - React hooks for reactive access to extensions and contributions.
  - Predefined contribution points for typical UI elements.
* 99% test coverage of core API.
* 100% prettier, linted TypeScript.

# Demo

To see the API in action, you can run the
[Demo code](https://github.com/forman/extendit/tree/main/src/demo)
using `npm run dev`,
see section [Development](#development) below. It is a simple React
application that demonstrates how extensions are installed,
activated, and how they can contribute elements such as commands or
UI components to an application.

# Installation

```bash
npm install @forman2/extendit
```

or 

```bash
yarn add @forman2/extendit
```

# Usage

## Extension basics

Any extension must be defined by its 
[_extension manifest_](https://forman.github.io/extendit/interfaces/core.ExtensionManifest.html), 
which is basically a slightly enhanced 
[`package.json`](https://docs.npmjs.com/cli/v7/configuring-npm/package-json).  

```json
{
   "name": "my-extension",
   "provider": "my-company",
   "version": "1.0.0",
   "main": "init"
}
```

The `main` field is optional. If you provide it as above, it means you 
provide an 
[_extension activator_](https://forman.github.io/extendit/interfaces/core.ExtensionModule.html) 
in a submodule named `init` which defines an `activate()` 
function that is called if your extension is activated by the host 
application:

```ts
import { SomeAppApi } from "some-app/api";

export function activate() {
  // Use the SomeAppApi here, e.g., 
  // register your contributions to the app
}
```

## Extension-specific APIs

The activator may also export an extension-specific API for other extensions

```ts
import { MyApi } from "./api";

export function activate(): MyApi {
  return new MyApi({ ... });
}
```

Hence, another dependent extension such as

```json
{
   "name": "other-extension",
   "provider": "other-company",
   "main": "init",
   "dependencies": {
      "@my-company/my-extension": "1.0.0"
   }
}
```

may consume it in its own `init.ts`

```ts
import { type ExtensionContext, getExtension } from "@forman2/extendit";
import { type MyApi } from "@my-company/my-extension";

export function activate(ctx: ExtensionContext) {
  const myExtension = getExtension("my-company.my-extension");
  const myApi = myExtension.exports as MyApi;
  // Use imported extension API here, e.g., to add some contribution
  myApi.registerViewProvider({ ... });
}
```

If you add `extensionDependencies` to your `package.json`

```json
{
   "extensionDependencies": [
     "my-company.my-extension"
   ]
}
```

then you can save some lines of code in your activator

```ts
import { type ExtensionContext, getExtension } from "@forman2/extendit";
import { type MyApi } from "@my-company/my-extension";

export function activate(ctx: ExtensionContext, myApi: MyApi) {
  myApi.registerViewProvider({ ... });
}
```

## Extension installation

The host application registers (installs) extensions by using the 
[`readExtensionManifest`](https://forman.github.io/extendit/functions/core.readExtensionManifest.html)
and
[`registerExtension`](https://forman.github.io/extendit/functions/core.registerExtension.html)
functions:

```ts
import { readExtensionManifest, registerExtension } from "@forman2/extendit";

export function initApp() {
   const extensionsUrls: string[] = [
     // Get or read installed extension URLs
   ];
   const pathResolver = (modulePath: string): string => {
     // Resolve a relative "main" entry from package.json
   };  
   extensionUrls.forEach((extensionUrl) => {
     readExtensionManifest(extensionUrl)
     .then((manifest) => 
       registerExtension(manifest, { pathResolver })
     )
     .catch((error) => {
       // Handle installation error
     });
   });
}
```

## Contribution points and contributions

The host application (or an extension) can also define handy 
[_contribution points_](https://forman.github.io/extendit/interfaces/core.ContributionPoint.html):

```ts
import { registerContributionPoint } from "@forman2/extendit";

export function initApp() {
  registerContributionPoint({
    id: "wiseSayings",
    manifestInfo: {
      schema: {
        type: "array",
        items: {type: "string"}
      }
    }
  });
}
```

Extensions can provide contributions to defined contribution points. 
Contributions are encoded in the `contributes` value of an extension's 
`package.json`:

```json
{
   "name": "my-extension",
   "provider": "my-company",
   "contributes": {
      "wiseSayings": [
         "Silence is a true friend who never betrays.",
         "Use your head to save your feet.",
         "Before Alice went to Wonderland, she had to fall."
      ]
   }
}
```

A consumer can access a current snapshot of all contributions
found in the application using the 
[`getContributions`](https://forman.github.io/extendit/functions/core.getContributions.html) 
function:

```ts
  const wiseSayings = getContributions<string[]>("wiseSayings");
```

The return value will be the _same_ value, as long as no other extensions are
installed that contribute to the contribution point `wiseSayings`. If this 
happens, a new snapshot value will be returned.

If you are building a React application, you can use the 
[provided React hooks](https://forman.github.io/extendit/modules/react.html) 
in `@forman2/extend-me/react` for accessing contributions (and other elements 
of the ExtendMe.js API) in a reactive way:

```tsx
import { useContributions } from "@forman2/extend-me/react";

export default function WiseSayingsComponent() {
  const wiseSayings = useContributions("wiseSayings");   
  return (
    <div>
      <h4>Wise Sayings:</h4>
      <ol>{ wiseSayings.map((wiseSaying) => <li>{wiseSaying}</li>) }</ol>
    </div>
  );
}
```

The component will be re-rendered if more contributions are added to the 
contribution point.

A contribution may be fully specified by the JSON data in the 
`contributes` object in `package.json`. It may also require JavaScript to be 
loaded and executed. Examples are commands or UI components that are rendered
by React or another UI library. The following contribution point also 
defined `codeInfo` to express its need of JavaScript code: 

```ts
import { registerCodeContribution } from "@forman2/extendit";

export function activate() {
  registerContributionPoint({
    id: "commands",
    manifestInfo: {
      schema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: {type: "string"},
            title: {type: "string"}
          }
        }
      }
    },
    codeInfo: {
      idKey: "id",
      activationEvent: "onCommand:${id}"
    }
  });
}
```

The entry `activationEvent` causes the framework to fire an event of the form
`"onCommand:${id}"` if the code contribution with the given `"id"` is 
requested. In turn, any extension that listens for the fired event will be 
activated.

Here is an extension that provide the following JSON contribution to the 
defined contribution point `commands` in its `package.json`

```json
{
  "contributes": {
    "commands": [
      {
        "id": "openMapView",
        "title": "Open Map View"
      }
    ]
  }
}
```

and also defines the corresponding JavaScript code contribution in its 
activator:

```ts
import { registerCodeContribition } from "@forman2/extendit";
import { openMapView } from "./map-view";

export function activate() {
  registerCodeContribition("commands", "openMapView", openMapView);
}
```

Such code contributions are loaded lazily. Only the first time a
code contribution is needed by a consumer, the contributing extension will be
activated. Therefore, code contributions are loaded asynchronously using the 
[`loadCodeContribution`](https://forman.github.io/extendit/functions/core.loadCodeContribution.html)
function:

```ts
import { loadCodeContribution } from "@forman2/extendit";
import { type Command } from "./command";

async function getCommand(commandId: string): Promise<Command> {
  return await loadCodeContribution<Command>("commands", commandId);
}  
```

There is also a corresponding React hook 
[`useLoadCodeContribution`](https://forman.github.io/extendit/functions/react.useLoadCodeContribution.html)
that is used for implementing React components:

```tsx
import { useLoadCodeContribution } from "@forman2/extendit/react";
import { type Command } from "./command";

interface CommandButtonProps {
  command: Command;  
}

export default function CommandButton({ command }: CommandButtonProps) {
  const commandCode = useLoadCodeContribution("commands", command.id);
  if (!commandCode) {  // Happens on first render only
    return null;
  }
  return (
    <button
      onClick={commandCode.data}
      disabled={commandCode.loading || commandCode.error}      
    >
      {command.title} 
    </button>
  );    
}  
```

# Documentation

We currently only have this file and the 
[API docs](https://forman.github.io/extendit/), sorry.

# Development

## Source code

Get sources and install dependencies first:

```bash
$ git clone https://github.com/forman/extendit
$ cd extendit
$ npm install
```

## Scripts

Now the following scripts are available that can be started with `npm run`:

* `dev` - run the **React Demo** in development mode
* `build` - build the library, outputs to `./dist`
* `lint` - run `eslint` on project sources
* `test` - run project unit tests
* `coverage` - generate project coverage report in `./coverage`
* `typedoc` - generate project API docs in `./docs`

## Configuration

You can use `.env` files, e.g., `.env.local` to configure development options:

```sh
# As `vite build` runs a production build by default, you can
# change this and run a development build by using a different mode
# and `.env` file configuration:
NODE_ENV=development

# Set the library's log level (ALL, DEBUG, INFO, WARN, ERROR, OFF)
# Logging is OFF by default. 
# Note, if the level is not set or it is OFF, no console outputs 
# are suppressed while unit tests are run.
VITE_LOG_LEVEL=ALL
```

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

# Acknowledgements

ExtendIt.js currently uses the awesome libraries

* [ajv](https://ajv.js.org/) for JSON validation (may be turned into peer dependency later)
* [memoize-one](https://github.com/alexreardon/memoize-one) for implementing state selector functions
* [zustand](https://github.com/pmndrs/zustand) for state management

# License

Copyright © 2023 Norman Fomferra

Permissions are hereby granted under the terms of the MIT License:
https://opensource.org/licenses/MIT.
