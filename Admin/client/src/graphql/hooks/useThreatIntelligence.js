import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_THREAT_INTELLIGENCE,
  GET_ML_ENGINE_STATUS,
  GET_ML_INSIGHTS,
  TOGGLE_ML_ENGINE
} from '../queries/admin.js';

export const useThreatIntelligence = () => {
  const { data, loading, error, refetch } = useQuery(GET_THREAT_INTELLIGENCE, {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    pollInterval: 30000, // Poll every 30 seconds for real-time updates
  });

  return {
    threatIntelligence: data?.threatIntelligence || {
      mlStatus: 'unknown',
      predictionAccuracy: 0,
      avgResponseTime: 0,
      threatCoverage: 0,
      falsePositives: 0,
      threats: []
    },
    loading,
    error,
    refetch
  };
};

export const useMLEngineStatus = () => {
  const { data, loading, error, refetch } = useQuery(GET_ML_ENGINE_STATUS, {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    pollInterval: 60000, // Poll every minute
  });

  return {
    mlEngine: data?.mlEngineStatus || {
      status: 'unknown',
      predictionAccuracy: 0,
      avgResponseTime: 0,
      threatCoverage: 0,
      falsePositives: 0,
      lastTraining: null,
      modelVersion: 'unknown'
    },
    loading,
    error,
    refetch
  };
};

export const useMLInsights = (timeRange = '24h') => {
  const { data, loading, error, refetch } = useQuery(GET_ML_INSIGHTS, {
    variables: { timeRange },
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  return {
    insights: data?.mlInsights || {
      behavioralAnalysis: {
        anomalousUsers: 0,
        suspiciousPatterns: 0,
        riskScore: 0
      },
      threatTrends: [],
      modelPerformance: {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0
      }
    },
    loading,
    error,
    refetch
  };
};

export const useToggleMLEngine = () => {
  const [toggleMLEngine, { loading, error }] = useMutation(TOGGLE_ML_ENGINE, {
    refetchQueries: [
      { query: GET_THREAT_INTELLIGENCE },
      { query: GET_ML_ENGINE_STATUS }
    ],
    errorPolicy: 'all',
  });

  return {
    toggleMLEngine: async () => {
      try {
        const result = await toggleMLEngine();
        return result.data?.toggleMLEngine;
      } catch (err) {
        throw err;
      }
    },
    loading,
    error
  };
};




