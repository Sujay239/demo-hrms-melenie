import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Room } from '@/demo-data/seedData';
import {
  Tv,
  Sparkles,
  Mic,
  Video,
  Coffee,
  DoorOpen,
  Wifi,
  Users,
  Check,
} from 'lucide-react';

const COMMON_FACILITIES = [
  { label: '4K Video Conf Display', icon: Tv },
  { label: 'Digital Smart Whiteboard', icon: Sparkles },
  { label: 'Polycom Mic & Soundbar', icon: Mic },
  { label: 'Wireless Presentation (AirPlay)', icon: Video },
  { label: 'Coffee & Refreshment Bar', icon: Coffee },
  { label: 'Privacy Switchable Glass', icon: DoorOpen },
  { label: 'High-Speed Wi-Fi & LAN', icon: Wifi },
  { label: 'Ergonomic Executive Seating', icon: Users },
];

interface MeetingRoomFormProps {
  initialValues?: Partial<Room>;
  tenantId: string;
  onSubmit: (data: {
    name: string;
    buildingName: string;
    floor: number;
    capacity: number;
    facilities: string[];
    status: 'ACTIVE' | 'INACTIVE';
  }) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export const MeetingRoomForm: React.FC<MeetingRoomFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Create Meeting Room',
}) => {
  const [roomName, setRoomName] = useState(initialValues?.name || '');
  const [buildingName, setBuildingName] = useState(
    initialValues?.buildingName || 'Main Office Tower'
  );
  const [floor, setFloor] = useState<number>(initialValues?.floor || 1);
  const [capacity, setCapacity] = useState<number>(initialValues?.capacity || 8);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(
    initialValues?.facilities || [
      '4K Video Conf Display',
      'Digital Smart Whiteboard',
      'High-Speed Wi-Fi & LAN',
    ]
  );
  const [roomStatus, setRoomStatus] = useState<'ACTIVE' | 'INACTIVE'>(
    initialValues?.status || 'ACTIVE'
  );

  const toggleFacility = (facility: string) => {
    if (selectedFacilities.includes(facility)) {
      setSelectedFacilities(selectedFacilities.filter((f) => f !== facility));
    } else {
      setSelectedFacilities([...selectedFacilities, facility]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    onSubmit({
      name: roomName.trim(),
      buildingName: buildingName.trim() || 'Headquarters Alpha',
      floor: Number(floor) || 1,
      capacity: Number(capacity) || 4,
      facilities: selectedFacilities,
      status: roomStatus,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <FormField label="Meeting Room Name" required helperText="e.g. Apollo Boardroom, Orion Focus Pod">
        <Input
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="e.g. Apollo Boardroom"
          required
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Building / Office Location" required>
          <Input
            value={buildingName}
            onChange={(e) => setBuildingName(e.target.value)}
            placeholder="e.g. HQ Tower Alpha, Tech Annex B"
            required
          />
        </FormField>

        <FormField label="Floor Number" required>
          <Input
            type="number"
            min="0"
            max="100"
            value={floor}
            onChange={(e) => setFloor(Number(e.target.value))}
            placeholder="1"
            required
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <FormField label="Seating Capacity (Persons)" required>
          <Input
            type="number"
            min="1"
            max="200"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            placeholder="8"
            required
          />
        </FormField>

        <FormField label="Operational Room Status" required>
          <Select
            value={roomStatus}
            onChange={(e) => setRoomStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
            options={[
              { value: 'ACTIVE', label: 'ACTIVE — Available for booking' },
              { value: 'INACTIVE', label: 'INACTIVE — Under Maintenance' },
            ]}
          />
        </FormField>
      </div>

      {/* Facilities Multi-Tag Checklist */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 block">
            Available Facilities & Equipment:
          </label>
          <span className="text-[11px] text-slate-400 font-medium">
            {selectedFacilities.length} of {COMMON_FACILITIES.length} selected
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
          {COMMON_FACILITIES.map((f) => {
            const isSelected = selectedFacilities.includes(f.label);
            const FacilityIcon = f.icon;
            return (
              <button
                key={f.label}
                type="button"
                onClick={() => toggleFacility(f.label)}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-[11px] font-medium transition-all cursor-pointer text-left w-full ${
                  isSelected
                    ? 'bg-indigo-50/90 text-indigo-900 border-indigo-300 font-semibold shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <FacilityIcon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-indigo-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{f.label}</span>
                </div>

                <div
                  className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'border border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 mt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="cursor-pointer">
            Cancel
          </Button>
        )}
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
