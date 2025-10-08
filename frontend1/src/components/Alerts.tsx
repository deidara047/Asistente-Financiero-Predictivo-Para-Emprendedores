'use client';

import { useGlobalContext } from '@/context/GlobalContext';
import { Alert } from '@/types';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const Alerts: React.FC = () => {
  const { isAlertsOpen, toggleAlerts } = useGlobalContext();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/alerts', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setAlerts(data.alerts || []);
        } else {
          setAlerts([]);
        }
      } catch (err) {
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <div className="mb-6 flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg border-2 border-gray-100">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Cargando alertas...</p>
      </div>
    );
  }

  if (!isAlertsOpen || alerts.length === 0) {
    return null;
  }

  const severityConfig: Record<Alert['severity'], { bg: string; text: string; border: string; icon: string; badge: string; emoji: string; label: string }> = {
    critica: {
      bg: 'bg-gradient-to-r from-red-50 to-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      icon: 'text-red-500',
      badge: 'bg-red-500 text-white',
      emoji: '🚨',
      label: 'Crítica',
    },
    alta: {
      bg: 'bg-gradient-to-r from-orange-50 to-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-300',
      icon: 'text-orange-500',
      badge: 'bg-orange-500 text-white',
      emoji: '⚠️',
      label: 'Alta',
    },
    media: {
      bg: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
      icon: 'text-yellow-500',
      badge: 'bg-yellow-500 text-white',
      emoji: '⚡',
      label: 'Media',
    },
    baja: {
      bg: 'bg-gradient-to-r from-gray-50 to-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-300',
      icon: 'text-gray-500',
      badge: 'bg-gray-500 text-white',
      emoji: 'ℹ️',
      label: 'Baja',
    },
  };

  return (
    <div className="mb-6">
      <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 p-6 rounded-xl shadow-lg border-2 border-yellow-300 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200 rounded-full opacity-10 -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-200 rounded-full opacity-10 -ml-24 -mb-24"></div>
        <div className="flex items-start justify-between mb-6 relative z-10">
          <div className="flex items-center">
            <div className="bg-yellow-500 rounded-full p-3 mr-4 shadow-md flex-shrink-0">
              <FaExclamationTriangle className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                Alertas Financieras
                <span className="text-sm font-semibold bg-yellow-500 text-white px-3 py-1 rounded-full">
                  {alerts.length}
                </span>
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Revisa estas notificaciones importantes sobre tu actividad financiera
              </p>
            </div>
          </div>
          <button
            onClick={toggleAlerts}
            aria-label="Cerrar alertas"
            className="p-2 -mr-2 -mt-1 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <span className="text-4xl font-light leading-none">&times;</span>
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto space-y-3 relative z-10 pr-2">
          {alerts.map((alert, index) => {
            const config = severityConfig[alert.severity] || severityConfig.baja;
            return (
              <div
                key={index}
                className={`${config.bg} ${config.border} border-2 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
                style={{
                  animation: `slideIn 0.4s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`${config.badge} rounded-full p-3 shadow-md flex items-center justify-center`}>
                      <span className="text-2xl">{config.emoji}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`${config.badge} text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        {alert.type}
                      </span>
                    </div>
                    <p className={`${config.text} font-medium leading-relaxed`}>
                      {alert.message}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <FaExclamationTriangle className={`${config.icon}`} size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <style>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Alerts;