/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import React from "react";
import type { JSONSchemaType } from "ajv";
import {
  type ContributionPoint,
  getContributions,
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
 * A data view type is used to describe a data view instances.
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
export interface DataViewProvider<Args extends unknown[] = unknown[]> {
  /**
   * Get or create a data view for the given data view type and optional
   * arguments.
   *
   * Typically, the function creates a new data view instance for the given
   * arguments. However, a data view type may define a singleton data view,
   * so subsequent calls of this function will return the same data view
   * instance.
   *
   * @param dataViewType - The data view type.
   * @param args - Arbitrary arguments understood by the data view to be
   *   created. Typically, they specify some data source to be displayed
   *   in the view
   * @returns An existing or new data view instance.
   */
  getDataView(dataViewType: DataViewType, ...args: Args): DataView;
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

export function getDataViewType(viewType: string): DataViewType | undefined;
export function getDataViewType(
  viewType: string,
  mustExist: true
): DataViewType;
export function getDataViewType(viewType: string, mustExist?: boolean) {
  const dataViewType = getContributions<DataViewType>(dataViewsPoint.id).find(
    (dataViewType) => dataViewType.viewType === viewType
  );
  if (!dataViewType && mustExist) {
    throw new Error(`No data view found for view type "${viewType}"`);
  }
  return dataViewType;
}

export async function getDataViewProvider(viewType: string) {
  return loadCodeContribution<DataViewProvider>(dataViewsPoint.id, viewType);
}
