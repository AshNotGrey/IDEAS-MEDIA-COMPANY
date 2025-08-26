import React, { useState } from "react";
import {
  Mail,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Copy,
  Trash2,
  Send,
  Settings,
  BarChart3,
} from "lucide-react";
import TemplateList from "../components/email/TemplateList";
import TemplateEditor from "../components/email/TemplateEditor";
import TemplatePreview from "../components/email/TemplatePreview";
import TemplateFilters from "../components/email/TemplateFilters";
import TemplateStats from "../components/email/TemplateStats";
import BulkEmail from "../components/email/BulkEmail";

const EmailTemplates = () => {
  const [view, setView] = useState("list"); // list, editor, preview, stats, bulk
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    category: "",
    type: "",
    search: "",
    isActive: undefined,
    tags: [],
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
  });

  // Mock data - replace with real REST API calls when needed
  const [templates, setTemplates] = useState([
    {
      _id: "1",
      name: "Welcome Email",
      category: "onboarding",
      type: "transactional",
      subject: "Welcome to Ideal Photography!",
      content: "<h1>Welcome!</h1><p>Thank you for joining us...</p>",
      isActive: true,
      isDefault: true,
      tags: ["welcome", "onboarding"],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
      usageCount: 1250,
      openRate: 85.5,
      clickRate: 12.3,
    },
    {
      _id: "2",
      name: "Booking Confirmation",
      category: "bookings",
      type: "transactional",
      subject: "Your booking has been confirmed",
      content: "<h1>Booking Confirmed!</h1><p>Your session is scheduled for...</p>",
      isActive: true,
      isDefault: false,
      tags: ["booking", "confirmation"],
      createdAt: "2024-01-02T00:00:00Z",
      updatedAt: "2024-01-14T14:20:00Z",
      usageCount: 890,
      openRate: 92.1,
      clickRate: 18.7,
    },
    {
      _id: "3",
      name: "Password Reset",
      category: "security",
      type: "transactional",
      subject: "Reset your password",
      content: "<h1>Password Reset</h1><p>Click the link below to reset...</p>",
      isActive: true,
      isDefault: false,
      tags: ["security", "password"],
      createdAt: "2024-01-03T00:00:00Z",
      updatedAt: "2024-01-13T16:45:00Z",
      usageCount: 45,
      openRate: 78.9,
      clickRate: 45.2,
    },
    {
      _id: "4",
      name: "Newsletter",
      category: "marketing",
      type: "promotional",
      subject: "This month's highlights",
      content: "<h1>Monthly Newsletter</h1><p>Check out what's new...</p>",
      isActive: true,
      isDefault: false,
      tags: ["newsletter", "marketing"],
      createdAt: "2024-01-04T00:00:00Z",
      updatedAt: "2024-01-12T11:15:00Z",
      usageCount: 320,
      openRate: 68.4,
      clickRate: 8.9,
    },
    {
      _id: "5",
      name: "Review Request",
      category: "feedback",
      type: "transactional",
      subject: "How was your experience?",
      content: "<h1>Share Your Experience</h1><p>We'd love to hear from you...</p>",
      isActive: true,
      isDefault: false,
      tags: ["review", "feedback"],
      createdAt: "2024-01-05T00:00:00Z",
      updatedAt: "2024-01-11T09:30:00Z",
      usageCount: 567,
      openRate: 74.2,
      clickRate: 22.1,
    },
  ]);

  const [stats, setStats] = useState({
    totalTemplates: 15,
    activeTemplates: 12,
    totalEmailsSent: 12500,
    avgOpenRate: 78.5,
    avgClickRate: 15.2,
    categories: [
      { name: "Onboarding", count: 3, usage: 2500 },
      { name: "Bookings", count: 4, usage: 4200 },
      { name: "Security", count: 2, usage: 800 },
      { name: "Marketing", count: 3, usage: 3200 },
      { name: "Feedback", count: 3, usage: 1800 },
    ],
  });

  // Handle template actions
  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setView("editor");
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setView("editor");
  };

  const handlePreviewTemplate = (template) => {
    setSelectedTemplate(template);
    setView("preview");
  };

  const handleDuplicateTemplate = async (template) => {
    try {
      const newTemplate = {
        _id: Date.now().toString(),
        ...template,
        name: `${template.name} (Copy)`,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
        openRate: 0,
        clickRate: 0,
      };
      setTemplates([...templates, newTemplate]);
    } catch (error) {
      console.error("Duplicate failed:", error);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        setTemplates(templates.filter((t) => t._id !== templateId));
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const handleTestTemplate = async (template, recipients, variables) => {
    try {
      // Mock test email sending
      console.log("Sending test email:", { template, recipients, variables });
      alert("Test email sent successfully!");
    } catch (error) {
      console.error("Test failed:", error);
      alert("Failed to send test email");
    }
  };

  const handleSetDefaultTemplate = async (templateId) => {
    try {
      setTemplates(
        templates.map((t) => ({
          ...t,
          isDefault: t._id === templateId,
        }))
      );
    } catch (error) {
      console.error("Set default failed:", error);
    }
  };

  const handleSaveTemplate = async (templateData) => {
    try {
      if (editingTemplate) {
        // Update existing template
        setTemplates(
          templates.map((t) =>
            t._id === editingTemplate._id
              ? { ...t, ...templateData, updatedAt: new Date().toISOString() }
              : t
          )
        );
      } else {
        // Create new template
        const newTemplate = {
          _id: Date.now().toString(),
          ...templateData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          usageCount: 0,
          openRate: 0,
          clickRate: 0,
        };
        setTemplates([...templates, newTemplate]);
      }
      setView("list");
      setEditingTemplate(null);
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  // Filter templates based on current filters
  const filteredTemplates = templates.filter((template) => {
    if (filters.category && template.category !== filters.category) return false;
    if (filters.type && template.type !== filters.type) return false;
    if (filters.search && !template.name.toLowerCase().includes(filters.search.toLowerCase()))
      return false;
    if (filters.isActive !== undefined && template.isActive !== filters.isActive) return false;
    if (filters.tags.length > 0 && !filters.tags.some((tag) => template.tags.includes(tag)))
      return false;
    return true;
  });

  if (view === "editor") {
    return (
      <TemplateEditor
        template={editingTemplate}
        onSave={handleSaveTemplate}
        onCancel={() => {
          setView("list");
          setEditingTemplate(null);
        }}
      />
    );
  }

  if (view === "preview") {
    return (
      <TemplatePreview
        template={selectedTemplate}
        onClose={() => {
          setView("list");
          setSelectedTemplate(null);
        }}
        onEdit={() => {
          setEditingTemplate(selectedTemplate);
          setView("editor");
        }}
      />
    );
  }

  if (view === "stats") {
    return <TemplateStats stats={stats} templates={templates} onBack={() => setView("list")} />;
  }

  if (view === "bulk") {
    return <BulkEmail templates={templates} onBack={() => setView("list")} />;
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Email Templates</h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Create and manage email templates for your business
          </p>
        </div>
        <div className='flex items-center space-x-3'>
          <button
            onClick={() => setView("stats")}
            className='btn-secondary flex items-center space-x-2'>
            <BarChart3 className='w-4 h-4' />
            <span>Stats</span>
          </button>
          <button
            onClick={() => setView("bulk")}
            className='btn-secondary flex items-center space-x-2'>
            <Send className='w-4 h-4' />
            <span>Bulk Email</span>
          </button>
          <button
            onClick={handleCreateTemplate}
            className='btn-primary flex items-center space-x-2'>
            <Plus className='w-4 h-4' />
            <span>Create Template</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg'>
              <Mail className='w-6 h-6 text-blue-600 dark:text-blue-400' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Total Templates
              </p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {stats.totalTemplates}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-green-100 dark:bg-green-900/20 rounded-lg'>
              <Settings className='w-6 h-6 text-green-600 dark:text-green-400' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Active Templates
              </p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {stats.activeTemplates}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg'>
              <Send className='w-6 h-6 text-purple-600 dark:text-purple-400' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Emails Sent</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {stats.totalEmailsSent.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg'>
              <BarChart3 className='w-6 h-6 text-orange-600 dark:text-orange-400' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Avg Open Rate</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {stats.avgOpenRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='flex items-center justify-between'>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className='btn-secondary flex items-center space-x-2'>
          <Filter className='w-4 h-4' />
          <span>Filters</span>
        </button>

        <div className='flex items-center space-x-2'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <input
              type='text'
              placeholder='Search templates...'
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className='pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white'
            />
          </div>
        </div>
      </div>

      {showFilters && (
        <TemplateFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={() =>
            setFilters({
              category: "",
              type: "",
              search: "",
              isActive: undefined,
              tags: [],
            })
          }
        />
      )}

      {/* Template List */}
      <TemplateList
        templates={filteredTemplates}
        onEdit={handleEditTemplate}
        onPreview={handlePreviewTemplate}
        onDuplicate={handleDuplicateTemplate}
        onDelete={handleDeleteTemplate}
        onTest={handleTestTemplate}
        onSetDefault={handleSetDefaultTemplate}
        loading={false}
      />
    </div>
  );
};

export default EmailTemplates;
