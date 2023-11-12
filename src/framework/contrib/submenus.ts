/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { useMemo } from "react";
import type { JSONSchemaType } from "ajv";
import { type ContributionPoint } from "@/core";
import { useContributions } from "@/react";
import * as log from "@/util/log";

const LOG = new log.Logger("contrib/submenus");

export interface SubmenuManifestEntry {
  id: string;
  label: string;
}

export interface Submenu extends SubmenuManifestEntry {}

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
  manifestInfo: {
    schema,
  },
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
