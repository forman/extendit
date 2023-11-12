/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

/**
 * A log level.
 */
export class LogLevel {
  /**
   * Disables logging.
   */
  static readonly OFF = new LogLevel("OFF", -1);
  /**
   * Log always. Its value is 0.
   */
  static readonly ALL = new LogLevel("ALL", 0);
  /**
   * Log at debugging level. Its value is 100.
   */
  static readonly DEBUG = new LogLevel(
    "DEBUG",
    100,
    "color:green;font-weight:bold;",
    console.debug
  );
  /**
   * Log at information level. Its value is 200.
   */
  static readonly INFO = new LogLevel(
    "INFO",
    200,
    "color:blue;font-weight:bold;",
    console.info
  );
  /**
   * Log at warning level. Its value is 300.
   */
  static readonly WARN = new LogLevel(
    "WARN",
    300,
    "color:orange;font-weight:bold;",
    console.warn
  );
  /**
   * Log at error level. Its value is 400.
   */
  static readonly ERROR = new LogLevel(
    "ERROR",
    400,
    "color:red;font-weight:bold;",
    console.error
  );

  private static readonly DEFAULT = LogLevel.OFF;

  private static readonly LEVELS = new Map<string, LogLevel>(
    [
      LogLevel.OFF,
      LogLevel.ERROR,
      LogLevel.WARN,
      LogLevel.INFO,
      LogLevel.DEBUG,
      LogLevel.ALL,
    ]
      .map((level) => [level.label, level] as [string, LogLevel])
      .concat([["WARNING", LogLevel.WARN]])
  );

  /**
   * Constructs a new log level.
   * @param label Level label.
   * @param value Level value. Must be >= zero.
   * @param style Label CSS style. Defaults to `"font-weight:bold;"`.
   * @param logFn Logging function. Defaults to `console.log`.
   */
  constructor(
    readonly label: string,
    readonly value: number,
    readonly style?: string,
    readonly logFn?: (...data: unknown[]) => void
  ) {}

  static get(label: string): LogLevel | undefined;
  static get(label: string, defaultLevel: LogLevel): LogLevel;
  static get(label: string, defaultLevel?: LogLevel): LogLevel | undefined {
    const key = label.toUpperCase();
    if (key === "DEFAULT") {
      return import.meta.env.VITE_LOG_LEVEL
        ? LogLevel.get(import.meta.env.VITE_LOG_LEVEL, LogLevel.DEFAULT)
        : LogLevel.DEFAULT;
    }
    return LogLevel.LEVELS.has(key) ? LogLevel.LEVELS.get(key) : defaultLevel;
  }
}
