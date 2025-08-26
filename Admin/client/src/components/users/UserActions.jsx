import React, { useState } from "react";
import {
  Download,
  Upload,
  ShieldCheck,
  ShieldX,
  Trash2,
  MoreVertical,
  FileText,
  Mail,
  Lock,
  Unlock,
} from "lucide-react";

const UserActions = ({ selectedUsers = [], onBulkAction, disabled = false }) => {
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const selectedCount = selectedUsers.length;

  const bulkActions = [
    {
      id: "activate",
      label: `Activate ${selectedCount} users`,
      icon: ShieldCheck,
      color: "text-green-600 dark:text-green-400",
      disabled: selectedCount === 0,
    },
    {
      id: "deactivate",
      label: `Deactivate ${selectedCount} users`,
      icon: ShieldX,
      color: "text-orange-600 dark:text-orange-400",
      disabled: selectedCount === 0,
    },
    {
      id: "unlock",
      label: `Unlock ${selectedCount} accounts`,
      icon: Unlock,
      color: "text-blue-600 dark:text-blue-400",
      disabled: selectedCount === 0,
    },
    {
      id: "email",
      label: `Send email to ${selectedCount} users`,
      icon: Mail,
      color: "text-purple-600 dark:text-purple-400",
      disabled: selectedCount === 0,
    },
    {
      id: "delete",
      label: `Delete ${selectedCount} users`,
      icon: Trash2,
      color: "text-red-600 dark:text-red-400",
      disabled: selectedCount === 0,
      dangerous: true,
    },
  ];

  const handleBulkAction = (actionId) => {
    if (disabled || selectedCount === 0) return;
    onBulkAction(actionId);
    setShowBulkMenu(false);
  };

  const handleExportUsers = () => {
    // TODO: Implement user export functionality
    console.log("Exporting users...");
  };

  const handleImportUsers = () => {
    // TODO: Implement user import functionality
    console.log("Importing users...");
  };

  return (
    <div className='flex items-center gap-3'>
      {/* Export/Import Actions */}
      <div className='flex items-center gap-2'>
        <button
          onClick={handleExportUsers}
          disabled={disabled}
          className='btn-secondary flex items-center gap-2 disabled:opacity-50'>
          <Download size={16} />
          Export
        </button>

        <button
          onClick={handleImportUsers}
          disabled={disabled}
          className='btn-secondary flex items-center gap-2 disabled:opacity-50'>
          <Upload size={16} />
          Import
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <div className='relative'>
          <button
            onClick={() => setShowBulkMenu(!showBulkMenu)}
            disabled={disabled}
            className='btn-primary flex items-center gap-2 disabled:opacity-50'>
            <span>Actions ({selectedCount})</span>
            <MoreVertical size={16} />
          </button>

          {/* Bulk Actions Dropdown */}
          {showBulkMenu && (
            <>
              {/* Backdrop */}
              <div className='fixed inset-0 z-10' onClick={() => setShowBulkMenu(false)} />

              {/* Menu */}
              <div className='absolute right-0 top-full mt-2 w-64 bg-white dark:bg-ideas-darkInput rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20'>
                <div className='p-2'>
                  <div className='text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2'>
                    Bulk Actions
                  </div>

                  {bulkActions.map((action) => {
                    const Icon = action.icon;

                    return (
                      <button
                        key={action.id}
                        onClick={() => handleBulkAction(action.id)}
                        disabled={action.disabled || disabled}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md
                          transition-colors duration-150
                          ${
                            action.disabled || disabled
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-gray-100 dark:hover:bg-gray-700"
                          }
                          ${
                            action.dangerous
                              ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              : action.color
                          }
                        `}>
                        <Icon size={16} />
                        {action.label}
                      </button>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className='border-t border-gray-200 dark:border-gray-700' />

                {/* Info */}
                <div className='p-3 text-xs text-gray-500 dark:text-gray-400'>
                  {selectedCount === 1 ? "1 user selected" : `${selectedCount} users selected`}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Quick Actions for No Selection */}
      {selectedCount === 0 && (
        <div className='text-sm text-gray-500 dark:text-gray-400'>
          Select users to perform bulk actions
        </div>
      )}
    </div>
  );
};

export default UserActions;
