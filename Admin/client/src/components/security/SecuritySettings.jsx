import React, { useState } from "react";
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Save, 
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

const SecuritySettings = () => {
  const [activeTab, setActiveTab] = useState('authentication');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'authentication', name: 'Authentication', icon: <Lock className="w-4 h-4" /> },
    { id: 'mfa', name: 'Multi-Factor Auth', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'sessions', name: 'Session Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'threats', name: 'Threat Detection', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  const saveSettings = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security Settings</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configure security policies, MFA settings, and threat detection
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSaved(false)}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset to Defaults</span>
          </button>
          
          <button
            onClick={saveSettings}
            disabled={loading}
            className="btn-primary flex items-center space-x-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 dark:text-green-200 font-medium">
            Security settings saved successfully!
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-ideas-accent text-ideas-accent'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {tabs.find(t => t.id === activeTab)?.name} Settings
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Configuration options for {tabs.find(t => t.id === activeTab)?.name.toLowerCase()} will be implemented here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
