/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { keyFromArray } from "@/util/key";
import { LogLevel } from "./level";

/**
 * A logger.
 */
export class Logger {
  private static instances = new Map<string, Logger>();
  private static globalLevel = LogLevel.get("DEFAULT")!;
  private seenWarnings = new Set<string>();

  /*
   * Gets a global, optionally named, logger instance.
   *
   * @param name - An optional logger name.
   * @returns A global logger instance.
   */
  static getLogger(name?: string): Logger {
    const key = name ?? "";
    let logger = Logger.instances.get(key);
    if (!logger) {
      logger = new Logger(key);
      Logger.instances.set(key, logger);
    }
    return logger!;
  }

  /**
   * Gets the global log level applicable to all loggers.
   */
  static getGlobalLevel(): LogLevel {
    return Logger.globalLevel;
  }

  /**
   * Sets the global log level applicable to all loggers.
   * @param level - The new global log level or level label
   * @returns The previous global level
   */
  static setGlobalLevel(level: LogLevel | string): LogLevel {
    const prevLevel = Logger.globalLevel;
    Logger.globalLevel = LogLevel.get(level, prevLevel);
    return prevLevel;
  }

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
    return this.level ?? Logger.getGlobalLevel();
  }

  /**
   * Sets the logger's level.
   * @param level - the new level or level label or `null`, or `undefined`.
   */
  setLevel(level: LogLevel | string | undefined | null) {
    if (!level) {
      this.level = undefined;
    } else {
      this.level = LogLevel.get(level);
    }
  }

  /**
   * Checks whether this logger is enabled.
   */
  isEnabled(): boolean {
    return Logger.getGlobalLevel().value >= 0 && this.getLevel().value >= 0;
  }

  /**
   * Checks whether this logger is enabled for the given the log level.
   * @param levelOrLabel - The log level or level label.
   */
  isLevelEnabled(levelOrLabel: LogLevel | string): boolean {
    if (!this.isEnabled()) {
      return false;
    }
    const level = LogLevel.get(levelOrLabel);
    return (
      !!level &&
      level.value >= Logger.getGlobalLevel().value &&
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
  log(levelOrData: LogLevel | unknown, ...data: unknown[]): void {
    let level: LogLevel;
    if (levelOrData instanceof LogLevel) {
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
