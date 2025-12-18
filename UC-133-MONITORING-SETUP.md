# UC-133: Production Monitoring and Logging - Setup Guide

## Overview
This guide covers the setup and configuration of production monitoring and logging for the application using:
- **Application Logging**: File-based structured logging with multiple severity levels
- **Error Tracking**: Sentry for real-time error monitoring and alerting
- **Uptime Monitoring**: UptimeRobot for availability tracking
- **Performance Metrics**: API response time and error rate tracking
- **Dashboards**: Web-based monitoring dashboard

## Prerequisites
- Node.js 18+ (already installed)
- Sentry account (free tier) - https://sentry.io/
- UptimeRobot account (free tier) - https://uptimerobot.com/
- Basic understanding of monitoring concepts

## Step 1: Set Up Sentry Free Tier Account

### 1.1 Create Sentry Account
1. Go to https://sentry.io/
2. Sign up for a free account
3. Create a new organization (or use existing)

### 1.2 Create Projects
Create two Sentry projects:

**Backend Project:**
1. Go to Projects → Create Project
2. Select "Node.js" as platform
3. Name: `career-app-backend`
4. Copy the DSN (Data Source Name) - looks like: `https://xxxx@yyyy.ingest.sentry.io/zzzz`

**Frontend Project:**
1. Go to Projects → Create Project
2. Select "React" as platform
3. Name: `career-app-frontend`
4. Copy the DSN

### 1.3 Set Up Alert Rules (Backend)
1. Go to Backend Project → Alerts
2. Create Alert Rule:
   - **Alert**: "Errors count is greater than 10"
   - **Environment**: Production
   - **Actions**: Send email
3. Create another Alert for:
   - **Alert**: "Error level is equal to fatal or error"
   - **Environment**: Production
   - **Actions**: Send email immediately

## Step 2: Configure Environment Variables

### Backend Setup (.env file)

```env
# Sentry Configuration
SENTRY_DSN=https://your-dsn-here@ingest.sentry.io/your-project-id
NODE_ENV=production  # or development for local testing

# Existing variables...
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
JWT_SECRET=your-jwt-secret
```

### Frontend Setup (.env file)

```env
# Sentry Configuration
VITE_SENTRY_DSN=https://your-dsn-here@ingest.sentry.io/your-project-id
VITE_API_URL=http://localhost:3000/api

# Other existing variables...
```

## Step 3: Backend Installation and Setup

### 3.1 Install Sentry Packages
```bash
cd backend
npm install @sentry/node @sentry/profiling-node
```

**Already done** - The package.json has been updated with:
- `@sentry/node`: ^8.5.0
- `@sentry/profiling-node`: ^8.5.0

### 3.2 Monitoring Files Created
The following files have been created:

- `src/monitoring/logger.service.ts` - Structured logging service
- `src/monitoring/metrics.service.ts` - Performance metrics tracking
- `src/monitoring/monitoring.module.ts` - Monitoring module
- `src/monitoring/monitoring.controller.ts` - Monitoring endpoints
- `src/monitoring/metrics.interceptor.ts` - HTTP interceptor for tracking
- `src/monitoring/sentry.init.ts` - Sentry initialization

### 3.3 Verify Backend Integration
The following files have been updated:
- `src/main.ts` - Sentry initialization added
- `src/app.module.ts` - MonitoringModule imported
- `package.json` - Dependencies added

## Step 4: Frontend Installation and Setup

### 4.1 Install Sentry Packages
```bash
cd frontend
npm install @sentry/react @sentry/tracing
```

**Already done** - The package.json has been updated with:
- `@sentry/react`: ^8.5.0
- `@sentry/tracing`: ^8.5.0

### 4.2 Monitoring Files Created
- `src/monitoring/sentry.init.ts` - Frontend Sentry initialization

### 4.3 Update main.jsx
Update `src/main.jsx` to initialize Sentry:

```javascript
import { initializeFrontendSentry, withSentryErrorBoundary } from './monitoring/sentry.init';
import App from './App';

// Initialize Sentry before rendering
initializeFrontendSentry();

// Wrap App with error boundary
const SentryApp = withSentryErrorBoundary(App);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SentryApp />
  </React.StrictMode>,
);
```

## Step 5: Set Up UptimeRobot

### 5.1 Create UptimeRobot Account
1. Go to https://uptimerobot.com/
2. Sign up for free account
3. Create API key (under settings)

### 5.2 Create Monitor
1. Click "Add New Monitor"
2. **Monitor Type**: HTTP(s)
3. **URL**: `https://your-production-url.com/monitoring/health`
4. **Interval**: 5 minutes (free tier)
5. **Notifications**: Add email address

### 5.3 API Integration (Optional)
Save the API key for programmatic monitoring:

```bash
# Example: Check status via UptimeRobot API
curl -X POST "https://api.uptimerobot.com/v2/getMonitors" \
  -d "api_key=YOUR_API_KEY" \
  -d "format=json"
```

## Step 6: Test the Setup

### 6.1 Backend Testing
```bash
# Start backend
npm run start:dev

# Test health endpoint
curl http://localhost:3000/monitoring/health

# Test metrics endpoint
curl http://localhost:3000/monitoring/metrics/summary

# Trigger an error in your code to test Sentry
```

### 6.2 Trigger Test Error (Backend)
In any service, add:

```typescript
// Temporary test - remove after verification
if (process.env.TEST_ERROR === 'true') {
  throw new Error('Test error for Sentry monitoring');
}
```

Then call:
```bash
TEST_ERROR=true npm run start:dev
```

### 6.3 Frontend Testing
Update your component:

```jsx
import { captureException, addBreadcrumb } from '@/monitoring/sentry.init';

export function TestErrorComponent() {
  const handleTestError = () => {
    try {
      throw new Error('Frontend test error');
    } catch (error) {
      captureException(error);
    }
  };

  return (
    <button onClick={handleTestError}>
      Trigger Test Error
    </button>
  );
}
```

### 6.4 Verify in Sentry
1. Go to Sentry Dashboard
2. You should see errors appearing in real-time
3. Check email for alerts

## Step 7: Monitoring Dashboard

### 7.1 Access Dashboard
Frontend dashboard created at: `src/pages/MonitoringDashboard.jsx`

Add route to your frontend routing:
```jsx
import MonitoringDashboard from '@/pages/MonitoringDashboard';

// In your router:
<Route path="/monitoring" element={<MonitoringDashboard />} />
```

### 7.2 Dashboard Features
- Total requests count
- Average response time
- Error rate percentage
- Slow requests count
- Top API endpoints
- Error status codes distribution
- Application health status
- Memory usage tracking

## Step 8: Log Files

Logs are stored in `backend/logs/` directory with the following structure:
```
logs/
├── info-2024-12-17.log
├── error-2024-12-17.log
├── warn-2024-12-17.log
├── debug-2024-12-17.log
├── verbose-2024-12-17.log
└── critical-2024-12-17.log
```

Each log file contains JSON-formatted entries with:
- Timestamp
- Log level
- Message
- Context (userId, endpoint, requestId, etc.)

## Step 9: Production Deployment Checklist

### Before Deploying:
- [ ] Set `NODE_ENV=production` on server
- [ ] Set `SENTRY_DSN` environment variable
- [ ] Configure Sentry alert rules
- [ ] Set up UptimeRobot monitor
- [ ] Configure email alerts
- [ ] Test error tracking in staging environment
- [ ] Set up log rotation (to prevent disk space issues)
- [ ] Document on-call procedures

### Log Rotation Setup (Optional)
Install `pm2-logrotate`:
```bash
npm install -g pm2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:retain 7
```

## Step 10: Incident Response Procedures

### When Alert is Triggered:
1. **Immediate Action** (First 5 minutes):
   - Check Sentry dashboard for error details
   - Check application health endpoint
   - Check UptimeRobot status

2. **Investigation** (Next 15 minutes):
   - Review error logs in `backend/logs/error-*.log`
   - Check metrics for affected endpoints
   - Check database connectivity

3. **Resolution**:
   - Fix the issue
   - Deploy fix
   - Verify fix in Sentry (should see resolution in new events)

4. **Post-Incident**:
   - Document in Sentry
   - Create follow-up issue/ticket
   - Update monitoring thresholds if needed

### Escalation:
- **Critical Errors**: Page on-call engineer immediately
- **Error Rate > 5%**: Send Slack alert
- **Response Time > 10s**: Create incident ticket
- **Downtime**: Immediate page on-call engineer

## Useful Commands

```bash
# View recent logs
tail -f backend/logs/error-$(date +%Y-%m-%d).log

# Search logs
grep "specific_error" backend/logs/error-*.log

# Count errors by type
grep -o '"message":"[^"]*' backend/logs/error-*.log | sort | uniq -c

# Monitor in real-time
watch -n 5 'curl -s http://localhost:3000/monitoring/metrics/summary | jq'
```

## Monitoring Best Practices

1. **Set Appropriate Thresholds**:
   - Slow request: > 5 seconds
   - Error rate: > 5%
   - Memory usage: > 80% heap

2. **Regular Log Review**:
   - Check logs daily for patterns
   - Archive old logs monthly
   - Use log aggregation for long-term analysis

3. **Alert Fatigue Prevention**:
   - Set sensible thresholds
   - Create alerts for actionable events only
   - Configure quiet hours if needed

4. **Performance Optimization**:
   - Use metrics data to identify slow endpoints
   - Optimize top 10% slowest endpoints
   - Monitor response time trends

## Additional Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [NestJS Logging](https://docs.nestjs.com/techniques/logger)
- [UptimeRobot Documentation](https://uptimerobot.com/help/)
- [Monitoring Best Practices](https://www.datadoghq.com/blog/monitoring-best-practices/)

## Support

For issues or questions:
1. Check Sentry error details and breadcrumbs
2. Review log files in `backend/logs/`
3. Check monitoring dashboard at `/monitoring`
4. Create GitHub issue with error details and logs
