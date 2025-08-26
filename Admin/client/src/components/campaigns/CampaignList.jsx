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
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import CampaignStatusBadge from "./CampaignStatusBadge.jsx";
import CampaignCard from "./CampaignCard.jsx";

const CampaignList = ({
  campaigns,
  viewMode,
  selectedCampaigns,
  onSelectCampaign,
  onSelectAll,
  onEditCampaign,
  onDeleteCampaign,
  onDuplicateCampaign,
  onActivateCampaign,
  onDeactivateCampaign,
  onApproveCampaign,
  onViewCampaign,
  currentPage,
  totalPages,
  onPageChange,
  sortField,
  sortOrder,
  onSort,
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
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  const renderTableHeader = () => (
    <thead className='bg-gray-50'>
      <tr>
        <th scope='col' className='relative px-6 py-3'>
          <input
            type='checkbox'
            checked={selectedCampaigns.length === campaigns.length && campaigns.length > 0}
            onChange={onSelectAll}
            className='rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500'
          />
        </th>
        <th
          scope='col'
          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
          Campaign
        </th>
        <th
          scope='col'
          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
          <button
            onClick={() => onSort("status")}
            className='group inline-flex items-center hover:text-gray-700'>
            Status
            {sortField === "status" &&
              (sortOrder === "asc" ? (
                <ChevronUpIcon className='ml-1 h-4 w-4' />
              ) : (
                <ChevronDownIcon className='ml-1 h-4 w-4' />
              ))}
          </button>
        </th>
        <th
          scope='col'
          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
          <button
            onClick={() => onSort("type")}
            className='group inline-flex items-center hover:text-gray-700'>
            Type
            {sortField === "type" &&
              (sortOrder === "asc" ? (
                <ChevronUpIcon className='ml-1 h-4 w-4' />
              ) : (
                <ChevronDownIcon className='ml-1 h-4 w-4' />
              ))}
          </button>
        </th>
        <th
          scope='col'
          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
          <button
            onClick={() => onSort("placement")}
            className='group inline-flex items-center hover:text-gray-700'>
            Placement
            {sortField === "placement" &&
              (sortOrder === "asc" ? (
                <ChevronUpIcon className='ml-1 h-4 w-4' />
              ) : (
                <ChevronDownIcon className='ml-1 h-4 w-4' />
              ))}
          </button>
        </th>
        <th
          scope='col'
          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
          <button
            onClick={() => onSort("schedule.startDate")}
            className='group inline-flex items-center hover:text-gray-700'>
            Start Date
            {sortField === "schedule.startDate" &&
              (sortOrder === "asc" ? (
                <ChevronUpIcon className='ml-1 h-4 w-4' />
              ) : (
                <ChevronDownIcon className='ml-1 h-4 w-4' />
              ))}
          </button>
        </th>
        <th
          scope='col'
          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
          <button
            onClick={() => onSort("schedule.priority")}
            className='group inline-flex items-center hover:text-gray-700'>
            Priority
            {sortField === "schedule.priority" &&
              (sortOrder === "asc" ? (
                <ChevronUpIcon className='ml-1 h-4 w-4' />
              ) : (
                <ChevronDownIcon className='ml-1 h-4 w-4' />
              ))}
          </button>
        </th>
        <th
          scope='col'
          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
          Analytics
        </th>
        <th scope='col' className='relative px-6 py-3'>
          <span className='sr-only'>Actions</span>
        </th>
      </tr>
    </thead>
  );

  const renderTableRow = (campaign) => (
    <tr key={campaign.id} className='bg-white hover:bg-gray-50'>
      <td className='px-6 py-4 whitespace-nowrap'>
        <input
          type='checkbox'
          checked={selectedCampaigns.includes(campaign.id)}
          onChange={() => onSelectCampaign(campaign.id)}
          className='rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500'
        />
      </td>
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='flex items-center'>
          <div className='flex-shrink-0 h-10 w-10'>
            {campaign.images && campaign.images.length > 0 ? (
              <img
                className='h-10 w-10 rounded-lg object-cover'
                src={campaign.images[0].url}
                alt={campaign.images[0].alt || "Campaign image"}
              />
            ) : (
              <div className='h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center'>
                <EyeIcon className='h-5 w-5 text-gray-400' />
              </div>
            )}
          </div>
          <div className='ml-4'>
            <div className='text-sm font-medium text-gray-900'>{campaign.title}</div>
            <div className='text-sm text-gray-500'>{campaign.description}</div>
          </div>
        </div>
      </td>
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='flex items-center'>
          {getStatusIcon(campaign.settings?.campaignStatus)}
          <CampaignStatusBadge status={campaign.settings?.campaignStatus} />
        </div>
      </td>
      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize'>
        {campaign.settings?.campaignType?.replace("_", " ")}
      </td>
      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize'>
        {campaign.settings?.campaignPlacement?.replace("_", " ")}
      </td>
      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
        {formatDate(campaign.schedule?.startDate)}
      </td>
      <td className='px-6 py-4 whitespace-nowrap'>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(campaign.schedule?.priority)}`}>
          {campaign.schedule?.priority || "normal"}
        </span>
      </td>
      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
        <div className='text-xs'>
          <div>Impressions: {campaign.analytics?.impressions || 0}</div>
          <div>Clicks: {campaign.analytics?.clicks || 0}</div>
          <div>CTR: {campaign.analytics?.ctr || "0%"}</div>
        </div>
      </td>
      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
        <div className='flex items-center space-x-2'>
          <button
            onClick={() => onViewCampaign(campaign)}
            className='text-blue-600 hover:text-blue-900'
            title='View Campaign'>
            <EyeIcon className='h-4 w-4' />
          </button>
          <button
            onClick={() => onEditCampaign(campaign)}
            className='text-indigo-600 hover:text-indigo-900'
            title='Edit Campaign'>
            <PencilIcon className='h-4 w-4' />
          </button>
          <button
            onClick={() => onDuplicateCampaign(campaign)}
            className='text-green-600 hover:text-green-900'
            title='Duplicate Campaign'>
            <DocumentDuplicateIcon className='h-4 w-4' />
          </button>
          {campaign.settings?.campaignStatus === "active" ? (
            <button
              onClick={() => onDeactivateCampaign(campaign.id)}
              className='text-yellow-600 hover:text-yellow-900'
              title='Pause Campaign'>
              <PauseIcon className='h-4 w-4' />
            </button>
          ) : (
            <button
              onClick={() => onActivateCampaign(campaign.id)}
              className='text-green-600 hover:text-green-900'
              title='Activate Campaign'>
              <PlayIcon className='h-4 w-4' />
            </button>
          )}
          {campaign.settings?.campaignStatus === "pending_review" && (
            <button
              onClick={() => onApproveCampaign(campaign.id)}
              className='text-blue-600 hover:text-blue-900'
              title='Approve Campaign'>
              <CheckCircleIcon className='h-4 w-4' />
            </button>
          )}
          <button
            onClick={() => onDeleteCampaign(campaign.id)}
            className='text-red-600 hover:text-red-900'
            title='Delete Campaign'>
            <TrashIcon className='h-4 w-4' />
          </button>
        </div>
      </td>
    </tr>
  );

  const renderPagination = () => (
    <div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6'>
      <div className='flex-1 flex justify-between sm:hidden'>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'>
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'>
          Next
        </button>
      </div>
      <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
        <div>
          <p className='text-sm text-gray-700'>
            Showing page <span className='font-medium'>{currentPage}</span> of{" "}
            <span className='font-medium'>{totalPages}</span>
          </p>
        </div>
        <div>
          <nav
            className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'
            aria-label='Pagination'>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'>
              <span className='sr-only'>Previous</span>
              <ChevronUpIcon className='h-5 w-5 rotate-90' />
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    pageNum === currentPage
                      ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}>
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'>
              <span className='sr-only'>Next</span>
              <ChevronDownIcon className='h-5 w-5 rotate-90' />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

  if (viewMode === "grid") {
    return (
      <div className='space-y-4'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              isSelected={selectedCampaigns.includes(campaign.id)}
              onSelect={() => onSelectCampaign(campaign.id)}
              onEdit={() => onEditCampaign(campaign)}
              onDelete={() => onDeleteCampaign(campaign.id)}
              onDuplicate={() => onDuplicateCampaign(campaign)}
              onActivate={() => onActivateCampaign(campaign.id)}
              onDeactivate={() => onDeactivateCampaign(campaign.id)}
              onApprove={() => onApproveCampaign(campaign.id)}
              onView={() => onViewCampaign(campaign)}
            />
          ))}
        </div>
        {renderPagination()}
      </div>
    );
  }

  return (
    <div className='flex flex-col'>
      <div className='-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
        <div className='py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8'>
          <div className='shadow overflow-hidden border-b border-gray-200 sm:rounded-lg'>
            <table className='min-w-full divide-y divide-gray-200'>
              {renderTableHeader()}
              <tbody className='bg-white divide-y divide-gray-200'>
                {campaigns.map(renderTableRow)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {renderPagination()}
    </div>
  );
};

export default CampaignList;
