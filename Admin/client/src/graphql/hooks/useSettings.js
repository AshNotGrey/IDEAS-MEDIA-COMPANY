import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

// GraphQL Queries
export const GET_SETTINGS = gql`
    query GetSettings($filter: SettingsFilterInput, $page: Int, $limit: Int) {
        settings(filter: $filter, page: $page, limit: $limit) {
            settings {
                _id
                uuid
                key
                name
                description
                category
                value
                type
                defaultValue
                validation {
                    required
                    min
                    max
                    minLength
                    maxLength
                    pattern
                    enum
                }
                ui {
                    inputType
                    placeholder
                    helpText
                    options {
                        value
                        label
                    }
                    group
                    order
                    hidden
                    readonly
                }
                isSecret
                accessLevel
                isActive
                isSystem
                requiresRestart
                environment
                history {
                    previousValue
                    newValue
                    changedBy {
                        _id
                        username
                        email
                    }
                    changedAt
                    reason
                    ipAddress
                }
                lastModifiedBy {
                    _id
                    username
                    email
                }
                tags
                notes
                isModified
                hasHistory
                createdAt
                updatedAt
            }
            total
            page
            limit
            totalPages
        }
    }
`;

export const GET_SETTINGS_BY_CATEGORY = gql`
    query GetSettingsByCategory($category: SettingsCategory!) {
        settingsByCategory(category: $category) {
            _id
            uuid
            key
            name
            description
            category
            value
            type
            defaultValue
            validation {
                required
                min
                max
                minLength
                maxLength
                pattern
                enum
            }
            ui {
                inputType
                placeholder
                helpText
                options {
                    value
                    label
                }
                group
                order
                hidden
                readonly
            }
            isSecret
            accessLevel
            isActive
            isSystem
            requiresRestart
            environment
            history {
                previousValue
                newValue
                changedBy {
                    _id
                    username
                    email
                }
                changedAt
                reason
                ipAddress
            }
            lastModifiedBy {
                _id
                username
                email
            }
            tags
            notes
            isModified
            hasHistory
            createdAt
            updatedAt
        }
    }
`;

export const GET_SETTING = gql`
    query GetSetting($key: String!) {
        setting(key: $key) {
            _id
            uuid
            key
            name
            description
            category
            value
            type
            defaultValue
            validation {
                required
                min
                max
                minLength
                maxLength
                pattern
                enum
            }
            ui {
                inputType
                placeholder
                helpText
                options {
                    value
                    label
                }
                group
                order
                hidden
                readonly
            }
            isSecret
            accessLevel
            isActive
            isSystem
            requiresRestart
            environment
            history {
                previousValue
                newValue
                changedBy {
                    _id
                    username
                    email
                }
                changedAt
                reason
                ipAddress
            }
            lastModifiedBy {
                _id
                username
                email
            }
            tags
            notes
            isModified
            hasHistory
            createdAt
            updatedAt
        }
    }
`;

// GraphQL Mutations
export const UPDATE_SETTING = gql`
    mutation UpdateSetting($input: UpdateSettingsInput!) {
        updateSetting(input: $input) {
            _id
            uuid
            key
            name
            description
            category
            value
            type
            defaultValue
            validation {
                required
                min
                max
                minLength
                maxLength
                pattern
                enum
            }
            ui {
                inputType
                placeholder
                helpText
                options {
                    value
                    label
                }
                group
                order
                hidden
                readonly
            }
            isSecret
            accessLevel
            isActive
            isSystem
            requiresRestart
            environment
            history {
                previousValue
                newValue
                changedBy {
                    _id
                    username
                    email
                }
                changedAt
                reason
                ipAddress
            }
            lastModifiedBy {
                _id
                username
                email
            }
            tags
            notes
            isModified
            hasHistory
            createdAt
            updatedAt
        }
    }
`;

export const RESET_SETTING = gql`
    mutation ResetSetting($key: String!, $reason: String) {
        resetSetting(key: $key, reason: $reason) {
            _id
            uuid
            key
            name
            description
            category
            value
            type
            defaultValue
            validation {
                required
                min
                max
                minLength
                maxLength
                pattern
                enum
            }
            ui {
                inputType
                placeholder
                helpText
                options {
                    value
                    label
                }
                group
                order
                hidden
                readonly
            }
            isSecret
            accessLevel
            isActive
            isSystem
            requiresRestart
            environment
            history {
                previousValue
                newValue
                changedBy {
                    _id
                    username
                    email
                }
                changedAt
                reason
                ipAddress
            }
            lastModifiedBy {
                _id
                username
                email
            }
            tags
            notes
            isModified
            hasHistory
            createdAt
            updatedAt
        }
    }
`;

export const BULK_UPDATE_SETTINGS = gql`
    mutation BulkUpdateSettings($inputs: [UpdateSettingsInput!]!) {
        bulkUpdateSettings(inputs: $inputs) {
            _id
            key
            name
            value
            isModified
        }
    }
`;

// Custom Hooks
export const useSettings = (filter = {}, page = 1, limit = 50) => {
    const { data, loading, error, refetch } = useQuery(GET_SETTINGS, {
        variables: { filter, page, limit },
        fetchPolicy: 'cache-and-network'
    });

    return {
        settings: data?.settings?.settings || [],
        pagination: {
            total: data?.settings?.total || 0,
            page: data?.settings?.page || 1,
            limit: data?.settings?.limit || 50,
            totalPages: data?.settings?.totalPages || 0
        },
        loading,
        error,
        refetch
    };
};

export const useSettingsByCategory = (category) => {
    const { data, loading, error, refetch } = useQuery(GET_SETTINGS_BY_CATEGORY, {
        variables: { category },
        fetchPolicy: 'cache-and-network',
        skip: !category
    });

    return {
        settings: data?.settingsByCategory || [],
        loading,
        error,
        refetch
    };
};

export const useSetting = (key) => {
    const { data, loading, error, refetch } = useQuery(GET_SETTING, {
        variables: { key },
        fetchPolicy: 'cache-and-network',
        skip: !key
    });

    return {
        setting: data?.setting,
        loading,
        error,
        refetch
    };
};

export const useUpdateSetting = () => {
    const [updateSetting, { loading, error }] = useMutation(UPDATE_SETTING, {
        refetchQueries: [GET_SETTINGS, GET_SETTINGS_BY_CATEGORY],
        onError: (error) => {
            console.error('Error updating setting:', error);
        }
    });

    return {
        updateSetting: (input) => updateSetting({ variables: { input } }),
        loading,
        error
    };
};

export const useResetSetting = () => {
    const [resetSetting, { loading, error }] = useMutation(RESET_SETTING, {
        refetchQueries: [GET_SETTINGS, GET_SETTINGS_BY_CATEGORY],
        onError: (error) => {
            console.error('Error resetting setting:', error);
        }
    });

    return {
        resetSetting: (key, reason) => resetSetting({ variables: { key, reason } }),
        loading,
        error
    };
};

export const useBulkUpdateSettings = () => {
    const [bulkUpdateSettings, { loading, error }] = useMutation(BULK_UPDATE_SETTINGS, {
        refetchQueries: [GET_SETTINGS, GET_SETTINGS_BY_CATEGORY],
        onError: (error) => {
            console.error('Error bulk updating settings:', error);
        }
    });

    return {
        bulkUpdateSettings: (inputs) => bulkUpdateSettings({ variables: { inputs } }),
        loading,
        error
    };
};
