import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_AUTOMATED_RESPONSE_CONFIG,
  GET_AUTOMATED_RESPONSE_INCIDENTS,
  UPDATE_RESPONSE_RULE,
  TOGGLE_AUTOMATED_RESPONSE,
  CREATE_RESPONSE_RULE
} from '../queries/admin.js';

export const useAutomatedResponseConfig = () => {
  const { data, loading, error, refetch } = useQuery(GET_AUTOMATED_RESPONSE_CONFIG, {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  return {
    config: data?.automatedResponseConfig || {
      enabled: false,
      responseRules: [],
      responseActions: []
    },
    loading,
    error,
    refetch
  };
};

export const useAutomatedResponseIncidents = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_AUTOMATED_RESPONSE_INCIDENTS, {
    variables: {
      limit: options.limit || 50,
      offset: options.offset || 0,
      severity: options.severity
    },
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  return {
    incidents: data?.automatedResponseIncidents || [],
    loading,
    error,
    refetch
  };
};

export const useUpdateResponseRule = () => {
  const [updateResponseRule, { loading, error }] = useMutation(UPDATE_RESPONSE_RULE, {
    refetchQueries: [{ query: GET_AUTOMATED_RESPONSE_CONFIG }],
    errorPolicy: 'all',
  });

  return {
    updateRule: async (ruleId, input) => {
      try {
        const result = await updateResponseRule({ 
          variables: { ruleId, input } 
        });
        return result.data?.updateResponseRule;
      } catch (err) {
        throw err;
      }
    },
    loading,
    error
  };
};

export const useToggleAutomatedResponse = () => {
  const [toggleAutomatedResponse, { loading, error }] = useMutation(TOGGLE_AUTOMATED_RESPONSE, {
    refetchQueries: [{ query: GET_AUTOMATED_RESPONSE_CONFIG }],
    errorPolicy: 'all',
  });

  return {
    toggleSystem: async (enabled) => {
      try {
        const result = await toggleAutomatedResponse({ variables: { enabled } });
        return result.data?.toggleAutomatedResponse;
      } catch (err) {
        throw err;
      }
    },
    loading,
    error
  };
};

export const useCreateResponseRule = () => {
  const [createResponseRule, { loading, error }] = useMutation(CREATE_RESPONSE_RULE, {
    refetchQueries: [{ query: GET_AUTOMATED_RESPONSE_CONFIG }],
    errorPolicy: 'all',
  });

  return {
    createRule: async (input) => {
      try {
        const result = await createResponseRule({ variables: { input } });
        return result.data?.createResponseRule;
      } catch (err) {
        throw err;
      }
    },
    loading,
    error
  };
};




