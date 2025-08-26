import React, { useState, useCallback } from "react";
import { Plus, Filter, Download, Upload, RefreshCw } from "lucide-react";
import { useServices } from "../graphql/hooks/useServices.js";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import ServiceList from "../components/services/ServiceList.jsx";
import ServiceForm from "../components/services/ServiceForm.jsx";
import ServiceFilters from "../components/services/ServiceFilters.jsx";
import ServiceActions from "../components/services/ServiceActions.jsx";
import ServiceStats from "../components/services/ServiceStats.jsx";

const Services = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Services hook
  const {
    services,
    total,
    page,
    totalPages,
    stats,
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    bulkUpdateLoading,
    bulkDeleteLoading,
    error,
    filters,
    updateFilters,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    toggleServiceFeatured,
    bulkUpdateServices,
    bulkDeleteServices,
    refetch,
  } = useServices();

  // Handle form submission
  const handleFormSubmit = useCallback(
    async (serviceData) => {
      setFormError("");
      setFormSuccess("");

      try {
        if (editingService) {
          await updateService(editingService._id, serviceData);
          setFormSuccess("Service updated successfully!");
        } else {
          await createService(serviceData);
          setFormSuccess("Service created successfully!");
        }

        setShowForm(false);
        setEditingService(null);

        // Clear success message after 3 seconds
        setTimeout(() => setFormSuccess(""), 3000);
      } catch (err) {
        setFormError(err.message);
      }
    },
    [editingService, createService, updateService]
  );

  // Handle edit
  const handleEdit = useCallback((service) => {
    setEditingService(service);
    setShowForm(true);
    setFormError("");
  }, []);

  // Handle delete
  const handleDelete = useCallback(
    async (serviceId) => {
      if (!window.confirm("Are you sure you want to delete this service?")) {
        return;
      }

      try {
        await deleteService(serviceId);
        setSelectedServices((prev) => prev.filter((id) => id !== serviceId));
      } catch (err) {
        alert(`Failed to delete service: ${err.message}`);
      }
    },
    [deleteService]
  );

  // Handle status toggle
  const handleToggleStatus = useCallback(
    async (serviceId) => {
      try {
        await toggleServiceStatus(serviceId);
      } catch (err) {
        alert(`Failed to toggle service status: ${err.message}`);
      }
    },
    [toggleServiceStatus]
  );

  // Handle featured toggle
  const handleToggleFeatured = useCallback(
    async (serviceId) => {
      try {
        await toggleServiceFeatured(serviceId);
      } catch (err) {
        alert(`Failed to toggle featured status: ${err.message}`);
      }
    },
    [toggleServiceFeatured]
  );

  // Handle selection
  const handleSelectService = useCallback((serviceId) => {
    setSelectedServices((prev) => {
      const isSelected = prev.includes(serviceId);
      return isSelected ? prev.filter((id) => id !== serviceId) : [...prev, serviceId];
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const allSelected = selectedServices.length === services.length;
    setSelectedServices(allSelected ? [] : services.map((s) => s._id));
  }, [selectedServices.length, services]);

  // Handle bulk operations
  const handleBulkUpdate = useCallback(
    async (updateData) => {
      if (selectedServices.length === 0) {
        alert("Please select services to update");
        return;
      }

      try {
        await bulkUpdateServices(selectedServices, updateData);
        setSelectedServices([]);
      } catch (err) {
        alert(`Failed to update services: ${err.message}`);
      }
    },
    [selectedServices, bulkUpdateServices]
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedServices.length === 0) {
      alert("Please select services to delete");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedServices.length} service(s)?`)) {
      return;
    }

    try {
      await bulkDeleteServices(selectedServices);
      setSelectedServices([]);
    } catch (err) {
      alert(`Failed to delete services: ${err.message}`);
    }
  }, [selectedServices, bulkDeleteServices]);

  // Handle pagination
  const handlePageChange = useCallback(
    (newPage) => {
      updateFilters({ page: newPage });
      setSelectedServices([]); // Clear selections when changing pages
    },
    [updateFilters]
  );

  // Handle filters
  const handleFiltersChange = useCallback(
    (newFilters) => {
      updateFilters(newFilters);
      setSelectedServices([]); // Clear selections when changing filters
    },
    [updateFilters]
  );

  if (loading && !services.length) {
    return (
      <div className='flex items-center justify-center h-64'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Service Management</h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Manage your photography and equipment rental services
          </p>
        </div>
        <div className='flex items-center space-x-3'>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className='flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'>
            <Filter className='w-4 h-4 mr-2' />
            Filters
          </button>
          <button
            onClick={refetch}
            className='flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              setEditingService(null);
              setShowForm(true);
              setFormError("");
            }}
            className='flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700'>
            <Plus className='w-4 h-4 mr-2' />
            Add Service
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {formSuccess && (
        <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg'>
          {formSuccess}
        </div>
      )}

      {error && (
        <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg'>
          Failed to load services: {error.message}
        </div>
      )}

      {/* Stats */}
      {stats && <ServiceStats stats={stats} />}

      {/* Filters */}
      {showFilters && (
        <ServiceFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Bulk Actions */}
      {selectedServices.length > 0 && (
        <ServiceActions
          selectedCount={selectedServices.length}
          onBulkUpdate={handleBulkUpdate}
          onBulkDelete={handleBulkDelete}
          loading={bulkUpdateLoading || bulkDeleteLoading}
        />
      )}

      {/* Service Form Modal */}
      {showForm && (
        <ServiceForm
          service={editingService}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingService(null);
            setFormError("");
          }}
          loading={createLoading || updateLoading}
          error={formError}
        />
      )}

      {/* Service List */}
      <ServiceList
        services={services}
        total={total}
        page={page}
        totalPages={totalPages}
        loading={loading}
        selectedServices={selectedServices}
        onSelectService={handleSelectService}
        onSelectAll={handleSelectAll}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onToggleFeatured={handleToggleFeatured}
        onPageChange={handlePageChange}
        deleteLoading={deleteLoading}
      />
    </div>
  );
};

export default Services;
