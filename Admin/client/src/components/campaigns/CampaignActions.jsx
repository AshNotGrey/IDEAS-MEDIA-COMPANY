import React, { useState } from "react";
import {
  EllipsisVerticalIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  EyeIcon,
  PencilIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const CampaignActions = ({
  campaign,
  onEdit,
  onDelete,
  onDuplicate,
  onActivate,
  onDeactivate,
  onApprove,
  onView,
  onMoveUp,
  onMoveDown,
  className = "",
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleAction = (action) => {
    setIsDropdownOpen(false);
    action();
  };

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
        return <EyeIcon className='h-4 w-4 text-gray-600' />;
      case "pending_review":
        return <ExclamationTriangleIcon className='h-4 w-4 text-orange-600' />;
      default:
        return <EyeIcon className='h-4 w-4 text-gray-600' />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-50 border-green-200";
      case "paused":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "approved":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "scheduled":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "draft":
        return "text-gray-600 bg-gray-50 border-gray-200";
      case "pending_review":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const canActivate =
    campaign.settings?.campaignStatus === "approved" ||
    campaign.settings?.campaignStatus === "paused";

  const canDeactivate = campaign.settings?.campaignStatus === "active";

  const canApprove = campaign.settings?.campaignStatus === "pending_review";

  const canEdit =
    campaign.settings?.campaignStatus !== "completed" &&
    campaign.settings?.campaignStatus !== "rejected";

  return (
    <div className={`relative ${className}`}>
      {/* Quick Actions Bar */}
      <div className='flex items-center space-x-1'>
        {/* View Button */}
        <button
          onClick={() => onView(campaign)}
          className='p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors'
          title='View Campaign'>
          <EyeIcon className='h-4 w-4' />
        </button>

        {/* Edit Button */}
        {canEdit && (
          <button
            onClick={() => onEdit(campaign)}
            className='p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-colors'
            title='Edit Campaign'>
            <PencilIcon className='h-4 w-4' />
          </button>
        )}

        {/* Duplicate Button */}
        <button
          onClick={() => onDuplicate(campaign)}
          className='p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors'
          title='Duplicate Campaign'>
          <DocumentDuplicateIcon className='h-4 w-4' />
        </button>

        {/* Status Management Buttons */}
        {canActivate && (
          <button
            onClick={() => onActivate(campaign.id)}
            className='p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors'
            title='Activate Campaign'>
            <PlayIcon className='h-4 w-4' />
          </button>
        )}

        {canDeactivate && (
          <button
            onClick={() => onDeactivate(campaign.id)}
            className='p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded-md transition-colors'
            title='Pause Campaign'>
            <PauseIcon className='h-4 w-4' />
          </button>
        )}

        {canApprove && (
          <button
            onClick={() => onApprove(campaign.id)}
            className='p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors'
            title='Approve Campaign'>
            <CheckCircleIcon className='h-4 w-4' />
          </button>
        )}

        {/* Order Management Buttons */}
        {onMoveUp && (
          <button
            onClick={() => onMoveUp(campaign.id)}
            className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors'
            title='Move Up'>
            <ArrowUpIcon className='h-4 w-4' />
          </button>
        )}

        {onMoveDown && (
          <button
            onClick={() => onMoveDown(campaign.id)}
            className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors'
            title='Move Down'>
            <ArrowDownIcon className='h-4 w-4' />
          </button>
        )}

        {/* More Actions Dropdown */}
        <div className='relative'>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors'
            title='More Actions'>
            <EllipsisVerticalIcon className='h-4 w-4' />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <div className='fixed inset-0 z-10' onClick={() => setIsDropdownOpen(false)} />

              {/* Dropdown Content */}
              <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200'>
                {/* Campaign Status Info */}
                <div className='px-4 py-2 border-b border-gray-100'>
                  <div className='flex items-center space-x-2'>
                    {getStatusIcon(campaign.settings?.campaignStatus)}
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(campaign.settings?.campaignStatus)}`}>
                      {campaign.settings?.campaignStatus?.replace("_", " ") || "Unknown"}
                    </span>
                  </div>
                  <p className='text-xs text-gray-500 mt-1'>
                    {campaign.schedule?.isActive ? "Active" : "Inactive"}
                  </p>
                </div>

                {/* Action Items */}
                <div className='py-1'>
                  {/* View Details */}
                  <button
                    onClick={() => handleAction(() => onView(campaign))}
                    className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2'>
                    <EyeIcon className='h-4 w-4' />
                    <span>View Details</span>
                  </button>

                  {/* Edit Campaign */}
                  {canEdit && (
                    <button
                      onClick={() => handleAction(() => onEdit(campaign))}
                      className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2'>
                      <PencilIcon className='h-4 w-4' />
                      <span>Edit Campaign</span>
                    </button>
                  )}

                  {/* Duplicate Campaign */}
                  <button
                    onClick={() => handleAction(() => onDuplicate(campaign))}
                    className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2'>
                    <DocumentDuplicateIcon className='h-4 w-4' />
                    <span>Duplicate Campaign</span>
                  </button>

                  {/* Status Management */}
                  {canActivate && (
                    <button
                      onClick={() => handleAction(() => onActivate(campaign.id))}
                      className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2'>
                      <PlayIcon className='h-4 w-4' />
                      <span>Activate Campaign</span>
                    </button>
                  )}

                  {canDeactivate && (
                    <button
                      onClick={() => handleAction(() => onDeactivate(campaign.id))}
                      className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2'>
                      <PauseIcon className='h-4 w-4' />
                      <span>Pause Campaign</span>
                    </button>
                  )}

                  {canApprove && (
                    <button
                      onClick={() => handleAction(() => onApprove(campaign.id))}
                      className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2'>
                      <CheckCircleIcon className='h-4 w-4' />
                      <span>Approve Campaign</span>
                    </button>
                  )}

                  {/* Order Management */}
                  {onMoveUp && (
                    <button
                      onClick={() => handleAction(() => onMoveUp(campaign.id))}
                      className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2'>
                      <ArrowUpIcon className='h-4 w-4' />
                      <span>Move Up</span>
                    </button>
                  )}

                  {onMoveDown && (
                    <button
                      onClick={() => handleAction(() => onMoveDown(campaign.id))}
                      className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2'>
                      <ArrowDownIcon className='h-4 w-4' />
                      <span>Move Down</span>
                    </button>
                  )}

                  {/* Divider */}
                  <div className='border-t border-gray-100 my-1' />

                  {/* Delete Campaign */}
                  <button
                    onClick={() => handleAction(() => onDelete(campaign.id))}
                    className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2'>
                    <TrashIcon className='h-4 w-4' />
                    <span>Delete Campaign</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignActions;
