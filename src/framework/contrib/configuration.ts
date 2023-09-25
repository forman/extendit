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
  order?: number;
  category?: ConfigurationCategory;
  children?: ConfigurationNode[];
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
      additionalItems: false,
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

export function useConfigurations(): Map<string, Configuration> {
  return useContributions<Configuration>(
    configurationPoint.id,
    undefined,
    true
  );
}

export function useConfigurationNodes(
  familyTitles: string[]
): ConfigurationNode[] {
  const configurations = useConfigurations();
  return useMemo(
    () => categoriesToNodes(configurations, familyTitles),
    [configurations, familyTitles]
  );
}

// export for local test only
export function categoriesToNodes(
  configurations: Map<string, Configuration>,
  familyTitles: string[]
): ConfigurationNode[] {
  const familyNodes = new Map<string, ConfigurationNode>(
    familyTitles.map((familyTitle, familyOrder) => [
      familyTitle,
      nodeFromChildren(familyTitle, [], familyOrder),
    ])
  );
  configurations.forEach((categoryOrArrayOf, extensionId) => {
    const ctx = getExtensionContext(extensionId, true);
    const defaultFamilyTitle = !ctx.builtIn ? toTitle(extensionId) : undefined;
    if (Array.isArray(categoryOrArrayOf)) {
      categoryOrArrayOf.forEach((category) => {
        collectCategory(category, defaultFamilyTitle, familyNodes);
      });
    } else {
      collectCategory(categoryOrArrayOf, defaultFamilyTitle, familyNodes);
    }
  });
  return sortNodes(
    [...familyNodes.values()].filter(
      (familyNode) => familyNode.category || familyNode.children?.length
    )
  );
}

function collectCategory(
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
      familyNode = nodeFromChildren(familyTitle, [nodeFromCategory(category)]);
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
    order: category.order,
    category: category,
  };
}

function nodeFromChildren(
  title: string,
  children: ConfigurationNode[],
  order?: number
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
  const order1 = typeof node1.order === "number" ? node1.order : 1e9;
  const order2 = typeof node2.order === "number" ? node2.order : 1e9;
  const delta = order1 - order2;
  if (delta !== 0) {
    return delta;
  }
  return node1.title.localeCompare(node2.title);
}
