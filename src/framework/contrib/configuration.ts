/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { useMemo } from "react";
import type { JSONSchemaType } from "ajv";
import memoizeOne from "memoize-one";
import { type ContributionPoint, getExtensionContributions } from "@/core";
import { useExtensionContributions } from "@/react";
import {
  getDefaultUiValue,
  jsonMetaSchema,
  newId,
  toTitle,
  type UiSchema,
  type UiValue,
} from "@/util";
import { getExtensionContext } from "@/core/extension-context/get";
//import * as log from "@/util/log";

//const LOG = new log.Logger("contrib/configurations");

export interface ConfigurationCategory {
  title: string;
  familyTitle?: string;
  order?: number;
  properties: Record<string, UiSchema>;
}

export type Configuration = ConfigurationCategory | ConfigurationCategory[];
export type ConfigurationManifestEntry = Configuration;

export interface ConfigurationNode {
  id: string;
  title: string;
  order: number;
  category?: ConfigurationCategory;
  children?: ConfigurationNode[];
  numProperties: number;
}

const configurationCategorySchema = {
  type: "object",
  properties: {
    title: { type: "string", minLength: 1 },
    familyTitle: { type: "string", minLength: 1 },
    order: { type: "integer", minimum: 0 },
    properties: jsonMetaSchema,
  },
  required: ["title", "properties"],
  additionalProperties: false,
};

const configurationSchema = {
  oneOf: [
    configurationCategorySchema,
    {
      type: "array",
      items: configurationCategorySchema,
      minItems: 1,
    },
  ],
};

/**
 * The "configuration" contribution point.
 * To register in your app, call {@link registerContributionPoint} with
 * {@link configurationPoint}.
 *
 * @category UI Contributions API
 */
export const configurationPoint: ContributionPoint<Configuration> = {
  id: "configuration",
  manifestInfo: {
    // Note, it seems impossible to provide a schema that
    // makes AJV happy with given JSONSchemaType<Configuration>.
    // It is a nightmare, don't try, it is wasted time!
    // That's why we fake it here.
    schema: configurationSchema as unknown as JSONSchemaType<Configuration>,
  },
};

/**
 * Returns a mapping from extension identifier to the configuration
 * provided by that extension.
 */
export function useExtensionConfigurations(): ReadonlyMap<
  string,
  Configuration
> {
  return useExtensionContributions<Configuration>(configurationPoint.id);
}

/**
 * Returns a mapping from extension identifier to the configuration
 * provided by that extension.
 */
export function getExtensionConfigurations(): ReadonlyMap<
  string,
  Configuration
> {
  return getExtensionContributions<Configuration>(configurationPoint.id);
}

export function getConfigurationDefaultValue(propertyName: string): UiValue {
  return getDefaultUiValue(getConfigurationSchema(propertyName));
}

export function getConfigurationSchema(propertyName: string): UiSchema {
  const schema = getConfigurationSchemas().get(propertyName);
  if (!schema) {
    throw new Error(`Unknown configuration property '${propertyName}'.`);
  }
  return schema;
}

export function getConfigurationSchemas(): ReadonlyMap<string, UiSchema> {
  const configurations = getExtensionConfigurations();
  return getConfigurationSchemasMemo(configurations);
}

/**
 * Returns a mapping from configuration property name to the UI schema used by
 * that property.
 */
export function useConfigurationSchemas(): ReadonlyMap<string, UiSchema> {
  const configurations = useExtensionConfigurations();
  return getConfigurationSchemasMemo(configurations);
}

const getConfigurationSchemasMemo = memoizeOne(
  (
    configurations: ReadonlyMap<string, Configuration>
  ): ReadonlyMap<string, UiSchema> => {
    const schemas = new Map<string, UiSchema>();
    collectSchemasFromConfigurations(configurations, schemas);
    return schemas;
  }
);

function collectSchemasFromConfigurations(
  configurations: ReadonlyMap<string, Configuration>,
  schemas: Map<string, UiSchema>
) {
  configurations.forEach((categoryOrArrayOf) => {
    if (Array.isArray(categoryOrArrayOf)) {
      categoryOrArrayOf.forEach((category) => {
        collectSchemasFromCategory(category, schemas);
      });
    } else {
      collectSchemasFromCategory(categoryOrArrayOf, schemas);
    }
  });
}

function collectSchemasFromCategory(
  category: ConfigurationCategory,
  schemas: Map<string, UiSchema>
) {
  Object.entries(category.properties).forEach(
    ([propertyName, propertySchema]) => {
      schemas.set(propertyName, propertySchema);
    }
  );
}

export function useConfigurationNodes(
  familyTitles: string[],
  searchPattern?: string
): ConfigurationNode[] {
  const configurations = useExtensionConfigurations();
  if (searchPattern) {
    searchPattern = searchPattern.toLowerCase();
  }
  return useMemo(
    () =>
      getNodesFromConfigurations(configurations, familyTitles, searchPattern),
    [configurations, familyTitles, searchPattern]
  );
}

const defaultOrder = 1e6;

/**
 * Exported for local test only
 * @internal
 */
export function getNodesFromConfigurations(
  configurations: ReadonlyMap<string, Configuration>,
  familyTitles: string[],
  searchPattern?: string
): ConfigurationNode[] {
  const familyNodes = new Map<string, ConfigurationNode>(
    familyTitles.map((familyTitle, familyOrder) => [
      familyTitle,
      nodeFromChildren(familyTitle, familyOrder, []),
    ])
  );
  configurations.forEach((categoryOrArrayOf, extensionId) => {
    const ctx = getExtensionContext(extensionId, true);
    const defaultFamilyTitle = !ctx.builtIn ? toTitle(extensionId) : undefined;
    if (Array.isArray(categoryOrArrayOf)) {
      categoryOrArrayOf.forEach((category) => {
        collectFamilyNodesFromCategory(
          category,
          defaultFamilyTitle,
          searchPattern,
          familyNodes
        );
      });
    } else {
      collectFamilyNodesFromCategory(
        categoryOrArrayOf,
        defaultFamilyTitle,
        searchPattern,
        familyNodes
      );
    }
  });
  return sortNodes(
    [...familyNodes.values()].filter(
      (familyNode) => familyNode.category || familyNode.children?.length
    )
  );
}

function collectFamilyNodesFromCategory(
  category: ConfigurationCategory,
  defaultFamilyTitle: string | undefined,
  searchPattern: string | undefined,
  familyNodes: Map<string, ConfigurationNode>
) {
  if (searchPattern) {
    const filteredCategory = filterCategory(category, searchPattern);
    if (!filteredCategory) {
      return;
    }
    category = filteredCategory;
  }
  const categoryNode = nodeFromCategory(category);
  let familyTitle = category.familyTitle || defaultFamilyTitle;
  let familyNode = familyTitle ? familyNodes.get(familyTitle) : undefined;
  if (familyNode) {
    familyNode.children!.push(categoryNode);
    familyNode.numProperties += categoryNode.numProperties;
  } else {
    if (familyTitle) {
      familyNode = nodeFromChildren(familyTitle, defaultOrder, [categoryNode]);
    } else {
      familyNode = categoryNode;
      familyTitle = category.title;
    }
    familyNodes.set(familyTitle, familyNode);
  }
}

function filterCategory(
  category: ConfigurationCategory,
  searchPattern: string
): ConfigurationCategory | undefined {
  const unfilteredProps = Object.entries(category.properties);
  const filteredProps = unfilteredProps.filter((prop) =>
    matchProperty(prop, searchPattern)
  );
  if (filteredProps.length === 0) {
    return undefined;
  }
  if (filteredProps.length === unfilteredProps.length) {
    return category;
  }
  const properties: Record<string, UiSchema> = {};
  filteredProps.forEach(([name, schema]) => {
    properties[name] = schema;
  });
  return { ...category, properties };
}

function matchProperty(
  [name, schema]: [string, UiSchema],
  searchPattern: string
): boolean {
  return (
    textMatches(name, searchPattern) ||
    textMatches(schema.description, searchPattern) ||
    textMatches(schema.markdownDescription, searchPattern) ||
    (schema.type === "object" &&
      Object.entries(schema.properties).some((prop) =>
        matchProperty(prop, searchPattern)
      ))
  );
}

function textMatches(text: string | undefined, searchPattern: string) {
  if (!text) {
    return false;
  }
  return text.toLowerCase().indexOf(searchPattern) >= 0;
}

function nodeFromCategory(category: ConfigurationCategory): ConfigurationNode {
  const title = category.title;
  const order =
    typeof category.order === "number" ? category.order : defaultOrder;
  const numProperties = Object.values(category.properties)
    .filter((schema) => !schema.hidden)
    .reduce((n: number) => n + 1, 0);
  return { id: newId(), title, order, category, numProperties };
}

function nodeFromChildren(
  title: string,
  order: number,
  children: ConfigurationNode[]
): ConfigurationNode {
  const numProperties = children.reduce(
    (n: number, node) => n + node.numProperties,
    0
  );
  return { id: newId(), title, order, children, numProperties };
}

function sortNodes(
  configurationNodes: ConfigurationNode[]
): ConfigurationNode[] {
  return configurationNodes.map(sortNodeChildren).sort(compareNodes);
}

function sortNodeChildren(
  configurationNode: ConfigurationNode
): ConfigurationNode {
  const children = configurationNode.children;
  if (children) {
    return { ...configurationNode, children: sortNodes(children) };
  }
  return configurationNode;
}

function compareNodes(
  node1: ConfigurationNode,
  node2: ConfigurationNode
): number {
  const delta = node1.order - node2.order;
  if (delta !== 0) {
    return delta;
  }
  return node1.title.localeCompare(node2.title);
}

export interface ConfigurationItemBase {
  type: "header" | "property";
  id: string;
  titlePath: string[];
}

export interface ConfigurationHeaderItem extends ConfigurationItemBase {
  type: "header";
}

export interface ConfigurationPropertyItem extends ConfigurationItemBase {
  type: "property";
  schema: UiSchema;
}

export type ConfigurationItem =
  | ConfigurationHeaderItem
  | ConfigurationPropertyItem;

export function useConfigurationItems(
  configurationNodes: ConfigurationNode[]
): ConfigurationItem[] {
  return useMemo(
    () => getConfigurationItems(configurationNodes),
    [configurationNodes]
  );
}

function getConfigurationItems(
  configurationNodes: ConfigurationNode[]
): ConfigurationItem[] {
  const items: ConfigurationItem[] = [];
  collectConfigurationItems(configurationNodes, [], items);
  return items;
}

function collectConfigurationItems(
  nodes: ConfigurationNode[],
  titlePath: string[],
  items: ConfigurationItem[]
) {
  nodes.forEach((node) => {
    if (node.category) {
      items.push({
        type: "header",
        id: node.id,
        titlePath: [...titlePath, node.title],
      });
      Object.entries(node.category.properties)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, propertySchema]) => !propertySchema.hidden)
        .sort(compareCategoryProperties)
        .forEach(([propertyName, propertySchema]) => {
          items.push({
            type: "property",
            id: propertyName,
            titlePath: getCategoryPropertyTitlePath(node.title, propertyName),
            schema: propertySchema,
          });
        });
    } else if (node.children) {
      collectConfigurationItems(
        node.children,
        [...titlePath, node.title],
        items
      );
    }
  });
}

function compareCategoryProperties(
  [propertyName1, propertySchema1]: [string, UiSchema],
  [propertyName2, propertySchema2]: [string, UiSchema]
): number {
  const order1 =
    typeof propertySchema1.order === "number"
      ? propertySchema1.order
      : defaultOrder;
  const order2 =
    typeof propertySchema2.order === "number"
      ? propertySchema2.order
      : defaultOrder;
  const delta = order1 - order2;
  return delta !== 0 ? delta : propertyName1.localeCompare(propertyName2);
}

function getCategoryPropertyTitlePath(
  categoryTitle: string,
  propertyName: string
) {
  const titlePath = propertyName.split(".").map((name) => toTitle(name));
  if (titlePath.length > 1 && titlePath[0] === categoryTitle) {
    return titlePath.slice(1);
  }
  return titlePath;
}
