import React, { useMemo } from "react";
import type { JSONSchemaType } from "ajv";
import {
  type CodeContributionPoint,
  type When,
  compileWhenClause,
  registerCodeContribution,
  useContributions,
} from "@/core";
import { useLoadCodeContribution } from "@/core/hooks";
import { Disposable } from "@/util/disposable";
import * as log from "@/util/log";

const LOG = new log.Logger("contrib/views");

export interface View {
  id: string;
  title?: string;
  icon?: string;
}

export interface JsonView extends View {
  when?: string;
}

interface ProcessedView extends View {
  when?: When;
}

const viewSchema: JSONSchemaType<JsonView> = {
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

const schema: JSONSchemaType<Record<string, JsonView[]>> = {
  type: "object",
  additionalProperties: {
    type: "array",
    items: viewSchema,
  },
  required: [],
};

/**
 * The "views" contribution point.
 * To register in your app, call {@link registerContributionPoint} with
 * {@link viewsPoint}.
 *
 * @category UI Contributions API
 */
export const viewsPoint: CodeContributionPoint<Record<string, View[]>> = {
  id: "views",
  schema,
  processManifestEntry: processContribution,
  idKey: "id",
  activationEvent: "onView:${id}",
};

function processContribution(
  views: Record<string, JsonView[]>
): Record<string, ProcessedView[]> {
  const processedContributions: Record<string, ProcessedView[]> = {};
  Object.entries(views).forEach(([k, v]) => {
    processedContributions[k] = v.map((view) => {
      const { when: whenClause, ...rest } = view;
      return { ...rest, when: compileWhenClause(whenClause) };
    });
  });
  return processedContributions;
}

export function useViews(
  containerId: string,
  ctx: Record<string, unknown>
): View[] {
  const views = useContributions<ProcessedView>(viewsPoint.id, containerId);
  return useMemo(() => {
    LOG.debug("Hook 'useViews' is recomputing");
    return views.filter((view) => (view.when ? view.when(ctx) : true));
  }, [views, ctx]);
}

export function registerViewComponent(
  viewId: string,
  component: React.JSX.Element
): Disposable {
  return registerCodeContribution(viewsPoint.id, viewId, component);
}

export function useViewComponent(
  viewId: string | null | undefined
): React.JSX.Element | undefined {
  const codeContribution = useLoadCodeContribution<
    React.JSX.Element,
    Record<string, View[]>
  >(viewsPoint, viewId);
  return (!codeContribution?.loading && codeContribution?.data) || undefined;
}

export interface ViewComponentProps {
  viewId: string;
}

export function ViewComponent({ viewId }: ViewComponentProps) {
  return useViewComponent(viewId);
}
