import React from "react";
import { MapPinIcon, UsersIcon, ChartBarIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

const CampaignTargetingEditor = ({ formData, errors, onChange }) => {
  const ageRanges = [
    { value: '13-17', label: '13-17 years' },
    { value: '18-24', label: '18-24 years' },
    { value: '25-34', label: '25-34 years' },
    { value: '35-44', label: '35-44 years' },
    { value: '45-54', label: '45-54 years' },
    { value: '55-64', label: '55-64 years' },
    { value: '65+', label: '65+ years' }
  ];

  const genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'all', label: 'All Genders' }
  ];

  const interests = [
    'Photography', 'Travel', 'Fashion', 'Technology', 'Sports', 'Music', 'Food', 'Art',
    'Business', 'Education', 'Health', 'Fitness', 'Entertainment', 'Automotive', 'Real Estate',
    'Finance', 'Politics', 'Science', 'Nature', 'Pets', 'Gaming', 'Books', 'Movies'
  ];

  const deviceTypes = [
    { value: 'desktop', label: 'Desktop' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'tablet', label: 'Tablet' },
    { value: 'all', label: 'All Devices' }
  ];

  const handleTargetingChange = (field, value) => {
    onChange('targeting', {
      ...formData.targeting,
      [field]: value
    });
  };

  const addInterest = (interest) => {
    const currentInterests = formData.targeting?.interests || [];
    if (!currentInterests.includes(interest)) {
      handleTargetingChange('interests', [...currentInterests, interest]);
    }
  };

  const removeInterest = (interest) => {
    const currentInterests = formData.targeting?.interests || [];
    handleTargetingChange('interests', currentInterests.filter(i => i !== interest));
  };

  const addLocation = () => {
    const newLocation = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'country',
      value: '',
      radius: null
    };
    const currentLocations = formData.targeting?.locations || [];
    handleTargetingChange('locations', [...currentLocations, newLocation]);
  };

  const updateLocation = (locationId, field, value) => {
    const currentLocations = formData.targeting?.locations || [];
    const updatedLocations = currentLocations.map(loc => 
      loc.id === locationId ? { ...loc, [field]: value } : loc
    );
    handleTargetingChange('locations', updatedLocations);
  };

  const removeLocation = (locationId) => {
    const currentLocations = formData.targeting?.locations || [];
    handleTargetingChange('locations', currentLocations.filter(loc => loc.id !== locationId));
  };

  const addBehavioralRule = () => {
    const newRule = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'page_views',
      condition: 'greater_than',
      value: '',
      timeframe: '30d'
    };
    const currentRules = formData.targeting?.behavioralRules || [];
    handleTargetingChange('behavioralRules', [...currentRules, newRule]);
  };

  const updateBehavioralRule = (ruleId, field, value) => {
    const currentRules = formData.targeting?.behavioralRules || [];
    const updatedRules = currentRules.map(rule => 
      rule.id === ruleId ? { ...rule, [field]: value } : rule
    );
    handleTargetingChange('behavioralRules', updatedRules);
  };

  const removeBehavioralRule = (ruleId) => {
    const currentRules = formData.targeting?.behavioralRules || [];
    handleTargetingChange('behavioralRules', currentRules.filter(rule => rule.id !== ruleId));
  };

  return (
    <div className="space-y-6">
      {/* Demographics */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <UsersIcon className="h-5 w-5 mr-2" />
          Demographics
        </h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age Ranges
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {ageRanges.map((range) => {
                const isSelected = formData.targeting?.ageRanges?.includes(range.value);
                return (
                  <label key={range.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isSelected || false}
                      onChange={(e) => {
                        const currentRanges = formData.targeting?.ageRanges || [];
                        if (e.target.checked) {
                          handleTargetingChange('ageRanges', [...currentRanges, range.value]);
                        } else {
                          handleTargetingChange('ageRanges', currentRanges.filter(r => r !== range.value));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{range.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <div className="space-y-2">
              {genders.map((gender) => {
                const isSelected = formData.targeting?.gender === gender.value;
                return (
                  <label key={gender.value} className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value={gender.value}
                      checked={isSelected}
                      onChange={(e) => handleTargetingChange('gender', e.target.value)}
                      className="border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{gender.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="incomeRange" className="block text-sm font-medium text-gray-700">
            Income Range
          </label>
          <select
            id="incomeRange"
            name="incomeRange"
            value={formData.targeting?.incomeRange || 'all'}
            onChange={(e) => handleTargetingChange('incomeRange', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">All Income Levels</option>
            <option value="low">Low Income ($0 - $50k)</option>
            <option value="medium">Medium Income ($50k - $100k)</option>
            <option value="high">High Income ($100k - $200k)</option>
            <option value="very_high">Very High Income ($200k+)</option>
          </select>
        </div>
      </div>

      {/* Geographic Targeting */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <MapPinIcon className="h-5 w-5 mr-2" />
          Geographic Targeting
        </h3>
        
        <div className="space-y-3">
          {formData.targeting?.locations?.map((location) => (
            <div key={location.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <div className="flex-1 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <select
                  value={location.type}
                  onChange={(e) => updateLocation(location.id, 'type', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="country">Country</option>
                  <option value="state">State/Province</option>
                  <option value="city">City</option>
                  <option value="zip">ZIP/Postal Code</option>
                </select>
                <input
                  type="text"
                  value={location.value}
                  onChange={(e) => updateLocation(location.id, 'value', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter location"
                />
                {location.type === 'city' && (
                  <input
                    type="number"
                    value={location.radius || ''}
                    onChange={(e) => updateLocation(location.id, 'radius', e.target.value ? parseInt(e.target.value) : null)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Radius (miles)"
                    min="1"
                    max="100"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => removeLocation(location.id)}
                className="text-red-600 hover:text-red-800"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addLocation}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Location
        </button>

        {(!formData.targeting?.locations || formData.targeting.locations.length === 0) && (
          <p className="text-sm text-gray-500 text-center py-4">
            No locations specified. Campaign will target all locations.
          </p>
        )}
      </div>

      {/* Interests & Behaviors */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2" />
          Interests & Behaviors
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interests
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 max-h-32 overflow-y-auto">
            {interests.map((interest) => {
              const isSelected = formData.targeting?.interests?.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => isSelected ? removeInterest(interest) : addInterest(interest)}
                  className={`p-2 text-sm rounded-md border transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="deviceType" className="block text-sm font-medium text-gray-700">
            Device Type
          </label>
          <select
            id="deviceType"
            name="deviceType"
            value={formData.targeting?.deviceType || 'all'}
            onChange={(e) => handleTargetingChange('deviceType', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {deviceTypes.map((device) => (
              <option key={device.value} value={device.value}>
                {device.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Behavioral Targeting */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Behavioral Targeting</h3>
        
        <div className="space-y-3">
          {formData.targeting?.behavioralRules?.map((rule) => (
            <div key={rule.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <div className="flex-1 grid grid-cols-1 gap-3 sm:grid-cols-4">
                <select
                  value={rule.type}
                  onChange={(e) => updateBehavioralRule(rule.id, 'type', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="page_views">Page Views</option>
                  <option value="time_spent">Time Spent</option>
                  <option value="clicks">Clicks</option>
                  <option value="conversions">Conversions</option>
                  <option value="purchases">Purchases</option>
                </select>
                <select
                  value={rule.condition}
                  onChange={(e) => updateBehavioralRule(rule.id, 'condition', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="greater_than">Greater than</option>
                  <option value="less_than">Less than</option>
                  <option value="equals">Equals</option>
                  <option value="contains">Contains</option>
                </select>
                <input
                  type="text"
                  value={rule.value}
                  onChange={(e) => updateBehavioralRule(rule.id, 'value', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Value"
                />
                <select
                  value={rule.timeframe}
                  onChange={(e) => updateBehavioralRule(rule.id, 'timeframe', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => removeBehavioralRule(rule.id)}
                className="text-red-600 hover:text-red-800"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addBehavioralRule}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Behavioral Rule
        </button>

        {(!formData.targeting?.behavioralRules || formData.targeting.behavioralRules.length === 0) && (
          <p className="text-sm text-gray-500 text-center py-4">
            No behavioral rules specified. Campaign will target all users.
          </p>
        )}
      </div>

      {/* Advanced Targeting */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Advanced Targeting</h3>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.targeting?.excludeExistingCustomers || false}
              onChange={(e) => handleTargetingChange('excludeExistingCustomers', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Exclude existing customers</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.targeting?.excludeSubscribers || false}
              onChange={(e) => handleTargetingChange('excludeSubscribers', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Exclude email subscribers</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.targeting?.retargeting || false}
              onChange={(e) => handleTargetingChange('retargeting', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Enable retargeting</span>
          </label>
        </div>

        <div>
          <label htmlFor="maxFrequency" className="block text-sm font-medium text-gray-700">
            Max Frequency (per user)
          </label>
          <input
            type="number"
            id="maxFrequency"
            name="maxFrequency"
            min="1"
            max="100"
            value={formData.targeting?.maxFrequency || ''}
            onChange={(e) => handleTargetingChange('maxFrequency', e.target.value ? parseInt(e.target.value) : null)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Unlimited"
          />
          <p className="mt-1 text-xs text-gray-500">Maximum times a user can see this campaign</p>
        </div>
      </div>
    </div>
  );
};

export default CampaignTargetingEditor;
