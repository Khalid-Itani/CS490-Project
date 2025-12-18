// Deprecated: Sentry is initialized via @sentry/nestjs in instrument.ts
// These stubs remain to avoid import breaks if referenced elsewhere.
export function initializeSentry(): void {}
export function getSentryRequestHandler(): any { return (_req: any, _res: any, next: any) => next(); }
export function getSentryErrorHandler(): any { return (_err: any, _req: any, _res: any, next: any) => next(); }
