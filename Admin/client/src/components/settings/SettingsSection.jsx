import React from "react";
import { Save, RotateCcw, AlertTriangle, Eye, EyeOff, History } from "lucide-react";
import SettingField from "./SettingField";

const SettingsSection = ({
  title,
  settings,
  pendingChanges,
  onSettingChange,
  onSaveSetting,
  onResetSetting,
  updating,
  resetting,
}) => {
  if (!settings || settings.length === 0) return null;

  // Sort settings by UI order
  const sortedSettings = [...settings].sort((a, b) => {
    const orderA = a.ui?.order || 0;
    const orderB = b.ui?.order || 0;
    return orderA - orderB || a.name.localeCompare(b.name);
  });

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
      {/* Section Header */}
      <div className='px-6 py-4 border-b border-gray-200'>
        <h3 className='text-lg font-medium text-gray-900'>{title}</h3>
      </div>

      {/* Settings List */}
      <div className='p-6 space-y-6'>
        {sortedSettings.map((setting) => {
          const hasPendingChange = pendingChanges.hasOwnProperty(setting.key);
          const currentValue = hasPendingChange ? pendingChanges[setting.key] : setting.value;
          const isModified = setting.isModified || hasPendingChange;

          return (
            <div
              key={setting.key}
              className={`p-4 rounded-lg border transition-colors ${
                hasPendingChange
                  ? "border-amber-200 bg-amber-50"
                  : isModified
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-200 bg-gray-50"
              }`}>
              {/* Setting Header */}
              <div className='flex items-start justify-between mb-3'>
                <div className='flex-1'>
                  <div className='flex items-center mb-1'>
                    <label className='text-sm font-medium text-gray-900'>{setting.name}</label>

                    {/* Security badge */}
                    {setting.isSecret && (
                      <span className='ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800'>
                        <Eye className='h-3 w-3 mr-1' />
                        Secret
                      </span>
                    )}

                    {/* Modified badge */}
                    {isModified && (
                      <span className='ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'>
                        Modified
                      </span>
                    )}

                    {/* Restart required badge */}
                    {setting.requiresRestart && (
                      <span className='ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800'>
                        <AlertTriangle className='h-3 w-3 mr-1' />
                        Restart Required
                      </span>
                    )}
                  </div>

                  {setting.description && (
                    <p className='text-sm text-gray-600 mb-2'>{setting.description}</p>
                  )}

                  {setting.ui?.helpText && (
                    <p className='text-xs text-gray-500'>{setting.ui.helpText}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className='flex items-center space-x-2 ml-4'>
                  {/* History Button */}
                  {setting.hasHistory && (
                    <button
                      className='p-1 text-gray-400 hover:text-gray-600 rounded'
                      title='View History'>
                      <History className='h-4 w-4' />
                    </button>
                  )}

                  {/* Reset Button */}
                  {isModified && (
                    <button
                      onClick={() => onResetSetting(setting.key)}
                      disabled={resetting}
                      className='p-1 text-gray-400 hover:text-red-600 rounded disabled:opacity-50'
                      title='Reset to Default'>
                      <RotateCcw className='h-4 w-4' />
                    </button>
                  )}

                  {/* Save Button */}
                  {hasPendingChange && (
                    <button
                      onClick={() => onSaveSetting(setting.key, currentValue)}
                      disabled={updating}
                      className='p-1 text-gray-400 hover:text-green-600 rounded disabled:opacity-50'
                      title='Save Changes'>
                      <Save className='h-4 w-4' />
                    </button>
                  )}
                </div>
              </div>

              {/* Setting Field */}
              <SettingField
                setting={setting}
                value={currentValue}
                onChange={(value) => onSettingChange(setting.key, value)}
                disabled={setting.ui?.readonly || updating || resetting}
              />

              {/* Setting Info */}
              <div className='mt-3 flex items-center justify-between text-xs text-gray-500'>
                <div className='flex items-center space-x-4'>
                  <span>Key: {setting.key}</span>
                  {setting.accessLevel !== "admin" && <span>Access: {setting.accessLevel}</span>}
                  {setting.environment !== "all" && <span>Environment: {setting.environment}</span>}
                </div>

                {setting.lastModifiedBy && (
                  <span>Last modified by {setting.lastModifiedBy.username}</span>
                )}
              </div>

              {/* Default Value Info */}
              {setting.defaultValue !== undefined && setting.defaultValue !== currentValue && (
                <div className='mt-2 text-xs text-gray-500'>
                  <span className='font-medium'>Default:</span>{" "}
                  {setting.isSecret ? "***HIDDEN***" : JSON.stringify(setting.defaultValue)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SettingsSection;
