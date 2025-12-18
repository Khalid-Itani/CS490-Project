# UC-133: Monitoring Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USER APPLICATIONS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────┐      ┌──────────────────────────────┐   │
│  │     Frontend (React)         │      │     Backend (NestJS)         │   │
│  │  ┌────────────────────────┐  │      │  ┌────────────────────────┐  │   │
│  │  │   Sentry Init          │  │      │  │   Sentry Init          │  │   │
│  │  │  - Error Capture       │  │      │  │  - Error Capture       │  │   │
│  │  │  - Session Replay      │  │      │  │  - Performance Tracing │  │   │
│  │  │  - User Context        │  │      │  │  - Profiling           │  │   │
│  │  └────────────────────────┘  │      │  └────────────────────────┘  │   │
│  │           ↓                   │      │           ↓                   │   │
│  │  ┌────────────────────────┐  │      │  ┌────────────────────────┐  │   │
│  │  │   Error Boundary       │  │      │  │   Metrics Interceptor  │  │   │
│  │  │  - Catches Exceptions  │  │      │  │  - Tracks API Calls    │  │   │
│  │  │  - Graceful UI Fallback│  │      │  │  - Records Response    │  │   │
│  │  └────────────────────────┘  │      │  │  - Measures Duration   │  │   │
│  │           ↓                   │      │  └────────────────────────┘  │   │
│  │  ┌────────────────────────┐  │      │           ↓                   │   │
│  │  │  Monitoring Dashboard  │  │      │  ┌────────────────────────┐  │   │
│  │  │  - Real-time Metrics   │  │      │  │   Logging Service      │  │   │
│  │  │  - Charts & Graphs     │  │      │  │  - File-based Logs     │  │   │
│  │  │  - Error Tracking      │  │      │  │  - JSON Format         │  │   │
│  │  └────────────────────────┘  │      │  │  - Daily Rotation      │  │   │
│  └──────────────────────────────┘      │  └────────────────────────┘  │   │
│                                         │           ↓                   │   │
│                                         │  ┌────────────────────────┐  │   │
│                                         │  │   Metrics Service      │  │   │
│                                         │  │  - Request Tracking    │  │   │
│                                         │  │  - Error Calculation   │  │   │
│                                         │  │  - Performance Analysis│  │   │
│                                         │  └────────────────────────┘  │   │
│                                         │           ↓                   │   │
│                                         │  ┌────────────────────────┐  │   │
│                                         │  │   Monitoring Endpoint  │  │   │
│                                         │  │  - /monitoring/health  │  │   │
│                                         │  │  - /monitoring/metrics │  │   │
│                                         │  └────────────────────────┘  │   │
│                                         └──────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                    ↓                                           ↓
           ┌────────────────────┐               ┌────────────────────────┐
           │   Sentry Cloud     │               │   File System (logs/)  │
           │  ┌──────────────┐  │               │  ┌──────────────────┐  │
           │  │  Error Issu │  │               │  │  error-*.log     │  │
           │  │  Alerting   │  │               │  │  warn-*.log      │  │
           │  │  Dashboard  │  │               │  │  info-*.log      │  │
           │  │  Reporting  │  │               │  │  critical-*.log  │  │
           │  └──────────────┘  │               │  └──────────────────┘  │
           └────────────────────┘               └────────────────────────┘
                    ↓
           ┌────────────────────┐
           │   UptimeRobot      │
           │  ┌──────────────┐  │
           │  │ Health Check │  │
           │  │ Uptime Moni  │  │
           │  │ Status Page  │  │
           │  └──────────────┘  │
           └────────────────────┘
                    ↓
           ┌────────────────────┐
           │   Email Alerts     │
           │  - Critical Errors │
           │  - Downtime Alert  │
           │  - Daily Summary   │
           └────────────────────┘
```

## Data Flow Diagram

### Error Tracking Flow
```
Error Occurs
    ↓
[Frontend: React]  ← Error thrown
    ↓
Sentry Error Boundary
    ↓
captureException()
    ↓
[Browser Storage] ← Queued for upload
    ↓
Sentry Cloud → [Sentry Dashboard]
    ↓
[Alert Rule Triggered]
    ↓
Email Notification
```

### Backend Request Flow
```
HTTP Request
    ↓
Sentry Request Handler
    ↓
Metrics Interceptor [START]
    ↓
Route Handler
    ↓
Metrics Interceptor [END]
    ↓
└─ Record Metrics
   - Response time
   - Status code
   - Endpoint
   - User ID
    ↓
└─ Log Entry
   - JSON format
   - File storage
   - Sentry breadcrumb
    ↓
└─ Performance Check
   - Slow? (>5s)
   - Error? (5xx)
    ↓
HTTP Response
```

### Metrics Collection Flow
```
API Request comes in
    ↓
MetricsInterceptor intercepts
    ↓
Start timer
Record: method, endpoint, user
    ↓
Request processes
    ↓
Capture: duration, status code
    ↓
Store in MetricsService
    ↓
Check thresholds:
- Response > 5s? → Sentry warning
- Status >= 500? → Sentry error
- Rate > 5%? → Alert
    ↓
Log to file (JSON)
    ↓
Response sent to client
```

## Component Communication

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│                                                          │
│  [Sentry]──────────────────┐                           │
│     ↓                       │                           │
│  [Error Boundary]           ├─→ Sentry Cloud           │
│     ↓                       │                           │
│  [Components]──────────────┘                           │
│     ↓                                                    │
│  [MonitoringDashboard] ← fetch metrics                │
└─────────────────────────────────────────────────────────┘
         │
         │ HTTP Requests
         ↓
┌─────────────────────────────────────────────────────────┐
│                    Backend (NestJS)                      │
│                                                          │
│  [main.ts]                                              │
│     ↓                                                    │
│  [Sentry Init]──────────────────┐                      │
│     ↓                            │                      │
│  [Express Middleware]            ├─→ Sentry Cloud     │
│     ↓                            │                      │
│  [MetricsInterceptor]────────────┤                      │
│     ↓                            │                      │
│  [Route Handlers]                │                      │
│     ↓                            ↓                      │
│  ┌────────────────────────────────────────────────┐    │
│  │  [MonitoringLogger]                             │    │
│  │    ↓                                             │    │
│  │  [File System: logs/]                           │    │
│  │                                                 │    │
│  │  [MetricsService]                              │    │
│  │    ↓                                             │    │
│  │  [In-Memory Cache]                              │    │
│  │                                                 │    │
│  │  [MonitoringController] ← Query endpoints      │    │
│  │    ↓                                             │    │
│  │  JSON Responses                                 │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
         │
         │
         ├─→ UptimeRobot (Health checks)
         ├─→ Log Files (error tracking)
         └─→ Email (Alerts)
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Production Environment                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────┐              ┌──────────────────┐  │
│  │   Load Balancer    │              │   Frontend CDN   │  │
│  │  (Optional)        │              │  (Static Files)  │  │
│  └────────────┬───────┘              └──────────────────┘  │
│               │                               │             │
│               ↓                               ↓             │
│  ┌────────────────────────┐      ┌──────────────────────┐ │
│  │  Backend Instances    │      │  Frontend Instances   │ │
│  │  (Multiple Replicas)  │      │  (Multiple Replicas)  │ │
│  │                        │      │                       │ │
│  │  [Sentry]             │      │  [Sentry]             │ │
│  │  [Metrics]            │      │  [Error Boundary]     │ │
│  │  [Logging]            │      │  [Dashboard]          │ │
│  └────────────┬──────────┘      └───────────┬──────────┘ │
│               │                              │             │
└───────────────┼──────────────────────────────┼─────────────┘
                │                              │
       ┌────────┴──────────┬─────────┬────────┴─────────┐
       │                   │         │                   │
       ↓                   ↓         ↓                   ↓
   ┌─────────┐    ┌──────────────┐ ┌─────────────┐ ┌─────────────┐
   │ Sentry  │    │ Log Storage  │ │ UptimeRobot │ │Email Service│
   │ Cloud   │    │ (File/S3)    │ │             │ │             │
   └─────────┘    └──────────────┘ └─────────────┘ └─────────────┘
       ↓                   ↓              ↓
   ┌─────────┐    ┌──────────────┐ ┌─────────────┐
   │Dashboard│    │ Log Analysis │ │ Dashboard   │
   │Alerting │    │ Aggregation  │ │ Status Page │
   │  Rules  │    │              │ │             │
   └─────────┘    └──────────────┘ └─────────────┘
```

## Data Storage

### Backend Logs Structure
```
backend/logs/
├── info-2024-12-17.log
│   └── {"timestamp":"...", "level":"info", "message":"...", "context":{...}}
│       [One JSON object per line]
│
├── error-2024-12-17.log
│   └── {"timestamp":"...", "level":"error", "message":"...", "error":{...}}
│
├── warn-2024-12-17.log
├── critical-2024-12-17.log
├── debug-2024-12-17.log
└── verbose-2024-12-17.log
```

### Metrics in Memory
```
MetricsService
└── metrics: MetricData[]
    ├── [0] {endpoint, method, statusCode, duration, userId, timestamp}
    ├── [1] {endpoint, method, statusCode, duration, userId, timestamp}
    ├── [2] {endpoint, method, statusCode, duration, userId, timestamp}
    └── ... (max 10,000 entries, auto-cleanup daily)
```

## Alert & Notification Flow

```
┌─────────────────────────────────────────────────────┐
│         Monitoring Detection                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Sentry Error? → Severity Assessment               │
│       ├─→ Fatal  ────────────────────────────┐     │
│       ├─→ Error  ────────────────────────┐   │     │
│       └─→ Warning ──────────────────┐   │   │     │
│                                     │   │   │     │
│  UptimeRobot Down? ────────────────┐│   │   │     │
│       ├─→ Critical ────────────────┤│   │   │     │
│       └─→ Degraded ────────────────││   │   │     │
│                                     ││   │   │     │
│  Metrics Threshold? ─────────────────┤│   │   │     │
│       ├─→ Error rate > 5% ─────────┤│   │   │     │
│       ├─→ Response time > 10s ─────││   │   │     │
│       └─→ Memory > 80% ───────────││   │   │     │
│                                     ││   │   │     │
└────────────────────────────────────┼┼───┼───┼─────┘
                                      ││   │   │
                    ┌─────────────────┘│   │   │
                    │                  ◄─── Alert Queue
                    │                  │   │   │
                    ↓                  │   │   │
            ┌───────────────────────────────────┐
            │    Alert Destination              │
            ├───────────────────────────────────┤
            │                                   │
            │  ├─ Email to On-Call             │
            │  ├─ Slack Notification           │
            │  ├─ SMS (Optional)               │
            │  ├─ PagerDuty (Optional)         │
            │  └─ Status Page Update           │
            │                                   │
            └───────────────────────────────────┘
```

## Key Metrics Flow

```
Request comes in
    ↓
startTime = now()
    ↓
[Process Request]
    ↓
duration = now() - startTime
    ↓
MetricsService.recordMetric(
  endpoint,
  method,
  statusCode,
  duration,
  userId
)
    ↓
Store in memory array
    ↓
Calculate:
- Running average
- Error rate
- Slow request count
    ↓
Dashboard queries:
/monitoring/metrics/summary
    ↓
Returns:
{
  totalRequests: 1000,
  averageResponseTime: 245,
  errorRate: 2.5,
  slowRequests: 12,
  topEndpoints: [...],
  topErrors: [...]
}
```

## Integration Points

```
┌─────────────────────────────────────────────────────────┐
│              Integration Diagram                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Application                                           │
│  ├─ NestJS (Backend)  → [MonitoringModule]            │
│  └─ React (Frontend)  → [Sentry Init] + [Dashboard]  │
│                                                         │
│  External Services                                     │
│  ├─ Sentry Cloud      ← Error tracking                │
│  ├─ UptimeRobot       ← Health endpoint               │
│  ├─ Email Service     ← Alert notifications           │
│  └─ Log Storage       ← JSON logs                     │
│                                                         │
│  Data Sources                                          │
│  ├─ API Requests      → [Metrics]                     │
│  ├─ Error Events      → [Sentry] + [Logs]            │
│  ├─ Performance Data  → [Dashboard]                   │
│  └─ User Context      → [Sentry]                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

This architecture provides comprehensive monitoring and observability across the entire application stack, enabling quick detection and resolution of production issues.
