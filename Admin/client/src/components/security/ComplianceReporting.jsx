import React, { useState } from "react";
import { Shield, AlertTriangle, FileText, Target, BarChart3 } from "lucide-react";

const ComplianceReporting = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", name: "Compliance Overview", icon: <Shield className='w-4 h-4' /> },
    { id: "incidents", name: "Security Incidents", icon: <AlertTriangle className='w-4 h-4' /> },
    { id: "reports", name: "Compliance Reports", icon: <FileText className='w-4 h-4' /> },
    { id: "regulations", name: "Regulatory Requirements", icon: <Target className='w-4 h-4' /> },
    { id: "analytics", name: "Compliance Analytics", icon: <BarChart3 className='w-4 h-4' /> },
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Compliance & Reporting
          </h2>
          <p className='text-gray-600 dark:text-gray-400'>
            Monitor compliance status, track security incidents, and generate regulatory reports
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
        <div className='border-b border-gray-200 dark:border-gray-700'>
          <nav className='flex space-x-8 px-6' aria-label='Tabs'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors
                  ${
                    activeTab === tab.id
                      ? "border-ideas-accent text-ideas-accent"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                  }
                `}>
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className='p-6'>
          <div className='text-center py-12'>
            <Shield className='w-16 h-16 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
              {tabs.find((t) => t.id === activeTab)?.name} - Compliance Features
            </h3>
            <p className='text-gray-500 dark:text-gray-400'>
              Compliance and reporting features coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceReporting;
