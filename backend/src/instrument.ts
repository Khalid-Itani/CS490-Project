import * as Sentry from "@sentry/nestjs";

Sentry.init({
  dsn: "https://a37f975ba4e955d9b0ab7cdd7385c6bb@o4510557443719168.ingest.us.sentry.io/4510557445947392",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});

// Send a one-off startup test event to verify integration
Sentry.captureMessage("Sentry startup test: backend initialized");
