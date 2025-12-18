# UC-133: Testing and Verification Guide

## Overview
This document provides step-by-step instructions to verify that production monitoring and logging is working correctly.

## Pre-Test Checklist

- [ ] Backend `.env` file has `SENTRY_DSN` set
- [ ] Frontend `.env` file has `VITE_SENTRY_DSN` set  
- [ ] Backend `npm install` has been run
- [ ] Frontend `npm install` has been run
- [ ] You have Sentry accounts created with DSN keys
- [ ] You have access to Sentry dashboard

## Test 1: Application Health Endpoint

### Objective
Verify that the health monitoring endpoint is working.

### Steps
1. Start the backend server:
   ```bash
   cd backend
   npm run start:dev
   ```

2. In another terminal, call the health endpoint:
   ```bash
   curl http://localhost:3000/monitoring/health
   ```

3. Verify the response includes:
   - `status: "ok"`
   - `uptime` (in seconds)
   - `memory` usage details

### Expected Output
```json
{
  "status": "ok",
  "timestamp": "2024-12-17T10:30:00.000Z",
  "uptime": 45.123,
  "memory": {
    "rss": 67108864,
    "heapTotal": 34603008,
    "heapUsed": 15728640,
    "external": 1048576,
    "arrayBuffers": 0
  }
}
```

## Test 2: Metrics Summary Endpoint

### Objective
Verify that API metrics are being tracked correctly.

### Steps
1. Make some API requests to the backend:
   ```bash
   curl http://localhost:3000/api/your-endpoint
   ```

2. Query metrics:
   ```bash
   curl http://localhost:3000/monitoring/metrics/summary?timeWindow=60
   ```

3. Verify response includes:
   - `totalRequests` > 0
   - `averageResponseTime` in milliseconds
   - `errorRate` percentage
   - `topEndpoints` array

### Expected Output
```json
{
  "success": true,
  "data": {
    "totalRequests": 5,
    "averageResponseTime": 245,
    "errorRate": 0,
    "slowRequests": 0,
    "topEndpoints": [
      {
        "endpoint": "/api/your-endpoint",
        "count": 5
      }
    ],
    "topErrors": []
  },
  "timestamp": "2024-12-17T10:30:00.000Z"
}
```

## Test 3: Application Logging

### Objective
Verify that application logs are being written to files.

### Steps
1. With backend running, make some requests
2. Check the logs directory:
   ```bash
   ls backend/logs/
   ```

3. View today's logs:
   ```bash
   cat backend/logs/info-$(date +%Y-%m-%d).log
   ```

4. Verify log entries are JSON formatted with:
   - timestamp
   - level
   - message
   - context

### Expected Output
```json
{"timestamp":"2024-12-17T10:30:45.123Z","level":"info","message":"Application starting","context":{"port":3000}}
{"timestamp":"2024-12-17T10:30:46.456Z","level":"info","message":"API Request: GET /api/endpoint - 200","context":{"endpoint":"/api/endpoint","method":"GET","statusCode":200,"duration":145,"type":"metric"}}
```

## Test 4: Error Logging

### Objective
Verify that errors are being logged and sent to Sentry.

### Steps
1. Add a test error route to your backend (temporary):
   ```typescript
   @Get('test-error')
   testError() {
     throw new Error('Test error for monitoring verification');
   }
   ```

2. Restart backend and call the error endpoint:
   ```bash
   curl http://localhost:3000/api/test-error
   ```

3. Check error logs:
   ```bash
   tail backend/logs/error-$(date +%Y-%m-%d).log
   ```

4. Go to Sentry dashboard and verify:
   - Error appears under "Issues"
   - Error details show correct stack trace
   - Context includes endpoint and method

5. Clean up - remove the test endpoint

## Test 5: Critical Error Alert

### Objective
Verify that critical errors trigger alerts.

### Steps
1. Add another test route:
   ```typescript
   @Get('test-critical-error')
   testCriticalError() {
     this.logger.critical('Critical system error detected', {
       endpoint: '/api/test-critical-error',
       error: new Error('Database connection lost'),
     });
   }
   ```

2. Call the endpoint:
   ```bash
   curl http://localhost:3000/api/test-critical-error
   ```

3. In Sentry dashboard:
   - Look for the critical issue
   - Should be marked as "fatal" severity
   - Should trigger alert rules you configured

4. Check your email for alert notification

5. Clean up test endpoint

## Test 6: Response Time Tracking

### Objective
Verify that slow requests are detected and tracked.

### Steps
1. Add a slow endpoint:
   ```typescript
   @Get('test-slow')
   async testSlow() {
     // Sleep for 6 seconds (will trigger slow request alert)
     await new Promise(resolve => setTimeout(resolve, 6000));
     return { message: 'Done' };
   }
   ```

2. Call the endpoint:
   ```bash
   curl http://localhost:3000/api/test-slow
   ```

3. Verify metrics:
   ```bash
   curl http://localhost:3000/monitoring/metrics/summary
   ```

4. Response should show:
   - `averageResponseTime` over 6000ms
   - `slowRequests`: 1

5. Check Sentry for slow request warning

6. Clean up test endpoint

## Test 7: Error Rate Calculation

### Objective
Verify that error rates are calculated correctly.

### Steps
1. Add endpoints for testing:
   ```typescript
   @Get('test-success')
   testSuccess() {
     return { status: 'ok' };
   }

   @Get('test-failure')
   testFailure() {
     throw new BadRequestException('Test error');
   }
   ```

2. Make multiple requests:
   ```bash
   # Make 10 successful requests
   for i in {1..10}; do curl http://localhost:3000/api/test-success; done

   # Make 5 error requests
   for i in {1..5}; do curl http://localhost:3000/api/test-failure; done
   ```

3. Check metrics:
   ```bash
   curl http://localhost:3000/monitoring/metrics/error-rate
   ```

4. Expected error rate: ~33% (5 errors out of 15 total)

5. Clean up test endpoints

## Test 8: Frontend Monitoring Dashboard

### Objective
Verify that the frontend monitoring dashboard works.

### Steps
1. Start frontend:
   ```bash
   cd frontend
   npm run dev
   ```

2. Navigate to monitoring dashboard:
   ```
   http://localhost:5173/monitoring
   ```

3. Verify dashboard displays:
   - Total Requests metric
   - Avg Response Time metric
   - Error Rate metric
   - Slow Requests count
   - Application Status
   - Uptime
   - Memory Usage
   - Top Endpoints chart
   - Error Status Codes chart

4. Test time window selector:
   - Change to "Last 15 minutes"
   - Change to "Last 4 hours"
   - Verify metrics update

5. Test Refresh button:
   - Click "Refresh Now"
   - Verify data updates

## Test 9: Frontend Error Tracking (Sentry)

### Objective
Verify that frontend errors are captured by Sentry.

### Steps
1. Update main.jsx with Sentry:
   ```jsx
   import { initializeFrontendSentry, withSentryErrorBoundary } from './monitoring/sentry.init';
   import App from './App';

   initializeFrontendSentry();
   const SentryApp = withSentryErrorBoundary(App);
   
   ReactDOM.createRoot(document.getElementById('root')).render(
     <React.StrictMode>
       <SentryApp />
     </React.StrictMode>,
   );
   ```

2. Add test error button in a component:
   ```jsx
   import { captureException } from '@/monitoring/sentry.init';

   export function TestButton() {
     const handleError = () => {
       try {
         throw new Error('Frontend test error from monitoring');
       } catch (error) {
         captureException(error);
       }
     };
     
     return <button onClick={handleError}>Trigger Test Error</button>;
   }
   ```

3. Click the button in browser

4. Check browser console - no error should be displayed (caught by Sentry)

5. Go to Sentry dashboard - should see the frontend error under a new issue

6. Verify error shows:
   - Browser information
   - URL and page context
   - JavaScript stack trace

## Test 10: UptimeRobot Monitoring

### Objective
Verify that UptimeRobot can monitor application health.

### Steps
1. In UptimeRobot dashboard, create a monitor:
   - URL: `http://your-server:3000/monitoring/health`
   - Check interval: 5 minutes

2. Wait for first check (up to 5 minutes)

3. Verify status shows as "Up"

4. Test alert by stopping backend:
   ```bash
   # In backend terminal, press Ctrl+C
   ```

5. Wait for UptimeRobot to detect downtime (5+ minutes)

6. Verify downtime is detected:
   - Status changes to "Down"
   - Email alert received (if configured)

7. Restart backend:
   ```bash
   npm run start:dev
   ```

8. Verify status changes back to "Up"

## Test 11: Structured Logging

### Objective
Verify that logs contain searchable fields.

### Steps
1. Make API request with known user/endpoint:
   ```bash
   curl -H "Authorization: Bearer test_token" http://localhost:3000/api/protected-endpoint
   ```

2. Check logs:
   ```bash
   grep "protected-endpoint" backend/logs/info-$(date +%Y-%m-%d).log
   ```

3. Parse a log entry:
   ```bash
   cat backend/logs/info-$(date +%Y-%m-%d).log | head -1 | jq .
   ```

4. Verify log entry contains:
   - timestamp
   - level
   - message
   - context with:
     - endpoint
     - method
     - statusCode
     - duration
     - userId (if available)

## Test 12: End-to-End Error Flow

### Objective
Verify complete error tracking flow: Error → Logged → Sentry → Dashboard → Alert.

### Steps
1. Clear Sentry project (or create new one for testing)

2. Trigger test error:
   ```bash
   curl http://localhost:3000/api/test-error
   ```

3. Verify **file logging**:
   ```bash
   grep "Test error" backend/logs/error-$(date +%Y-%m-%d).log
   ```

4. Verify **metrics tracking**:
   ```bash
   curl http://localhost:3000/monitoring/metrics/summary
   ```
   Should show error rate > 0

5. Verify **Sentry tracking**:
   - Go to Sentry dashboard
   - New issue should appear
   - Should have correct error message and stack trace

6. Verify **dashboard display**:
   ```bash
   curl http://localhost:3000/monitoring/metrics/summary | jq '.data.errorRate'
   ```

7. Verify **alert**:
   - Check email for alert (if configured in Sentry)
   - Check Sentry incident page

## Troubleshooting

### Issue: No logs appearing
**Solution**:
- Check `backend/logs/` directory exists
- Verify write permissions: `chmod 755 backend/logs/`
- Check NODE_ENV is not "production" (might suppress debug logs)

### Issue: Sentry not receiving errors
**Solution**:
- Verify SENTRY_DSN is set correctly: `echo $SENTRY_DSN`
- Check Sentry project is active
- Verify network connectivity
- Check browser console for Sentry initialization errors

### Issue: Metrics showing 0
**Solution**:
- Make sure backend is running
- Confirm requests are being made
- Wait a few seconds before checking metrics
- Check MetricsInterceptor is applied globally

### Issue: Dashboard not loading
**Solution**:
- Verify `/monitoring/*` endpoints are accessible
- Check CORS is configured correctly
- Verify frontend can reach backend
- Check browser console for errors

### Issue: UptimeRobot showing Down
**Solution**:
- Verify health endpoint is public (no auth required)
- Check firewall/network allows external access
- Verify backend is actually running
- Check server logs for errors

## Post-Test Cleanup

After testing, remember to:
1. Remove test endpoints from code
2. Remove test users/data from database
3. Verify production settings are correct
4. Commit working code to repository
5. Create production deployment checklist

## Success Criteria

All tests pass if:
- ✅ Health endpoint returns status "ok"
- ✅ Metrics are tracking requests and response times
- ✅ Logs are being written to files in JSON format
- ✅ Errors appear in Sentry dashboard
- ✅ Critical errors trigger alerts
- ✅ Slow requests are detected and logged
- ✅ Error rates are calculated correctly
- ✅ Frontend dashboard displays all metrics
- ✅ Frontend errors are captured by Sentry
- ✅ UptimeRobot can monitor application health
- ✅ Structured logs contain searchable fields
- ✅ Complete error flow works end-to-end

## Next Steps

Once all tests pass:
1. Merge code to main branch
2. Deploy to staging environment
3. Run full test suite in staging
4. Deploy to production
5. Configure production alerts and thresholds
6. Monitor for 24-48 hours for issues
7. Document any additional customizations
