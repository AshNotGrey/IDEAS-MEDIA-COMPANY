import React from "react";
import { CalendarIcon, ClockIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

const CampaignScheduleEditor = ({ formData, errors, onChange }) => {
  const timeZones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' }
  ];

  const recurrenceTypes = [
    { value: 'none', label: 'No Recurrence' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const weekDays = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const handleScheduleChange = (field, value) => {
    onChange('schedule', {
      ...formData.schedule,
      [field]: value
    });
  };

  const handleRecurrenceChange = (field, value) => {
    onChange('schedule', {
      ...formData.schedule,
      recurrence: {
        ...formData.schedule?.recurrence,
        [field]: value
      }
    });
  };

  const addWeekDay = (day) => {
    const currentDays = formData.schedule?.recurrence?.weekDays || [];
    if (!currentDays.includes(day)) {
      handleRecurrenceChange('weekDays', [...currentDays, day]);
    }
  };

  const removeWeekDay = (day) => {
    const currentDays = formData.schedule?.recurrence?.weekDays || [];
    handleRecurrenceChange('weekDays', currentDays.filter(d => d !== day));
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="space-y-6">
      {/* Basic Scheduling */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Basic Scheduling</h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date & Time *
            </label>
            <div className="mt-1 relative">
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.schedule?.startDate || getCurrentDateTime()}
                onChange={(e) => handleScheduleChange('startDate', e.target.value)}
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.schedule?.startDate ? 'border-red-500' : ''
                }`}
              />
              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            {errors.schedule?.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.schedule.startDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date & Time
            </label>
            <div className="mt-1 relative">
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.schedule?.endDate || ''}
                onChange={(e) => handleScheduleChange('endDate', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                min={formData.schedule?.startDate || getCurrentDateTime()}
              />
              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700">
            Time Zone *
          </label>
          <div className="mt-1 relative">
            <select
              id="timeZone"
              name="timeZone"
              value={formData.schedule?.timeZone || 'UTC'}
              onChange={(e) => handleScheduleChange('timeZone', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {timeZones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <GlobeAltIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Recurrence Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Recurrence Settings</h3>
        
        <div>
          <label htmlFor="recurrenceType" className="block text-sm font-medium text-gray-700">
            Recurrence Type
          </label>
          <select
            id="recurrenceType"
            name="recurrenceType"
            value={formData.schedule?.recurrence?.type || 'none'}
            onChange={(e) => handleRecurrenceChange('type', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {recurrenceTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {formData.schedule?.recurrence?.type === 'weekly' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repeat on Days
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {weekDays.map((day) => {
                const isSelected = formData.schedule?.recurrence?.weekDays?.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => isSelected ? removeWeekDay(day.value) : addWeekDay(day.value)}
                    className={`p-2 text-sm rounded-md border transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {formData.schedule?.recurrence?.type !== 'none' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="interval" className="block text-sm font-medium text-gray-700">
                Interval
              </label>
              <input
                type="number"
                id="interval"
                name="interval"
                min="1"
                max="99"
                value={formData.schedule?.recurrence?.interval || 1}
                onChange={(e) => handleRecurrenceChange('interval', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.schedule?.recurrence?.type === 'daily' && 'Repeat every X days'}
                {formData.schedule?.recurrence?.type === 'weekly' && 'Repeat every X weeks'}
                {formData.schedule?.recurrence?.type === 'monthly' && 'Repeat every X months'}
                {formData.schedule?.recurrence?.type === 'yearly' && 'Repeat every X years'}
              </p>
            </div>

            <div>
              <label htmlFor="maxOccurrences" className="block text-sm font-medium text-gray-700">
                Max Occurrences
              </label>
              <input
                type="number"
                id="maxOccurrences"
                name="maxOccurrences"
                min="1"
                max="999"
                value={formData.schedule?.recurrence?.maxOccurrences || ''}
                onChange={(e) => handleRecurrenceChange('maxOccurrences', e.target.value ? parseInt(e.target.value) : null)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Unlimited"
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty for unlimited</p>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Scheduling */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Advanced Scheduling</h3>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.schedule?.isActive || false}
              onChange={(e) => handleScheduleChange('isActive', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Campaign is active</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.schedule?.isScheduled || false}
              onChange={(e) => handleScheduleChange('isScheduled', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Campaign is scheduled</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.schedule?.allowOverlap || false}
              onChange={(e) => handleScheduleChange('allowOverlap', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Allow overlapping with other campaigns</span>
          </label>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority Level
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.schedule?.priority || 'normal'}
            onChange={(e) => handleScheduleChange('priority', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Higher priority campaigns will be displayed first when multiple campaigns are eligible
          </p>
        </div>
      </div>
    </div>
  );
};

export default CampaignScheduleEditor;
