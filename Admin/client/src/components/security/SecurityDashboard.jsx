import React, { useState, useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Lock,
  Unlock,
  Users,
  Activity,
  Clock,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  Settings,
  Zap,
  Globe,
  Smartphone,
  Monitor,
} from "lucide-react";

const SecurityDashboard = () => {
  const [timeRange, setTimeRange] = useState("24h");
  const [loading, setLoading] = useState(false);

  // Mock data for now - will be replaced with GraphQL queries
  const [securityMetrics, setSecurityMetrics] = useState({
    totalLogins: 156,
    failedAttempts: 23,
    suspiciousActivity: 5,
    blockedIPs: 8,
    activeSessions: 12,
    lastIncident: new Date(Date.now() - 2 * 60 * 60 * 1000),
    securityScore: 87,
    complianceStatus: "compliant",
  });

  const [threats, setThreats] = useState([
    {
      id: "1",
      type: "brute_force",
      severity: "high",
      description: "Multiple failed login attempts from IP 192.168.1.100",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: "blocked",
      ip: "192.168.1.100",
      attempts: 15,
    },
    {
      id: "2",
      type: "suspicious_location",
      severity: "medium",
      description: "Login from new location (New York, US)",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "investigating",
      ip: "203.0.113.45",
      location: "New York, US",
    },
  ]);

  const [complianceChecks, setComplianceChecks] = useState([
    {
      id: "1",
      category: "Authentication",
      status: "pass",
      lastCheck: new Date(Date.now() - 1 * 60 * 60 * 1000),
      details: "Multi-factor authentication enabled, strong password policy enforced",
    },
    {
      id: "2",
      category: "Session Management",
      status: "pass",
      lastCheck: new Date(Date.now() - 1 * 60 * 60 * 1000),
      details: "Session timeout configured, secure session handling",
    },
  ]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pass":
        return "text-green-600 bg-green-50 border-green-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "fail":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getThreatIcon = (type) => {
    switch (type) {
      case "brute_force":
        return <Lock className='w-4 h-4' />;
      case "suspicious_location":
        return <Globe className='w-4 h-4' />;
      case "unusual_time":
        return <Clock className='w-4 h-4' />;
      default:
        return <AlertTriangle className='w-4 h-4' />;
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const refreshData = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const getSecurityScoreColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getSecurityScoreBg = (score) => {
    if (score >= 90) return "bg-green-50 dark:bg-green-900/20";
    if (score >= 70) return "bg-yellow-50 dark:bg-yellow-900/20";
    return "bg-red-50 dark:bg-red-900/20";
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Security Dashboard</h2>
          <p className='text-gray-600 dark:text-gray-400'>
            Monitor security metrics, threats, and compliance status
          </p>
        </div>
        <div className='flex items-center space-x-3'>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className='input text-sm'>
            <option value='1h'>Last Hour</option>
            <option value='24h'>Last 24 Hours</option>
            <option value='7d'>Last 7 Days</option>
            <option value='30d'>Last 30 Days</option>
          </select>
          <button
            onClick={refreshData}
            className='btn-secondary flex items-center space-x-2'
            disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg'>
              <Shield className='w-6 h-6 text-blue-600' />
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Security Score</p>
              <p
                className={`text-2xl font-bold ${getSecurityScoreColor(securityMetrics.securityScore)}`}>
                {securityMetrics.securityScore}/100
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-green-100 dark:bg-green-900/20 rounded-lg'>
              <CheckCircle className='w-6 h-6 text-green-600' />
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                Active Sessions
              </p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {securityMetrics.activeSessions}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-red-100 dark:bg-red-900/20 rounded-lg'>
              <XCircle className='w-6 h-6 text-red-600' />
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Failed Logins</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {securityMetrics.failedAttempts}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg'>
              <AlertTriangle className='w-6 h-6 text-yellow-600' />
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Threats</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>{threats.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Score and Compliance Status */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Security Score Chart */}
        <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
              Security Score Trend
            </h3>
            <TrendingUp className='w-5 h-5 text-green-600' />
          </div>

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>Current Score</span>
              <span
                className={`text-lg font-semibold ${getSecurityScoreColor(securityMetrics.securityScore)}`}>
                {securityMetrics.securityScore}/100
              </span>
            </div>

            <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3'>
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getSecurityScoreBg(securityMetrics.securityScore)}`}
                style={{ width: `${securityMetrics.securityScore}%` }}></div>
            </div>

            <div className='grid grid-cols-3 gap-4 text-center'>
              <div>
                <p className='text-xs text-gray-500 dark:text-gray-400'>Excellent</p>
                <p className='text-sm font-medium text-green-600'>90-100</p>
              </div>
              <div>
                <p className='text-xs text-gray-500 dark:text-gray-400'>Good</p>
                <p className='text-sm font-medium text-yellow-600'>70-89</p>
              </div>
              <div>
                <p className='text-xs text-gray-500 dark:text-gray-400'>Needs Attention</p>
                <p className='text-sm font-medium text-red-600'>0-69</p>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Status */}
        <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white'>Compliance Status</h3>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                securityMetrics.complianceStatus === "compliant"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200"
              }`}>
              {securityMetrics.complianceStatus === "compliant" ? "Compliant" : "Non-Compliant"}
            </div>
          </div>

          <div className='space-y-3'>
            {complianceChecks.map((check) => (
              <div
                key={check.id}
                className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                <div className='flex items-center space-x-3'>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(check.status)}`}>
                    {check.status === "pass" ? (
                      <CheckCircle className='w-3 h-3 mr-1' />
                    ) : check.status === "warning" ? (
                      <AlertTriangle className='w-3 h-3 mr-1' />
                    ) : (
                      <XCircle className='w-3 h-3 mr-1' />
                    )}
                    {check.status}
                  </span>
                  <span className='text-sm font-medium text-gray-900 dark:text-white'>
                    {check.category}
                  </span>
                </div>
                <span className='text-xs text-gray-500 dark:text-gray-400'>
                  {formatTimeAgo(check.lastCheck)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Threats */}
      <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
          <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
            Recent Security Threats
          </h3>
        </div>

        <div className='divide-y divide-gray-200 dark:divide-gray-700'>
          {threats.map((threat) => (
            <div
              key={threat.id}
              className='p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'>
              <div className='flex items-start justify-between'>
                <div className='flex items-start space-x-4'>
                  <div
                    className={`p-3 rounded-lg ${getSeverityColor(threat.severity).split(" ")[1]}`}>
                    {getThreatIcon(threat.type)}
                  </div>

                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center space-x-3 mb-2'>
                      <h4 className='text-lg font-medium text-gray-900 dark:text-white'>
                        {threat.description}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(threat.severity)}`}>
                        {threat.severity}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          threat.status === "blocked"
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : threat.status === "investigating"
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              : "bg-green-100 text-green-800 border border-green-200"
                        }`}>
                        {threat.status}
                      </span>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2'>
                      <div>
                        <span className='font-medium'>IP Address:</span>
                        <p className='mt-1 font-mono'>{threat.ip}</p>
                      </div>
                      <div>
                        <span className='font-medium'>Detected:</span>
                        <p className='mt-1'>{formatTimeAgo(threat.timestamp)}</p>
                        <p className='text-xs text-gray-500'>{formatDate(threat.timestamp)}</p>
                      </div>
                      <div>
                        <span className='font-medium'>Details:</span>
                        <p className='mt-1'>
                          {threat.type === "brute_force" && `${threat.attempts} failed attempts`}
                          {threat.type === "suspicious_location" && `Location: ${threat.location}`}
                          {threat.type === "unusual_time" && `Time: ${threat.time}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className='flex items-center space-x-2 ml-4'>
                  <button className='btn-secondary' title='View details'>
                    <Eye className='w-4 h-4' />
                  </button>
                  <button className='btn-secondary' title='Take action'>
                    <Settings className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700'>
        <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
          Quick Security Actions
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <button
            onClick={() => (window.location.href = "/security-settings")}
            className='p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center'>
            <Shield className='w-8 h-8 text-blue-600 mx-auto mb-2' />
            <p className='text-sm font-medium text-gray-900 dark:text-white'>Security Settings</p>
          </button>

          <button
            onClick={() => (window.location.href = "/audit-logs")}
            className='p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center'>
            <FileText className='w-8 h-8 text-green-600 mx-auto mb-2' />
            <p className='text-sm font-medium text-gray-900 dark:text-white'>Audit Logs</p>
          </button>

          <button
            onClick={() => (window.location.href = "/threat-intelligence")}
            className='p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center'>
            <Brain className='w-8 h-8 text-purple-600 mx-auto mb-2' />
            <p className='text-sm font-medium text-gray-900 dark:text-white'>Threat Intelligence</p>
          </button>

          <button
            onClick={() => (window.location.href = "/automated-response")}
            className='p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center'>
            <Zap className='w-8 h-8 text-yellow-600 mx-auto mb-2' />
            <p className='text-sm font-medium text-gray-900 dark:text-white'>Automated Response</p>
          </button>
        </div>

        {/* Additional Phase 4 Components */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4'>
          <button
            onClick={() => (window.location.href = "/admin-hierarchy")}
            className='p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center'>
            <Users className='w-8 h-8 text-indigo-600 mx-auto mb-2' />
            <p className='text-sm font-medium text-gray-900 dark:text-white'>Admin Hierarchy</p>
          </button>

          <button
            onClick={() => (window.location.href = "/compliance-reporting")}
            className='p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center'>
            <Target className='w-8 h-8 text-red-600 mx-auto mb-2' />
            <p className='text-sm font-medium text-gray-900 dark:text-white'>Compliance</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
