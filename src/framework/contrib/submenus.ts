import type { JSONSchemaType } from "ajv";
import { type ContributionPoint, useContributions } from "@/core";
import { useMemo } from "react";
import * as log from "@/util/log";

const LOG = new log.Logger("contrib/submenus");

export interface JsonSubmenu {
  id: string;
  label: string;
}

export interface Submenu extends JsonSubmenu {}

const submenuSchema: JSONSchemaType<Submenu> = {
  $id: "submenu",
  type: "object",
  properties: {
    id: { type: "string" },
    label: { type: "string" },
  },
  required: ["id", "label"],
  additionalProperties: false,
};

const schema: JSONSchemaType<Submenu[]> = {
  $id: "submenus",
  type: "array",
  items: submenuSchema,
};

/**
 * The "submenus" contribution point.
 * To register in your app, call {@link registerContributionPoint} with
 * {@link submenusPoint}.
 *
 * @category UI Contributions API
 */
export const submenusPoint: ContributionPoint<Submenu[]> = {
  id: "submenus",
  schema,
};

export function useSubmenus() {
  return useContributions<Submenu>(submenusPoint.id);
}

export function useSubmenusMap() {
  const submenus = useSubmenus();
  return useMemo(() => {
    LOG.debug("Hook 'useSubmenusMap' is recomputing");
    return new Map<string, Submenu>(submenus.map((sm) => [sm.id, sm]));
  }, [submenus]);
}
