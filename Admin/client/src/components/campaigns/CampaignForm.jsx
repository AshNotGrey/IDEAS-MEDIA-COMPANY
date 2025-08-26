import React, { useState, useEffect } from "react";
import { XMarkIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import CampaignContentEditor from "./CampaignContentEditor.jsx";
import CampaignScheduleEditor from "./CampaignScheduleEditor.jsx";
import CampaignTargetingEditor from "./CampaignTargetingEditor.jsx";
import CampaignSettingsEditor from "./CampaignSettingsEditor.jsx";
import CampaignPreview from "./CampaignPreview.jsx";

const CampaignForm = ({ isOpen, onClose, onSubmit, campaign, mode }) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "banner",
    placement: "top-banner",
    priority: 5,
    status: "draft",
    content: {
      title: "",
      subtitle: "",
      description: "",
      ctaText: "",
      ctaUrl: "",
      images: {
        desktop: "",
        mobile: "",
        tablet: "",
      },
    },
    schedule: {
      startDate: "",
      endDate: "",
      isRecurring: false,
      recurrence: {
        frequency: "daily",
        interval: 1,
        daysOfWeek: [],
        dayOfMonth: 1,
      },
    },
    targeting: {
      userRoles: [],
      userTypes: [],
      countries: [],
      cities: [],
      devices: [],
      browsers: [],
    },
    settings: {
      isActive: false,
      isScheduled: false,
      isExpired: false,
      maxImpressions: "",
      maxClicks: "",
      displayFrequency: "always",
      displayDelay: 0,
    },
    tags: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (campaign && mode === "edit") {
      setFormData({
        name: campaign.name || "",
        type: campaign.type || "banner",
        placement: campaign.placement || "top-banner",
        priority: campaign.priority || 5,
        status: campaign.status || "draft",
        content: {
          title: campaign.content?.title || "",
          subtitle: campaign.content?.subtitle || "",
          description: campaign.content?.description || "",
          ctaText: campaign.content?.ctaText || "",
          ctaUrl: campaign.content?.ctaUrl || "",
          images: {
            desktop: campaign.content?.images?.desktop || "",
            mobile: campaign.content?.images?.mobile || "",
            tablet: campaign.content?.images?.tablet || "",
          },
        },
        schedule: {
          startDate: campaign.schedule?.startDate
            ? new Date(campaign.schedule.startDate).toISOString().slice(0, 16)
            : "",
          endDate: campaign.schedule?.endDate
            ? new Date(campaign.schedule.endDate).toISOString().slice(0, 16)
            : "",
          isRecurring: campaign.schedule?.isRecurring || false,
          recurrence: {
            frequency: campaign.schedule?.recurrence?.frequency || "daily",
            interval: campaign.schedule?.recurrence?.interval || 1,
            daysOfWeek: campaign.schedule?.recurrence?.daysOfWeek || [],
            dayOfMonth: campaign.schedule?.recurrence?.dayOfMonth || 1,
          },
        },
        targeting: {
          userRoles: campaign.targeting?.userRoles || [],
          userTypes: campaign.targeting?.userTypes || [],
          countries: campaign.targeting?.countries || [],
          cities: campaign.targeting?.cities || [],
          devices: campaign.targeting?.devices || [],
          browsers: campaign.targeting?.browsers || [],
        },
        settings: {
          isActive: campaign.settings?.isActive || false,
          isScheduled: campaign.settings?.isScheduled || false,
          isExpired: campaign.settings?.isExpired || false,
          maxImpressions: campaign.settings?.maxImpressions || "",
          maxClicks: campaign.settings?.maxClicks || "",
          displayFrequency: campaign.settings?.displayFrequency || "always",
          displayDelay: campaign.settings?.displayDelay || 0,
        },
        tags: campaign.tags || [],
      });
    }
  }, [campaign, mode]);

  const tabs = [
    { id: "basic", label: "Basic Info", icon: "📝" },
    { id: "content", label: "Content", icon: "🎨" },
    { id: "schedule", label: "Schedule", icon: "📅" },
    { id: "targeting", label: "Targeting", icon: "🎯" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Campaign name is required";
    }

    if (!formData.content.title.trim()) {
      newErrors.contentTitle = "Campaign title is required";
    }

    if (formData.schedule.startDate && formData.schedule.endDate) {
      if (new Date(formData.schedule.startDate) >= new Date(formData.schedule.endDate)) {
        newErrors.schedule = "End date must be after start date";
      }
    }

    if (formData.settings.maxImpressions && formData.settings.maxImpressions < 1) {
      newErrors.maxImpressions = "Maximum impressions must be at least 1";
    }

    if (formData.settings.maxClicks && formData.settings.maxClicks < 1) {
      newErrors.maxClicks = "Maximum clicks must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting campaign:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (path, value) => {
    const keys = path.split(".");
    const newFormData = { ...formData };
    let current = newFormData;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setFormData(newFormData);

    // Clear error when user starts typing
    if (errors[path]) {
      setErrors((prev) => ({ ...prev, [path]: undefined }));
    }
  };

  const handleArrayChange = (path, value) => {
    const keys = path.split(".");
    const newFormData = { ...formData };
    let current = newFormData;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setFormData(newFormData);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
        <div
          className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
          onClick={onClose}></div>

        <div className='inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full'>
          <div className='bg-white'>
            {/* Header */}
            <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
              <div>
                <h3 className='text-lg font-medium text-gray-900'>
                  {mode === "edit" ? "Edit Campaign" : "Create New Campaign"}
                </h3>
                <p className='mt-1 text-sm text-gray-500'>
                  {mode === "edit"
                    ? "Update campaign details and settings"
                    : "Set up a new marketing campaign"}
                </p>
              </div>
              <div className='flex items-center space-x-3'>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
                  {showPreview ? (
                    <>
                      <EyeSlashIcon className='h-4 w-4 mr-2' />
                      Hide Preview
                    </>
                  ) : (
                    <>
                      <EyeIcon className='h-4 w-4 mr-2' />
                      Preview
                    </>
                  )}
                </button>
                <button onClick={onClose} className='text-gray-400 hover:text-gray-500'>
                  <XMarkIcon className='h-6 w-6' />
                </button>
              </div>
            </div>

            <div className='flex'>
              {/* Main Form */}
              <div className={`${showPreview ? "w-1/2" : "w-full"} p-6`}>
                {/* Tabs */}
                <div className='border-b border-gray-200 mb-6'>
                  <nav className='-mb-px flex space-x-8'>
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}>
                        <span className='mr-2'>{tab.icon}</span>
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <form onSubmit={handleSubmit}>
                  {activeTab === "basic" && (
                    <div className='space-y-6'>
                      <div>
                        <label htmlFor='name' className='block text-sm font-medium text-gray-700'>
                          Campaign Name *
                        </label>
                        <input
                          type='text'
                          id='name'
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                            errors.name ? "border-red-300" : "border-gray-300"
                          }`}
                          placeholder='Enter campaign name'
                        />
                        {errors.name && <p className='mt-1 text-sm text-red-600'>{errors.name}</p>}
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                          <label htmlFor='type' className='block text-sm font-medium text-gray-700'>
                            Campaign Type
                          </label>
                          <select
                            id='type'
                            value={formData.type}
                            onChange={(e) => handleInputChange("type", e.target.value)}
                            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'>
                            <option value='hero-carousel'>Hero Carousel</option>
                            <option value='banner'>Banner</option>
                            <option value='popup'>Popup</option>
                            <option value='notification'>Notification</option>
                            <option value='theme-override'>Theme Override</option>
                            <option value='promotional'>Promotional</option>
                            <option value='announcement'>Announcement</option>
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor='placement'
                            className='block text-sm font-medium text-gray-700'>
                            Placement
                          </label>
                          <select
                            id='placement'
                            value={formData.placement}
                            onChange={(e) => handleInputChange("placement", e.target.value)}
                            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'>
                            <option value='hero'>Hero Section</option>
                            <option value='top-banner'>Top Banner</option>
                            <option value='sidebar'>Sidebar</option>
                            <option value='footer'>Footer</option>
                            <option value='popup'>Popup</option>
                            <option value='notification'>Notification Bar</option>
                            <option value='modal'>Modal</option>
                            <option value='overlay'>Overlay</option>
                            <option value='inline'>Inline</option>
                          </select>
                        </div>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                          <label
                            htmlFor='priority'
                            className='block text-sm font-medium text-gray-700'>
                            Priority (1-10)
                          </label>
                          <input
                            type='number'
                            id='priority'
                            min='1'
                            max='10'
                            value={formData.priority}
                            onChange={(e) =>
                              handleInputChange("priority", parseInt(e.target.value))
                            }
                            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                          />
                        </div>

                        <div>
                          <label
                            htmlFor='status'
                            className='block text-sm font-medium text-gray-700'>
                            Status
                          </label>
                          <select
                            id='status'
                            value={formData.status}
                            onChange={(e) => handleInputChange("status", e.target.value)}
                            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'>
                            <option value='draft'>Draft</option>
                            <option value='pending'>Pending</option>
                            <option value='approved'>Approved</option>
                            <option value='active'>Active</option>
                            <option value='paused'>Paused</option>
                            <option value='completed'>Completed</option>
                            <option value='cancelled'>Cancelled</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor='tags' className='block text-sm font-medium text-gray-700'>
                          Tags
                        </label>
                        <input
                          type='text'
                          id='tags'
                          value={formData.tags.join(", ")}
                          onChange={(e) =>
                            handleArrayChange(
                              "tags",
                              e.target.value
                                .split(",")
                                .map((tag) => tag.trim())
                                .filter((tag) => tag)
                            )
                          }
                          className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                          placeholder='Enter tags separated by commas'
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "content" && (
                    <CampaignContentEditor
                      content={formData.content}
                      onChange={(content) => handleInputChange("content", content)}
                      errors={errors}
                    />
                  )}

                  {activeTab === "schedule" && (
                    <CampaignScheduleEditor
                      schedule={formData.schedule}
                      onChange={(schedule) => handleInputChange("schedule", schedule)}
                      errors={errors}
                    />
                  )}

                  {activeTab === "targeting" && (
                    <CampaignTargetingEditor
                      targeting={formData.targeting}
                      onChange={(targeting) => handleInputChange("targeting", targeting)}
                    />
                  )}

                  {activeTab === "settings" && (
                    <CampaignSettingsEditor
                      settings={formData.settings}
                      onChange={(settings) => handleInputChange("settings", settings)}
                      errors={errors}
                    />
                  )}

                  {/* Form Actions */}
                  <div className='flex items-center justify-between pt-6 border-t border-gray-200'>
                    <div className='flex items-center space-x-3'>
                      {tabs.map((tab, index) => (
                        <button
                          key={tab.id}
                          type='button'
                          onClick={() => setActiveTab(tab.id)}
                          disabled={index === 0}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            index === 0
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-700 hover:text-gray-900"
                          }`}>
                          {index > 0 && "← "}
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className='flex items-center space-x-3'>
                      <button
                        type='button'
                        onClick={onClose}
                        className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
                        Cancel
                      </button>
                      <button
                        type='submit'
                        disabled={isSubmitting}
                        className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'>
                        {isSubmitting
                          ? "Saving..."
                          : mode === "edit"
                            ? "Update Campaign"
                            : "Create Campaign"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Preview Panel */}
              {showPreview && (
                <div className='w-1/2 border-l border-gray-200 p-6 bg-gray-50'>
                  <h4 className='text-lg font-medium text-gray-900 mb-4'>Campaign Preview</h4>
                  <CampaignPreview campaign={formData} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignForm;
