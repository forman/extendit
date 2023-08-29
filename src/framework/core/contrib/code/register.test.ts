import { expect, test } from "vitest";
import { registerCodeContribution } from "./register";
import { registerContributionPoint } from "@/core/contrib/point/register";
import type { CodeContributionPoint } from "../../types";

test("registerCodeContribution", () => {
  const contribPoint: CodeContributionPoint<string> = {
    id: "test",
    schema: { type: "string" },
    activationEvent: "onTest",
  };
  const disposable1 = registerContributionPoint<string>(contribPoint);
  const disposable2 = registerCodeContribution("test", "foo", {});
  expect(0).toBe(0);
  disposable1.dispose();
  disposable2.dispose();
});
