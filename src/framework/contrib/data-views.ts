import React from "react";
import type { JSONSchemaType } from "ajv";
import {
  type ContributionPoint,
  loadCodeContribution,
  registerCodeContribution,
  useContributions,
} from "@/core";
import { Disposable, type DisposableLike } from "@/util/disposable";

export interface DataViewManifestEntry {
  viewType: string;
  title: string;
  icon?: string;
}

export interface DataView extends DataViewManifestEntry {}

export interface DataViewInstance extends DataView, DisposableLike {
  id: string;
  component: React.JSX.Element;
}

const dataViewSchema: JSONSchemaType<DataViewManifestEntry> = {
  type: "object",
  properties: {
    viewType: { type: "string" },
    title: { type: "string" },
    icon: { type: "string", nullable: true },
  },
  required: ["viewType", "title"],
  additionalProperties: false,
};

const schema: JSONSchemaType<DataViewManifestEntry[]> = {
  type: "array",
  items: dataViewSchema,
};

/**
 * The "views" contribution point.
 * To register in your app, call {@link registerContributionPoint} with
 * {@link dataViewsPoint}.
 *
 * @category UI Contributions API
 */
export const dataViewsPoint: ContributionPoint<DataViewManifestEntry[]> = {
  id: "dataViews",
  manifestInfo: {
    schema,
  },
  codeInfo: {
    idKey: "viewType",
    activationEvent: "onDataView:${id}",
  },
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
  return loadCodeContribution<DataViewProvider>(dataViewsPoint.id, viewType);
}
