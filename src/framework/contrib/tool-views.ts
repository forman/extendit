/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import React, { useMemo } from "react";
import type { JSONSchemaType } from "ajv";
import {
  type ContributionPoint,
  type When,
  compileWhenClause,
  registerCodeContribution,
} from "@/core";
import { useContributions, useLoadCodeContribution } from "@/react";
import { Disposable } from "@/util/disposable";
import { Logger } from "@/util/log";

const LOG = Logger.getLogger("extendit/contrib/views");

/**
 * A tool view.
 */
export interface ToolView {
  id: string;
  title?: string;
  icon?: string;
}

/**
 * JSON representation of a tool view.
 */
export interface ToolViewManifestEntry extends ToolView {
  when?: string;
}

interface StoreToolView extends ToolView {
  when?: When;
}

const toolViewSchema: JSONSchemaType<ToolViewManifestEntry> = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string", nullable: true },
    icon: { type: "string", nullable: true },
    when: { type: "string", nullable: true },
  },
  required: ["id"],
  additionalProperties: false,
};

const schema: JSONSchemaType<Record<string, ToolViewManifestEntry[]>> = {
  type: "object",
  additionalProperties: {
    type: "array",
    items: toolViewSchema,
  },
  required: [],
};

/**
 * The "toolViews" contribution point.
 *
 * JSON contributions to this point are represented by type
 * {@link ToolViewManifestEntry}.
 *
 * Code contributions to this point are made using the
 * {@link registerToolViewComponent} that accepts a React component of type
 * `React.JSX.Element`.
 *
 * @experimental
 */
export const toolViewsPoint: ContributionPoint<Record<string, ToolView[]>> = {
  id: "toolViews",
  manifestInfo: {
    schema,
    processEntry,
  },
  codeInfo: {
    idKey: "id",
    activationEvent: "onToolView:${id}",
  },
};

function processEntry(
  views: Record<string, ToolViewManifestEntry[]>
): Record<string, StoreToolView[]> {
  const processedContributions: Record<string, StoreToolView[]> = {};
  Object.entries(views).forEach(([k, v]) => {
    processedContributions[k] = v.map((view) => {
      const { when: whenClause, ...rest } = view;
      return { ...rest, when: compileWhenClause(whenClause) };
    });
  });
  return processedContributions;
}

export function useToolViews(
  containerId: string,
  ctx: Record<string, unknown>
): ToolView[] {
  const views = useContributions<StoreToolView>(toolViewsPoint.id, containerId);
  return useMemo(() => {
    LOG.debug("Hook 'useToolViews' is recomputing");
    return views.filter((view) => (view.when ? view.when(ctx) : true));
  }, [views, ctx]);
}

export function registerToolViewComponent(
  viewId: string,
  component: React.JSX.Element
): Disposable {
  return registerCodeContribution(toolViewsPoint.id, viewId, component);
}

export function useToolViewComponent(
  viewId: string
): React.JSX.Element | undefined {
  const codeContribution = useLoadCodeContribution<React.JSX.Element>(
    toolViewsPoint.id,
    viewId
  );
  return (!codeContribution?.loading && codeContribution?.value) || undefined;
}

export interface ToolViewComponentProps {
  viewId: string;
}

export function ToolViewComponent({ viewId }: ToolViewComponentProps) {
  return useToolViewComponent(viewId);
}
