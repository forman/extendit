/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import Ajv from "ajv";

/**
 * Singleton instance of "Another JSON Validator".
 * Implementation detail, no public API.
 */
const ajv = new Ajv({});

export default ajv;
