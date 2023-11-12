[![CI](https://github.com/forman/extendit/actions/workflows/node.js.yml/badge.svg)](https://github.com/forman/extendit/actions/workflows/node.js.yml)
[![License: MIT](https://badgen.net/static/license/MIT/blue)](https://mit-license.org/)
[![](https://badgen.net/npm/types/tslib)](https://www.typescriptlang.org/)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

![image](logo.png)


ExtendIt.js is a framework and library that is used to create extensible and
scalable JavaScript applications. Its core API design is largely inspired by 
the [Extension API](https://code.visualstudio.com/api)
of [Visual Studio Code](https://code.visualstudio.com/).

ExtendIt.js provides the means for a host application to dynamically
import JavaScript modules - _extensions_ - that add new features and 
capabilities to the application.

ExtendIt.js has been designed to efficiently work with 
[React](https://react.dev/), for this purpose it provides a number of
reactive [hooks](). However, the library can be used without 
React too. It's a peer dependency.

### Installation

```bash
npm install @forman2/extendit
```

or 

```bash
yarn add @forman2/extendit
```

### Getting Started

Any extension comprises at least a usual [`package.json`](https://docs.npmjs.com/cli/v7/configuring-npm/package-json)  

```json
{
   "name": "my-extension",
   "provider": "my-company",
   "main": "init"
}
```

The `main` field above is optional. If you provide it as above, it means you 
provide an _extension activator_ in a submodule named `init`, 
e.g., in `init.ts` you define an `activate()` function:

```ts
import { type ExtensionContext } from "@forman2/extendit";
import { type AppApi } from "./app/api";

export function activate() {
  // Use your AppApi here, e.g. register your contributions
}
```

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

The host application registers extensions using the `registerExtension`
function:

```ts
import { registerExtension } from "@forman2/extendit";

export function initApp() {
   const extensionsUrls = getAppExtensionUrls();
   extensionUrls.forEach((extensionUrl) => {
      void registerExtension(extensionUrl);
   });
}

function getAppExtensionUrls(): URL[] {
  // ...
}
```

The host application (or an extension) can also define handy 
_contribution points_:

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
Contributions are encoded in the `contributes` object of an extension's 
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
found in the application using the `getContributions` function:

```ts
  const wiseSayings = getContributions<string[]>("wiseSayings");
```

The return value will be the _same_ object, as long no other extensions are
installed that contribute to "wiseSayings". If this happens, a new snapshot 
instance will be returned.

If you are building a React application, you can use hooks to access
contributions (and other elements of the ExtendMe.js API) in a reactive way:

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
`contributes` object in `package.json`. 

A contribution may also require JavaScript to be loaded and executed. 
Examples are commands and UI components, such as rendered views.

Let a contribution point be

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
`"onCommand:${id}"`, if the code contribution with the given `"id"` is 
requested. In turn, this causes the extension to be activated, that provides
this requested code contribution.

Then some extension could provide the following JSON contribution:

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

and define the corresponding JavaScript code contribution:

```ts
import { registerCodeContribition } from "@forman2/extendit";
import { openMapView } from "./map-view";

export function activate() {
   registerCodeContribition("commands", "openMapView", openMapView);
}
```

Such code contributions are loaded lazily: Only the first time a
code contribution is needed by a consumer, the contributing extension will be
activated.

Therefore, code contributions are loaded asynchronously using the 
`loadCodeContribution` function:

```ts
import { loadCodeContribution } from "@forman2/extendit";
import { type Command } from "./command";

async function getCommand(commandId: string): Promise<Command> {
  return await loadCodeContribution<Command>("commands", commandId);
}  
```

There is also a corresponding React hook `useLoadCodeContribution`
that is used for implementing React components:

```tsx
import { useLoadCodeContribution } from "@forman2/extendit/react";
import { type Command } from "./command";

interface CommandButtonProps {
  command: Command;  
}

export default function CommandButton({ command }: CommandButtonProps) {
  const commandCode = useLoadCodeContribution("commands", command.id);
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

### Acknowledgements

ExtendIt.js currently uses the awesome libraries

* [Ajv](https://ajv.js.org/) for JSON validation (may be turned into peer dependency later)
* [memoize-one](https://github.com/alexreardon/memoize-one) for implementing state selector functions
* [zustand](https://github.com/pmndrs/zustand) for state management

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

### Configuration

You can use `.env` files, e.g., `.env.local` to configure development options:

```.env
# As `vite build` runs a production build by default, you can
# change this and run a development build by using a different mode
# and `.env` file configuration:
NODE_ENV=development

# Set the library's log level (ALL, DEBUG, INFO, WARN, ERROR, OFF)
# Logging is OFF by default.
VITE_LOG_LEVEL=ALL
```

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
