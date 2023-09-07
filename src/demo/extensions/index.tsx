import type { ExtensionManifest } from "@/core";

const manifest1: ExtensionManifest = {
  provider: "forman",
  name: "ex1",
  version: "0.0.0",
  displayName: "Example #1",
  main: "my-extension-1",
  contributes: {
    commands: [
      {
        command: "ex1.pippo",
        title: "Print Pippo 1",
      },
      {
        command: "ex1.foo",
        title: "Show Foo 1",
        enablement: "view != 'ex1.foo'",
      },
    ],
    menus: {
      main: [
        {
          command: "ex1.pippo",
          group: "print@1",
        },
        {
          command: "ex1.foo",
          group: "show@1",
        },
      ],
    },
    views: {
      main: [
        {
          id: "ex1.foo",
          title: "Foo 1",
        },
      ],
    },
  },
};

const manifest2: ExtensionManifest = {
  provider: "forman",
  name: "ex2",
  version: "0.0.0",
  displayName: "Example #2",
  main: "my-extension-2",
  contributes: {
    commands: [
      {
        command: "ex2.foo",
        title: "Print Foo 2",
      },
      {
        command: "ex2.bar",
        title: "Show Bar 2",
        enablement: "view != 'ex2.bar'",
      },
    ],
    menus: {
      main: [
        {
          command: "ex2.foo",
          group: "print@2",
        },
        {
          command: "ex2.bar",
          group: "show@2",
        },
      ],
    },
    views: {
      main: [
        {
          id: "ex2.bar",
          title: "Bar 2",
        },
      ],
    },
  },
};

const manifest3: ExtensionManifest = {
  provider: "forman",
  name: "ex3",
  version: "0.0.0",
  displayName: "Example #3",
  main: "my-extension-3",
  contributes: {
    commands: [
      {
        command: "ex3.bar",
        title: "Print Bar 3",
      },
      {
        command: "ex3.pippo",
        title: "Show Pippo 3",
        enablement: "view != 'ex3.pippo'",
      },
    ],
    menus: {
      main: [
        {
          command: "ex3.bar",
          group: "print@3",
        },
        {
          command: "ex3.pippo",
          group: "show@3",
        },
      ],
    },
    views: {
      main: [
        {
          id: "ex3.pippo",
          title: "Pippo 3",
        },
      ],
    },
  },
};

const availableExtensions: ExtensionManifest[] = [
  manifest1,
  manifest2,
  manifest3,
];

export default availableExtensions;
