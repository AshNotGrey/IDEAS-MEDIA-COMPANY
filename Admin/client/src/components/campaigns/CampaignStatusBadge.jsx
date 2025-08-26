import React from "react";

const CampaignStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "draft":
        return {
          label: "Draft",
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
      case "pending_review":
        return {
          label: "Pending Review",
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      case "approved":
        return {
          label: "Approved",
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "active":
        return {
          label: "Active",
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case "paused":
        return {
          label: "Paused",
          className: "bg-orange-100 text-orange-800 border-orange-200",
        };
      case "scheduled":
        return {
          label: "Scheduled",
          className: "bg-purple-100 text-purple-800 border-purple-200",
        };
      case "completed":
        return {
          label: "Completed",
          className: "bg-purple-100 text-purple-800 border-purple-200",
        };
      case "rejected":
        return {
          label: "Rejected",
          className: "bg-red-100 text-red-800 border-red-200",
        };
      default:
        return {
          label: status || "Unknown",
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
};

export default CampaignStatusBadge;
