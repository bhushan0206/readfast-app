import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Shield, Activity, Settings, Database, Users, FileText } from 'lucide-react';
import SecurityDashboard from '../components/SecurityDashboard';
import { useAuthStore } from '../../../store/authStore';

type AdminTab = 'security' | 'monitoring' | 'users' | 'content' | 'settings';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('security');
  const { user } = useAuthStore();

  // Simple admin check - in production, this should be a proper role-based check
  const isAdmin = import.meta.env.DEV || user?.email?.includes('admin');

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const tabs = [
    { id: 'security' as AdminTab, label: 'Security', icon: Shield },
    { id: 'monitoring' as AdminTab, label: 'Monitoring', icon: Activity },
    { id: 'users' as AdminTab, label: 'Users', icon: Users },
    { id: 'content' as AdminTab, label: 'Content', icon: FileText },
    { id: 'settings' as AdminTab, label: 'Settings', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'security':
        return <SecurityDashboard />;
      case 'monitoring':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Application Monitoring
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Monitoring dashboard content would go here. In production, this would integrate 
              with services like DataDog, New Relic, or Grafana.
            </p>
          </div>
        );
      case 'users':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              User Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              User management interface would go here. Features would include user listings,
              role management, and user activity monitoring.
            </p>
          </div>
        );
      case 'content':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Content Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Content management interface would go here. Features would include content
              moderation, bulk operations, and content analytics.
            </p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              System Settings
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              System configuration interface would go here. Features would include
              environment settings, feature flags, and system maintenance tools.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Database className="w-8 h-8" />
            <span>Admin Dashboard</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            System administration and monitoring interface
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {renderTabContent()}
        </div>

        {/* Development Warning */}
        {import.meta.env.DEV && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-600" />
              <h4 className="font-medium text-red-800 dark:text-red-200">Development Mode Warning</h4>
            </div>
            <p className="text-red-700 dark:text-red-300 text-sm mt-1">
              This admin interface is accessible in development mode for testing purposes. 
              In production, proper authentication, authorization, and access controls must be implemented.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;