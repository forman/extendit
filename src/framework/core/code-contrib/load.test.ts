import { describe, expect, test } from "vitest";
import { loadCodeContribution } from "./load";
import { registerCodeContribution } from "./register";
import { registerContributionPoint } from "@/core/contrib-point/register";
import { Disposable } from "@/util";

describe("loadCodeContribution", () => {
  test("with contribution point, with items", async () => {
    const disposable = Disposable.from(
      registerContributionPoint({
        id: "items",
        codeInfo: { activationEvent: `onItem` },
      }),
      registerCodeContribution("items", "id0", 10),
      registerCodeContribution("items", "id1", 11),
      registerCodeContribution("items", "id2", 12)
    );
    expect(await loadCodeContribution("items", "id0")).toEqual(10);
    expect(await loadCodeContribution("items", "id1")).toEqual(11);
    expect(await loadCodeContribution("items", "id2")).toEqual(12);

    disposable.dispose();
  });

  test("with contribution point, without items", async () => {
    const disposable = registerContributionPoint({
      id: "items",
      codeInfo: { activationEvent: `onItem` },
    });
    await expect(async () => {
      await loadCodeContribution("items", "id0");
    }).rejects.toThrowError("Unregistered code contribution 'items/id0'.");

    disposable.dispose();
  });

  test("without contribution point", async () => {
    await expect(async () => {
      await loadCodeContribution("items", "id0");
    }).rejects.toThrowError("Unregistered contribution point 'items'.");
  });
});
