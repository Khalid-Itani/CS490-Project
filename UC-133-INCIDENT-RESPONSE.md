# UC-133: Incident Response Procedures

## Overview
This document defines procedures for responding to incidents detected by the production monitoring system.

## Severity Levels

| Severity | Definition | Response Time | Examples |
|----------|-----------|----------------|----------|
| **Critical** | System down or critical feature broken | 5 minutes | Database down, authentication broken |
| **High** | Major functionality impacted | 15 minutes | 50% error rate, API response > 30s |
| **Medium** | Some functionality affected | 1 hour | 10% error rate, specific endpoint slow |
| **Low** | Minor issues, workarounds available | 8 hours | 5% error rate, single slow endpoint |

## Incident Detection

### Automatic Alerts Triggered By:

1. **Sentry Alerts**:
   - Fatal/Error level exceptions
   - Error spike (>10 errors in 5 minutes)
   - Specific error patterns

2. **UptimeRobot Alerts**:
   - Application down
   - Response time > 30 seconds
   - SSL certificate expiring

3. **Manual Monitoring**:
   - Dashboard error rate > 5%
   - Average response time > 10 seconds
   - Memory usage > 80%

## Incident Response Flowchart

```
Incident Detected
    ↓
Verify Issue (1-2 min)
    ↓
Classify Severity (1 min)
    ↓
Notify On-Call Team (1 min)
    ↓
Gather Information (2-5 min)
    ↓
Attempt Fix/Workaround (5-30 min)
    ↓
Deploy Fix
    ↓
Verify Resolution (1-5 min)
    ↓
Communicate Status
    ↓
Post-Incident Review
```

## Step-by-Step Response Procedures

### Phase 1: Detection & Verification (First 5 Minutes)

#### When Alert is Received:

1. **Acknowledge Alert**
   - Note timestamp of first alert
   - Check alert source (Sentry, UptimeRobot, Slack, email)
   - Set status to "investigating"

2. **Verify the Issue**
   ```bash
   # Check application health
   curl http://production-server:3000/monitoring/health
   
   # Check metrics
   curl http://production-server:3000/monitoring/metrics/summary
   
   # Check recent logs
   ssh user@production-server
   tail -100 backend/logs/error-$(date +%Y-%m-%d).log | jq
   ```

3. **Determine Scope**
   - Is this widespread or isolated?
   - How many users affected?
   - Is data being corrupted?
   - Can users work around it?

### Phase 2: Initial Response (5-15 Minutes)

#### Gather Information:

```bash
# Get detailed error information from Sentry
1. Go to https://sentry.io/
2. Open the project dashboard
3. Look at the failing issue
4. Note:
   - Error message
   - Stack trace
   - Affected endpoint(s)
   - Affected user(s)
   - First occurrence time

# Check application logs
grep -i "error" backend/logs/error-$(date +%Y-%m-%d).log | tail -50 | jq

# Check system resources
ssh user@production-server
free -m  # Memory
df -h    # Disk space
top      # CPU usage
ps aux | grep node  # Process info

# Check database connectivity
curl -X GET http://production-server:3000/api/health/database

# Check external service integrations
curl -X GET http://production-server:3000/api/health/services
```

#### Create Incident Ticket:

1. **GitHub/Jira Issue Template**:
   ```
   Title: [INCIDENT] Brief Description - Time
   
   Severity: [Critical/High/Medium/Low]
   Start Time: [ISO timestamp]
   
   ## Symptoms
   - [What users/systems are affected]
   
   ## Initial Investigation
   - Error: [Main error message]
   - Affected Endpoint: [/api/...]
   - Affected Users: [user IDs or count]
   
   ## Possible Causes
   - [List potential causes]
   
   ## Actions Taken
   - [List actions]
   
   ## Resolution
   - [When resolved, note what fixed it]
   ```

#### Notify Team:

```
Critical: Page on-call engineer immediately
High: Send Slack alert + email
Medium: Create ticket + email team
Low: Add to backlog
```

### Phase 3: Investigation & Root Cause (15-45 Minutes)

#### Check Common Causes:

```typescript
// 1. Database Issues
// Check connection pool
SELECT * FROM pg_stat_connections;

// Check locks
SELECT * FROM pg_locks;

// Check disk space
df -h /var/lib/postgresql/

// 2. Memory Leaks
// Check memory usage over time
curl http://production-server:3000/monitoring/health | jq '.memory'

// 3. External Service Issues
// Check API integrations
- Sentry status
- Email service status
- Payment processor status
- Third-party APIs

// 4. Recent Deployments
git log --oneline -10
# Compare with incident start time
```

#### Query Logs by Pattern:

```bash
# Find all errors in last hour
grep "$(date -d '1 hour ago' +%Y-%m-%d'T'%H)" backend/logs/error-*.log | jq

# Find errors from specific endpoint
grep '"endpoint":"/api/jobs"' backend/logs/error-*.log

# Find errors from specific user
grep '"userId":"user123"' backend/logs/error-*.log

# Count errors by type
grep '"message"' backend/logs/error-*.log | \
  sed 's/.*"message":"\([^"]*\).*/\1/' | \
  sort | uniq -c | sort -rn
```

#### Review Sentry Details:

1. **Issue Details**:
   - Frequency graph
   - First seen vs last seen
   - Affected releases
   - Browser/OS breakdown (frontend)

2. **Event Details**:
   - Full stack trace
   - Request headers
   - User context
   - Breadcrumbs (user actions before error)
   - Tags and context

3. **Release Info**:
   - Commits in current release
   - Compare with previous release

### Phase 4: Mitigation (30-60 Minutes)

#### Option 1: Quick Workaround
```typescript
// If you identify the problematic code:
// Add temporary condition to bypass issue

// Example: If specific endpoint is broken
@Get('problem-endpoint')
problemEndpoint() {
  // Temporary: Return cached data instead
  return cachedData;
}
```

#### Option 2: Feature Flag
```typescript
// Temporarily disable problematic feature
if (featureFlags.isEnabled('problem-feature')) {
  // Run feature
} else {
  // Return alternative
}
```

#### Option 3: Rollback
```bash
# If issue was introduced in recent deployment
git log --oneline -5
git revert <commit-hash>
npm run build
npm run start:prod

# Verify
curl http://production-server:3000/monitoring/health
```

#### Option 4: Direct Fix
```typescript
// Fix the actual issue
// Test locally
npm run test

// Build
npm run build

// Deploy
# See deployment process below
```

### Phase 5: Deployment & Verification

#### Deploy Fix:

```bash
# 1. Build
npm run build

# 2. Run tests
npm run test
npm run test:e2e

# 3. Deploy (follow your deployment process)
# Example: Docker
docker build -t app:latest .
docker tag app:latest app:prod
docker push app:prod

# Kubernetes example
kubectl set image deployment/app app=app:prod

# 4. Verify health
curl http://production-server:3000/monitoring/health

# 5. Check metrics
curl http://production-server:3000/monitoring/metrics/summary | jq '.data.errorRate'
```

#### Verification Checklist:

- [ ] Application is responding
- [ ] Health endpoint returns "ok"
- [ ] Error rate is returning to normal
- [ ] Response times are acceptable
- [ ] No new errors appearing in Sentry
- [ ] Affected functionality is working
- [ ] Database queries are responsive
- [ ] External services are connected
- [ ] Logs show normal operation

### Phase 6: Communication & Documentation

#### Update Incident Ticket:

```
## Resolution
Fixed by: [Description of fix]
Commit: [Git hash]
Deployed at: [ISO timestamp]

## Verification
- Health check: ✅ OK
- Error rate: ✅ 0%
- Response time: ✅ <500ms

## Root Cause
[Explain what caused the issue]

## Prevention
[How to prevent this in future]
```

#### Notify Users:

**Example Status Message**:
```
RESOLVED - We experienced an outage from 14:30-14:45 UTC 
affecting the Jobs API. The issue was [brief description]. 
All services are now operating normally. We apologize for 
the inconvenience and will conduct a full review.
```

#### Post-Incident Actions:

1. **Document in Wiki/Knowledge Base**
2. **Create Prevention Ticket**
3. **Schedule Review Meeting** (24-48 hours later)
4. **Update Monitoring Thresholds** (if needed)
5. **Add Test Case** (to prevent regression)

### Phase 7: Post-Incident Review (24-48 Hours Later)

#### Review Meeting Agenda:

1. **What happened?**
   - Timeline of events
   - Impact assessment

2. **Why did it happen?**
   - Root cause analysis
   - Contributing factors

3. **What are we doing to prevent it?**
   - Code fixes
   - Process improvements
   - Monitoring enhancements

4. **What are we doing to respond better?**
   - Documentation updates
   - Procedure improvements
   - Training needs

#### Example Post-Incident Notes:

```markdown
## Incident: Database Connection Pool Exhaustion

### Timeline
- 14:30 UTC: First errors in Sentry
- 14:32 UTC: On-call engineer alerted
- 14:40 UTC: Root cause identified (connection leak)
- 14:45 UTC: Temporary fix deployed (restart app)
- 15:00 UTC: Permanent fix deployed (fix connection handling)

### Root Cause
The connection pool was not properly closing connections 
after certain error conditions, leading to pool exhaustion 
after ~24 hours.

### Prevention
1. Add connection pool monitoring to dashboard
2. Add automated connection cleanup
3. Add tests for connection leak scenarios
4. Improve error handling to ensure cleanup

### Action Items
- [ ] @dev1 - Fix connection handling (PR #123)
- [ ] @dev2 - Add connection pool tests (PR #124)
- [ ] @ops - Deploy monitoring enhancement
- [ ] @lead - Review database connection patterns
```

## Emergency Contact Procedures

### Escalation Path:
1. On-Call Engineer (paged immediately for Critical)
2. Tech Lead
3. Engineering Manager
4. CTO

### Contact Methods:
- Slack: @on-call
- Phone: [on-call number]
- SMS: [backup number]

## Runbook Templates

### Template: Database Down

**Symptoms**: Database connection errors, 500 errors

**Quick Checks**:
```bash
# Is database running?
psql -h db-server -U user -d database -c "SELECT 1;"

# Is it accessible from app server?
telnet db-server 5432

# Check disk space
ssh db-server "df -h /var/lib/postgresql/"

# Check database logs
ssh db-server "tail -50 /var/log/postgresql/postgresql.log"
```

**Mitigation**:
- Restart database service
- Check for hung queries
- Clear connection pool
- Scale read replicas if available

### Template: High Error Rate

**Symptoms**: Error rate > 10%, multiple errors in Sentry

**Quick Checks**:
```bash
# What endpoints are failing?
curl http://server:3000/monitoring/metrics/summary | jq '.data.topErrors'

# Recent logs
tail -100 backend/logs/error-$(date +%Y-%m-%d).log | jq

# System resources
free -m; df -h; top -b -n1
```

**Mitigation**:
- Identify affected endpoints
- Check for recent deploys
- Monitor error rate trend
- Consider rollback if new deployment

### Template: Slow Response Times

**Symptoms**: Average response time > 10 seconds

**Quick Checks**:
```bash
# What's slow?
curl http://server:3000/monitoring/metrics/summary | \
  jq '.data.topEndpoints'

# CPU usage
top -b -n1 | head -20

# Disk I/O
iostat -x 1 5

# Database query time
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 10;
```

**Mitigation**:
- Check CPU/memory/disk usage
- Identify slow queries
- Check external API latency
- Consider caching or optimization

## Key Metrics to Monitor

- Error rate: Should be < 1% (alert at > 5%)
- Response time: Should be < 500ms (alert at > 5s)
- Memory usage: Should be < 70% heap (alert at > 80%)
- Disk usage: Should be < 70% (alert at > 85%)
- Database connections: Should be < 80 (alert at > 95)

## Related Documentation

- [Setup Guide](./UC-133-MONITORING-SETUP.md)
- [Testing Guide](./UC-133-TESTING-VERIFICATION.md)
- [System Architecture](./README.md)
- [Deployment Procedures](./DEPLOYMENT.md)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-12-17 | Initial version |

---

**Last Updated**: 2024-12-17
**Maintained By**: DevOps Team
**Review Frequency**: Quarterly
