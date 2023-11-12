/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { Logger, LogLevel } from "@/util/log";

let globalLevel: LogLevel;

beforeEach(() => {
  globalLevel = Logger.getGlobalLevel();
});

afterEach(() => {
  Logger.setGlobalLevel(globalLevel);
});

test("logger global level", () => {
  expect(globalLevel).toBeInstanceOf(LogLevel);
  const oldLevel = Logger.setGlobalLevel(LogLevel.INFO);
  expect(oldLevel).toEqual(globalLevel);
  expect(Logger.getGlobalLevel()).toEqual(LogLevel.INFO);
});

describe("logger properties", () => {
  test("name", () => {
    const logger = new Logger("test");
    expect(logger.getName()).toEqual("test");
  });

  test("level", () => {
    Logger.setGlobalLevel(LogLevel.ALL);
    const logger = new Logger("test");
    expect(logger.getLevel()).toEqual(LogLevel.ALL);
    logger.setLevel(LogLevel.WARN);
    expect(logger.getLevel()).toEqual(LogLevel.WARN);
    logger.setLevel(undefined);
    expect(logger.getLevel()).toEqual(Logger.getGlobalLevel());
  });
});

describe("enablement", () => {
  function assertLoggerEnablement(
    logger: Logger,
    ok: boolean,
    debugOk: boolean,
    infoOk: boolean,
    warnOk: boolean,
    errorOk: boolean
  ) {
    expect(logger.isEnabled()).toBe(ok);
    expect(logger.isLevelEnabled(LogLevel.DEBUG)).toBe(debugOk);
    expect(logger.isLevelEnabled(LogLevel.INFO)).toBe(infoOk);
    expect(logger.isLevelEnabled(LogLevel.WARN)).toBe(warnOk);
    expect(logger.isLevelEnabled(LogLevel.ERROR)).toBe(errorOk);
  }

  test("global ALL and logger ALL", () => {
    Logger.setGlobalLevel(LogLevel.ALL);

    const logger = new Logger("test", LogLevel.ALL);
    assertLoggerEnablement(logger, true, true, true, true, true);

    logger.setLevel(LogLevel.INFO);
    assertLoggerEnablement(logger, true, false, true, true, true);

    logger.setLevel(LogLevel.WARN);
    assertLoggerEnablement(logger, true, false, false, true, true);

    logger.setLevel(LogLevel.ERROR);
    assertLoggerEnablement(logger, true, false, false, false, true);

    logger.setLevel(LogLevel.OFF);
    assertLoggerEnablement(logger, false, false, false, false, false);
  });

  test("global WARN and logger ALL", () => {
    Logger.setGlobalLevel(LogLevel.WARN);

    const logger = new Logger("test", LogLevel.ALL);
    assertLoggerEnablement(logger, true, false, false, true, true);

    logger.setLevel(LogLevel.INFO);
    assertLoggerEnablement(logger, true, false, false, true, true);

    logger.setLevel(LogLevel.WARN);
    assertLoggerEnablement(logger, true, false, false, true, true);

    logger.setLevel(LogLevel.ERROR);
    assertLoggerEnablement(logger, true, false, false, false, true);

    logger.setLevel(LogLevel.OFF);
    assertLoggerEnablement(logger, false, false, false, false, false);
  });
});

describe("logging methods", () => {
  function logStuff(logger: Logger) {
    logger.debug("More frogs coming in,", 1000, "we have");
    logger.info("Good amount of frogs, ", 100, "are enough");
    logger.warn("Low on frogs,", 10, "left");
    logger.error("Out of frogs,", 0, "left");
    logger.log(new LogLevel("TEST", 10), "Say hello to", 25, "salamanders");
    logger.log("Say hello to", 26, "salamanders");

    logger.warnOnce("Seen more salamanders than frags");
    logger.warnOnce("Seen more salamanders than frags");
    logger.warnOnce("Salamanders take over!");
    logger.warnOnce("Salamanders take over!");
    logger.warnOnce("Salamanders take over!");
  }

  test("using console with global level", () => {
    const logger = new Logger("test");
    logStuff(logger);
  });

  test("using console with logger level", () => {
    const logger = new Logger("test", LogLevel.ALL);
    logStuff(logger);
  });

  test("generated records", () => {
    Logger.setGlobalLevel(LogLevel.ALL);

    const records: unknown[][] = [];
    const logFn = (...data: unknown[]) => {
      records.push(data);
    };

    const logger = new Logger("test", LogLevel.ALL, logFn);
    logStuff(logger);

    expect(records).toEqual([
      [
        "%cDEBUG [test]",
        "color:green;font-weight:bold;",
        "More frogs coming in,",
        1000,
        "we have",
      ],
      [
        "%cINFO [test]",
        "color:blue;font-weight:bold;",
        "Good amount of frogs, ",
        100,
        "are enough",
      ],
      [
        "%cWARN [test]",
        "color:orange;font-weight:bold;",
        "Low on frogs,",
        10,
        "left",
      ],
      [
        "%cERROR [test]",
        "color:red;font-weight:bold;",
        "Out of frogs,",
        0,
        "left",
      ],
      ["%cTEST [test]", "font-weight:bold;", "Say hello to", 25, "salamanders"],
      ["%cALL [test]", "font-weight:bold;", "Say hello to", 26, "salamanders"],
      [
        "%cWARN [test]",
        "color:orange;font-weight:bold;",
        "Seen more salamanders than frags",
      ],
      [
        "%cWARN [test]",
        "color:orange;font-weight:bold;",
        "Salamanders take over!",
      ],
    ]);
  });
});
