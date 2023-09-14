import React, { useEffect, useState } from "react";
import type { JSONSchemaType } from "ajv";
import {
  type CodeContributionPoint,
  getCodeContribution,
  registerCodeContribution,
  useContributions,
} from "@/core";
import { Disposable } from "@/util/disposable";
import * as log from "@/util/log";

const LOG = new log.Logger("contrib/data-views");

export interface DataView {
  viewType: string;
  displayName: string;
  icon?: string;
}


const viewSchema: JSONSchemaType<DataView> = {
  type: "object",
  properties: {
    viewType: { type: "string" },
    displayName: { type: "string" },
    icon: { type: "string", nullable: true },
  },
  required: ["viewType", "displayName"],
  additionalProperties: false,
};

const schema: JSONSchemaType<Record<string, DataView[]>> = {
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
export const dataViewsPoint: CodeContributionPoint<Record<string, DataView[]>> = {
  id: "dataViews",
  schema,
  idKey: "viewType",
  activationEvent: "onDataView:${id}",
};


export function useDataViews(containerId: string): DataView[] {
  return useContributions<DataView>(dataViewsPoint.id, containerId);
}

export interface DataViewProvider {

}

export function registerDataViewProvider(
  viewType: string,
  dataViewProvider: DataViewProvider
): Disposable {
  return registerCodeContribution(dataViewsPoint.id, viewType, dataViewProvider);
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
        dataViewsPoint as CodeContributionPoint, // FIXME!
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

export interface DataViewComponentProps {
  viewId: string;
}

export function DataViewComponent({ viewId }: DataViewComponentProps) {
  return useViewComponent(viewId);
}
