import React, { useState } from 'react';
import { apiFetch } from '../../../shared/lib/api';
import { Button } from '../../../shared/components/Button';
import { useToast } from '../../../shared/store/toastContext';
import { Settings, RotateCcw, Trash2, Cpu, Wifi, Shield, Database } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { showToast } = useToast();
  const [isResetting, setIsResetting] = useState(false);
  const [espIp, setEspIp] = useState('192.168.1.145');
  const [cameraUrl, setCameraUrl] = useState('http://192.168.1.145:81/stream');

  const handleResetDemo = async () => {
    if (!confirm('This will wipe all active orders and restore the system to its initial pristine demo state. Continue?')) {
      return;
    }
    setIsResetting(true);
    try {
      await apiFetch('/system/reset-demo', { method: 'POST' });
      showToast('System database reset to initial demo state!', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      showToast(err.message || 'Reset failed', 'error');
      setIsResetting(false);
    }
  };

  const handleSaveHardware = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Hardware IP credentials updated', 'success');
  };

  return (
    <div className="max-w-4xl space-y-8 pb-16">
      <div className="pb-4 border-b border-zinc-200/80">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">System Settings &amp; Data Operations</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Database maintenance, hardware simulator configuration, and demo state restoration.
        </p>
      </div>

      {/* Hardware Configuration */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">ESP32 &amp; Sensor Node Config</h3>
            <p className="text-xs text-zinc-500">Telemetry endpoints for Bay 01 hardware controller.</p>
          </div>
        </div>

        <form onSubmit={handleSaveHardware} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-zinc-600 font-medium">ESP32 Microcontroller IP</label>
              <input
                type="text"
                value={espIp}
                onChange={e => setEspIp(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-zinc-300 rounded-lg font-mono text-zinc-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-600 font-medium">Simulated Camera RTSP / MJPEG Stream</label>
              <input
                type="text"
                value={cameraUrl}
                onChange={e => setCameraUrl(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-zinc-300 rounded-lg font-mono text-zinc-900"
              />
            </div>
          </div>

          <Button variant="indigo" size="sm" type="submit">
            Save Telemetry Config
          </Button>
        </form>
      </div>

      {/* Danger Zone / Reset Database */}
      <div className="bg-red-50/50 border border-red-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-red-200/80">
          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-950">Restore Fresh Demo Data</h3>
            <p className="text-xs text-red-700">
              Re-seeds products, customer orders, inventory stock, and resets hardware simulation.
            </p>
          </div>
        </div>

        <p className="text-xs text-red-800">
          Use this action to refresh all customer orders, restart the sorting conveyor queue, and populate clean demonstration metrics.
        </p>

        <Button
          variant="danger"
          size="sm"
          disabled={isResetting}
          onClick={handleResetDemo}
          icon={<RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />}
        >
          {isResetting ? 'Restoring System...' : 'Reset Database to Fresh Demo State'}
        </Button>
      </div>
    </div>
  );
};
