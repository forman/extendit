import { useMemo } from "react";
import { useViews, ViewComponent } from "@/contrib";
import { useAppContext, useAppStore } from "./app-store";

function ViewContainer() {
  const selectedViewId = useAppStore((s) => s.viewId);
  const views = useViews("main", useAppContext());

  const selectedView = useMemo(
    () => views.find((v) => v.id === selectedViewId) ?? null,
    [selectedViewId, views]
  );

  return (
    <div style={{ width: "100%" }}>
      <h1>
        Current View: {selectedView ? selectedView.title : "No view selected"}
      </h1>
      <p>
        Shows a selected view (UI component) of the <code>views</code>{" "}
        contribution point:
      </p>
      <div>
        {selectedView && (
          <ViewComponent key={selectedViewId} viewId={selectedView.id} />
        )}
      </div>
    </div>
  );
}

export default ViewContainer;
