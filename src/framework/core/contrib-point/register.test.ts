/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { expect, test } from "vitest";
import { registerContributionPoint } from "@/core/contrib-point/register";

test("registerContributionPoint", async () => {
  // TODO: replace smoke test by unit test
  expect(registerContributionPoint).toBeInstanceOf(Object);
});
