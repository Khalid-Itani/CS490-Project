# UC-133: Quick Start Guide

**⚡ Get monitoring and logging running in 10 minutes**

## TL;DR - Essential Steps

### 1. Install Dependencies (2 minutes)
```bash
# Backend
cd backend
npm install

# Frontend  
cd frontend
npm install
```

### 2. Set Up Sentry (3 minutes)
1. Go to https://sentry.io/ → Sign up (free tier)
2. Create project → Select "Node.js" → Copy DSN
3. Create another project → Select "React" → Copy DSN
4. Update environment variables (see below)

### 3. Configure Environment Variables (2 minutes)

**backend/.env**
```env
SENTRY_DSN=https://[YOUR_BACKEND_DSN_HERE]@ingest.sentry.io/[PROJECT_ID]
NODE_ENV=development
```

**frontend/.env**
```env
VITE_SENTRY_DSN=https://[YOUR_FRONTEND_DSN_HERE]@ingest.sentry.io/[PROJECT_ID]
```

### 4. Start Application (2 minutes)
```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 5. Verify It Works (1 minute)
```bash
# Check health
curl http://localhost:3000/monitoring/health

# Check metrics
curl http://localhost:3000/monitoring/metrics/summary
```

## ✅ Quick Verification

- [ ] Health endpoint returns `status: "ok"`
- [ ] Metrics show `totalRequests > 0`
- [ ] Backend logs appear in `backend/logs/` directory
- [ ] Frontend dashboard loads at http://localhost:5173/monitoring
- [ ] Frontend app doesn't crash (error boundary working)

## 🔧 Testing the Setup

### Test Error Logging
```bash
# In backend src/app.controller.ts, add:
@Get('test-error')
testError() {
  throw new Error('Test error for monitoring');
}

# Call it:
curl http://localhost:3000/test-error

# Check:
# 1. Error appears in backend/logs/error-*.log
# 2. Error appears in Sentry dashboard
```

### Test Metrics
```bash
# Make some requests
curl http://localhost:3000/api/some-endpoint

# Check metrics
curl http://localhost:3000/monitoring/metrics/summary | jq

# View dashboard
# Go to: http://localhost:5173/monitoring
```

## 📁 What Was Created

**Backend Monitoring** (`backend/src/monitoring/`):
- `logger.service.ts` - Structured logging
- `metrics.service.ts` - Tracks API metrics
- `metrics.interceptor.ts` - Captures requests
- `monitoring.controller.ts` - Metrics endpoints
- `monitoring.module.ts` - Wires everything together
- `sentry.init.ts` - Sentry setup

**Frontend Monitoring** (`frontend/src/monitoring/`):
- `sentry.init.ts` - Frontend error tracking
- `pages/MonitoringDashboard.jsx` - Metrics dashboard

## 📖 Documentation

- **Setup Details**: `UC-133-MONITORING-SETUP.md` (for production)
- **Testing Guide**: `UC-133-TESTING-VERIFICATION.md` (12 tests to run)
- **Incident Response**: `UC-133-INCIDENT-RESPONSE.md` (how to handle issues)
- **Implementation Summary**: `UC-133-IMPLEMENTATION-SUMMARY.md` (complete overview)

## 🚀 Next Steps

1. **Run Tests**: Follow `UC-133-TESTING-VERIFICATION.md`
2. **Set Up Production**: Follow `UC-133-MONITORING-SETUP.md`
3. **Configure Alerts**: In Sentry, set up alert rules
4. **Monitor Logs**: `tail -f backend/logs/error-*.log`
5. **View Dashboard**: http://localhost:5173/monitoring

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| `SENTRY_DSN not set` | Add `SENTRY_DSN` to backend/.env |
| `No logs in backend/logs/` | Check directory exists: `mkdir backend/logs` |
| Dashboard shows no data | Make some API requests first, then refresh |
| Sentry not getting errors | Verify DSN is correct in `.env` |

## 📊 Available Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /monitoring/health` | Application health status |
| `GET /monitoring/metrics/summary` | Overall metrics |
| `GET /monitoring/metrics/all` | Raw metrics data |
| `GET /monitoring/metrics/error-rate` | Error rate percentage |
| `GET /monitoring/metrics/average-response-time` | Avg response time |

## 🎯 Success Criteria

After setup, you should see:
- ✅ Health check returning `ok`
- ✅ Logs in `backend/logs/` directory
- ✅ Metrics accumulating (request count increasing)
- ✅ Errors appearing in Sentry (if you trigger them)
- ✅ Dashboard displaying all metrics
- ✅ No console errors in frontend

## 💡 Pro Tips

1. **Quick log check**:
   ```bash
   tail backend/logs/info-$(date +%Y-%m-%d).log | jq
   ```

2. **Monitor in real-time**:
   ```bash
   watch -n 1 'curl -s http://localhost:3000/monitoring/metrics/summary | jq'
   ```

3. **Clear logs** (development only):
   ```bash
   rm backend/logs/*.log
   ```

4. **View specific errors**:
   ```bash
   grep "specific-endpoint" backend/logs/error-*.log | jq
   ```

## ❓ Questions?

Check the documentation:
- **How do I configure?** → `UC-133-MONITORING-SETUP.md`
- **How do I test?** → `UC-133-TESTING-VERIFICATION.md`
- **What do I do if something breaks?** → `UC-133-INCIDENT-RESPONSE.md`
- **What was implemented?** → `UC-133-IMPLEMENTATION-SUMMARY.md`

## 📞 Getting Help

1. Check the relevant documentation above
2. Review log files in `backend/logs/`
3. Check Sentry dashboard for error details
4. Review `UC-133-TESTING-VERIFICATION.md` troubleshooting section

---

**Ready to go!** 🚀 Follow the 5 steps above and you'll have full monitoring and logging in minutes.
