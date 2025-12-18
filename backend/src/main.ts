import "./instrument";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';
// Sentry is initialized in instrument.ts; custom init/middleware removed to avoid duplication
import { MetricsInterceptor } from './monitoring/metrics.interceptor';
import { MonitoringLogger } from './monitoring/logger.service';
import { MetricsService } from './monitoring/metrics.service';

console.log('Loaded SUPABASE_URL:', process.env.SUPABASE_URL);

async function bootstrap() {
  // Sentry already initialized in instrument.ts

  const app = await NestFactory.create(AppModule);
  
  // Get monitoring services
  const metricsService = app.get(MetricsService);
  const monitoringLogger = app.get(MonitoringLogger);

  // Sentry request handler is managed by @sentry/nestjs setup

  // Add metrics interceptor globally
  app.useGlobalInterceptors(new MetricsInterceptor(metricsService, monitoringLogger));

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  app.use(
    session({
      secret: process.env.JWT_SECRET || 'your-session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }, // set to true if using HTTPS
    }),
  );

  // Sentry error handler is managed by @sentry/nestjs setup

  monitoringLogger.log('Application starting', { port: 3000 });
  await app.listen(3000);
  monitoringLogger.log('Application started successfully', { port: 3000 });
}

bootstrap().catch(error => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
