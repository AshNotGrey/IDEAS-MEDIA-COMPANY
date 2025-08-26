import React, { useState, useEffect } from "react";
import { PlusIcon, FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import CampaignList from "../components/campaigns/CampaignList.jsx";
import CampaignFilters from "../components/campaigns/CampaignFilters.jsx";
import CampaignForm from "../components/campaigns/CampaignForm.jsx";

const Campaigns = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [filters, setFilters] = useState({
    type: "",
    placement: "",
    status: "",
    isActive: "",
    search: "",
  });
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'

  // Mock data - replace with real REST API calls when needed
  const [campaigns, setCampaigns] = useState([
    {
      _id: "1",
      name: "Summer Photography Sale",
      type: "promotional",
      placement: "homepage",
      status: "active",
      settings: { isActive: true },
      startDate: "2024-06-01",
      endDate: "2024-08-31",
      impressions: 12500,
      clicks: 450,
      conversions: 23,
      budget: 50000,
      spent: 32000,
    },
    {
      _id: "2",
      name: "Wedding Season Promotion",
      type: "seasonal",
      placement: "services",
      status: "scheduled",
      settings: { isActive: false },
      startDate: "2024-09-01",
      endDate: "2024-12-31",
      impressions: 0,
      clicks: 0,
      conversions: 0,
      budget: 75000,
      spent: 0,
    },
    {
      _id: "3",
      name: "Portrait Session Discount",
      type: "promotional",
      placement: "gallery",
      status: "active",
      settings: { isActive: true },
      startDate: "2024-01-01",
      endDate: "2024-03-31",
      impressions: 8900,
      clicks: 320,
      conversions: 18,
      budget: 30000,
      spent: 28000,
    },
    {
      _id: "4",
      name: "Corporate Event Special",
      type: "business",
      placement: "services",
      status: "draft",
      settings: { isActive: false },
      startDate: "2024-04-01",
      endDate: "2024-06-30",
      impressions: 0,
      clicks: 0,
      conversions: 0,
      budget: 40000,
      spent: 0,
    },
  ]);

  // Filter campaigns based on current filters
  const filteredCampaigns = campaigns.filter((campaign) => {
    if (filters.type && campaign.type !== filters.type) return false;
    if (filters.placement && campaign.placement !== filters.placement) return false;
    if (filters.status && campaign.status !== filters.status) return false;
    if (filters.isActive !== "" && campaign.settings?.isActive !== (filters.isActive === "true"))
      return false;
    if (filters.search && !campaign.name.toLowerCase().includes(filters.search.toLowerCase()))
      return false;
    return true;
  });

  const handleCreateCampaign = async (campaignData) => {
    try {
      const newCampaign = {
        _id: Date.now().toString(),
        ...campaignData,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spent: 0,
      };
      setCampaigns([...campaigns, newCampaign]);
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  const handleEditCampaign = async (campaignData) => {
    try {
      setCampaigns(
        campaigns.map((c) => (c._id === editingCampaign._id ? { ...c, ...campaignData } : c))
      );
      setEditingCampaign(null);
    } catch (error) {
      console.error("Error updating campaign:", error);
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      try {
        setCampaigns(campaigns.filter((c) => c._id !== campaignId));
      } catch (error) {
        console.error("Error deleting campaign:", error);
      }
    }
  };

  const handleBulkAction = async (action, campaignIds = selectedCampaigns) => {
    if (campaignIds.length === 0) return;

    try {
      switch (action) {
        case "activate":
          setCampaigns(
            campaigns.map((c) =>
              campaignIds.includes(c._id)
                ? { ...c, settings: { ...c.settings, isActive: true } }
                : c
            )
          );
          break;
        case "deactivate":
          setCampaigns(
            campaigns.map((c) =>
              campaignIds.includes(c._id)
                ? { ...c, settings: { ...c.settings, isActive: false } }
                : c
            )
          );
          break;
        case "delete":
          if (window.confirm(`Are you sure you want to delete ${campaignIds.length} campaigns?`)) {
            setCampaigns(campaigns.filter((c) => !campaignIds.includes(c._id)));
          }
          break;
        default:
          break;
      }
      setSelectedCampaigns([]);
    } catch (error) {
      console.error("Error performing bulk action:", error);
    }
  };

  const handleSelectCampaign = (campaignId) => {
    setSelectedCampaigns((prev) =>
      prev.includes(campaignId) ? prev.filter((id) => id !== campaignId) : [...prev, campaignId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCampaigns.length === filteredCampaigns.length) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(filteredCampaigns.map((c) => c._id));
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Campaigns</h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Manage your marketing campaigns and promotional activities
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className='btn-primary flex items-center space-x-2'>
          <PlusIcon className='w-5 h-5' />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Filters and Search */}
      <CampaignFilters
        filters={filters}
        onFiltersChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Bulk Actions */}
      {selectedCampaigns.length > 0 && (
        <div className='bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-600 dark:text-gray-400'>
              {selectedCampaigns.length} campaign(s) selected
            </span>
            <div className='flex space-x-2'>
              <button
                onClick={() => handleBulkAction("activate")}
                className='btn-secondary text-sm'>
                Activate
              </button>
              <button
                onClick={() => handleBulkAction("deactivate")}
                className='btn-secondary text-sm'>
                Deactivate
              </button>
              <button onClick={() => handleBulkAction("delete")} className='btn-danger text-sm'>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign List */}
      <CampaignList
        campaigns={filteredCampaigns}
        viewMode={viewMode}
        selectedCampaigns={selectedCampaigns}
        onSelectCampaign={handleSelectCampaign}
        onSelectAll={handleSelectAll}
        onEdit={setEditingCampaign}
        onDelete={handleDeleteCampaign}
        loading={false}
      />

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingCampaign) && (
        <CampaignForm
          isOpen={showCreateForm || !!editingCampaign}
          onClose={() => {
            setShowCreateForm(false);
            setEditingCampaign(null);
          }}
          onSubmit={editingCampaign ? handleEditCampaign : handleCreateCampaign}
          campaign={editingCampaign}
        />
      )}
    </div>
  );
};

export default Campaigns;
