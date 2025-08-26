import React, { useState } from "react";
import { DevicePhoneMobileIcon, DeviceTabletIcon, ComputerDesktopIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const CampaignPreview = ({ campaign }) => {
  const [viewMode, setViewMode] = useState('desktop');
  const [showPreview, setShowPreview] = useState(true);

  const deviceConfigs = {
    desktop: { width: 'w-full', height: 'h-96', icon: ComputerDesktopIcon, label: 'Desktop' },
    tablet: { width: 'w-80', height: 'h-96', icon: DeviceTabletIcon, label: 'Tablet' },
    mobile: { width: 'w-64', height: 'h-96', icon: DevicePhoneMobileIcon, label: 'Mobile' }
  };

  const currentDevice = deviceConfigs[viewMode];

  const renderCampaignContent = () => {
    if (!campaign) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No campaign data to preview</p>
        </div>
      );
    }

    return (
      <div className="p-4 bg-white">
        {/* Campaign Header */}
        {campaign.title && (
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{campaign.title}</h2>
            {campaign.description && (
              <p className="text-gray-600 text-sm">{campaign.description}</p>
            )}
          </div>
        )}

        {/* Campaign Content */}
        {campaign.content && (
          <div className="mb-4">
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: campaign.content }}
            />
          </div>
        )}

        {/* Campaign Images */}
        {campaign.images && campaign.images.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-1 gap-3">
              {campaign.images.map((image, index) => (
                <div key={image.id || index} className="relative">
                  <img
                    src={image.url}
                    alt={image.alt || `Campaign image ${index + 1}`}
                    className="w-full h-auto rounded-lg shadow-sm"
                  />
                  {image.alt && (
                    <p className="text-xs text-gray-500 mt-1">{image.alt}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call-to-Actions */}
        {campaign.ctas && campaign.ctas.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {campaign.ctas.map((cta, index) => (
                <button
                  key={cta.id || index}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    cta.type === 'primary'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : cta.type === 'secondary'
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  disabled={!cta.isActive}
                >
                  {cta.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Campaign Metadata */}
        <div className="border-t pt-4 mt-4">
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
            {campaign.settings?.campaignType && (
              <div>
                <span className="font-medium">Type:</span> {campaign.settings.campaignType}
              </div>
            )}
            {campaign.settings?.campaignPlacement && (
              <div>
                <span className="font-medium">Placement:</span> {campaign.settings.campaignPlacement}
              </div>
            )}
            {campaign.schedule?.startDate && (
              <div>
                <span className="font-medium">Start:</span> {new Date(campaign.schedule.startDate).toLocaleDateString()}
              </div>
            )}
            {campaign.schedule?.endDate && (
              <div>
                <span className="font-medium">End:</span> {new Date(campaign.schedule.endDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPreviewFrame = () => {
    if (!showPreview) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <EyeSlashIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Preview hidden</p>
            <button
              onClick={() => setShowPreview(true)}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              Show preview
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={`${currentDevice.width} ${currentDevice.height} mx-auto border border-gray-300 rounded-lg overflow-hidden shadow-lg bg-gray-50`}>
        {/* Device Frame Header */}
        <div className="bg-gray-200 px-3 py-2 border-b border-gray-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <currentDevice.icon className="h-4 w-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">{currentDevice.label}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="overflow-y-auto h-full">
          {renderCampaignContent()}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Preview Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <EyeIcon className="h-5 w-5 mr-2" />
          Campaign Preview
        </h3>
        
        <div className="flex items-center space-x-2">
          {/* Device Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {Object.entries(deviceConfigs).map(([mode, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === mode
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title={config.label}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>

          {/* Preview Toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`p-2 rounded-md transition-colors ${
              showPreview
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={showPreview ? 'Hide preview' : 'Show preview'}
          >
            {showPreview ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex justify-center">
        {renderPreviewFrame()}
      </div>

      {/* Preview Information */}
      {showPreview && campaign && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Preview Information</h4>
          
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Current View:</span>
              <span className="ml-2 text-gray-600 capitalize">{viewMode}</span>
            </div>
            
            {campaign.settings?.campaignType && (
              <div>
                <span className="font-medium text-gray-700">Type:</span>
                <span className="ml-2 text-gray-600 capitalize">{campaign.settings.campaignType}</span>
              </div>
            )}
            
            {campaign.settings?.campaignPlacement && (
              <div>
                <span className="font-medium text-gray-700">Placement:</span>
                <span className="ml-2 text-gray-600 capitalize">{campaign.settings.campaignPlacement.replace('_', ' ')}</span>
              </div>
            )}
            
            {campaign.settings?.campaignStatus && (
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className="ml-2 text-gray-600 capitalize">{campaign.settings.campaignStatus.replace('_', ' ')}</span>
              </div>
            )}
            
            {campaign.schedule?.isActive !== undefined && (
              <div>
                <span className="font-medium text-gray-700">Active:</span>
                <span className={`ml-2 ${campaign.schedule.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {campaign.schedule.isActive ? 'Yes' : 'No'}
                </span>
              </div>
            )}
            
            {campaign.schedule?.isScheduled !== undefined && (
              <div>
                <span className="font-medium text-gray-700">Scheduled:</span>
                <span className={`ml-2 ${campaign.schedule.isScheduled ? 'text-blue-600' : 'text-gray-600'}`}>
                  {campaign.schedule.isScheduled ? 'Yes' : 'No'}
                </span>
              </div>
            )}
          </div>

          {/* Responsive Design Notes */}
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> This preview shows how your campaign will appear on {viewMode} devices. 
              The actual display may vary based on user device, browser, and campaign targeting settings.
            </p>
          </div>
        </div>
      )}

      {/* No Campaign Data Message */}
      {!campaign && (
        <div className="text-center py-8 text-gray-500">
          <EyeIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p>No campaign data available for preview</p>
          <p className="text-sm">Fill out the form above to see a live preview</p>
        </div>
      )}
    </div>
  );
};

export default CampaignPreview;
