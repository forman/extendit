import { useMemo } from "react";
import { type View, useViews, useViewComponent } from "@/contrib";
import { useAppStore } from "./app-store";

function ViewContainer() {
  const selectedViewId = useAppStore((s) => s.selectedViewId);
  const views = useViews();

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
          <ViewComponentContainer key={selectedViewId} view={selectedView} />
        )}
      </div>
    </div>
  );
}

interface ViewComponentContainerProps {
  view: View;
}

function ViewComponentContainer({ view }: ViewComponentContainerProps) {
  const ViewComponent = useViewComponent(view.id);
  if (ViewComponent !== null) {
    return <ViewComponent key={view.id} />;
  }
  return null;
}

export default ViewContainer;
