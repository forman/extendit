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
      return { ...rest, when: whenClauseCompiler.compile(whenClause) };
    });
  });
  return processedContributions;
}

export function useViews(containerId: string): View[] {
  const views = useContributions<ProcessedView>(viewsPoint.id, containerId);
  const ctx = useFrameworkContext();
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

interface ViewComponentState {
  viewId?: string | null;
  component: React.JSX.Element | null;
  error?: unknown;
}

const initState: ViewComponentState = {
  viewId: null,
  component: null,
};
export function useViewComponent(
  viewId: string | null
): React.JSX.Element | null {
  const [state, setState] = useState<ViewComponentState>(initState);
  useEffect(() => {
    LOG.debug("Hook 'useViewComponent' is recomputing");
    if (viewId) {
      if (viewId === state.viewId && (state.component || state.error)) {
        // If we have component, ok
        // If we have error, don't try again
        return;
      }
      getCodeContribution<React.JSX.Element>(
        viewsPoint as CodeContributionPoint, // FIXME!
        viewId
      )
        .then((component) => {
          setState({ viewId, component });
        })
        .catch((error: unknown) => {
          LOG.error(
            "Hook 'useViewComponent' failed due to following error:",
            error
          );
          setState({ viewId, component: null, error });
        });
    } else {
      setState(initState);
    }
  }, [viewId, state.component, state.viewId, state.error]);
  return viewId === state.viewId ? state.component : null;
}

export interface ViewComponentProps {
  viewId: string;
}

export function ViewComponent({ viewId }: ViewComponentProps) {
  return useViewComponent(viewId);
}
