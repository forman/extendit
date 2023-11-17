/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import React from "react";
import type { JSONSchemaType } from "ajv";
import {
  type ContributionPoint,
  loadCodeContribution,
  registerCodeContribution,
} from "@/core";
import { useContributions } from "@/react";
import { Disposable, type DisposableLike } from "@/util/disposable";

/**
 * A data view type in a package JSON.
 */
export interface DataViewManifestEntry {
  viewType: string;
  title: string;
  icon?: string;
}

/**
 * A data view types is used to describe a data view instances.
 */
export interface DataViewType extends DataViewManifestEntry {}

/**
 * A data view instance created from a data view provider.
 */
export interface DataView extends DataViewType, DisposableLike {
  id: string;
  component: React.JSX.Element;
}

/**
 * Used to create new data views from data view types.
 */
export interface DataViewProvider {
  createDataView(dataViewType: DataViewType): DataView;
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
 * The "dataViews" contribution point.
 *
 * JSON contributions to this point are represented by type
 * {@link DataViewManifestEntry}.
 *
 * Code contributions to this point are made using the
 * {@link registerDataViewProvider} that accepts an argument of type
 * {@link DataViewProvider}.
 *
 * @experimental
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

export function useDataViewTypes(): DataViewType[] {
  return useContributions<DataViewType>(dataViewsPoint.id);
}

export function useDataViewType(viewType: string): DataViewType {
  const dataViews = useDataViewTypes();
  const dataView = dataViews.find((dv) => dv.viewType === viewType);
  if (!dataView) {
    throw new Error(`Unknown data view type "${viewType}".`);
  }
  return dataView;
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
