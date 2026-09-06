import React from 'react';
import { MachineState, WarehouseQueue, Order } from '../../../types';
import { KPICard } from '../../../shared/components/KPICard';
import { Button } from '../../../shared/components/Button';
import { StatusPill } from '../../../shared/components/StatusPill';
import { formatINR } from '../../../shared/lib/formatters';
import {
  ListOrdered,
  ScanLine,
  Boxes,
  Cpu,
  Truck,
  ArrowRight,
  Activity,
  Video,
  Play,
  RotateCcw
} from 'lucide-react';

interface OperatorDashboardProps {
  queue: WarehouseQueue;
  machineState: MachineState;
  onNavigate: (tab: string) => void;
  onSendToConveyor: (orderId: string) => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  queue,
  machineState,
  onNavigate,
  onSendToConveyor
}) => {
  const readyOrders = queue.ready || [];
  const conveyorOrders = queue.conveyor || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Warehouse Floor Dashboard</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time fulfillment metrics, automated conveyor flow, and robotic sorting operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="teal"
            size="sm"
            onClick={() => onNavigate('conveyor')}
            icon={<Cpu className="w-3.5 h-3.5" />}
          >
            Launch Conveyor Monitor
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard
          label="New Orders"
          value={queue.newOrders.length}
          subtext="Awaiting pick list"
          icon={<ListOrdered className="w-4 h-4 text-blue-600" />}
          onClick={() => onNavigate('queue')}
        />
        <KPICard
          label="In Picking"
          value={queue.picking.length}
          subtext="At rack shelves"
          icon={<ScanLine className="w-4 h-4 text-amber-600" />}
          onClick={() => onNavigate('picking')}
        />
        <KPICard
          label="At Packing Bay"
          value={queue.packing.length}
          subtext="Barcoding &amp; weighing"
          icon={<Boxes className="w-4 h-4 text-purple-600" />}
          onClick={() => onNavigate('packing')}
        />
        <KPICard
          label="Ready for Conveyor"
          value={queue.ready.length}
          subtext="Cartons queued"
          icon={<Cpu className="w-4 h-4 text-teal-600" />}
          onClick={() => onNavigate('conveyor')}
        />
        <KPICard
          label="Dispatched Today"
          value={queue.dispatched.length}
          subtext="Sorted &amp; staged"
          icon={<Truck className="w-4 h-4 text-emerald-600" />}
          onClick={() => onNavigate('queue')}
        />
      </div>

      {/* Centerpiece: Active Conveyor & Robotic Arm Animated Track */}
      <div className="bg-zinc-950 text-white border border-zinc-800 rounded-2xl p-6 shadow-md space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-950 text-teal-400 border border-teal-800">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span>Active Conveyor Automation</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                  {machineState.conveyor}
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Continuous motor speed: <span className="font-mono text-teal-300 font-semibold">{machineState.motorRpm} RPM</span> &bull; Status: {machineState.activeOrderId ? `Processing ${machineState.activeOrderId}` : 'Awaiting Next Parcel'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="teal"
              size="sm"
              onClick={() => onNavigate('conveyor')}
              icon={<Video className="w-3.5 h-3.5" />}
            >
              Open Live Camera View
            </Button>
          </div>
        </div>

        {/* Animated SVG Conveyor Simulation Visualizer */}
        <div className="relative bg-zinc-900/90 rounded-xl p-6 border border-zinc-800 overflow-hidden">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Infeed (Packing Bay)</span>
            <span>Infrared Laser Scanner</span>
            <span>Robotic 4-Axis Arm Sorter</span>
            <span>Destination Hub Bins</span>
          </div>

          {/* Belt Track */}
          <div className="relative h-20 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center px-4 overflow-hidden">
            {/* Roller lines pattern */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(255,255,255,0.05)_20px,rgba(255,255,255,0.05)_22px)] animate-pulse" />

            {/* Sensor beam */}
            <div className="absolute left-[38%] top-0 bottom-0 w-1 bg-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.8)] z-10 flex flex-col justify-between items-center py-1">
              <span className="text-[8px] bg-red-950 text-red-400 font-mono px-1 rounded -translate-y-2">IR SENSOR</span>
            </div>

            {/* Robot arm position marker */}
            <div className="absolute left-[65%] top-1 bottom-1 w-20 bg-teal-950/60 border border-teal-700/60 rounded flex flex-col items-center justify-center text-[9px] font-mono text-teal-300 z-10">
              <Cpu className="w-4 h-4 text-teal-400 mb-0.5" />
              <span>ROBOT {machineState.robot}</span>
            </div>

            {/* Simulated moving parcel */}
            {machineState.activeOrderId ? (
              <div
                className="absolute z-20 top-3 h-14 w-28 bg-amber-500 text-zinc-950 rounded-lg shadow-lg flex flex-col items-center justify-center p-1.5 transition-all duration-1000 animate-bounce"
                style={{
                  left: machineState.robot === 'BUSY' ? '65%' : machineState.sensor === 'ACTIVE' ? '38%' : '15%'
                }}
              >
                <span className="font-mono font-black text-[10px] truncate w-full text-center">
                  {machineState.activeOrderId}
                </span>
                <span className="text-[9px] font-bold bg-black/20 px-1.5 py-0.2 rounded mt-0.5">
                  {machineState.activeOrderCity || 'SORTING'}
                </span>
              </div>
            ) : (
              <div className="w-full text-center text-xs text-zinc-500 font-mono">
                [ CONVEYOR BELT IDLE &bull; READY FOR INFEED ]
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Currently Sorting:</span>
              <span className="font-mono text-zinc-200 font-bold">
                {machineState.activeOrderId || 'None'}
              </span>
              {machineState.activeOrderCity && (
                <span className="text-teal-400 font-semibold bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                  Dest: {machineState.activeOrderCity} (Bin {machineState.activeOrderBin})
                </span>
              )}
            </div>

            {readyOrders.length > 0 && (
              <button
                onClick={() => onSendToConveyor(readyOrders[0].id)}
                className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Send Next Parcel ({readyOrders[0].id})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Two columns: Ready for Conveyor list + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ready to Infeed */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div>
              <h3 className="text-base font-bold text-zinc-900">Packed Parcels Ready for Infeed</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Cartons sealed and awaiting conveyor placement.</p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {readyOrders.length}
            </span>
          </div>

          {readyOrders.length === 0 ? (
            <p className="text-xs text-zinc-400 py-6 text-center">No parcels currently awaiting conveyor infeed.</p>
          ) : (
            <div className="space-y-2.5">
              {readyOrders.slice(0, 4).map(order => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-zinc-900">{order.id}</span>
                      <StatusPill status={order.status} size="sm" />
                    </div>
                    <p className="text-zinc-600 mt-0.5">
                      Destination: <strong className="text-zinc-900">{order.destination_city}</strong> &bull; {order.item_count || 1} item(s)
                    </p>
                  </div>

                  <Button
                    variant="teal"
                    size="sm"
                    onClick={() => onSendToConveyor(order.id)}
                    icon={<Play className="w-3 h-3 fill-current" />}
                  >
                    Infeed
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Warehouse Navigation shortcuts */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-zinc-900 pb-3 border-b border-zinc-100">
            Quick Station Actions
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              onClick={() => onNavigate('picking')}
              className="p-4 rounded-xl border border-zinc-200 hover:border-teal-500 bg-zinc-50 hover:bg-teal-50/30 transition-all text-left group cursor-pointer"
            >
              <ScanLine className="w-5 h-5 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-zinc-900">Floor Picking</h4>
              <p className="text-zinc-500 text-[11px] mt-0.5">{queue.picking.length} active picking tasks</p>
            </button>

            <button
              onClick={() => onNavigate('packing')}
              className="p-4 rounded-xl border border-zinc-200 hover:border-teal-500 bg-zinc-50 hover:bg-teal-50/30 transition-all text-left group cursor-pointer"
            >
              <Boxes className="w-5 h-5 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-zinc-900">Packing Station</h4>
              <p className="text-zinc-500 text-[11px] mt-0.5">{queue.packing.length} cartons to barcode</p>
            </button>

            <button
              onClick={() => onNavigate('conveyor')}
              className="p-4 rounded-xl border border-zinc-200 hover:border-teal-500 bg-zinc-50 hover:bg-teal-50/30 transition-all text-left group cursor-pointer"
            >
              <Cpu className="w-5 h-5 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-zinc-900">Conveyor Monitor</h4>
              <p className="text-zinc-500 text-[11px] mt-0.5">Live camera &amp; robotic sorter</p>
            </button>

            <button
              onClick={() => onNavigate('alerts')}
              className="p-4 rounded-xl border border-zinc-200 hover:border-teal-500 bg-zinc-50 hover:bg-teal-50/30 transition-all text-left group cursor-pointer"
            >
              <Activity className="w-5 h-5 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-zinc-900">Hardware Telemetry</h4>
              <p className="text-zinc-500 text-[11px] mt-0.5">Check ESP32 sensor signals</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
