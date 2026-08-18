import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { Room, RoomReservation } from '@/demo-data/seedData';
import { DoorOpen, Plus, Calendar, Clock, CheckCircle2, X } from 'lucide-react';

export const RoomReservationPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);

  // Form
  const [roomId, setRoomId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-08-19');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];
  const currentUser = mockStorage.getCurrentUser();

  const rooms = mockStorage.getTenantItems<Room>(KEYS.ROOMS, currentTenant.id);
  const reservations = mockStorage.getTenantItems<RoomReservation>(KEYS.RESERVATIONS, currentTenant.id);

  const activeReservations = reservations.filter((r) => r.status === 'CONFIRMED');

  const handleReserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !title || !date || !startTime || !endTime) {
      toast.error('All fields are required');
      return;
    }

    const selectedRoom = rooms.find((r) => r.id === roomId);
    const startAt = `${date}T${startTime}:00Z`;
    const endAt = `${date}T${endTime}:00Z`;

    // Overlap Check Invariant (Backend logic simulated in mock storage)
    const hasOverlap = activeReservations.some(
      (r) =>
        r.roomId === roomId &&
        r.status === 'CONFIRMED' &&
        ((startAt >= r.startAt && startAt < r.endAt) ||
          (endAt > r.startAt && endAt <= r.endAt))
    );

    if (hasOverlap) {
      toast.error(
        'Slot Conflict! This room is already reserved for the selected time window. Please pick another slot.'
      );
      return;
    }

    mockStorage.addTenantItem<RoomReservation>(KEYS.RESERVATIONS, {
      id: `res-${Date.now()}`,
      tenantId: currentTenant.id,
      roomId,
      roomName: selectedRoom?.name || 'Meeting Room',
      reservedById: currentUser.id,
      reservedByName: currentUser.name,
      title,
      startAt,
      endAt,
      status: 'CONFIRMED',
    });

    mockStorage.addAuditLog('ROOM_RESERVED', 'ROOM_RESERVATION', `res-${Date.now()}`);
    toast.success(`Booking confirmed for ${selectedRoom?.name}!`);
    setIsReserveModalOpen(false);
    setTitle('');
  };

  const handleCancelReservation = (id: string) => {
    mockStorage.updateTenantItem<RoomReservation>(KEYS.RESERVATIONS, id, { status: 'CANCELLED' });
    toast.success('Reservation cancelled');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Buildings & Meeting Rooms</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Facility management, room availability, and conflict-free booking for {currentTenant.name}.
          </p>
        </div>
        <Button onClick={() => setIsReserveModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Reserve Room
        </Button>
      </div>

      {/* Available Rooms Grid */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">Available Conference Rooms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((r) => (
            <Card key={r.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <DoorOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{r.name}</h4>
                    <p className="text-xs text-slate-500">
                      {r.buildingName} • Floor {r.floor} • Capacity: {r.capacity} seats
                    </p>
                  </div>
                </div>
                <Badge status={r.status} />
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                {r.facilities.map((f) => (
                  <span key={f} className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {f}
                  </span>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setRoomId(r.id);
                  setIsReserveModalOpen(true);
                }}
              >
                Book This Room
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Existing Reservations */}
      <div className="space-y-3 pt-4">
        <h3 className="text-lg font-bold text-slate-900">Active Room Reservations</h3>
        <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-200 shadow-xs">
          {reservations.map((res) => (
            <div key={res.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 text-sm">{res.title}</span>
                  <Badge variant={res.status === 'CONFIRMED' ? 'emerald' : 'neutral'} size="sm">
                    {res.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Room: <span className="font-semibold text-slate-700">{res.roomName}</span> • Reserved by {res.reservedByName}
                </p>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  {new Date(res.startAt).toLocaleString()} — {new Date(res.endAt).toLocaleTimeString()}
                </p>
              </div>

              {res.status === 'CONFIRMED' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  onClick={() => handleCancelReservation(res.id)}
                >
                  Cancel Booking
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reserve Room Modal */}
      <Modal
        isOpen={isReserveModalOpen}
        onClose={() => setIsReserveModalOpen(false)}
        title="Reserve Conference Room"
        description="Backend owns overlap prevention; conflicts will be rejected."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsReserveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReserve}>Confirm Booking</Button>
          </>
        }
      >
        <form onSubmit={handleReserve} className="space-y-4">
          <FormField label="Select Room" required>
            <Select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Choose a room"
              options={rooms.map((r) => ({
                value: r.id,
                label: `${r.name} (${r.capacity} seats)`,
              }))}
            />
          </FormField>

          <FormField label="Meeting Title / Purpose" required>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Sprint Architecture Planning"
              required
            />
          </FormField>

          <FormField label="Date" required>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Time" required>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </FormField>
            <FormField label="End Time" required>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </FormField>
          </div>
        </form>
      </Modal>
    </div>
  );
};
