import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../shared/lib/api';
import { Button } from '../../../shared/components/Button';
import { History, Search, FileText } from 'lucide-react';

export const OperatorLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchLogs = () => {
    setIsLoading(true);
    apiFetch<any[]>('/warehouse/audit-logs')
      .then(setLogs)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200/80">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Audit &amp; System Logs</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Complete chronological ledger of operator actions, status transitions, and sensor telemetry.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchLogs}>
          Refresh Ledger
        </Button>
      </div>

      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Event Category</th>
              <th className="py-3 px-4">Entity ID</th>
              <th className="py-3 px-4">Action Summary</th>
              <th className="py-3 px-4">Actor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-mono">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-400 font-sans">
                  No log entries recorded in session.
                </td>
              </tr>
            ) : (
              logs.map((l, idx) => (
                <tr key={l.id || idx} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-2.5 px-4 text-zinc-400">{l.timestamp}</td>
                  <td className="py-2.5 px-4">
                    <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded text-[10px] font-bold font-sans">
                      {l.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-zinc-900">{l.entity_id || '—'}</td>
                  <td className="py-2.5 px-4 font-sans text-zinc-700">{l.details}</td>
                  <td className="py-2.5 px-4 font-sans text-zinc-500">{l.actor || 'System Engine'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
