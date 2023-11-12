/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { expect, test } from "vitest";
import * as util from "./index";

test("Framework Util API is complete", () => {
  const api = Object.getOwnPropertyNames(util);
  api.sort();
  expect(api).toEqual([
    "AssertionError",
    "Disposable",
    "JsonValidationError",
    "assert",
    "assertDefined",
    "capitalize",
    "createSelector",
    "expr",
    "getDefaultUiValue",
    "isBooleanUiSchema",
    "isIntegerUiSchema",
    "isListUiSchema",
    "isNumberUiSchema",
    "isObjectUiSchema",
    "isStringUiSchema",
    "isTupleUiSchema",
    "jsonMetaSchema",
    "keyFromArray",
    "keyFromObject",
    "keyFromValue",
    "log",
    "newId",
    "toTitle",
    "validateJson",
  ]);
});
