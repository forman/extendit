import { expect, test } from "vitest";
import {
  useExtensions,
  useContributions,
  useContributionPoints,
} from "./hooks";

test("useExtensions", () => {
  // TODO: replace smoke test by React hook test
  expect(useExtensions).toBeInstanceOf(Function);
});

test("useContributions", () => {
  // TODO: replace smoke test by React hook test
  expect(useContributions).toBeInstanceOf(Function);
});

test("useContributionPoints", () => {
  // TODO: replace smoke test by React hook test
  expect(useContributionPoints).toBeInstanceOf(Function);
});
