import { expect, test } from "vitest";
import { getCodeContributions } from "./get";
import { registerCodeContribution } from "./register";
import { Disposable } from "@/util";

test("getCodeContributions", () => {
  let codeContributions = getCodeContributions("items");
  expect(codeContributions).toBeUndefined();

  const disposable = Disposable.from(
    registerCodeContribution("items", "id0", 10),
    registerCodeContribution("items", "id1", 11),
    registerCodeContribution("items", "id2", 12)
  );
  codeContributions = getCodeContributions("items");
  expect(codeContributions).toBeInstanceOf(Map);
  expect(codeContributions!.size).toEqual(3);
  expect(codeContributions!.get("id0")).toEqual(10);
  expect(codeContributions!.get("id1")).toEqual(11);
  expect(codeContributions!.get("id2")).toEqual(12);

  disposable.dispose();
});