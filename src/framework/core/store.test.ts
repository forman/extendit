import { expect, test } from "vitest";
import { getStoreRecord, deleteStoreRecord, setStoreRecord } from "./store";

test("add and remove store record", () => {
  const commands = new Map<string, unknown>();
  expect(getStoreRecord("codeContributions", "commands")).toBeUndefined();
  setStoreRecord("codeContributions", "commands", commands);
  expect(getStoreRecord("codeContributions", "commands")).toBe(commands);
  deleteStoreRecord("codeContributions", "commands");
  expect(getStoreRecord("codeContributions", "commands")).toBeUndefined();
});
