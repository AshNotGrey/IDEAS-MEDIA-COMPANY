import React from "react";
import {
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import CampaignStatusBadge from "./CampaignStatusBadge.jsx";

const CampaignCard = ({
  campaign,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onActivate,
  onDeactivate,
  onApprove,
  onView,
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <PlayIcon className='h-4 w-4 text-green-600' />;
      case "paused":
        return <PauseIcon className='h-4 w-4 text-yellow-600' />;
      case "approved":
        return <CheckCircleIcon className='h-4 w-4 text-blue-600' />;
      case "scheduled":
        return <ClockIcon className='h-4 w-4 text-purple-600' />;
      case "draft":
        return <EyeSlashIcon className='h-4 w-4 text-gray-600' />;
      case "pending_review":
        return <ExclamationTriangleIcon className='h-4 w-4 text-orange-600' />;
      default:
        return <EyeIcon className='h-4 w-4 text-gray-600' />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAnalyticsColor = (value, type) => {
    if (type === "ctr") {
      const ctr = parseFloat(value) || 0;
      if (ctr >= 2.0) return "text-green-600";
      if (ctr >= 1.0) return "text-yellow-600";
      return "text-red-600";
    }
    return "text-gray-600";
  };

  return (
    <div
      className={`bg-white rounded-lg shadow border-2 transition-all duration-200 ${
        isSelected ? "border-blue-500 shadow-lg" : "border-gray-200 hover:border-gray-300"
      }`}>
      <div className='p-4'>
        {/* Header */}
        <div className='flex items-start justify-between mb-3'>
          <input
            type='checkbox'
            checked={isSelected}
            onChange={onSelect}
            className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
          />
          <div className='flex items-center space-x-1'>
            {getStatusIcon(campaign.settings?.campaignStatus)}
            <CampaignStatusBadge status={campaign.settings?.campaignStatus} />
          </div>
        </div>

        {/* Campaign Image */}
        <div className='mb-4'>
          {campaign.images && campaign.images.length > 0 ? (
            <img
              className='w-full h-32 object-cover rounded-lg'
              src={campaign.images[0].url}
              alt={campaign.images[0].alt || "Campaign image"}
            />
          ) : (
            <div className='w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center'>
              <EyeIcon className='h-12 w-12 text-gray-400' />
            </div>
          )}
        </div>

        {/* Campaign Info */}
        <div className='mb-4'>
          <h3 className='text-lg font-semibold text-gray-900 mb-2 line-clamp-2'>
            {campaign.title || "Untitled Campaign"}
          </h3>
          <p className='text-sm text-gray-600 mb-2 line-clamp-2'>
            {campaign.description || "No description available"}
          </p>
          <div className='flex items-center justify-between text-xs text-gray-500 mb-2'>
            <span className='capitalize'>
              {campaign.settings?.campaignType?.replace("_", " ") || "Unknown"}
            </span>
            <span className='capitalize'>
              {campaign.settings?.campaignPlacement?.replace("_", " ") || "Unknown"}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(campaign.schedule?.priority)}`}>
              {campaign.schedule?.priority || "normal"}
            </span>
            <span className='text-xs text-gray-400'>{formatDate(campaign.createdAt)}</span>
          </div>
        </div>

        {/* Schedule Info */}
        {campaign.schedule?.startDate && (
          <div className='mb-4 p-3 bg-gray-50 rounded-md'>
            <div className='flex items-center text-xs text-gray-600 mb-1'>
              <CalendarIcon className='h-3 w-3 mr-1' />
              Schedule
            </div>
            <div className='text-xs text-gray-900'>
              <div>Start: {formatDate(campaign.schedule.startDate)}</div>
              {campaign.schedule?.endDate && (
                <div>End: {formatDate(campaign.schedule.endDate)}</div>
              )}
            </div>
          </div>
        )}

        {/* Analytics */}
        <div className='mb-4 p-3 bg-blue-50 rounded-md'>
          <div className='flex items-center text-xs text-gray-600 mb-2'>
            <ChartBarIcon className='h-3 w-3 mr-1' />
            Performance
          </div>
          <div className='grid grid-cols-2 gap-2 text-xs'>
            <div>
              <span className='text-gray-500'>Impressions:</span>
              <span className='ml-1 font-medium'>{campaign.analytics?.impressions || 0}</span>
            </div>
            <div>
              <span className='text-gray-500'>Clicks:</span>
              <span className='ml-1 font-medium'>{campaign.analytics?.clicks || 0}</span>
            </div>
            <div>
              <span className='text-gray-500'>CTR:</span>
              <span
                className={`ml-1 font-medium ${getAnalyticsColor(campaign.analytics?.ctr, "ctr")}`}>
                {campaign.analytics?.ctr || "0%"}
              </span>
            </div>
            <div>
              <span className='text-gray-500'>Conversions:</span>
              <span className='ml-1 font-medium'>{campaign.analytics?.conversions || 0}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex items-center justify-between pt-3 border-t border-gray-200'>
          <div className='flex items-center space-x-2'>
            <button
              onClick={onView}
              className='p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors'
              title='View campaign'>
              <EyeIcon className='h-4 w-4' />
            </button>
            <button
              onClick={onEdit}
              className='p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors'
              title='Edit campaign'>
              <PencilIcon className='h-4 w-4' />
            </button>
            <button
              onClick={onDuplicate}
              className='p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors'
              title='Duplicate campaign'>
              <DocumentDuplicateIcon className='h-4 w-4' />
            </button>
          </div>
          <div className='flex items-center space-x-2'>
            {campaign.settings?.campaignStatus === "active" ? (
              <button
                onClick={onDeactivate}
                className='p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded-md transition-colors'
                title='Pause campaign'>
                <PauseIcon className='h-4 w-4' />
              </button>
            ) : (
              <button
                onClick={onActivate}
                className='p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors'
                title='Activate campaign'>
                <PlayIcon className='h-4 w-4' />
              </button>
            )}
            {campaign.settings?.campaignStatus === "pending_review" && (
              <button
                onClick={onApprove}
                className='p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors'
                title='Approve campaign'>
                <CheckCircleIcon className='h-4 w-4' />
              </button>
            )}
            <button
              onClick={onDelete}
              className='p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors'
              title='Delete campaign'>
              <TrashIcon className='h-4 w-4' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
