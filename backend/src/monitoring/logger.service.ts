import { Injectable, LoggerService } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import * as fs from 'fs';
import * as path from 'path';

interface LogContext {
  userId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  error?: Error;
  [key: string]: any;
}

@Injectable()
export class MonitoringLogger implements LoggerService {
  private logDir = path.join(process.cwd(), 'logs');

  constructor() {
    // Ensure logs directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private getLogFile(level: string): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `${level}-${date}.log`);
  }

  private writeToFile(level: string, message: string, context?: LogContext): void {
    const timestamp = this.formatTimestamp();
    const logEntry = {
      timestamp,
      level,
      message,
      context: context || {},
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    const logFile = this.getLogFile(level);

    try {
      fs.appendFileSync(logFile, logLine, 'utf-8');
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  log(message: string, context?: LogContext): void {
    const timestamp = this.formatTimestamp();
    const contextStr = context ? JSON.stringify(context) : '';
    console.log(
      `[${timestamp}] [INFO] ${message}${contextStr ? ' ' + contextStr : ''}`,
    );
    this.writeToFile('info', message, context);

    // Send to Sentry as breadcrumb
    Sentry.captureMessage(message, 'info');
  }

  error(message: string, context?: LogContext): void {
    const timestamp = this.formatTimestamp();
    const contextStr = context ? JSON.stringify(context) : '';
    console.error(
      `[${timestamp}] [ERROR] ${message}${contextStr ? ' ' + contextStr : ''}`,
    );
    this.writeToFile('error', message, context);

    // Send to Sentry
    if (context?.error) {
      Sentry.captureException(context.error, {
        tags: {
          userId: context.userId,
          endpoint: context.endpoint,
        },
        extra: context,
      });
    } else {
      Sentry.captureMessage(message, 'error');
    }
  }

  warn(message: string, context?: LogContext): void {
    const timestamp = this.formatTimestamp();
    const contextStr = context ? JSON.stringify(context) : '';
    console.warn(
      `[${timestamp}] [WARN] ${message}${contextStr ? ' ' + contextStr : ''}`,
    );
    this.writeToFile('warn', message, context);

    // Send to Sentry as breadcrumb
    Sentry.captureMessage(message, 'warning');
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = this.formatTimestamp();
      const contextStr = context ? JSON.stringify(context) : '';
      console.debug(
        `[${timestamp}] [DEBUG] ${message}${contextStr ? ' ' + contextStr : ''}`,
      );
      this.writeToFile('debug', message, context);
    }
  }

  verbose(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = this.formatTimestamp();
      const contextStr = context ? JSON.stringify(context) : '';
      console.log(
        `[${timestamp}] [VERBOSE] ${message}${contextStr ? ' ' + contextStr : ''}`,
      );
      this.writeToFile('verbose', message, context);
    }
  }

  /**
   * Log API request/response metrics
   */
  logMetric(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    userId?: string,
  ): void {
    const metricData: LogContext = {
      endpoint,
      method,
      statusCode,
      duration,
      userId,
      type: 'metric',
    };

    this.log(`API Request: ${method} ${endpoint} - ${statusCode}ms`, metricData);

    // Send metric to Sentry
    Sentry.captureMessage(
      `API: ${method} ${endpoint} - ${statusCode} (${duration}ms)`,
      'info',
    );
  }

  /**
   * Log critical errors
   */
  critical(message: string, context?: LogContext): void {
    const fullContext = { ...context, severity: 'critical' };
    const timestamp = this.formatTimestamp();
    const contextStr = JSON.stringify(fullContext);
    console.error(
      `[${timestamp}] [CRITICAL] ${message} ${contextStr}`,
    );
    this.writeToFile('critical', message, fullContext);

    // Alert via Sentry with highest priority
    if (context?.error) {
      Sentry.captureException(context.error, {
        level: 'fatal',
        tags: {
          userId: context.userId,
          endpoint: context.endpoint,
          severity: 'critical',
        },
        extra: fullContext,
      });
    } else {
      Sentry.captureMessage(message, 'fatal');
    }
  }

  /**
   * Get logs for a specific date and level
   */
  getLogs(level: string = 'error', date?: string): string {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const logFile = path.join(this.logDir, `${level}-${targetDate}.log`);

    if (!fs.existsSync(logFile)) {
      return `No logs found for ${level} on ${targetDate}`;
    }

    return fs.readFileSync(logFile, 'utf-8');
  }
}
