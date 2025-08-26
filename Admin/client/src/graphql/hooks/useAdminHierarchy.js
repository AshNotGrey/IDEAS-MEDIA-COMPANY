import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_ADMIN_HIERARCHY, 
  GET_ADMIN_ROLES, 
  GET_ADMIN_PERMISSIONS, 
  GET_ADMIN_ACTIVITY,
  CREATE_ADMIN,
  UPDATE_ADMIN_ROLE,
  TOGGLE_ADMIN_STATUS
} from '../queries/admin.js';

export const useAdminHierarchy = () => {
  const { data, loading, error, refetch } = useQuery(GET_ADMIN_HIERARCHY, {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  return {
    adminHierarchy: data?.adminHierarchy || [],
    loading,
    error,
    refetch
  };
};

export const useAdminRoles = () => {
  const { data, loading, error } = useQuery(GET_ADMIN_ROLES, {
    errorPolicy: 'all',
  });

  return {
    roles: data?.adminRoles || [],
    loading,
    error
  };
};

export const useAdminPermissions = () => {
  const { data, loading, error } = useQuery(GET_ADMIN_PERMISSIONS, {
    errorPolicy: 'all',
  });

  return {
    permissions: data?.adminPermissions || [],
    loading,
    error
  };
};

export const useAdminActivity = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_ADMIN_ACTIVITY, {
    variables: {
      limit: options.limit || 50,
      offset: options.offset || 0,
      adminId: options.adminId,
      action: options.action
    },
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  return {
    activity: data?.adminActivity || [],
    loading,
    error,
    refetch
  };
};

export const useCreateAdmin = () => {
  const [createAdmin, { loading, error }] = useMutation(CREATE_ADMIN, {
    refetchQueries: [{ query: GET_ADMIN_HIERARCHY }],
    errorPolicy: 'all',
  });

  return {
    createAdmin: async (input) => {
      try {
        const result = await createAdmin({ variables: { input } });
        return result.data?.createAdmin;
      } catch (err) {
        throw err;
      }
    },
    loading,
    error
  };
};

export const useUpdateAdminRole = () => {
  const [updateAdminRole, { loading, error }] = useMutation(UPDATE_ADMIN_ROLE, {
    refetchQueries: [{ query: GET_ADMIN_HIERARCHY }],
    errorPolicy: 'all',
  });

  return {
    updateAdminRole: async (adminId, role, permissions) => {
      try {
        const result = await updateAdminRole({ 
          variables: { adminId, role, permissions } 
        });
        return result.data?.updateAdminRole;
      } catch (err) {
        throw err;
      }
    },
    loading,
    error
  };
};

export const useToggleAdminStatus = () => {
  const [toggleAdminStatus, { loading, error }] = useMutation(TOGGLE_ADMIN_STATUS, {
    refetchQueries: [{ query: GET_ADMIN_HIERARCHY }],
    errorPolicy: 'all',
  });

  return {
    toggleAdminStatus: async (adminId) => {
      try {
        const result = await toggleAdminStatus({ variables: { adminId } });
        return result.data?.toggleAdminStatus;
      } catch (err) {
        throw err;
      }
    },
    loading,
    error
  };
};




