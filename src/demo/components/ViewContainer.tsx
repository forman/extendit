/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { useMemo } from "react";
import { useToolViews, ToolViewComponent } from "@/contrib";
import { useAppContext, useAppStore } from "../app/store";
import ApiLink from "./ApiLink";

function ViewContainer() {
  const selectedViewId = useAppStore((s) => s.viewId);
  const views = useToolViews("main", useAppContext());

  const selectedView = useMemo(
    () => views.find((v) => v.id === selectedViewId) ?? null,
    [selectedViewId, views]
  );

  return (
    <div style={{ width: "100%" }}>
      <h2>
        Current View: {selectedView ? selectedView.title : "No view selected"}
      </h2>
      <p>
        Shows a selected view (UI component) of the{" "}
        <ApiLink
          module="contrib"
          type="variables"
          name="toolViewsPoint"
          text="toolViews"
        />{" "}
        contribution point.
      </p>
      <div>
        {selectedView && (
          <ToolViewComponent key={selectedViewId} viewId={selectedView.id} />
        )}
      </div>
    </div>
  );
}

export default ViewContainer;
