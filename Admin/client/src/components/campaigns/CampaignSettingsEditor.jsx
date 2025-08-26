import React from "react";
import { Settings, Tag, Globe, ShieldCheck } from "lucide-react";

const CampaignSettingsEditor = ({ formData, errors, onChange }) => {
  const campaignTypes = [
    {
      value: "hero_carousel",
      label: "Hero Carousel",
      description: "Full-width carousel with multiple slides and navigation",
    },
    {
      value: "banner",
      label: "Banner Advertisement",
      description: "Traditional banner ads displayed on websites",
    },
    {
      value: "popup",
      label: "Popup/Modal",
      description: "Overlay popup that appears over content",
    },
    {
      value: "notification",
      label: "Push Notification",
      description: "Browser or app push notifications",
    },
    {
      value: "theme_override",
      label: "Theme Override",
      description: "Custom CSS and JavaScript theme modifications",
    },
  ];

  const campaignPlacements = [
    {
      value: "top_banner",
      label: "Top Banner",
      description: "Site-wide top banner area above navigation",
    },
    { value: "homepage", label: "Homepage", description: "Main landing page" },
    {
      value: "product_pages",
      label: "Product Pages",
      description: "Individual product/service pages",
    },
    { value: "category_pages", label: "Category Pages", description: "Product category listings" },
    { value: "blog_posts", label: "Blog Posts", description: "Blog article pages" },
    {
      value: "landing_pages",
      label: "Landing Pages",
      description: "Specific campaign landing pages",
    },
    { value: "checkout", label: "Checkout Pages", description: "Shopping cart and checkout flow" },
    { value: "404_pages", label: "404 Pages", description: "Error pages" },
    { value: "all_pages", label: "All Pages", description: "Site-wide placement" },
  ];

  const campaignStatuses = [
    { value: "draft", label: "Draft", description: "Work in progress, not visible to users" },
    {
      value: "pending_review",
      label: "Pending Review",
      description: "Awaiting approval from admin",
    },
    { value: "approved", label: "Approved", description: "Approved and ready for activation" },
    { value: "active", label: "Active", description: "Currently running and visible to users" },
    { value: "paused", label: "Paused", description: "Temporarily stopped but can be resumed" },
    { value: "completed", label: "Completed", description: "Campaign has finished its run" },
    { value: "rejected", label: "Rejected", description: "Not approved for publication" },
  ];

  const handleSettingsChange = (field, value) => {
    onChange("settings", {
      ...formData.settings,
      [field]: value,
    });
  };

  const addTag = (tag) => {
    const currentTags = formData.settings?.tags || [];
    if (!currentTags.includes(tag) && tag.trim()) {
      handleSettingsChange("tags", [...currentTags, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove) => {
    const currentTags = formData.settings?.tags || [];
    handleSettingsChange(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleTagInput = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      addTag(e.target.value);
      e.target.value = "";
    }
  };

  return (
    <div className='space-y-6'>
      {/* Basic Settings */}
      <div className='space-y-4'>
        <h3 className='text-lg font-medium text-gray-900 flex items-center'>
          <Settings className='h-5 w-5 mr-2' />
          Basic Settings
        </h3>

        <div>
          <label htmlFor='campaignType' className='block text-sm font-medium text-gray-700'>
            Campaign Type *
          </label>
          <select
            id='campaignType'
            name='campaignType'
            value={formData.settings?.campaignType || ""}
            onChange={(e) => handleSettingsChange("campaignType", e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.settings?.campaignType ? "border-red-500" : ""
            }`}>
            <option value=''>Select campaign type</option>
            {campaignTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {formData.settings?.campaignType && (
            <p className='mt-1 text-sm text-gray-500'>
              {campaignTypes.find((t) => t.value === formData.settings.campaignType)?.description}
            </p>
          )}
          {errors.settings?.campaignType && (
            <p className='mt-1 text-sm text-red-600'>{errors.settings.campaignType}</p>
          )}
        </div>

        <div>
          <label htmlFor='campaignPlacement' className='block text-sm font-medium text-gray-700'>
            Campaign Placement *
          </label>
          <select
            id='campaignPlacement'
            name='campaignPlacement'
            value={formData.settings?.campaignPlacement || ""}
            onChange={(e) => handleSettingsChange("campaignPlacement", e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.settings?.campaignPlacement ? "border-red-500" : ""
            }`}>
            <option value=''>Select placement</option>
            {campaignPlacements.map((placement) => (
              <option key={placement.value} value={placement.value}>
                {placement.label}
              </option>
            ))}
          </select>
          {formData.settings?.campaignPlacement && (
            <p className='mt-1 text-sm text-gray-500'>
              {
                campaignPlacements.find((p) => p.value === formData.settings.campaignPlacement)
                  ?.description
              }
            </p>
          )}
          {errors.settings?.campaignPlacement && (
            <p className='mt-1 text-sm text-red-600'>{errors.settings.campaignPlacement}</p>
          )}
        </div>

        <div>
          <label htmlFor='campaignStatus' className='block text-sm font-medium text-gray-700'>
            Campaign Status *
          </label>
          <select
            id='campaignStatus'
            name='campaignStatus'
            value={formData.settings?.campaignStatus || "draft"}
            onChange={(e) => handleSettingsChange("campaignStatus", e.target.value)}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'>
            {campaignStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          {formData.settings?.campaignStatus && (
            <p className='mt-1 text-sm text-gray-500'>
              {
                campaignStatuses.find((s) => s.value === formData.settings.campaignStatus)
                  ?.description
              }
            </p>
          )}
        </div>
      </div>

      {/* Campaign Information */}
      <div className='space-y-4'>
        <h3 className='text-lg font-medium text-gray-900 flex items-center'>
          <Tag className='h-5 w-5 mr-2' />
          Campaign Information
        </h3>

        <div>
          <label htmlFor='campaignId' className='block text-sm font-medium text-gray-700'>
            Campaign ID
          </label>
          <input
            type='text'
            id='campaignId'
            name='campaignId'
            value={formData.settings?.campaignId || ""}
            onChange={(e) => handleSettingsChange("campaignId", e.target.value)}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
            placeholder='Auto-generated if left empty'
          />
          <p className='mt-1 text-xs text-gray-500'>Unique identifier for the campaign</p>
        </div>

        <div>
          <label htmlFor='externalId' className='block text-sm font-medium text-gray-700'>
            External ID
          </label>
          <input
            type='text'
            id='externalId'
            name='externalId'
            value={formData.settings?.externalId || ""}
            onChange={(e) => handleSettingsChange("externalId", e.target.value)}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
            placeholder='External system reference'
          />
          <p className='mt-1 text-xs text-gray-500'>
            Reference ID from external systems (optional)
          </p>
        </div>

        <div>
          <label htmlFor='tags' className='block text-sm font-medium text-gray-700'>
            Tags
          </label>
          <div className='mt-1'>
            <input
              type='text'
              placeholder='Type a tag and press Enter'
              onKeyPress={handleTagInput}
              className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
            />
          </div>
          {formData.settings?.tags && formData.settings.tags.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-2'>
              {formData.settings.tags.map((tag) => (
                <span
                  key={tag}
                  className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                  {tag}
                  <button
                    type='button'
                    onClick={() => removeTag(tag)}
                    className='ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500'>
                    <span className='sr-only'>Remove tag</span>×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Display Settings */}
      <div className='space-y-4'>
        <h3 className='text-lg font-medium text-gray-900 flex items-center'>
          <Globe className='h-5 w-5 mr-2' />
          Display Settings
        </h3>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <label htmlFor='displayOrder' className='block text-sm font-medium text-gray-700'>
              Display Order
            </label>
            <input
              type='number'
              id='displayOrder'
              name='displayOrder'
              min='1'
              max='999'
              value={formData.settings?.displayOrder || 1}
              onChange={(e) => handleSettingsChange("displayOrder", parseInt(e.target.value))}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
            />
            <p className='mt-1 text-xs text-gray-500'>Lower numbers display first</p>
          </div>

          <div>
            <label htmlFor='maxDisplays' className='block text-sm font-medium text-gray-700'>
              Max Displays
            </label>
            <input
              type='number'
              id='maxDisplays'
              name='maxDisplays'
              min='1'
              max='999999'
              value={formData.settings?.maxDisplays || ""}
              onChange={(e) =>
                handleSettingsChange(
                  "maxDisplays",
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
              placeholder='Unlimited'
            />
            <p className='mt-1 text-xs text-gray-500'>Maximum times campaign can be displayed</p>
          </div>
        </div>

        <div className='space-y-3'>
          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={formData.settings?.isResponsive || false}
              onChange={(e) => handleSettingsChange("isResponsive", e.target.checked)}
              className='rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            />
            <span className='ml-2 text-sm text-gray-700'>Responsive design (mobile-friendly)</span>
          </label>

          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={formData.settings?.isAccessible || false}
              onChange={(e) => handleSettingsChange("isAccessible", e.target.checked)}
              className='rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            />
            <span className='ml-2 text-sm text-gray-700'>Accessibility compliant (WCAG)</span>
          </label>

          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={formData.settings?.isAbtesting || false}
              onChange={(e) => handleSettingsChange("isAbtesting", e.target.checked)}
              className='rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            />
            <span className='ml-2 text-sm text-gray-700'>Enable A/B testing</span>
          </label>
        </div>
      </div>

      {/* Security & Privacy */}
      <div className='space-y-4'>
        <h3 className='text-lg font-medium text-gray-900 flex items-center'>
          <ShieldCheck className='h-5 w-5 mr-2' />
          Security & Privacy
        </h3>

        <div className='space-y-3'>
          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={formData.settings?.requiresConsent || false}
              onChange={(e) => handleSettingsChange("requiresConsent", e.target.checked)}
              className='rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            />
            <span className='ml-2 text-sm text-gray-700'>Require user consent before display</span>
          </label>

          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={formData.settings?.isGdprCompliant || false}
              onChange={(e) => handleSettingsChange("isGdprCompliant", e.target.checked)}
              className='rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            />
            <span className='ml-2 text-sm text-gray-700'>GDPR compliant</span>
          </label>

          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={formData.settings?.isCcpCompliant || false}
              onChange={(e) => handleSettingsChange("isCcpCompliant", e.target.checked)}
              className='rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            />
            <span className='ml-2 text-sm text-gray-700'>CCPA compliant</span>
          </label>
        </div>

        <div>
          <label htmlFor='privacyPolicy' className='block text-sm font-medium text-gray-700'>
            Privacy Policy URL
          </label>
          <input
            type='url'
            id='privacyPolicy'
            name='privacyPolicy'
            value={formData.settings?.privacyPolicy || ""}
            onChange={(e) => handleSettingsChange("privacyPolicy", e.target.value)}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
            placeholder='https://example.com/privacy'
          />
          <p className='mt-1 text-xs text-gray-500'>URL to privacy policy for this campaign</p>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className='space-y-4'>
        <h3 className='text-lg font-medium text-gray-900'>Advanced Settings</h3>

        <div>
          <label htmlFor='customCss' className='block text-sm font-medium text-gray-700'>
            Custom CSS
          </label>
          <textarea
            id='customCss'
            name='customCss'
            rows={4}
            value={formData.settings?.customCss || ""}
            onChange={(e) => handleSettingsChange("customCss", e.target.value)}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono text-sm'
            placeholder='/* Custom CSS styles for this campaign */'
          />
          <p className='mt-1 text-xs text-gray-500'>Custom CSS to override default styling</p>
        </div>

        <div>
          <label htmlFor='customJs' className='block text-sm font-medium text-gray-700'>
            Custom JavaScript
          </label>
          <textarea
            id='customJs'
            name='customJs'
            rows={4}
            value={formData.settings?.customJs || ""}
            onChange={(e) => handleSettingsChange("customJs", e.target.value)}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono text-sm'
            placeholder='// Custom JavaScript for this campaign'
          />
          <p className='mt-1 text-xs text-gray-500'>Custom JavaScript for enhanced functionality</p>
        </div>

        <div>
          <label htmlFor='notes' className='block text-sm font-medium text-gray-700'>
            Internal Notes
          </label>
          <textarea
            id='notes'
            name='notes'
            rows={3}
            value={formData.settings?.notes || ""}
            onChange={(e) => handleSettingsChange("notes", e.target.value)}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
            placeholder='Internal notes about this campaign (not visible to users)'
          />
          <p className='mt-1 text-xs text-gray-500'>Internal notes for team reference</p>
        </div>
      </div>
    </div>
  );
};

export default CampaignSettingsEditor;
