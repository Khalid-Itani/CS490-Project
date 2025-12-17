import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

/**
 * Initialize Sentry for error tracking
 * Make sure to call this in main.ts BEFORE creating the NestJS app
 */
export function initializeSentry(): void {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.warn(
      'SENTRY_DSN not set in environment. Error tracking will be disabled.',
    );
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    integrations: [
      new ProfilingIntegration(),
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection(),
    ],
    // Capture breadcrumbs
    beforeBreadcrumb(breadcrumb) {
      // Filter sensitive data
      if (breadcrumb.message?.includes('password')) {
        return null;
      }
      return breadcrumb;
    },
    beforeSend(event) {
      // Filter sensitive data
      if (event.request?.url?.includes('password')) {
        return null;
      }
      return event;
    },
  });

  console.log('Sentry initialized with DSN:', dsn);
}

/**
 * Get Sentry request handler middleware
 */
export function getSentryRequestHandler() {
  return Sentry.Handlers.requestHandler();
}

/**
 * Get Sentry error handler middleware
 */
export function getSentryErrorHandler() {
  return Sentry.Handlers.errorHandler();
}
