import {describe, expect, test} from "vitest";
import * as log from "./log";
import {LogLevel} from "./log";


test('module properties', () => {
    const level = log.getLevel();
    expect(level).toEqual(log.LogLevel.ALL);
    const oldLevel = log.setLevel(log.LogLevel.INFO);
    expect(oldLevel).toEqual(level);
    expect(log.getLevel()).toEqual(log.LogLevel.INFO);
    log.setLevel(level);
})

describe('logger properties', () => {
    test('name', () => {
        const logger = new log.Logger("test");
        expect(logger.getName()).toEqual("test");
    })

    test('level', () => {
        const logger = new log.Logger("test");
        expect(logger.getLevel()).toEqual(log.LogLevel.ALL);
        logger.setLevel(log.LogLevel.WARN);
        expect(logger.getLevel()).toEqual(log.LogLevel.WARN);
        logger.setLevel(undefined);
        expect(logger.getLevel()).toEqual(log.getLevel());
    })
})

describe('enablement', () => {

    function assertLoggerEnablement(logger: log.Logger,
                                    ok: boolean,
                                    debugOk: boolean,
                                    infoOk: boolean,
                                    warnOk: boolean,
                                    errorOk: boolean) {
        expect(logger.isEnabled()).toBe(ok);
        expect(logger.isLevelEnabled(log.LogLevel.DEBUG)).toBe(debugOk);
        expect(logger.isLevelEnabled(log.LogLevel.INFO)).toBe(infoOk);
        expect(logger.isLevelEnabled(log.LogLevel.WARN)).toBe(warnOk);
        expect(logger.isLevelEnabled(log.LogLevel.ERROR)).toBe(errorOk);
    }

    test('global ALL and logger ALL', () => {
        const oldLevel = log.setLevel(log.LogLevel.ALL);

        const logger = new log.Logger("test", log.LogLevel.ALL);
        assertLoggerEnablement(logger,
            true, true, true, true, true,
        );

        logger.setLevel(log.LogLevel.INFO);
        assertLoggerEnablement(logger,
            true, false, true, true, true,
        );

        logger.setLevel(log.LogLevel.WARN);
        assertLoggerEnablement(logger,
            true, false, false, true, true,
        );

        logger.setLevel(log.LogLevel.ERROR);
        assertLoggerEnablement(logger,
            true, false, false, false, true,
        );

        logger.setLevel(log.LogLevel.OFF);
        assertLoggerEnablement(logger,
            false, false, false, false, false,
        );

        log.setLevel(oldLevel);
    })

    test('global WARN and logger ALL', () => {
        const oldLevel = log.setLevel(log.LogLevel.WARN);

        const logger = new log.Logger("test", log.LogLevel.ALL);
        assertLoggerEnablement(logger,
            true, false, false, true, true,
        );

        logger.setLevel(log.LogLevel.INFO);
        assertLoggerEnablement(logger,
            true, false, false, true, true,
        );

        logger.setLevel(log.LogLevel.WARN);
        assertLoggerEnablement(logger,
            true, false, false, true, true,
        );

        logger.setLevel(log.LogLevel.ERROR);
        assertLoggerEnablement(logger,
            true, false, false, false, true,
        );

        logger.setLevel(log.LogLevel.OFF);
        assertLoggerEnablement(logger,
            false, false, false, false, false,
        );

        log.setLevel(oldLevel);
    })
})

describe("logging methods", () => {
    function logStuff(logger: log.Logger) {
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

    test('using console with global level', () => {
        const logger = new log.Logger("test");
        logStuff(logger);
    });

    test('using console with logger level', () => {
        const logger = new log.Logger("test", log.LogLevel.ALL);
        logStuff(logger);
    });

    test('generated records', () => {
        const oldLevel = log.setLevel(log.LogLevel.ALL);

        const records: unknown[][] = [];
        const logFn = (...data: unknown[]) => {
            records.push(data);
        };

        const logger = new log.Logger("test", log.LogLevel.ALL, logFn);
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
            [
                "%cTEST [test]",
                "font-weight:bold;",
                "Say hello to",
                25,
                "salamanders"
            ],
            [
                "%cALL [test]",
                "font-weight:bold;",
                "Say hello to",
                26,
                "salamanders"
            ],
            [
                "%cWARN [test]",
                "color:orange;font-weight:bold;",
                "Seen more salamanders than frags",
            ],
            [
                "%cWARN [test]",
                "color:orange;font-weight:bold;",
                "Salamanders take over!",
            ]
        ]);

        log.setLevel(oldLevel);
    })

})
