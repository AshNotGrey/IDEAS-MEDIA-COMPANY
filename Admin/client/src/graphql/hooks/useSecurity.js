import { useQuery } from '@apollo/client';
import { 
  GET_SECURITY_METRICS,
  GET_SECURITY_AUDIT_LOGS
} from '../queries/admin.js';

export const useSecurityMetrics = () => {
  const { data, loading, error, refetch } = useQuery(GET_SECURITY_METRICS, {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    pollInterval: 30000, // Poll every 30 seconds for real-time updates
  });

  return {
    securityMetrics: data?.securityMetrics || {
      securityScore: 0,
      activeSessions: 0,
      failedAttempts: 0,
      blockedIPs: 0,
      complianceStatus: 'unknown',
      recentThreats: [],
      complianceFrameworks: []
    },
    loading,
    error,
    refetch
  };
};

export const useSecurityAuditLogs = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_SECURITY_AUDIT_LOGS, {
    variables: {
      limit: options.limit || 50,
      category: options.category
    },
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  return {
    auditLogs: data?.auditLogs || [],
    loading,
    error,
    refetch
  };
};




