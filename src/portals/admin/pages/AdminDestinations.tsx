import React, { useState, useEffect } from 'react';
import { Destination } from '../../../types';
import { apiFetch } from '../../../shared/lib/api';
import { Button } from '../../../shared/components/Button';
import { Modal } from '../../../shared/components/Modal';
import { useToast } from '../../../shared/store/toastContext';
import { Sliders, Edit2, CheckCircle2, RotateCcw } from 'lucide-react';

export const AdminDestinations: React.FC = () => {
  const { showToast } = useToast();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [city, setCity] = useState('');
  const [angle, setAngle] = useState(45);
  const [pin, setPin] = useState(12);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDestinations = () => {
    setIsLoading(true);
    apiFetch<Destination[]>('/warehouse/destinations')
      .then(setDestinations)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleOpenEdit = (dest: Destination) => {
    setSelectedDest(dest);
    setCity(dest.city);
    setAngle(dest.servo_deflection_angle ?? 45);
    setPin(dest.pin_mapping ?? 12);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDest) return;
    try {
      await apiFetch(`/warehouse/destinations/${selectedDest.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          city,
          servo_deflection_angle: angle,
          pin_mapping: pin
        })
      });
      showToast(`Updated destination bin configuration for ${selectedDest.bin_label}`, 'success');
      setIsModalOpen(false);
      fetchDestinations();
    } catch (err: any) {
      showToast(err.message || 'Failed to update', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Destination Bins Configuration</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Configure the 5 physical sorting bin receptacles, target destination hub cities, and robotic servo angles.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={fetchDestinations}>
          Refresh Bins
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {destinations.map(d => (
          <div
            key={d.id}
            className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-mono font-bold text-sm">
                  {d.bin_label.replace('BOX ', '')}
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-sm">{d.bin_label}</h3>
                  <span className="text-[10px] text-zinc-400 font-mono">GPIO {d.pin_mapping}</span>
                </div>
              </div>

              <button
                onClick={() => handleOpenEdit(d)}
                className="p-1.5 rounded text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                title="Edit Bin Mapping"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Destination Hub:</span>
                <span className="font-bold text-zinc-900">{d.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Servo Angle:</span>
                <span className="font-mono font-bold text-indigo-600">{d.servo_deflection_angle}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Sorted Today:</span>
                <span className="font-mono font-bold text-teal-700">{d.countToday || 0} parcels</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {selectedDest && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Configure ${selectedDest.bin_label}`}
          subtitle="Robotic sorter deflection parameter"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="indigo" size="sm" onClick={handleSave}>
                Save Configuration
              </Button>
            </>
          }
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-zinc-600 font-medium">Mapped Destination City</label>
              <input
                type="text"
                required
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-zinc-600 font-medium">Servo Deflection Angle (°)</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={180}
                  value={angle}
                  onChange={e => setAngle(Number(e.target.value))}
                  className="w-full h-9 px-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-600 font-medium">ESP32 Pin Mapping</label>
                <input
                  type="number"
                  required
                  value={pin}
                  onChange={e => setPin(Number(e.target.value))}
                  className="w-full h-9 px-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 font-mono"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
