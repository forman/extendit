import React, { useEffect, useMemo, useState } from "react";
import type { JSONSchemaType } from "ajv";
import {
  type CodeContributionPoint,
  type When,
  getCodeContribution,
  registerCodeContribution,
  useContributions,
  useFrameworkContext,
  whenClauseCompiler,
} from "@/core";
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
  processContribution,
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
      let when: When | undefined = undefined;
      if (whenClause) {
        when = whenClauseCompiler.compile(whenClause);
      }
      return { ...rest, when };
    });
  });
  return processedContributions;
}

export type ViewComponent = React.ComponentType;

export function useViews(containerId: string): View[] {
  const views = useContributions<ProcessedView>(viewsPoint.id, containerId);
  const ctx = useFrameworkContext();
  return useMemo(() => {
    LOG.debug("Hook 'useViews' is recomputing");
    return views.filter((view) => (view.when ? view.when(ctx) : false));
  }, [views, ctx]);
}

export function registerViewComponent(
  viewId: string,
  component: ViewComponent
): Disposable {
  return registerCodeContribution(viewsPoint.id, viewId, component);
}

export function useViewComponent(viewId: string | null): ViewComponent | null {
  const [viewComponent, setViewComponent] = useState<ViewComponent | null>(
    null
  );
  const [error, setError] = useState<unknown>(null);
  useEffect(() => {
    LOG.debug("Hook 'useViewComponent' is recomputing");

    if (!viewComponent && !error && viewId) {
      getCodeContribution<ViewComponent>(
        viewsPoint as CodeContributionPoint, // FIXME!
        viewId
      )
        .then((vc) => {
          setViewComponent(() => vc);
        })
        .catch((e: unknown) => {
          console.error(e);
          setError(e);
        });
    }
  }, [viewId, viewComponent, error]);
  return viewComponent;
}
