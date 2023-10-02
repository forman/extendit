import { describe, expect, test, beforeAll, afterAll } from "vitest";
import {
  type Configuration,
  type ConfigurationCategory,
  categoriesToNodes,
} from "@/contrib/configuration";
import { registerExtension } from "@/core";
import { newTestManifest } from "@/test/testing";
import { Disposable } from "@/util";

describe("categoriesToNodes", () => {
  const subscriptions: Disposable[] = [];

  beforeAll(() => {
    // internal built-in extension
    subscriptions.push(
      registerExtension(
        newTestManifest({
          provider: "forman",
          name: "xcube-ui",
          displayName: "xcube UI",
        }),
        // Makes this an internal built-in module
        { module: { activate: () => {} } }
      )
    );
    // external extension
    subscriptions.push(
      registerExtension(
        newTestManifest({
          provider: "forman",
          name: "geo-db",
          displayName: "geoDB",
        })
      )
    );
  });

  afterAll(() => {
    Disposable.from(...subscriptions).dispose();
  });

  const viewCategory: ConfigurationCategory = {
    title: "View",
    properties: {
      "view.actionBarLimit": {
        type: "integer",
        description: "How many visible action bar items",
      },
      "view.hideAllActions": {
        type: "boolean",
        description: "Whether to show all actions in a more menu",
      },
    },
  };

  const mapCategory: ConfigurationCategory = {
    title: "Map",
    properties: {
      "view.hideBackgroundLayer": {
        type: "boolean",
        description: "Whether to show all actions in a more menu",
      },
      "map.backgroundLayers": {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string", minLength: 1 },
            url: { type: "string", format: "url" },
          },
          additionalProperties: false,
        },
        description: "Background layers",
        additionalItems: false,
      },
    },
  };

  const geoDbCategory: ConfigurationCategory = {
    title: "geoDB",
    properties: {
      "geoDB.server.url": {
        type: "string",
        format: "uri",
        description: "geoDB Server URL",
      },
      "geoDB.server.userName": {
        type: "string",
        description: "User name",
      },
      "geoDB.server.password": {
        type: "string",
        format: "password",
        description: "Password",
      },
    },
  };

  const viewCategoryWithFamily: ConfigurationCategory = {
    ...viewCategory,
    familyTitle: "Appearance",
  };

  test("category with familyTitle", () => {
    const nodes = categoriesToNodes(
      new Map([["forman.xcube-ui", viewCategoryWithFamily]]),
      ["Appearance", "I/O"]
    );
    expect(nodes.length).toEqual(1);
    const node0 = nodes[0];
    expect(node0.title).toEqual("Appearance");
    expect(node0.order).toEqual(0);
    expect(node0.children).toBeDefined();
    expect(node0.category).toBeUndefined();
    expect(node0.children!.length).toEqual(1);
    const node00 = node0.children![0];
    expect(node00.title).toEqual("View");
    expect(node00.order).toEqual(1000000);
    expect(node00.children).toBeUndefined();
    expect(node00.category).toBe(viewCategoryWithFamily);
  });

  test("category without familyTitle", () => {
    const nodes = categoriesToNodes(
      new Map([["forman.xcube-ui", viewCategory]]),
      ["Appearance", "Map"]
    );
    expect(nodes.length).toEqual(1);
    const node0 = nodes[0];
    expect(node0.title).toEqual("View");
    expect(node0.order).toEqual(1000000);
    expect(node0.children).toBeUndefined();
    expect(node0.category).toBe(viewCategory);
  });

  test("categories from built-in and extension, alpha sort", () => {
    const configurations = new Map<string, Configuration>([
      ["forman.xcube-ui", [viewCategory, mapCategory]],
      ["forman.geo-db", geoDbCategory],
    ]);
    const nodes = categoriesToNodes(configurations, []);
    expect(nodes.length).toEqual(3);
    expect(nodes.map((n) => n.title)).toEqual(["geoDB", "Map", "View"]);
    expect(nodes.map((n) => n.category)).toEqual([
      geoDbCategory,
      mapCategory,
      viewCategory,
    ]);
    expect(nodes.map((n) => n.children)).toEqual([
      undefined,
      undefined,
      undefined,
    ]);
  });

  test("categories from built-in and extension, order sort", () => {
    const configurations = new Map<string, Configuration>([
      [
        "forman.xcube-ui",
        [
          { ...mapCategory, order: 2 },
          { ...viewCategory, order: 1 },
        ],
      ],
      ["forman.geo-db", { ...geoDbCategory, order: 10 }],
    ]);
    const nodes = categoriesToNodes(configurations, []);
    expect(nodes.length).toEqual(3);
    expect(nodes.map((n) => n.title)).toEqual(["View", "Map", "geoDB"]);
  });
});
