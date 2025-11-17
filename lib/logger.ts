// lib/logger.ts
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  error?: Error;
  data?: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, context, error, data } = entry;
    let formatted = `[${timestamp}] [${level.toUpperCase()}]`;

    if (context) {
      formatted += ` [${context}]`;
    }

    formatted += ` ${message}`;

    if (data) {
      formatted += `\nData: ${JSON.stringify(data, null, 2)}`;
    }

    if (error) {
      formatted += `\nError: ${error.message}`;
      if (error.stack) {
        formatted += `\nStack: ${error.stack}`;
      }
    }

    return formatted;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: string,
    error?: Error,
    data?: any
  ): void {
    if (!this.isDevelopment && level === 'debug') {
      return; // Skip debug logs in production
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      data,
    };

    const formattedMessage = this.formatMessage(entry);

    switch (level) {
      case 'error':
        console.error(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'debug':
        console.debug(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
  }

  info(message: string, context?: string, data?: any): void {
    this.log('info', message, context, undefined, data);
  }

  warn(message: string, context?: string, data?: any): void {
    this.log('warn', message, context, undefined, data);
  }

  error(message: string, context?: string, error?: Error, data?: any): void {
    this.log('error', message, context, error, data);
  }

  debug(message: string, context?: string, data?: any): void {
    this.log('debug', message, context, undefined, data);
  }
}

export const logger = new Logger();
