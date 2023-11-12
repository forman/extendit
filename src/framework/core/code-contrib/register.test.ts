/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { expect, test } from "vitest";
import type { ContributionPoint } from "@/core/types";
import { registerContributionPoint } from "@/core/contrib-point/register";
import { registerCodeContribution } from "@/core/code-contrib/register";

test("registerCodeContribution", () => {
  const contribPoint: ContributionPoint<string> = {
    id: "test",
    manifestInfo: {
      schema: { type: "string" },
    },
    codeInfo: {
      activationEvent: "onTest",
    },
  };
  const disposable1 = registerContributionPoint<string>(contribPoint);
  const disposable2 = registerCodeContribution("test", "foo", {});
  expect(0).toBe(0);
  disposable1.dispose();
  disposable2.dispose();
});
