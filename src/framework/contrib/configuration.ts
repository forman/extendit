import { type ContributionPoint, useContributions } from "@/core";
import type { JSONSchemaType } from "ajv";
import { getExtensionContext } from "@/core/store";
import { jsonMetaSchema, newId, toTitle, type UiSchema } from "@/util";
import { useMemo } from "react";
//import * as log from "@/util/log";

//const LOG = new log.Logger("contrib/configurations");

export interface ConfigurationCategory {
  title: string;
  familyTitle?: string;
  order?: number;
  properties: Record<string, UiSchema>;
}

export type Configuration = ConfigurationCategory | ConfigurationCategory[];

export interface ConfigurationNode {
  id: string;
  title: string;
  order: number;
  category?: ConfigurationCategory;
  children?: ConfigurationNode[];
}

export interface ConfigurationBranchNode extends ConfigurationNode {
  children: ConfigurationNode[];
}

export interface ConfigurationTree extends ConfigurationBranchNode {
  id: "root";
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
  // Note, it is impossible to provide a schema that makes AJV happy with given
  // JSONSchemaType<Configuration>. It is a nightmare,
  // don't try, it is wasted time! That's why we fake it here.
  schema: configurationSchema as unknown as JSONSchemaType<Configuration>,
};

/**
 * Returns a mapping from extension identifier to the configuration
 * provided by that extension.
 */
export function useConfigurations(): Map<string, Configuration> {
  return useContributions<Configuration>(
    configurationPoint.id,
    undefined,
    true
  );
}

/**
 * Returns a mapping from configuration property name to the UI schema used by
 * that property.
 */
export function useConfigurationSchemas(): Map<string, UiSchema> {
  const configurations = useConfigurations();
  return useMemo(
    () => getSchemasFromConfigurations(configurations),
    [configurations]
  );
}

function getSchemasFromConfigurations(
  configurations: Map<string, Configuration>
): Map<string, UiSchema> {
  const schemas = new Map<string, UiSchema>();
  collectSchemasFromConfigurations(configurations, schemas);
  return schemas;
}

function collectSchemasFromConfigurations(
  configurations: Map<string, Configuration>,
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
  Object.entries(category.properties).forEach(([name, schema]) => {
    schemas.set(name, schema);
  });
}

export function useConfigurationTree(
  familyTitles: string[]
): ConfigurationTree {
  const configurations = useConfigurations();
  return useMemo(
    () => ({
      id: "root",
      title: "Root",
      order: 0,
      children: getNodesFromConfigurations(configurations, familyTitles),
    }),
    [configurations, familyTitles]
  );
}

const defaultOrder = 1e6;

// export for local test only
export function getNodesFromConfigurations(
  configurations: Map<string, Configuration>,
  familyTitles: string[]
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
          familyNodes
        );
      });
    } else {
      collectFamilyNodesFromCategory(
        categoryOrArrayOf,
        defaultFamilyTitle,
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
  familyNodes: Map<string, ConfigurationNode>
) {
  let familyTitle = category.familyTitle || defaultFamilyTitle;
  let familyNode = familyTitle ? familyNodes.get(familyTitle) : undefined;
  if (familyNode) {
    familyNode.children!.push(nodeFromCategory(category));
  } else {
    if (familyTitle) {
      familyNode = nodeFromChildren(familyTitle, defaultOrder, [
        nodeFromCategory(category),
      ]);
    } else {
      familyNode = nodeFromCategory(category);
      familyTitle = category.title;
    }
    familyNodes.set(familyTitle, familyNode);
  }
}

function nodeFromCategory(category: ConfigurationCategory): ConfigurationNode {
  return {
    id: newId(),
    title: category.title,
    order: typeof category.order === "number" ? category.order : defaultOrder,
    category: category,
  };
}

function nodeFromChildren(
  title: string,
  order: number,
  children: ConfigurationNode[]
): ConfigurationNode {
  return {
    id: newId(),
    title,
    order,
    children,
  };
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
  configurationTree: ConfigurationTree
): ConfigurationItem[] {
  return useMemo(
    () => getConfigurationItems(configurationTree),
    [configurationTree]
  );
}

function getConfigurationItems(
  configurationTree: ConfigurationTree
): ConfigurationItem[] {
  const items: ConfigurationItem[] = [];
  collectConfigurationItems(configurationTree.children, [], items);
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
