import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

interface MetricsSummary {
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  slowRequests: number;
  topEndpoints: { endpoint: string; count: number }[];
  topErrors: { statusCode: number; count: number }[];
}

interface HealthStatus {
  status: string;
  uptime: number;
  memory: NodeJS.MemoryUsage;
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState('60');

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeWindow]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [metricsRes, healthRes] = await Promise.all([
        axios.get(`/monitoring/metrics/summary?timeWindow=${timeWindow}`),
        axios.get(`/monitoring/health`),
      ]);

      setMetrics(metricsRes.data.data);
      setHealth(healthRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading monitoring data...</div>
      </div>
    );
  }

  const errorData = metrics?.topErrors.map(err => ({
    name: `${err.statusCode}`,
    value: err.count,
  })) || [];

  const endpointData = metrics?.topEndpoints.map(ep => ({
    name: ep.endpoint.substring(0, 20) + (ep.endpoint.length > 20 ? '...' : ''),
    count: ep.count,
  })) || [];

  const memoryUsageMB = health?.memory ? Math.round(health.memory.heapUsed / 1024 / 1024) : 0;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Production Monitoring Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button
              onClick={fetchMetrics}
              className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Time Window Selector */}
        <div className="mb-6">
          <label className="mr-4 font-semibold">Time Window:</label>
          <select
            value={timeWindow}
            onChange={(e) => setTimeWindow(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded"
          >
            <option value="15">Last 15 minutes</option>
            <option value="60">Last hour</option>
            <option value="240">Last 4 hours</option>
            <option value="1440">Last day</option>
          </select>
        </div>

        {/* Key Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-semibold">Total Requests</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {metrics.totalRequests.toLocaleString()}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-semibold">Avg Response Time</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {metrics.averageResponseTime}ms
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-semibold">Error Rate</h3>
              <p className={`text-3xl font-bold mt-2 ${
                metrics.errorRate > 5 ? 'text-red-600' : 'text-green-600'
              }`}>
                {metrics.errorRate}%
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-semibold">Slow Requests</h3>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {metrics.slowRequests}
              </p>
            </div>
          </div>
        )}

        {/* Health Status */}
        {health && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-semibold">Application Status</h3>
              <p className={`text-2xl font-bold mt-2 ${
                health.status === 'ok' ? 'text-green-600' : 'text-red-600'
              }`}>
                {health.status.toUpperCase()}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-semibold">Uptime</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {(health.uptime / 3600).toFixed(1)}h
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-semibold">Memory Usage</h3>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {memoryUsageMB}MB
              </p>
            </div>
          </div>
        )}

        {/* Charts */}
        {metrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Endpoints */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Top API Endpoints</h3>
              {endpointData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={endpointData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </div>

            {/* Error Status Codes */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Error Status Codes</h3>
              {errorData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={errorData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {errorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500">No errors - Great job! 🎉</p>
              )}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchMetrics}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Refresh Now
          </button>
        </div>
      </div>
    </div>
  );
}
