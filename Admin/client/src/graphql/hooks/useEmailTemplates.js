import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

// GraphQL Queries
const GET_EMAIL_TEMPLATES = gql`
  query GetEmailTemplates($filter: EmailTemplateFilterInput, $sort: SortInput, $page: Int, $limit: Int) {
    getEmailTemplates(filter: $filter, sort: $sort, page: $page, limit: $limit) {
      templates {
        _id
        name
        slug
        description
        subject
        category
        type
        isActive
        isDefault
        priority
        variables {
          name
          description
          type
          required
          defaultValue
        }
        design {
          theme
          primaryColor
          backgroundColor
          fontFamily
          layout
        }
        delivery {
          fromName
          fromEmail
          replyTo
        }
        stats {
          sent
          delivered
          opened
          clicked
          bounced
          unsubscribed
          lastSent
        }
        version
        createdBy {
          _id
          name
          username
        }
        lastModifiedBy {
          _id
          name
          username
        }
        tags
        lastTested
        createdAt
        updatedAt
        deliveryRate
        openRate
        clickRate
        bounceRate
      }
      pagination {
        currentPage
        totalPages
        totalItems
        itemsPerPage
        hasNextPage
        hasPrevPage
      }
    }
  }
`;

const GET_EMAIL_TEMPLATE = gql`
  query GetEmailTemplate($id: ID!) {
    getEmailTemplate(id: $id) {
      _id
      name
      slug
      description
      subject
      htmlContent
      textContent
      category
      type
      variables {
        name
        description
        type
        required
        defaultValue
      }
      isActive
      isDefault
      priority
      design {
        theme
        primaryColor
        backgroundColor
        fontFamily
        layout
      }
      triggers {
        event
        conditions {
          field
          operator
          value
        }
        delay {
          value
          unit
        }
      }
      delivery {
        fromName
        fromEmail
        replyTo
        bcc
        attachments {
          name
          url
          type
        }
      }
      stats {
        sent
        delivered
        opened
        clicked
        bounced
        unsubscribed
        lastSent
      }
      version
      previousVersions {
        version
        content {
          subject
          htmlContent
          textContent
        }
        modifiedAt
        modifiedBy {
          name
          username
        }
        changelog
      }
      createdBy {
        _id
        name
        username
        email
      }
      lastModifiedBy {
        _id
        name
        username
        email
      }
      tags
      testRecipients
      lastTested
      createdAt
      updatedAt
      deliveryRate
      openRate
      clickRate
      bounceRate
    }
  }
`;

const GET_TEMPLATES_BY_CATEGORY = gql`
  query GetTemplatesByCategory($category: EmailTemplateCategory!) {
    getEmailTemplatesByCategory(category: $category) {
      _id
      name
      subject
      isDefault
      isActive
      createdAt
    }
  }
`;

const COMPILE_TEMPLATE = gql`
  query CompileTemplate($id: ID!, $variables: JSON!) {
    compileEmailTemplate(id: $id, variables: $variables) {
      subject
      htmlContent
      textContent
      from
      replyTo
      bcc
      attachments {
        name
        url
        type
      }
    }
  }
`;

const PREVIEW_TEMPLATE = gql`
  query PreviewTemplate($id: ID!, $variables: JSON!) {
    previewEmailTemplate(id: $id, variables: $variables) {
      subject
      htmlContent
      textContent
      from
      replyTo
    }
  }
`;

// GraphQL Mutations
const CREATE_EMAIL_TEMPLATE = gql`
  mutation CreateEmailTemplate($input: EmailTemplateInput!) {
    createEmailTemplate(input: $input) {
      _id
      name
      slug
      subject
      category
      type
      isActive
      createdAt
    }
  }
`;

const UPDATE_EMAIL_TEMPLATE = gql`
  mutation UpdateEmailTemplate($id: ID!, $input: EmailTemplateUpdateInput!) {
    updateEmailTemplate(id: $id, input: $input) {
      _id
      name
      slug
      subject
      category
      type
      isActive
      version
      updatedAt
    }
  }
`;

const DELETE_EMAIL_TEMPLATE = gql`
  mutation DeleteEmailTemplate($id: ID!) {
    deleteEmailTemplate(id: $id)
  }
`;

const DUPLICATE_EMAIL_TEMPLATE = gql`
  mutation DuplicateEmailTemplate($id: ID!, $name: String!) {
    duplicateEmailTemplate(id: $id, name: $name) {
      _id
      name
      slug
      subject
      category
      createdAt
    }
  }
`;

const SET_DEFAULT_TEMPLATE = gql`
  mutation SetDefaultTemplate($id: ID!, $category: EmailTemplateCategory!) {
    setDefaultTemplate(id: $id, category: $category) {
      _id
      name
      isDefault
    }
  }
`;

const TEST_EMAIL_TEMPLATE = gql`
  mutation TestEmailTemplate($id: ID!, $recipients: [String!]!, $variables: JSON!) {
    testEmailTemplate(id: $id, recipients: $recipients, variables: $variables)
  }
`;

const REVERT_TEMPLATE_VERSION = gql`
  mutation RevertTemplateVersion($id: ID!, $version: Int!) {
    revertTemplateVersion(id: $id, version: $version) {
      _id
      name
      version
      subject
      updatedAt
    }
  }
`;

const SEND_QUICK_EMAIL = gql`
  mutation SendQuickEmail($template: ID!, $recipients: [String!]!, $variables: JSON!, $customSubject: String) {
    sendQuickEmail(template: $template, recipients: $recipients, variables: $variables, customSubject: $customSubject)
  }
`;

export const useEmailTemplates = (filters = {}, pagination = { page: 1, limit: 20 }) => {
    // Main templates query
    const {
        data: templatesData,
        loading,
        error,
        refetch,
        fetchMore
    } = useQuery(GET_EMAIL_TEMPLATES, {
        variables: {
            filter: filters,
            sort: { field: 'createdAt', direction: 'DESC' },
            page: pagination.page,
            limit: pagination.limit
        },
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true
    });

    // Mutations
    const [createTemplateMutation] = useMutation(CREATE_EMAIL_TEMPLATE, {
        refetchQueries: [{ query: GET_EMAIL_TEMPLATES }],
        awaitRefetchQueries: true
    });

    const [updateTemplateMutation] = useMutation(UPDATE_EMAIL_TEMPLATE, {
        refetchQueries: [{ query: GET_EMAIL_TEMPLATES }],
        awaitRefetchQueries: true
    });

    const [deleteTemplateMutation] = useMutation(DELETE_EMAIL_TEMPLATE, {
        refetchQueries: [{ query: GET_EMAIL_TEMPLATES }],
        awaitRefetchQueries: true
    });

    const [duplicateTemplateMutation] = useMutation(DUPLICATE_EMAIL_TEMPLATE, {
        refetchQueries: [{ query: GET_EMAIL_TEMPLATES }],
        awaitRefetchQueries: true
    });

    const [setDefaultTemplateMutation] = useMutation(SET_DEFAULT_TEMPLATE);
    const [testTemplateMutation] = useMutation(TEST_EMAIL_TEMPLATE);
    const [revertVersionMutation] = useMutation(REVERT_TEMPLATE_VERSION);
    const [sendQuickEmailMutation] = useMutation(SEND_QUICK_EMAIL);

    // Template operations
    const createTemplate = async (input) => {
        try {
            const { data } = await createTemplateMutation({
                variables: { input }
            });
            return data.createEmailTemplate;
        } catch (error) {
            throw new Error(`Failed to create template: ${error.message}`);
        }
    };

    const updateTemplate = async (id, input) => {
        try {
            const { data } = await updateTemplateMutation({
                variables: { id, input }
            });
            return data.updateEmailTemplate;
        } catch (error) {
            throw new Error(`Failed to update template: ${error.message}`);
        }
    };

    const deleteTemplate = async (id) => {
        try {
            await deleteTemplateMutation({
                variables: { id }
            });
            return true;
        } catch (error) {
            throw new Error(`Failed to delete template: ${error.message}`);
        }
    };

    const duplicateTemplate = async (id, name) => {
        try {
            const { data } = await duplicateTemplateMutation({
                variables: { id, name }
            });
            return data.duplicateEmailTemplate;
        } catch (error) {
            throw new Error(`Failed to duplicate template: ${error.message}`);
        }
    };

    const setDefaultTemplate = async (id, category) => {
        try {
            const { data } = await setDefaultTemplateMutation({
                variables: { id, category }
            });
            return data.setDefaultTemplate;
        } catch (error) {
            throw new Error(`Failed to set default template: ${error.message}`);
        }
    };

    const testTemplate = async (id, recipients, variables = {}) => {
        try {
            await testTemplateMutation({
                variables: { id, recipients, variables }
            });
            return true;
        } catch (error) {
            throw new Error(`Failed to send test email: ${error.message}`);
        }
    };

    const revertToVersion = async (id, version) => {
        try {
            const { data } = await revertVersionMutation({
                variables: { id, version }
            });
            return data.revertTemplateVersion;
        } catch (error) {
            throw new Error(`Failed to revert template: ${error.message}`);
        }
    };

    const sendQuickEmail = async (template, recipients, variables, customSubject) => {
        try {
            await sendQuickEmailMutation({
                variables: { template, recipients, variables, customSubject }
            });
            return true;
        } catch (error) {
            throw new Error(`Failed to send email: ${error.message}`);
        }
    };

    // Load more functionality
    const loadMore = async () => {
        if (templatesData?.getEmailTemplates?.pagination?.hasNextPage) {
            try {
                await fetchMore({
                    variables: {
                        page: templatesData.getEmailTemplates.pagination.currentPage + 1
                    },
                    updateQuery: (previousResult, { fetchMoreResult }) => {
                        if (!fetchMoreResult) return previousResult;

                        return {
                            getEmailTemplates: {
                                ...fetchMoreResult.getEmailTemplates,
                                templates: [
                                    ...previousResult.getEmailTemplates.templates,
                                    ...fetchMoreResult.getEmailTemplates.templates
                                ]
                            }
                        };
                    }
                });
            } catch (error) {
                console.error('Load more failed:', error);
            }
        }
    };

    // Calculate stats from templates
    const stats = templatesData?.getEmailTemplates?.templates ? {
        totalTemplates: templatesData.getEmailTemplates.templates.length,
        activeTemplates: templatesData.getEmailTemplates.templates.filter(t => t.isActive).length,
        totalSent: templatesData.getEmailTemplates.templates.reduce((sum, t) => sum + t.stats.sent, 0),
        totalDelivered: templatesData.getEmailTemplates.templates.reduce((sum, t) => sum + t.stats.delivered, 0),
        avgOpenRate: templatesData.getEmailTemplates.templates.reduce((sum, t) => sum + parseFloat(t.openRate || 0), 0) / templatesData.getEmailTemplates.templates.length,
        byCategory: templatesData.getEmailTemplates.templates.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + 1;
            return acc;
        }, {})
    } : null;

    return {
        // Data
        templates: templatesData?.getEmailTemplates?.templates || [],
        pagination: templatesData?.getEmailTemplates?.pagination,
        stats,

        // Loading states
        loading,

        // Error
        error,

        // Operations
        refetch,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        duplicateTemplate,
        setDefaultTemplate,
        testTemplate,
        revertToVersion,
        sendQuickEmail,
        loadMore
    };
};

// Hook for single template
export const useEmailTemplate = (id) => {
    const { data, loading, error, refetch } = useQuery(GET_EMAIL_TEMPLATE, {
        variables: { id },
        skip: !id,
        errorPolicy: 'all'
    });

    return {
        template: data?.getEmailTemplate,
        loading,
        error,
        refetch
    };
};

// Hook for templates by category
export const useTemplatesByCategory = (category) => {
    const { data, loading, error, refetch } = useQuery(GET_TEMPLATES_BY_CATEGORY, {
        variables: { category },
        skip: !category,
        errorPolicy: 'all'
    });

    return {
        templates: data?.getEmailTemplatesByCategory || [],
        loading,
        error,
        refetch
    };
};

// Hook for template compilation
export const useTemplateCompilation = () => {
    const [compileTemplate] = useMutation(COMPILE_TEMPLATE);
    const [previewTemplate] = useMutation(PREVIEW_TEMPLATE);

    const compile = async (id, variables) => {
        try {
            const { data } = await compileTemplate({
                variables: { id, variables }
            });
            return data.compileEmailTemplate;
        } catch (error) {
            throw new Error(`Failed to compile template: ${error.message}`);
        }
    };

    const preview = async (id, variables) => {
        try {
            const { data } = await previewTemplate({
                variables: { id, variables }
            });
            return data.previewEmailTemplate;
        } catch (error) {
            throw new Error(`Failed to preview template: ${error.message}`);
        }
    };

    return { compile, preview };
};
