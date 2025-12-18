import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { MetricsService } from './metrics.service';
import { MonitoringLogger } from './logger.service';

@Controller('monitoring')
export class MonitoringController {
  constructor(
    private metricsService: MetricsService,
    private logger: MonitoringLogger,
  ) {}

  /**
   * Get metrics summary
   * Query params: timeWindow (minutes, default 60)
   */
  @Get('metrics/summary')
  getMetricsSummary(@Query('timeWindow') timeWindow: string = '60') {
    try {
      const summary = this.metricsService.getSummary(parseInt(timeWindow));
      return {
        success: true,
        data: summary,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error fetching metrics summary', { error });
      throw error;
    }
  }

  /**
   * Get all metrics
   */
  @Get('metrics/all')
  getAllMetrics() {
    try {
      const metrics = this.metricsService.getAllMetrics();
      return {
        success: true,
        count: metrics.length,
        data: metrics.slice(-1000), // Return last 1000 metrics
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error fetching all metrics', { error });
      throw error;
    }
  }

  /**
   * Get error rate
   * Query params: endpoint (optional)
   */
  @Get('metrics/error-rate')
  getErrorRate(@Query('endpoint') endpoint?: string) {
    try {
      const errorRate = this.metricsService.getErrorRate(endpoint);
      return {
        success: true,
        errorRate,
        endpoint,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error calculating error rate', { error });
      throw error;
    }
  }

  /**
   * Get average response time
   * Query params: endpoint (optional)
   */
  @Get('metrics/average-response-time')
  getAverageResponseTime(@Query('endpoint') endpoint?: string) {
    try {
      const avgTime = this.metricsService.getAverageResponseTime(endpoint);
      return {
        success: true,
        averageResponseTime: avgTime,
        endpoint,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error calculating average response time', { error });
      throw error;
    }
  }

  /**
   * Health check endpoint
   */
  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  /**
   * Sentry test endpoint: captures a message and throws an error
   */
  @Get('sentry-test')
  sentryTest() {
    Sentry.captureMessage('Sentry test message from /monitoring/sentry-test');
    throw new Error('Sentry test error from /monitoring/sentry-test');
  }
}
