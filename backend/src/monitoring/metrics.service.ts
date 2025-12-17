import { Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/node';

export interface MetricData {
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
  userId?: string;
  timestamp: Date;
}

@Injectable()
export class MetricsService {
  private metrics: MetricData[] = [];
  private readonly MAX_METRICS = 10000; // Keep last 10k metrics in memory

  /**
   * Record API request/response metrics
   */
  recordMetric(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    userId?: string,
  ): void {
    const metric: MetricData = {
      endpoint,
      method,
      statusCode,
      duration,
      userId,
      timestamp: new Date(),
    };

    this.metrics.push(metric);

    // Keep memory usage bounded
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Alert if response time is too high
    if (duration > 5000) {
      Sentry.captureMessage(
        `Slow API Response: ${method} ${endpoint} took ${duration}ms`,
        'warning',
      );
    }

    // Alert if error status code
    if (statusCode >= 500) {
      Sentry.captureMessage(
        `API Error: ${method} ${endpoint} returned ${statusCode}`,
        'error',
      );
    }
  }

  /**
   * Get average response time for an endpoint
   */
  getAverageResponseTime(endpoint?: string): number {
    const filteredMetrics = endpoint
      ? this.metrics.filter((m) => m.endpoint === endpoint)
      : this.metrics;

    if (filteredMetrics.length === 0) return 0;

    const total = filteredMetrics.reduce((sum, m) => sum + m.duration, 0);
    return Math.round(total / filteredMetrics.length);
  }

  /**
   * Get error rate (5xx responses)
   */
  getErrorRate(endpoint?: string): number {
    const filteredMetrics = endpoint
      ? this.metrics.filter((m) => m.endpoint === endpoint)
      : this.metrics;

    if (filteredMetrics.length === 0) return 0;

    const errors = filteredMetrics.filter((m) => m.statusCode >= 500).length;
    return Math.round((errors / filteredMetrics.length) * 100);
  }

  /**
   * Get metrics summary
   */
  getSummary(timeWindowMinutes: number = 60): {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    slowRequests: number;
    topEndpoints: { endpoint: string; count: number }[];
    topErrors: { statusCode: number; count: number }[];
  } {
    const cutoffTime = new Date(
      Date.now() - timeWindowMinutes * 60 * 1000,
    );
    const recentMetrics = this.metrics.filter(
      (m) => m.timestamp > cutoffTime,
    );

    const slowRequests = recentMetrics.filter((m) => m.duration > 5000).length;

    // Get top endpoints
    const endpointCounts: { [key: string]: number } = {};
    recentMetrics.forEach((m) => {
      endpointCounts[m.endpoint] = (endpointCounts[m.endpoint] || 0) + 1;
    });

    const topEndpoints = Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get top errors
    const errorCounts: { [key: number]: number } = {};
    recentMetrics.forEach((m) => {
      if (m.statusCode >= 400) {
        errorCounts[m.statusCode] = (errorCounts[m.statusCode] || 0) + 1;
      }
    });

    const topErrors = Object.entries(errorCounts)
      .map(([statusCode, count]) => ({ statusCode: Number(statusCode), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const totalRequests = recentMetrics.length;
    const errors = recentMetrics.filter((m) => m.statusCode >= 500).length;

    return {
      totalRequests,
      averageResponseTime: this.getAverageResponseTime(),
      errorRate: totalRequests > 0 ? Math.round((errors / totalRequests) * 100) : 0,
      slowRequests,
      topEndpoints,
      topErrors,
    };
  }

  /**
   * Get all metrics (for dashboard)
   */
  getAllMetrics(): MetricData[] {
    return this.metrics;
  }

  /**
   * Clear old metrics
   */
  clearOldMetrics(olderThanMinutes: number = 1440): void {
    const cutoffTime = new Date(
      Date.now() - olderThanMinutes * 60 * 1000,
    );
    this.metrics = this.metrics.filter((m) => m.timestamp > cutoffTime);
  }
}
