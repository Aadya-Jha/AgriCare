import React, { useState } from 'react';
import { AlertTriangle, Bell, CheckCircle, Clock, X, TrendingDown, Droplets, Bug } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

interface Alert {
  id: string;
  type: 'urgent' | 'warning' | 'info';
  category: 'pest' | 'irrigation' | 'weather' | 'health';
  title: string;
  message: string;
  timestamp: string;
  location?: string;
  isRead: boolean;
}

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'urgent',
      category: 'pest',
      title: 'Pest Detection Alert',
      message: 'High pest activity detected in North Field. Immediate attention required.',
      timestamp: '2024-11-20T10:30:00Z',
      location: 'North Field - Zone A',
      isRead: false
    },
    {
      id: '2',
      type: 'warning',
      category: 'irrigation',
      title: 'Low Soil Moisture',
      message: 'Soil moisture levels have dropped below optimal range in South Field.',
      timestamp: '2024-11-20T08:15:00Z',
      location: 'South Field - Zone B',
      isRead: false
    },
    {
      id: '3',
      type: 'info',
      category: 'weather',
      title: 'Weather Update',
      message: 'Rain expected in the next 48 hours. Adjust irrigation schedule accordingly.',
      timestamp: '2024-11-19T16:45:00Z',
      location: 'All Fields',
      isRead: true
    },
    {
      id: '4',
      type: 'warning',
      category: 'health',
      title: 'Crop Health Decline',
      message: 'NDVI values showing decline in East Field. Monitor closely for disease symptoms.',
      timestamp: '2024-11-19T14:20:00Z',
      location: 'East Field - Zone C',
      isRead: true
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');

  const getAlertIcon = (category: string) => {
    switch (category) {
      case 'pest': return <Bug className="h-5 w-5" />;
      case 'irrigation': return <Droplets className="h-5 w-5" />;
      case 'weather': return <Clock className="h-5 w-5" />;
      case 'health': return <TrendingDown className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getAlertColors = (type: string, isRead: boolean) => {
    const opacity = isRead ? 'opacity-75' : '';
    switch (type) {
      case 'urgent': return `bg-red-50 border-red-200 text-red-800 ${opacity}`;
      case 'warning': return `bg-yellow-50 border-yellow-200 text-yellow-800 ${opacity}`;
      case 'info': return `bg-blue-50 border-blue-200 text-blue-800 ${opacity}`;
      default: return `bg-gray-50 border-gray-200 text-gray-800 ${opacity}`;
    }
  };

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isRead: true } : alert
    ));
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.isRead;
    if (filter === 'urgent') return alert.type === 'urgent';
    return true;
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatedBackground variant="alerts">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-heading font-semibold flex items-center space-x-3">
                <Bell className="h-7 w-7" style={{color: 'var(--agricare-primary)'}} />
                <span style={{color: 'var(--agricare-primary)'}}>Alerts & Notifications</span>
              </h1>
              <p className="text-gray-600 mt-2">Monitor and manage farm alerts and notifications</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 rounded-full text-sm font-medium" 
                   style={{backgroundColor: 'var(--agricare-light)', color: 'var(--agricare-primary)'}}>
                {alerts.filter(a => !a.isRead).length} Unread
              </div>
            </div>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex space-x-2 mt-4">
            {(['all', 'unread', 'urgent'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filter === filterType 
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: filter === filterType ? 'var(--agricare-primary)' : 'transparent'
                }}
              >
                {filterType} ({filterType === 'all' ? alerts.length : 
                 filterType === 'unread' ? alerts.filter(a => !a.isRead).length :
                 alerts.filter(a => a.type === 'urgent').length})
              </button>
            ))}
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts to show</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'All systems are running smoothly!' 
                  : `No ${filter} alerts at the moment.`}
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white rounded-lg shadow-sm border p-4 transition-all duration-200 ${
                  getAlertColors(alert.type, alert.isRead)
                } hover:shadow-md`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getAlertIcon(alert.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                        {!alert.isRead && (
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">{alert.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatTimestamp(alert.timestamp)}</span>
                        {alert.location && (
                          <span className="flex items-center space-x-1">
                            <span>📍</span>
                            <span>{alert.location}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!alert.isRead && (
                      <button
                        onClick={() => markAsRead(alert.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Mark as read"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Dismiss alert"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AnimatedBackground>
  );
};
