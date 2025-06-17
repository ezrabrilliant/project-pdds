import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface ConnectionStatus {
  status: 'connecting' | 'connected' | 'error';
  message: string;
  timestamp: Date;
}

const ConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'connecting',
    message: 'Testing connection...',
    timestamp: new Date()
  });

  const testConnection = async () => {
    setConnectionStatus({
      status: 'connecting',
      message: 'Testing connection to backend...',
      timestamp: new Date()
    });

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://31.57.241.234:3001';
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConnectionStatus({
          status: 'connected',
          message: `✅ Connected successfully! Backend is healthy. ${JSON.stringify(data)}`,
          timestamp: new Date()
        });
      } else {
        setConnectionStatus({
          status: 'error',
          message: `❌ Backend responded with error: ${response.status} ${response.statusText}`,
          timestamp: new Date()
        });
      }
    } catch (error) {
      setConnectionStatus({
        status: 'error',
        message: `❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      });
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'connecting':
        return <RefreshCw className="animate-spin text-blue-500" size={24} />;
      case 'connected':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'error':
        return <XCircle className="text-red-500" size={24} />;
      default:
        return <AlertCircle className="text-yellow-500" size={24} />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus.status) {
      case 'connecting':
        return 'border-blue-500/50 bg-blue-500/10';
      case 'connected':
        return 'border-green-500/50 bg-green-500/10';
      case 'error':
        return 'border-red-500/50 bg-red-500/10';
      default:
        return 'border-yellow-500/50 bg-yellow-500/10';
    }
  };

  return (
    <div className={`max-w-2xl mx-auto p-6 rounded-xl border ${getStatusColor()}`}>
      <div className="flex items-center space-x-4 mb-4">
        {getStatusIcon()}
        <div>
          <h3 className="text-lg font-semibold text-white">Backend Connection Test</h3>
          <p className="text-sm text-slate-400">
            Testing connection to: {import.meta.env.VITE_API_URL || 'http://31.57.241.234:3001'}
          </p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <p className="text-sm text-slate-300 mb-2">Status:</p>
          <p className="text-white font-mono text-sm">{connectionStatus.message}</p>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4">
          <p className="text-sm text-slate-300 mb-2">Last checked:</p>
          <p className="text-white font-mono text-sm">{connectionStatus.timestamp.toLocaleString()}</p>
        </div>
        
        <button
          onClick={testConnection}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <RefreshCw size={16} />
          <span>Test Connection Again</span>
        </button>
        
        <div className="text-xs text-slate-400 space-y-1">
          <p><strong>Environment:</strong> {import.meta.env.VITE_NODE_ENV || 'development'}</p>
          <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'http://31.57.241.234:3001'}</p>
          <p><strong>App Name:</strong> {import.meta.env.VITE_APP_NAME || 'Netflix Recommendation System'}</p>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;
