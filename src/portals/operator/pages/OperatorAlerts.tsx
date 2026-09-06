import React, { useState, useEffect } from 'react';
import { AlertItem } from '../../../types';
import { apiFetch } from '../../../shared/lib/api';
import { formatDateTime } from '../../../shared/lib/formatters';
import { Button } from '../../../shared/components/Button';
import { EmptyState } from '../../../shared/components/EmptyState';
import { useToast } from '../../../shared/store/toastContext';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

export const OperatorAlerts: React.FC = () => {
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = () => {
    setIsLoading(true);
    apiFetch<AlertItem[]>('/warehouse/alerts')
      .then(setAlerts)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolveAlert = async (id: string) => {
    try {
      await apiFetch(`/warehouse/alerts/${id}/resolve`, { method: 'POST' });
      showToast('Alert resolved', 'success');
      fetchAlerts();
    } catch (err: any) {
      showToast(err.message || 'Failed to resolve', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200/80">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">System &amp; Hardware Alerts</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time warnings from ESP32 telemetry, conveyor sensors, and low inventory thresholds.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchAlerts}>
          Refresh
        </Button>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-12">
          <EmptyState
            icon={<CheckCircle2 className="w-10 h-10 text-emerald-500 stroke-1" />}
            title="All systems operational"
            message="No active warnings or critical safety faults detected."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => {
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 text-xs transition-all ${
                  isCritical
                    ? 'bg-red-50 border-red-200 text-red-950'
                    : isWarning
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isCritical && <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
                  {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
                  {!isCritical && !isWarning && <Info className="w-5 h-5 text-zinc-500 shrink-0" />}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{alert.type}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-white/70 border">
                        {alert.severity}
                      </span>
                    </div>
                    <p className="mt-0.5">{alert.message}</p>
                    <span className="text-[10px] opacity-70 font-mono mt-1 block">
                      Triggered: {formatDateTime(alert.created_at)}
                    </span>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleResolveAlert(alert.id)}
                  className="shrink-0 bg-white"
                >
                  Mark Resolved
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
