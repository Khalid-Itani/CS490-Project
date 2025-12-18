import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MetricsService } from './metrics.service';
import { MonitoringLogger } from './logger.service';
import * as Sentry from '@sentry/node';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    private metricsService: MetricsService,
    private logger: MonitoringLogger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    const endpoint = this.sanitizeUrl(url);
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    // Set Sentry context
    Sentry.setContext('http', {
      method,
      url: endpoint,
      requestId,
    });

    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - startTime;
        const statusCode = context.switchToHttp().getResponse().statusCode || 200;
        const userId = user?.id;

        // Record metrics
        this.metricsService.recordMetric(
          endpoint,
          method,
          statusCode,
          duration,
          userId,
        );

        // Log successful request
        this.logger.logMetric(endpoint, method, statusCode, duration, userId);

        // Clear Sentry context
        Sentry.setContext('http', {});
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode =
          error.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const userId = user?.id;

        // Record metrics with error
        this.metricsService.recordMetric(
          endpoint,
          method,
          statusCode,
          duration,
          userId,
        );

        // Log error
        this.logger.error(`API Error: ${method} ${endpoint}`, {
          endpoint,
          method,
          statusCode,
          duration,
          userId,
          error,
          requestId,
        });

        // Clear Sentry context
        Sentry.setContext('http', {});

        throw error;
      }),
    );
  }

  private sanitizeUrl(url: string): string {
    // Remove query parameters
    return url.split('?')[0];
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
