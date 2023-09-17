import React from "react";
import type { JSONSchemaType } from "ajv";
import {
  type CodeContributionPoint,
  getCodeContribution,
  registerCodeContribution,
  useContributions,
} from "@/core";
import { Disposable, type DisposableLike } from "@/util/disposable";

export interface DataView {
  viewType: string;
  title: string;
  icon?: string;
}

const dataViewSchema: JSONSchemaType<DataView> = {
  type: "object",
  properties: {
    viewType: { type: "string" },
    title: { type: "string" },
    icon: { type: "string", nullable: true },
  },
  required: ["viewType", "title"],
  additionalProperties: false,
};

const schema: JSONSchemaType<DataView[]> = {
  type: "array",
  items: dataViewSchema,
};

/**
 * The "views" contribution point.
 * To register in your app, call {@link registerContributionPoint} with
 * {@link viewsPoint}.
 *
 * @category UI Contributions API
 */
export const dataViewsPoint: CodeContributionPoint<DataView[]> = {
  id: "dataViews",
  schema,
  idKey: "viewType",
  activationEvent: "onDataView:${id}",
};

export function useDataViews(): DataView[] {
  return useContributions<DataView>(dataViewsPoint.id);
}

export function useDataView(viewType: string): DataView {
  const dataViews = useDataViews();
  const dataView = dataViews.find((dv) => dv.viewType === viewType);
  if (!dataView) {
    throw new Error(`Unknown data view type "${viewType}".`);
  }
  return dataView;
}

export interface DataViewInstance extends DataView, DisposableLike {
  id: string;
  component: React.JSX.Element;
}

export interface DataViewProvider {
  newDataViewInstance(dataView: DataView): DataViewInstance;
}

export function registerDataViewProvider(
  viewType: string,
  dataViewProvider: DataViewProvider
): Disposable {
  return registerCodeContribution(
    dataViewsPoint.id,
    viewType,
    dataViewProvider
  );
}

export async function getDataViewProvider(viewType: string) {
  return getCodeContribution<DataViewProvider, DataView[]>(
    dataViewsPoint,
    viewType
  );
}
