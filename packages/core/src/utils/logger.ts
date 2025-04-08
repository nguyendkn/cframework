import { IServiceCollection } from "../di/interfaces";
import { Singleton } from "../di/decorators";

/**
 * Log level enum
 */
export enum LogLevel {
  Trace = 0,
  Debug = 1,
  Information = 2,
  Warning = 3,
  Error = 4,
  Critical = 5,
  None = 6,
}

/**
 * Logger interface
 */
export interface ILogger {
  log(level: LogLevel, message: string, ...args: any[]): void;
  trace(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  critical(message: string, ...args: any[]): void;
}

/**
 * Logger factory interface
 */
export interface ILoggerFactory {
  createLogger(category: string): ILogger;
}

/**
 * Console logger implementation
 */
@Singleton()
export class ConsoleLogger implements ILogger {
  constructor(
    private readonly category: string,
    private readonly minLevel: LogLevel = LogLevel.Information
  ) {}

  /**
   * Log a message
   */
  public log(level: LogLevel, message: string, ...args: any[]): void {
    if (level < this.minLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const formattedMessage = this.formatMessage(message, args);
    const levelName = LogLevel[level];

    const logMessage = `[${timestamp}] [${levelName}] [${this.category}] ${formattedMessage}`;

    switch (level) {
      case LogLevel.Trace:
      case LogLevel.Debug:
        console.debug(logMessage);
        break;
      case LogLevel.Information:
        console.info(logMessage);
        break;
      case LogLevel.Warning:
        console.warn(logMessage);
        break;
      case LogLevel.Error:
      case LogLevel.Critical:
        console.error(logMessage);
        break;
    }
  }

  /**
   * Format a message with arguments
   */
  private formatMessage(message: string, args: any[]): string {
    if (args.length === 0) {
      return message;
    }

    return message.replace(/{(\d+)}/g, (match, index) => {
      const argIndex = parseInt(index, 10);
      return argIndex < args.length ? this.formatArg(args[argIndex]) : match;
    });
  }

  /**
   * Format an argument
   */
  private formatArg(arg: any): string {
    if (arg === null) {
      return "null";
    }

    if (arg === undefined) {
      return "undefined";
    }

    if (typeof arg === "object") {
      try {
        return JSON.stringify(arg);
      } catch {
        return arg.toString();
      }
    }

    return String(arg);
  }

  /**
   * Log a trace message
   */
  public trace(message: string, ...args: any[]): void {
    this.log(LogLevel.Trace, message, ...args);
  }

  /**
   * Log a debug message
   */
  public debug(message: string, ...args: any[]): void {
    this.log(LogLevel.Debug, message, ...args);
  }

  /**
   * Log an info message
   */
  public info(message: string, ...args: any[]): void {
    this.log(LogLevel.Information, message, ...args);
  }

  /**
   * Log a warning message
   */
  public warn(message: string, ...args: any[]): void {
    this.log(LogLevel.Warning, message, ...args);
  }

  /**
   * Log an error message
   */
  public error(message: string, ...args: any[]): void {
    this.log(LogLevel.Error, message, ...args);
  }

  /**
   * Log a critical message
   */
  public critical(message: string, ...args: any[]): void {
    this.log(LogLevel.Critical, message, ...args);
  }
}

/**
 * Console logger factory implementation
 */
@Singleton()
export class ConsoleLoggerFactory implements ILoggerFactory {
  constructor(private readonly minLevel: LogLevel = LogLevel.Information) {}

  /**
   * Create a logger
   */
  public createLogger(category: string): ILogger {
    return new ConsoleLogger(category, this.minLevel);
  }
}

/**
 * Add logging to the service collection
 */
export function addLogging(
  services: IServiceCollection,
  minLevel: LogLevel = LogLevel.Information
): IServiceCollection {
  services.addSingleton(ILoggerFactory, new ConsoleLoggerFactory(minLevel));
  return services;
}
