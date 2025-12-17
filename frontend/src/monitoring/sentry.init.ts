import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import React from 'react';

/**
 * Initialize Sentry for frontend error tracking
 * Call this in main.jsx before rendering the app
 */
export function initializeFrontendSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.warn(
      'VITE_SENTRY_DSN not set in environment. Error tracking will be disabled.',
    );
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE || 'development',
    integrations: [
      new BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event, hint) {
      // Filter sensitive data
      if (event.request?.url?.includes('password')) {
        return null;
      }
      return event;
    },
  });

  console.log('Sentry initialized for frontend with DSN:', dsn);
}

/**
 * Wrap your App component with Sentry error boundary
 */
export function withSentryErrorBoundary(Component) {
  return Sentry.withProfiler(
    Sentry.withErrorBoundary(Component, {
      fallback: <ErrorFallback />,
      showDialog: false,
    }),
  );
}

/**
 * Error boundary fallback component
 */
function ErrorFallback() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        fontFamily: 'sans-serif',
      }}
    >
      <h1>Oops! Something went wrong</h1>
      <p>Our team has been notified. Please try refreshing the page.</p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '20px',
        }}
      >
        Refresh Page
      </button>
    </div>
  );
}

/**
 * Capture a message in Sentry
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Capture an exception in Sentry
 */
export function captureException(error: Error, context?: any) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Set user context
 */
export function setUserContext(userId: string, userData?: any) {
  Sentry.setUser({
    id: userId,
    ...userData,
  });
}

/**
 * Clear user context (for logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for tracking user actions
 */
export function addBreadcrumb(message: string, category: string = 'user-action', level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    timestamp: Date.now() / 1000,
  });
}
