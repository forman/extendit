import Ajv from "ajv";

/**
 * Singleton instance of "Another JSON Validator".
 * Implementation detail, no public API.
 */
const ajv = new Ajv({});

export default ajv;
