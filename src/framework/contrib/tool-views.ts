import React, { useMemo } from "react";
import type { JSONSchemaType } from "ajv";
import {
  type ContributionPoint,
  type When,
  compileWhenClause,
  registerCodeContribution,
  useContributions,
} from "@/core";
import { useLoadCodeContribution } from "@/core/hooks";
import { Disposable } from "@/util/disposable";
import * as log from "@/util/log";

const LOG = new log.Logger("contrib/views");

export interface ToolView {
  id: string;
  title?: string;
  icon?: string;
}

export interface ToolViewJsonEntry extends ToolView {
  when?: string;
}

interface ProcessedToolView extends ToolView {
  when?: When;
}

const toolViewSchema: JSONSchemaType<ToolViewJsonEntry> = {
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

const schema: JSONSchemaType<Record<string, ToolViewJsonEntry[]>> = {
  type: "object",
  additionalProperties: {
    type: "array",
    items: toolViewSchema,
  },
  required: [],
};

/**
 * The "views" contribution point.
 * To register in your app, call {@link registerContributionPoint} with
 * {@link toolViewsPoint}.
 *
 * @category UI Contributions API
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
  views: Record<string, ToolViewJsonEntry[]>
): Record<string, ProcessedToolView[]> {
  const processedContributions: Record<string, ProcessedToolView[]> = {};
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
  const views = useContributions<ProcessedToolView>(
    toolViewsPoint.id,
    containerId
  );
  return useMemo(() => {
    LOG.debug("Hook 'useViews' is recomputing");
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
  return (!codeContribution?.loading && codeContribution?.data) || undefined;
}

export interface ToolViewComponentProps {
  viewId: string;
}

export function ToolViewComponent({ viewId }: ToolViewComponentProps) {
  return useToolViewComponent(viewId);
}
