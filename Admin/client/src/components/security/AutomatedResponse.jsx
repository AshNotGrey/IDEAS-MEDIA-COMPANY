import React, { useState } from "react";
import {
  Zap,
  Play,
  Pause,
  Settings,
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Eye,
  Brain,
  Target,
  Lock,
  Globe,
  Smartphone,
} from "lucide-react";

const AutomatedResponse = () => {
  const [activeTab, setActiveTab] = useState("rules");
  const [loading, setLoading] = useState(false);
  const [autoResponseEnabled, setAutoResponseEnabled] = useState(true);

  // Automated response rules
  const [responseRules, setResponseRules] = useState([
    {
      id: "1",
      name: "Brute Force Protection",
      description: "Automatically block IPs after multiple failed login attempts",
      enabled: true,
      priority: "high",
      triggers: ["failed_login_attempts", "geographic_anomaly"],
      actions: ["block_ip", "notify_admin", "log_incident"],
      conditions: {
        failedAttempts: 5,
        timeWindow: "15m",
        blockDuration: "1h",
      },
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
      triggerCount: 23,
    },
    {
      id: "2",
      name: "Suspicious Activity Response",
      description: "Enhanced monitoring for unusual user behavior patterns",
      enabled: true,
      priority: "medium",
      triggers: ["unusual_login_time", "new_device", "suspicious_endpoint"],
      actions: ["require_reauth", "enhanced_monitoring", "notify_user"],
      conditions: {
        confidenceThreshold: 0.8,
        monitoringDuration: "24h",
      },
      lastTriggered: new Date(Date.now() - 6 * 60 * 60 * 1000),
      triggerCount: 8,
    },
    {
      id: "3",
      name: "Data Exfiltration Prevention",
      description: "Block large data transfers to external destinations",
      enabled: true,
      priority: "critical",
      triggers: ["large_data_transfer", "external_destination", "unusual_protocol"],
      actions: ["block_transfer", "isolate_endpoint", "notify_security_team"],
      conditions: {
        dataThreshold: "100MB",
        destinationCheck: true,
      },
      lastTriggered: new Date(Date.now() - 12 * 60 * 60 * 1000),
      triggerCount: 2,
    },
  ]);

  // Response actions
  const [responseActions, setResponseActions] = useState([
    {
      id: "1",
      name: "IP Blocking",
      description: "Temporarily or permanently block suspicious IP addresses",
      type: "network",
      configurable: true,
      defaultDuration: "1h",
      escalation: "admin_approval",
    },
    {
      id: "2",
      name: "Session Termination",
      description: "Force logout of suspicious user sessions",
      type: "session",
      configurable: true,
      defaultDuration: "immediate",
      escalation: "none",
    },
    {
      id: "3",
      name: "Enhanced Monitoring",
      description: "Increase logging and monitoring for specific users/IPs",
      type: "monitoring",
      configurable: true,
      defaultDuration: "24h",
      escalation: "none",
    },
    {
      id: "4",
      name: "Multi-Factor Challenge",
      description: "Require additional authentication for suspicious activities",
      type: "authentication",
      configurable: true,
      defaultDuration: "session",
      escalation: "none",
    },
  ]);

  // Incident history
  const [incidents, setIncidents] = useState([
    {
      id: "1",
      rule: "Brute Force Protection",
      severity: "high",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      description: "IP 192.168.1.100 blocked after 15 failed login attempts",
      status: "resolved",
      actions: ["IP blocked for 1 hour", "Admin notified", "Incident logged"],
      affectedUsers: 0,
      falsePositive: false,
    },
    {
      id: "2",
      rule: "Suspicious Activity Response",
      severity: "medium",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      description: "User admin@ideas.com accessed sensitive endpoints outside business hours",
      status: "investigating",
      actions: ["Re-authentication required", "Enhanced monitoring enabled"],
      affectedUsers: 1,
      falsePositive: false,
    },
  ]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
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
      case "resolved":
        return "text-green-600 bg-green-50 border-green-200";
      case "investigating":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "escalated":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getActionTypeIcon = (type) => {
    switch (type) {
      case "network":
        return <Globe className='w-4 h-4' />;
      case "session":
        return <Smartphone className='w-4 h-4' />;
      case "monitoring":
        return <Eye className='w-4 h-4' />;
      case "authentication":
        return <Lock className='w-4 h-4' />;
      default:
        return <Zap className='w-4 h-4' />;
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

  const toggleRule = (ruleId) => {
    setResponseRules((prev) =>
      prev.map((rule) => (rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule))
    );
  };

  const saveConfiguration = async () => {
    setLoading(true);
    // TODO: Implement GraphQL mutation to save configuration
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const tabs = [
    { id: "rules", name: "Response Rules", icon: <Zap className='w-4 h-4' /> },
    { id: "actions", name: "Response Actions", icon: <Target className='w-4 h-4' /> },
    { id: "incidents", name: "Incident History", icon: <AlertTriangle className='w-4 h-4' /> },
    { id: "settings", name: "Configuration", icon: <Settings className='w-4 h-4' /> },
  ];

  const renderRulesTab = () => (
    <div className='space-y-6'>
      {/* Rules Overview */}
      <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
            Automated Response Rules
          </h3>
          <button className='btn-primary flex items-center space-x-2'>
            <Plus className='w-4 h-4' />
            <span>Add Rule</span>
          </button>
        </div>

        <div className='space-y-4'>
          {responseRules.map((rule) => (
            <div
              key={rule.id}
              className='border border-gray-200 dark:border-gray-700 rounded-lg p-4'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-3 mb-2'>
                    <h4 className='text-lg font-medium text-gray-900 dark:text-white'>
                      {rule.name}
                    </h4>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(rule.priority)}`}>
                      {rule.priority}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rule.enabled
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-gray-100 text-gray-800 border border-gray-200"
                      }`}>
                      {rule.enabled ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className='text-gray-600 dark:text-gray-400 mb-3'>{rule.description}</p>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                    <div>
                      <span className='font-medium text-gray-700 dark:text-gray-300'>
                        Triggers:
                      </span>
                      <div className='flex flex-wrap gap-2 mt-1'>
                        {rule.triggers.map((trigger, index) => (
                          <span
                            key={index}
                            className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'>
                            {trigger.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className='font-medium text-gray-700 dark:text-gray-300'>Actions:</span>
                      <div className='flex flex-wrap gap-2 mt-1'>
                        {rule.actions.map((action, index) => (
                          <span
                            key={index}
                            className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'>
                            {action.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className='font-medium text-gray-700 dark:text-gray-300'>
                        Statistics:
                      </span>
                      <div className='mt-1 space-y-1 text-xs'>
                        <p>Last triggered: {formatTimeAgo(rule.lastTriggered)}</p>
                        <p>Total triggers: {rule.triggerCount}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='flex items-center space-x-2 ml-4'>
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      rule.enabled
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}>
                    {rule.enabled ? "Disable" : "Enable"}
                  </button>
                  <button className='btn-secondary' title='Edit rule'>
                    <Edit className='w-4 h-4' />
                  </button>
                  <button className='btn-secondary' title='View details'>
                    <Eye className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderActionsTab = () => (
    <div className='space-y-6'>
      {/* Response Actions */}
      <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700'>
        <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
          Available Response Actions
        </h3>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {responseActions.map((action) => (
            <div
              key={action.id}
              className='border border-gray-200 dark:border-gray-700 rounded-lg p-4'>
              <div className='flex items-start space-x-3 mb-3'>
                <div className='p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg'>
                  {getActionTypeIcon(action.type)}
                </div>
                <div className='flex-1'>
                  <h4 className='font-medium text-gray-900 dark:text-white'>{action.name}</h4>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>{action.description}</p>
                </div>
              </div>

              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-400'>Type:</span>
                  <span className='font-medium capitalize'>{action.type}</span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-400'>Configurable:</span>
                  <span className='font-medium'>{action.configurable ? "Yes" : "No"}</span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-400'>Default Duration:</span>
                  <span className='font-medium'>{action.defaultDuration}</span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-400'>Escalation:</span>
                  <span className='font-medium capitalize'>
                    {action.escalation.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              <div className='mt-4 pt-3 border-t border-gray-200 dark:border-gray-700'>
                <div className='flex space-x-2'>
                  <button className='flex-1 btn-secondary text-xs py-2'>Configure</button>
                  <button className='flex-1 btn-secondary text-xs py-2'>Test</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderIncidentsTab = () => (
    <div className='space-y-6'>
      {/* Incident History */}
      <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
          <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
            Automated Response Incidents
          </h3>
        </div>

        <div className='divide-y divide-gray-200 dark:divide-gray-700'>
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className='p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-3 mb-2'>
                    <h4 className='text-lg font-medium text-gray-900 dark:text-white'>
                      {incident.rule}
                    </h4>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(incident.status)}`}>
                      {incident.status}
                    </span>
                  </div>

                  <p className='text-gray-600 dark:text-gray-400 mb-3'>{incident.description}</p>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='font-medium text-gray-700 dark:text-gray-300'>
                        Actions Taken:
                      </span>
                      <ul className='mt-1 space-y-1'>
                        {incident.actions.map((action, index) => (
                          <li key={index} className='flex items-center space-x-2'>
                            <CheckCircle className='w-3 h-3 text-green-600' />
                            <span className='text-gray-600 dark:text-gray-400'>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className='font-medium text-gray-700 dark:text-gray-300'>Details:</span>
                      <div className='mt-1 space-y-1'>
                        <p className='text-gray-600 dark:text-gray-400'>
                          <span className='font-medium'>Detected:</span>{" "}
                          {formatTimeAgo(incident.timestamp)}
                        </p>
                        <p className='text-gray-600 dark:text-gray-400'>
                          <span className='font-medium'>Affected Users:</span>{" "}
                          {incident.affectedUsers}
                        </p>
                        <p className='text-gray-600 dark:text-gray-400'>
                          <span className='font-medium'>False Positive:</span>{" "}
                          {incident.falsePositive ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='flex items-center space-x-2 ml-4'>
                  <button className='btn-secondary' title='View details'>
                    <Eye className='w-4 h-4' />
                  </button>
                  <button className='btn-secondary' title='Investigate'>
                    <AlertTriangle className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className='space-y-6'>
      {/* Global Configuration */}
      <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700'>
        <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
          Automated Response Configuration
        </h3>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Enable Automated Response
              </label>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Allow the system to automatically respond to security threats
              </p>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={autoResponseEnabled}
                onChange={(e) => setAutoResponseEnabled(e.target.checked)}
                className='sr-only peer'
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Default Response Delay
              </label>
              <select className='input w-full'>
                <option value='immediate'>Immediate</option>
                <option value='5s'>5 seconds</option>
                <option value='30s'>30 seconds</option>
                <option value='1m'>1 minute</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Escalation Threshold
              </label>
              <select className='input w-full'>
                <option value='1'>1 incident</option>
                <option value='3'>3 incidents</option>
                <option value='5'>5 incidents</option>
                <option value='10'>10 incidents</option>
              </select>
            </div>
          </div>

          <div className='pt-4 border-t border-gray-200 dark:border-gray-700'>
            <button
              onClick={saveConfiguration}
              disabled={loading}
              className='btn-primary flex items-center space-x-2'>
              {loading ? (
                <RefreshCw className='w-4 h-4 animate-spin' />
              ) : (
                <Save className='w-4 h-4' />
              )}
              <span>{loading ? "Saving..." : "Save Configuration"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "rules":
        return renderRulesTab();
      case "actions":
        return renderActionsTab();
      case "incidents":
        return renderIncidentsTab();
      case "settings":
        return renderSettingsTab();
      default:
        return renderRulesTab();
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Automated Response</h2>
          <p className='text-gray-600 dark:text-gray-400'>
            Configure intelligent security automation and incident response
          </p>
        </div>

        <div className='flex items-center space-x-3'>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
              autoResponseEnabled
                ? "text-green-600 bg-green-50 border-green-200"
                : "text-red-600 bg-red-50 border-red-200"
            }`}>
            {autoResponseEnabled ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
        <div className='border-b border-gray-200 dark:border-gray-700'>
          <nav className='flex space-x-8 px-6' aria-label='Tabs'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors
                  ${
                    activeTab === tab.id
                      ? "border-ideas-accent text-ideas-accent"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                  }
                `}>
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className='p-6'>{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default AutomatedResponse;
