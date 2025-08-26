import React, { useState } from "react";
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  User,
  Globe,
  Monitor,
  Shield
} from "lucide-react";

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('24h');

  // Mock audit logs data
  const [auditLogs] = useState([
    {
      id: '1',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      level: 'info',
      category: 'authentication',
      user: 'admin@ideas.com',
      action: 'User login successful',
      details: 'Login from IP 192.168.1.100, device: Chrome on Windows',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_12345'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      level: 'warning',
      category: 'security',
      user: 'admin@ideas.com',
      action: 'Failed login attempt',
      details: 'Invalid password for user admin@ideas.com',
      ip: '203.0.113.45',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      sessionId: null
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      level: 'error',
      category: 'system',
      user: 'system',
      action: 'Database connection failed',
      details: 'Failed to connect to MongoDB cluster',
      ip: null,
      userAgent: null,
      sessionId: null
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      level: 'info',
      category: 'admin',
      user: 'admin@ideas.com',
      action: 'Admin user created',
      details: 'New admin user: john@ideas.com with role: moderator',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_12345'
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      level: 'warning',
      category: 'security',
      user: 'admin@ideas.com',
      action: 'Suspicious activity detected',
      details: 'Multiple failed login attempts from IP 198.51.100.123',
      ip: '198.51.100.123',
      userAgent: 'Mozilla/5.0 (Unknown)',
      sessionId: null
    }
  ]);

  const getLevelColor = (level) => {
    switch (level) {
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error':
        return <XCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'info':
        return <Info className="w-4 h-4" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'authentication':
        return <Shield className="w-4 h-4" />;
      case 'security':
        return <AlertTriangle className="w-4 h-4" />;
      case 'system':
        return <Monitor className="w-4 h-4" />;
      case 'admin':
        return <User className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel;
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const exportLogs = () => {
    // TODO: Implement CSV/JSON export
    console.log('Exporting logs...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor system activity, security events, and user actions
          </p>
        </div>
        
        <button
          onClick={exportLogs}
          className="btn-secondary flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Export Logs</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="input w-full"
            >
              <option value="all">All Levels</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input w-full"
            >
              <option value="all">All Categories</option>
              <option value="authentication">Authentication</option>
              <option value="security">Security</option>
              <option value="system">System</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input w-full"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              System Logs ({filteredLogs.length})
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredLogs.length} of {auditLogs.length} logs
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatDate(log.timestamp)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(log.timestamp)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLevelColor(log.level)}`}>
                      {getLevelIcon(log.level)}
                      <span className="ml-1 capitalize">{log.level}</span>
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(log.category)}
                      <span className="text-sm text-gray-900 dark:text-white capitalize">
                        {log.category}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {log.user === 'system' ? 'System' : log.user}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {log.action}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {log.details}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {log.ip || 'N/A'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No logs found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search criteria or time range.
          </p>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
