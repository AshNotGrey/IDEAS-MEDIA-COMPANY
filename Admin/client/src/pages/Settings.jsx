import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Search,
  Filter,
  Save,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import {
  useSettingsByCategory,
  useUpdateSetting,
  useResetSetting,
  useBulkUpdateSettings,
} from "../graphql/hooks/useSettings";
import SettingsSection from "../components/settings/SettingsSection";
import SettingsFilters from "../components/settings/SettingsFilters";
import SettingsSearch from "../components/settings/SettingsSearch";

const Settings = () => {
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSettings, setFilteredSettings] = useState([]);
  const [pendingChanges, setPendingChanges] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Hooks for data fetching and mutations
  const { settings, loading, error, refetch } = useSettingsByCategory(selectedCategory);
  const { updateSetting, loading: updating } = useUpdateSetting();
  const { resetSetting, loading: resetting } = useResetSetting();
  const { bulkUpdateSettings, loading: bulkUpdating } = useBulkUpdateSettings();

  // Categories configuration
  const categories = [
    { key: "general", label: "General Settings", icon: "⚙️" },
    { key: "business", label: "Business Information", icon: "🏢" },
    { key: "payments", label: "Payment Settings", icon: "💳" },
    { key: "email", label: "Email Configuration", icon: "📧" },
    { key: "whatsapp", label: "WhatsApp Settings", icon: "💬" },
    { key: "integrations", label: "Integrations", icon: "🔗" },
    { key: "theme", label: "Theme & Branding", icon: "🎨" },
    { key: "notifications", label: "Notifications", icon: "🔔" },
    { key: "security", label: "Security", icon: "🔐" },
    { key: "booking", label: "Booking Settings", icon: "📅" },
    { key: "analytics", label: "Analytics", icon: "📊" },
    { key: "maintenance", label: "Maintenance", icon: "🔧" },
  ];

  // Filter settings based on search term
  useEffect(() => {
    if (!settings) {
      setFilteredSettings([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredSettings(settings);
      return;
    }

    const filtered = settings.filter(
      (setting) =>
        setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        setting.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        setting.key.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredSettings(filtered);
  }, [settings, searchTerm]);

  // Handle setting value change
  const handleSettingChange = (key, value) => {
    setPendingChanges((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Save individual setting
  const handleSaveSetting = async (key, value, reason = "") => {
    try {
      await updateSetting({
        key,
        value,
        reason: reason || "Updated via admin panel",
      });

      // Remove from pending changes
      setPendingChanges((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });

      refetch();
    } catch (error) {
      console.error("Error saving setting:", error);
    }
  };

  // Reset setting to default
  const handleResetSetting = async (key, reason = "") => {
    try {
      await resetSetting(key, reason || "Reset to default");

      // Remove from pending changes
      setPendingChanges((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });

      refetch();
    } catch (error) {
      console.error("Error resetting setting:", error);
    }
  };

  // Save all pending changes
  const handleSaveAll = async () => {
    if (Object.keys(pendingChanges).length === 0) return;

    try {
      const inputs = Object.entries(pendingChanges).map(([key, value]) => ({
        key,
        value,
        reason: "Bulk update via admin panel",
      }));

      await bulkUpdateSettings(inputs);
      setPendingChanges({});
      refetch();
    } catch (error) {
      console.error("Error saving all settings:", error);
    }
  };

  // Discard all pending changes
  const handleDiscardChanges = () => {
    setPendingChanges({});
  };

  // Group settings by UI group
  const groupedSettings = filteredSettings.reduce((groups, setting) => {
    const group = setting.ui?.group || "Other";
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(setting);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <div className='flex items-center'>
            <AlertTriangle className='h-5 w-5 text-red-500 mr-2' />
            <span className='text-red-700'>Error loading settings: {error.message}</span>
          </div>
        </div>
      </div>
    );
  }

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <SettingsIcon className='h-8 w-8 text-gray-600 mr-3' />
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Settings</h1>
              <p className='text-gray-600 mt-1'>
                Configure your application settings and integrations
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className='flex items-center space-x-4'>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className='flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'>
              <Filter className='h-4 w-4 mr-2' />
              Filters
            </button>

            {hasPendingChanges && (
              <div className='flex items-center space-x-2'>
                <button
                  onClick={handleDiscardChanges}
                  className='flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'
                  disabled={bulkUpdating}>
                  <RotateCcw className='h-4 w-4 mr-2' />
                  Discard
                </button>
                <button
                  onClick={handleSaveAll}
                  className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
                  disabled={bulkUpdating}>
                  <Save className='h-4 w-4 mr-2' />
                  {bulkUpdating ? "Saving..." : `Save All (${Object.keys(pendingChanges).length})`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pending changes notification */}
        {hasPendingChanges && (
          <div className='mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4'>
            <div className='flex items-center'>
              <AlertTriangle className='h-5 w-5 text-amber-500 mr-2' />
              <span className='text-amber-800'>
                You have {Object.keys(pendingChanges).length} unsaved changes
              </span>
            </div>
          </div>
        )}
      </div>

      <div className='flex gap-6'>
        {/* Sidebar */}
        <div className='w-64 flex-shrink-0'>
          {/* Search */}
          <SettingsSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

          {/* Categories */}
          <div className='mt-6'>
            <h3 className='text-sm font-medium text-gray-900 uppercase tracking-wider mb-3'>
              Categories
            </h3>
            <nav className='space-y-1'>
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedCategory === category.key
                      ? "bg-blue-100 text-blue-900 border-r-2 border-blue-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}>
                  <span className='mr-3'>{category.icon}</span>
                  {category.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className='flex-1'>
          {/* Filters Panel */}
          {showFilters && (
            <div className='mb-6'>
              <SettingsFilters onClose={() => setShowFilters(false)} />
            </div>
          )}

          {/* Settings Sections */}
          <div className='space-y-8'>
            {Object.entries(groupedSettings).map(([group, groupSettings]) => (
              <SettingsSection
                key={group}
                title={group}
                settings={groupSettings}
                pendingChanges={pendingChanges}
                onSettingChange={handleSettingChange}
                onSaveSetting={handleSaveSetting}
                onResetSetting={handleResetSetting}
                updating={updating}
                resetting={resetting}
              />
            ))}

            {filteredSettings.length === 0 && (
              <div className='text-center py-12'>
                <SettingsIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>No settings found</h3>
                <p className='text-gray-500'>
                  {searchTerm
                    ? "Try adjusting your search terms or filters."
                    : "No settings available for this category."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
