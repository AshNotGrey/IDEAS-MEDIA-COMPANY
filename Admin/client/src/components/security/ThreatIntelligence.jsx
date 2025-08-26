import React, { useState } from "react";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Shield,
  Activity,
  RefreshCw,
  BrainCircuit,
  Cpu,
  Target,
  Zap,
  Play
} from "lucide-react";
import { 
  useThreatIntelligence, 
  useMLEngineStatus, 
  useMLInsights, 
  useToggleMLEngine 
} from '../../graphql/hooks/useThreatIntelligence.js';

const ThreatIntelligence = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // GraphQL hooks
  const { threatIntelligence, loading: threatLoading, error: threatError, refetch: refetchThreat } = useThreatIntelligence();
  const { mlEngine, loading: mlLoading, error: mlError, refetch: refetchML } = useMLEngineStatus();
  const { insights, loading: insightsLoading, error: insightsError, refetch: refetchInsights } = useMLInsights();
  const { toggleMLEngine, loading: toggleLoading, error: toggleError } = useToggleMLEngine();
  
  const loading = threatLoading || mlLoading || insightsLoading;
  const mlStatus = mlEngine.status;

  const tabs = [
    { id: "overview", name: "Overview", icon: <Brain className='w-4 h-4' /> },
    { id: "insights", name: "ML Insights", icon: <BrainCircuit className='w-4 h-4' /> },
    { id: "models", name: "ML Models", icon: <Cpu className='w-4 h-4' /> },
    { id: "trends", name: "Threat Trends", icon: <TrendingUp className='w-4 h-4' /> },
  ];

  const handleToggleMLStatus = async () => {
    try {
      await toggleMLEngine();
    } catch (error) {
      console.error('Failed to toggle ML engine:', error);
    }
  };

  const refreshData = async () => {
    await Promise.all([
      refetchThreat(),
      refetchML(),
      refetchInsights()
    ]);
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Threat Intelligence</h2>
          <p className='text-gray-600 dark:text-gray-400'>
            Advanced ML-powered threat detection and intelligent security insights
          </p>
        </div>

        <div className='flex items-center space-x-3'>
          <button
            onClick={refreshData}
            className='btn-secondary flex items-center space-x-2'
            disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ML Status Overview */}
      <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
            Machine Learning Engine
          </h3>
          <div className='flex items-center space-x-3'>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                mlStatus === "active"
                  ? "text-green-600 bg-green-50 border-green-200"
                  : "text-red-600 bg-red-50 border-red-200"
              }`}>
              {mlStatus === "active" ? "Active" : "Paused"}
            </span>
            <button
              onClick={handleToggleMLStatus}
              disabled={toggleLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mlStatus === "active"
                  ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300"
                  : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300"
              }`}>
              {mlStatus === "active" ? "Pause ML" : "Activate ML"}
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <div className='text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
            <div className='text-2xl font-bold text-blue-600 mb-2'>
              {mlEngine.predictionAccuracy || threatIntelligence.predictionAccuracy || 0}%
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-400'>ML Prediction Accuracy</div>
          </div>

          <div className='text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
            <div className='text-2xl font-bold text-green-600 mb-2'>
              {mlEngine.avgResponseTime || threatIntelligence.avgResponseTime || 0}s
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-400'>Avg Response Time</div>
          </div>

          <div className='text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
            <div className='text-2xl font-bold text-purple-600 mb-2'>
              {mlEngine.threatCoverage || threatIntelligence.threatCoverage || 0}%
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-400'>Threat Coverage</div>
          </div>

          <div className='text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
            <div className='text-2xl font-bold text-yellow-600 mb-2'>
              {mlEngine.falsePositives || threatIntelligence.falsePositives || 0}
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-400'>False Positives</div>
          </div>
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
            <Brain className='w-16 h-16 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
              {tabs.find((t) => t.id === activeTab)?.name} - Advanced Features
            </h3>
            <p className='text-gray-500 dark:text-gray-400'>
              {tabs.find((t) => t.id === activeTab)?.name === "overview" &&
                "ML-powered threat detection overview and real-time risk assessment"}
              {tabs.find((t) => t.id === activeTab)?.name === "insights" &&
                "Machine learning insights and behavioral analysis"}
              {tabs.find((t) => t.id === activeTab)?.name === "models" &&
                "ML model performance and training status"}
              {tabs.find((t) => t.id === activeTab)?.name === "trends" &&
                "Threat trend analysis and predictive analytics"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatIntelligence;
