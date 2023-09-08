import { keyFromArray } from "@/util/key";

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
}

let logLevel: LogLevel = import.meta.env.PROD ? LogLevel.WARN : LogLevel.ALL;

/**
 * Gets the global log level.
 */
export function getLevel(): LogLevel {
  return logLevel;
}

/**
 * Sets the global log level.
 * @param level - The new global log level
 * @returns The previous global level
 */
export function setLevel(level: LogLevel): LogLevel {
  const prevLevel = logLevel;
  logLevel = level;
  return prevLevel;
}

/**
 * A logger.
 */
export class Logger {
  private seenWarnings = new Set<string>();

  /**
   * Constructs a new logger.
   * @param name - Logger name
   * @param level - Logger level. Defaults to the global log level
   * @param logFn - Logger function. Defaults to `console.log`
   */
  constructor(
    private readonly name: string,
    private level?: LogLevel,
    private logFn?: (...data: unknown[]) => void
  ) {}

  /**
   * Gets the logger's name.
   */
  getName(): string {
    return this.name;
  }

  /**
   * Gets the logger's level.
   */
  getLevel(): LogLevel {
    return this.level ?? logLevel;
  }

  /**
   * Sets the logger's level.
   * @param level - the new level or undefined
   */
  setLevel(level: LogLevel | undefined | null) {
    this.level = !level ? undefined : level;
  }

  /**
   * Checks whether this logger is enabled.
   */
  isEnabled(): boolean {
    return getLevel().value >= 0 && this.getLevel().value >= 0;
  }

  /**
   * Checks whether this logger is enabled for the given the log level.
   * @param level - the log level
   */
  isLevelEnabled(level: LogLevel): boolean {
    return (
      this.isEnabled() &&
      level.value >= getLevel().value &&
      level.value >= this.getLevel().value
    );
  }

  /**
   * Log data with debug level.
   * @param data - Data to log.
   */
  debug(...data: unknown[]) {
    this.log(LogLevel.DEBUG, ...data);
  }

  /**
   * Log data with information level.
   * @param data - Data to log.
   */
  info(...data: unknown[]) {
    this.log(LogLevel.INFO, ...data);
  }

  /**
   * Log data with warning level.
   * @param data - Data to log.
   */
  warn(...data: unknown[]) {
    this.log(LogLevel.WARN, ...data);
  }

  /**
   * Log data once with warning level.
   * @param data - Data to log.
   */
  warnOnce(...data: unknown[]) {
    const seenWarning = keyFromArray(data);
    if (!this.seenWarnings.has(seenWarning)) {
      this.warn(...data);
      this.seenWarnings.add(seenWarning);
    }
  }

  /**
   * Log data with error level.
   * @param data - Data to log.
   */
  error(...data: unknown[]) {
    this.log(LogLevel.ERROR, ...data);
  }

  /**
   * Log data with level given by {@link getLevel}.
   * @param data - Data to log
   */
  log(...data: unknown[]): void;
  /**
   * Log data with given level.
   * @param level - Log level
   * @param data - Data to log
   */
  log(level: LogLevel, ...data: unknown[]): void;
  log(levelOrData: LogLevel, ...data: unknown[]): void {
    let level: LogLevel;
    if ((levelOrData as unknown) instanceof LogLevel) {
      level = levelOrData;
    } else {
      level = this.getLevel();
      data = [levelOrData, ...data];
    }
    if (this.isLevelEnabled(level)) {
      const logFn =
        this.logFn ?? level.logFn ?? this.getLevel().logFn ?? console.log;
      logFn(
        `%c${level.label} [${this.name}]`,
        level.style ?? "font-weight:bold;",
        ...data
      );
    }
  }
}
