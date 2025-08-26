import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_COMPLIANCE_OVERVIEW,
  GET_SECURITY_INCIDENTS,
  GET_COMPLIANCE_REPORTS,
  GET_REGULATORY_REQUIREMENTS,
  CREATE_SECURITY_INCIDENT,
  UPDATE_SECURITY_INCIDENT,
  GENERATE_COMPLIANCE_REPORT
} from '../queries/admin.js';

export const useComplianceOverview = () => {
  const { data, loading, error, refetch } = useQuery(GET_COMPLIANCE_OVERVIEW, {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  return {
    complianceOverview: data?.complianceOverview || {
      overallStatus: 'unknown',
      score: 0,
      lastAssessment: null,
      nextAssessment: null,
      frameworks: []
    },
    loading,
    error,
    refetch
  };
};

export const useSecurityIncidents = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_SECURITY_INCIDENTS, {
    variables: {
      limit: options.limit || 50,
      offset: options.offset || 0,
      severity: options.severity,
      status: options.status
    },
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  return {
    incidents: data?.securityIncidents || [],
    loading,
    error,
    refetch
  };
};

export const useComplianceReports = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_COMPLIANCE_REPORTS, {
    variables: {
      framework: options.framework,
      status: options.status
    },
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  return {
    reports: data?.complianceReports || [],
    loading,
    error,
    refetch
  };
};

export const useRegulatoryRequirements = () => {
  const { data, loading, error } = useQuery(GET_REGULATORY_REQUIREMENTS, {
    errorPolicy: 'all',
  });

  return {
    requirements: data?.regulatoryRequirements || [],
    loading,
    error
  };
};

export const useCreateSecurityIncident = () => {
  const [createSecurityIncident, { loading, error }] = useMutation(CREATE_SECURITY_INCIDENT, {
    refetchQueries: [{ query: GET_SECURITY_INCIDENTS }],
    errorPolicy: 'all',
  });

  return {
    createIncident: async (input) => {
      try {
        const result = await createSecurityIncident({ variables: { input } });
        return result.data?.createSecurityIncident;
      } catch (err) {
        throw err;
      }
    },
    loading,
    error
  };
};

export const useUpdateSecurityIncident = () => {
  const [updateSecurityIncident, { loading, error }] = useMutation(UPDATE_SECURITY_INCIDENT, {
    refetchQueries: [{ query: GET_SECURITY_INCIDENTS }],
    errorPolicy: 'all',
  });

  return {
    updateIncident: async (incidentId, input) => {
      try {
        const result = await updateSecurityIncident({ 
          variables: { incidentId, input } 
        });
        return result.data?.updateSecurityIncident;
      } catch (err) {
        throw err;
      }
    },
    loading,
    error
  };
};

export const useGenerateComplianceReport = () => {
  const [generateComplianceReport, { loading, error }] = useMutation(GENERATE_COMPLIANCE_REPORT, {
    refetchQueries: [{ query: GET_COMPLIANCE_REPORTS }],
    errorPolicy: 'all',
  });

  return {
    generateReport: async (framework, options = {}) => {
      try {
        const result = await generateComplianceReport({ 
          variables: { framework, options } 
        });
        return result.data?.generateComplianceReport;
      } catch (err) {
        throw err;
      }
    },
    loading,
    error
  };
};




