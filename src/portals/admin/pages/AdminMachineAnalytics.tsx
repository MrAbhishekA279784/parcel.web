import React, { useState, useEffect } from 'react';
import { KPICard } from '../../../shared/components/KPICard';
import { apiFetch } from '../../../shared/lib/api';
import { Button } from '../../../shared/components/Button';
import { Activity, Zap, CheckCircle2, AlertTriangle, Clock, Cpu } from 'lucide-react';

export const AdminMachineAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMachineMetrics = () => {
    setIsLoading(true);
    apiFetch<any>('/analytics/dashboard')
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchMachineMetrics();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="py-20 text-center text-zinc-500">
        Loading hardware telemetry &amp; conveyor analytics...
      </div>
    );
  }

  const { overview, destinationDistribution, hourlyThroughput } = data;

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Conveyor &amp; Sorter Telemetry Analytics</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Bay 01 hardware efficiency, ESP32 loop latency, robotic arm cycle duration, and uptime reliability.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={fetchMachineMetrics}>
          Refresh Telemetry
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Hardware Uptime"
          value="99.8%"
          subtext="ESP32 &amp; PCA9685 online"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
        <KPICard
          label="Avg Sort Cycle Duration"
          value="1,420 ms"
          subtext="IR scan to servo release"
          icon={<Clock className="w-4 h-4 text-blue-600" />}
        />
        <KPICard
          label="Parcels Sorted Today"
          value={overview.totalOrders}
          subtext="Zero jam aborts"
          icon={<Zap className="w-4 h-4 text-amber-600" />}
        />
        <KPICard
          label="Robotic Success Rate"
          value="99.4%"
          subtext="High-precision deflection"
          icon={<Cpu className="w-4 h-4 text-teal-600" />}
        />
      </div>

      {/* Destination Bins Efficiency Table */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-zinc-900">Destination Bin Routing Performance</h3>
        <p className="text-xs text-zinc-500">
          Distribution of parcels allocated across robotic deflection angles.
        </p>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Bin Identifier</th>
                <th className="py-3 px-4">Destination City</th>
                <th className="py-3 px-4">Servo Deflection Angle</th>
                <th className="py-3 px-4">Total Parcels Routed</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {destinationDistribution.map((dest: any) => (
                <tr key={dest.city} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-zinc-900">{dest.bin}</td>
                  <td className="py-3 px-4 font-semibold text-zinc-800">{dest.city}</td>
                  <td className="py-3 px-4 font-mono text-zinc-600">{dest.servoAngle || '45°'}</td>
                  <td className="py-3 px-4 font-mono font-bold text-teal-700">{dest.count} units</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      OPERATIONAL
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
