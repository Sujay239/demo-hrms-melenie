import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { DatePicker } from '@/components/ui/DatePicker';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { Room, RoomReservation, Building } from '@/demo-data/seedData';
import { MeetingRoomForm } from '@/components/forms/MeetingRoomForm';
import {
  DoorOpen,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  Building2,
  Users,
  Tv,
  Wifi,
  Sparkles,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  Coffee,
  Mic,
  Video,
  Check,
  ShieldAlert,
  CalendarDays,
  Lock,
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

// Helper to convert date ("YYYY-MM-DD") and time ("HH:MM") into local epoch milliseconds
const getLocalEpochMs = (dateStr: string, timeStr: string): number => {
  if (!dateStr || !timeStr) return NaN;
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0).getTime();
};

// Check if an existing booking falls on the given local calendar day
const isBookingOnDay = (bookingStartStr: string, targetDateStr: string): boolean => {
  const d = new Date(bookingStartStr);
  const [targetYear, targetMonth, targetDay] = targetDateStr.split('-').map(Number);
  return (
    d.getFullYear() === targetYear &&
    d.getMonth() === targetMonth - 1 &&
    d.getDate() === targetDay
  );
};

// Mathematical interval overlap utility: [startA, endA) intersects [startB, endB)
const checkTimeOverlap = (
  proposedStartMs: number,
  proposedEndMs: number,
  existingStartStr: string,
  existingEndStr: string
): boolean => {
  const existingStartMs = new Date(existingStartStr).getTime();
  const existingEndMs = new Date(existingEndStr).getTime();

  if (isNaN(proposedStartMs) || isNaN(proposedEndMs) || isNaN(existingStartMs) || isNaN(existingEndMs)) {
    return false;
  }
  return proposedStartMs < existingEndMs && proposedEndMs > existingStartMs;
};

export const RoomReservationPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Modals
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Reservation Form State
  const [reserveRoomId, setReserveRoomId] = useState('');
  const [reserveTitle, setReserveTitle] = useState('');
  const [reserveDate, setReserveDate] = useState('2026-08-19');
  const [reserveStartTime, setReserveStartTime] = useState('10:00');
  const [reserveEndTime, setReserveEndTime] = useState('11:00');


  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('ALL');

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];
  const currentUser = mockStorage.getCurrentUser();
  const isTenantAdmin = mockStorage.isTenantAdminFor(currentUser, currentTenant.id);

  const [rooms, setRooms] = useState<Room[]>(() =>
    mockStorage.getTenantItems<Room>(KEYS.ROOMS, currentTenant.id)
  );
  const [reservations, setReservations] = useState<RoomReservation[]>(() =>
    mockStorage.getTenantItems<RoomReservation>(KEYS.RESERVATIONS, currentTenant.id)
  );

  const buildings = mockStorage.getTenantItems<Building>(KEYS.BUILDINGS, currentTenant.id);

  const reloadData = () => {
    setRooms(mockStorage.getTenantItems<Room>(KEYS.ROOMS, currentTenant.id));
    setReservations(mockStorage.getTenantItems<RoomReservation>(KEYS.RESERVATIONS, currentTenant.id));
  };

  const activeReservations = reservations.filter((r) => r.status === 'CONFIRMED');

  // Selected Room in Reserve Modal
  const selectedReserveRoom = rooms.find((r) => r.id === reserveRoomId) || rooms[0];

  // Local Epoch Timestamps for current input
  const proposedStartMs = useMemo(
    () => getLocalEpochMs(reserveDate, reserveStartTime),
    [reserveDate, reserveStartTime]
  );
  const proposedEndMs = useMemo(
    () => getLocalEpochMs(reserveDate, reserveEndTime),
    [reserveDate, reserveEndTime]
  );

  const isTimeOrderInvalid = !isNaN(proposedStartMs) && !isNaN(proposedEndMs) && proposedEndMs <= proposedStartMs;

  const existingBookingsOnDate = useMemo(() => {
    if (!reserveRoomId || !reserveDate) return [];
    return activeReservations.filter((r) => {
      if (r.roomId !== reserveRoomId) return false;
      return isBookingOnDay(r.startAt, reserveDate);
    });
  }, [activeReservations, reserveRoomId, reserveDate]);

  const conflictingBookings = useMemo(() => {
    if (!reserveRoomId || isNaN(proposedStartMs) || isNaN(proposedEndMs) || isTimeOrderInvalid) return [];
    return activeReservations.filter((r) => {
      if (r.roomId !== reserveRoomId) return false;
      return checkTimeOverlap(proposedStartMs, proposedEndMs, r.startAt, r.endAt);
    });
  }, [activeReservations, reserveRoomId, proposedStartMs, proposedEndMs, isTimeOrderInvalid]);

  const hasOverlapConflict = conflictingBookings.length > 0;

  // Handle Reservation Submit with Hard Protection
  const handleReserve = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reserveRoomId || !reserveTitle.trim() || !reserveDate || !reserveStartTime || !reserveEndTime) {
      toast.error('Please fill in all reservation fields.');
      return;
    }

    if (reserveStartTime >= reserveEndTime) {
      toast.error('Invalid Time Range: Meeting end time must be later than start time.');
      return;
    }

    const startAt = new Date(proposedStartMs).toISOString();
    const endAt = new Date(proposedEndMs).toISOString();

    // Hard Strict Overlap Validation
    const freshReservations = mockStorage.getTenantItems<RoomReservation>(KEYS.RESERVATIONS, currentTenant.id);
    const conflicts = freshReservations.filter(
      (r) =>
        r.roomId === reserveRoomId &&
        r.status === 'CONFIRMED' &&
        checkTimeOverlap(proposedStartMs, proposedEndMs, r.startAt, r.endAt)
    );

    if (conflicts.length > 0) {
      const conflict = conflicts[0];
      const conflictStart = new Date(conflict.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const conflictEnd = new Date(conflict.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      toast.error(
        `⛔ Slot Unavailable! ${selectedReserveRoom?.name} is already booked from ${conflictStart} to ${conflictEnd} by ${conflict.reservedByName}.`
      );
      return;
    }

    const newRes: RoomReservation = {
      id: `res-${Date.now()}`,
      tenantId: currentTenant.id,
      roomId: reserveRoomId,
      roomName: selectedReserveRoom?.name || 'Meeting Room',
      reservedById: currentUser.id,
      reservedByName: currentUser.name,
      title: reserveTitle.trim(),
      startAt,
      endAt,
      status: 'CONFIRMED',
    };

    mockStorage.addTenantItem<RoomReservation>(KEYS.RESERVATIONS, newRes);
    mockStorage.addAuditLog('ROOM_RESERVED', 'ROOM_RESERVATION', newRes.id);
    toast.success(`🎉 Successfully reserved ${selectedReserveRoom?.name}!`);
    setIsReserveModalOpen(false);
    setReserveTitle('');
    reloadData();
  };

  const handleCancelReservation = (id: string) => {
    mockStorage.updateTenantItem<RoomReservation>(KEYS.RESERVATIONS, id, { status: 'CANCELLED' });
    toast.success('Reservation booking cancelled');
    reloadData();
  };

  const handleOpenAddRoom = () => {
    setEditingRoom(null);
    setIsAddRoomModalOpen(true);
  };

  // Open Edit Room Modal
  const handleOpenEditRoom = (room: Room) => {
    setEditingRoom(room);
    setIsAddRoomModalOpen(true);
  };

  const handleDeleteRoom = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove meeting room "${name}"?`)) {
      mockStorage.deleteTenantItem(KEYS.ROOMS, id);
      toast.success(`Meeting Room "${name}" removed`);
      reloadData();
    }
  };

  const uniqueBuildings = Array.from(new Set(rooms.map((r) => r.buildingName)));

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.facilities.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesBuilding = buildingFilter === 'ALL' || r.buildingName === buildingFilter;

    return matchesSearch && matchesBuilding;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <DoorOpen className="w-4 h-4" />
            <span>Workplace Facilities & Smart Conference Booking</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Meeting Rooms & Workspaces</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage company conference spaces and conflict-free schedule reservations for {currentTenant.name}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isTenantAdmin && (
            <Button
              variant="outline"
              size="md"
              onClick={handleOpenAddRoom}
              leftIcon={<Plus className="w-4 h-4 text-indigo-600" />}
              className="font-semibold cursor-pointer"
            >
               Add Meeting Room
            </Button>
          )}

          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setReserveRoomId(rooms[0]?.id || '');
              setIsReserveModalOpen(true);
            }}
            leftIcon={<Calendar className="w-4 h-4" />}
            className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-xs cursor-pointer"
          >
            Reserve a Room
          </Button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Rooms</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{rooms.length}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <DoorOpen className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Configured in {currentTenant.name}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Now</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                {rooms.filter((r) => r.status === 'ACTIVE').length}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Active and ready for scheduling</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Bookings</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{activeReservations.length}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Scheduled team meetings</p>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search rooms by name, building, or facilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Building:</span>
          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Buildings ({rooms.length})</option>
            {uniqueBuildings.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Configured Conference Spaces Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Configured Conference Spaces ({filteredRooms.length})</span>
          </h3>
          <button
            onClick={handleOpenAddRoom}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Another Room
          </button>
        </div>

        {filteredRooms.length === 0 ? (
          <Card className="p-12 text-center bg-white border border-slate-200 space-y-4 rounded-2xl">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
              <DoorOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">No Meeting Rooms Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Set up your company's conference rooms, boardroom spaces, and focus pods so employees can begin scheduling reservations.
              </p>
            </div>
            <Button
              onClick={handleOpenAddRoom}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              + Add First Meeting Room
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((r) => {
              const roomReservations = activeReservations.filter((res) => res.roomId === r.id);

              return (
                <Card
                  key={r.id}
                  className="p-5 border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between space-y-4 bg-white"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                          <DoorOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{r.name}</h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {r.buildingName} • Floor {r.floor}
                          </p>
                        </div>
                      </div>
                      <Badge variant={r.status === 'ACTIVE' ? 'emerald' : 'neutral'} size="sm">
                        {r.status === 'ACTIVE' ? 'ACTIVE' : 'MAINTENANCE'}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Capacity: <strong className="text-slate-900">{r.capacity} Persons</strong></span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        {roomReservations.length} Active {roomReservations.length === 1 ? 'Booking' : 'Bookings'}
                      </span>
                    </div>

                    {/* Facilities list */}
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                      {r.facilities && r.facilities.length > 0 ? (
                        r.facilities.map((f, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200/50"
                          >
                            {f}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Standard Room Facilities</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold cursor-pointer"
                      onClick={() => {
                        setReserveRoomId(r.id);
                        setIsReserveModalOpen(true);
                      }}
                    >
                      Reserve Room
                    </Button>

                    {isTenantAdmin && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditRoom(r)}
                          className="text-slate-600 hover:text-indigo-600 p-2 cursor-pointer"
                          title="Edit Room"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRoom(r.id, r.name)}
                          className="text-slate-400 hover:text-rose-600 p-2 border-slate-200 cursor-pointer"
                          title="Delete Room"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Reservations Table */}
      <div className="space-y-3 pt-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Active Confirmed Reservations ({reservations.length})</span>
        </h3>

        {reservations.length === 0 ? (
          <Card className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No Reservations Scheduled</p>
            <p className="text-slate-400 mt-0.5">Click "Reserve a Room" above to schedule a conference meeting.</p>
          </Card>
        ) : (
          <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-200 shadow-xs">
            {reservations.map((res) => (
              <div key={res.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{res.title}</span>
                    <Badge variant={res.status === 'CONFIRMED' ? 'emerald' : 'neutral'} size="sm">
                      {res.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Room: <strong className="text-slate-800">{res.roomName}</strong> • Reserved by <strong className="text-slate-800">{res.reservedByName}</strong>
                  </p>
                  <p className="text-xs font-mono text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{new Date(res.startAt).toLocaleDateString()} • {new Date(res.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(res.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </p>
                </div>

                {res.status === 'CONFIRMED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs shrink-0"
                    onClick={() => handleCancelReservation(res.id)}
                  >
                    Cancel Booking
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* ADD / EDIT MEETING ROOM MODAL (WIDTH 2XL)                    */}
      {/* ============================================================ */}
      <Modal
        isOpen={isAddRoomModalOpen}
        onClose={() => setIsAddRoomModalOpen(false)}
        maxWidth="2xl"
        title={editingRoom ? 'Edit Meeting Room' : 'Add New Meeting Room'}
        description="Configure room details, seating capacity, facilities, and location for your office."
      >
        <MeetingRoomForm
          initialValues={editingRoom || undefined}
          tenantId={currentTenant.id}
          onSubmit={(formData) => {
            const bld = buildings.find((b) => b.name === formData.buildingName) || buildings[0];
            const bldId = bld?.id || `bld-${Date.now()}`;

            if (editingRoom) {
              mockStorage.updateTenantItem<Room>(KEYS.ROOMS, editingRoom.id, {
                name: formData.name,
                buildingId: bldId,
                buildingName: formData.buildingName,
                floor: formData.floor,
                capacity: formData.capacity,
                facilities: formData.facilities,
                status: formData.status,
              });
              mockStorage.addAuditLog('ROOM_UPDATED', 'ROOM', editingRoom.id);
              toast.success(`Meeting Room "${formData.name}" updated successfully!`);
            } else {
              const newRoom: Room = {
                id: `room-${Date.now()}`,
                tenantId: currentTenant.id,
                buildingId: bldId,
                buildingName: formData.buildingName,
                floor: formData.floor,
                name: formData.name,
                capacity: formData.capacity,
                facilities: formData.facilities,
                status: formData.status,
              };
              mockStorage.addTenantItem<Room>(KEYS.ROOMS, newRoom);
              mockStorage.addAuditLog('ROOM_CREATED', 'ROOM', newRoom.id);
              toast.success(`🎉 New Meeting Room "${formData.name}" created successfully!`);
            }

            setIsAddRoomModalOpen(false);
            reloadData();
          }}
          onCancel={() => setIsAddRoomModalOpen(false)}
          submitLabel={editingRoom ? 'Save Changes' : 'Create Meeting Room'}
        />
      </Modal>

      {/* ============================================================ */}
      {/* RESERVE ROOM MODAL (WITH LIVE OVERLAP PROTECTION)            */}
      {/* ============================================================ */}
      <Modal
        isOpen={isReserveModalOpen}
        onClose={() => setIsReserveModalOpen(false)}
        maxWidth="2xl"
        title="Reserve Conference Room"
        description="Book a slot for your team. Overlapping bookings for the same room are strictly prevented."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsReserveModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReserve}
              disabled={isTimeOrderInvalid || hasOverlapConflict}
              className={`font-bold transition-all ${
                isTimeOrderInvalid || hasOverlapConflict
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isTimeOrderInvalid
                ? 'Invalid Time Order'
                : hasOverlapConflict
                ? 'Slot Unavailable'
                : 'Confirm Booking'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleReserve} className="space-y-4 text-xs">
          <FormField label="Select Conference Room" required>
            <Select
              value={reserveRoomId}
              onChange={(e) => setReserveRoomId(e.target.value)}
              placeholder="Choose a room..."
              options={rooms.map((r) => ({
                value: r.id,
                label: `${r.name} (${r.buildingName} • ${r.capacity} seats)`,
              }))}
            />
          </FormField>

          <FormField label="Meeting Subject / Purpose" required>
            <Input
              value={reserveTitle}
              onChange={(e) => setReserveTitle(e.target.value)}
              placeholder="e.g. Q3 Sprint Planning & Architecture Review"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Meeting Date" required>
              <DatePicker
                value={reserveDate}
                onChange={setReserveDate}
                placeholder="Select meeting date"
                required
              />
            </FormField>

            <FormField label="Start Time" required>
              <Input
                type="time"
                value={reserveStartTime}
                onChange={(e) => setReserveStartTime(e.target.value)}
                required
              />
            </FormField>

            <FormField label="End Time" required>
              <Input
                type="time"
                value={reserveEndTime}
                onChange={(e) => setReserveEndTime(e.target.value)}
                required
              />
            </FormField>
          </div>

          {/* ============================================================ */}
          {/* LIVE OVERLAP CONFLICT DETECTOR BANNER                        */}
          {/* ============================================================ */}
          {isTimeOrderInvalid ? (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Invalid Time Range (End Time before Start Time)</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Meeting <strong>End Time</strong> must be later than <strong>Start Time</strong>.
                You currently have Start set to{' '}
                <strong>
                  {new Date(proposedStartMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </strong>{' '}
                and End set to{' '}
                <strong>
                  {new Date(proposedEndMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </strong>
                .
              </p>
              <p className="text-[11px] font-semibold text-amber-800">
                👉 Please choose an End Time that occurs after Start Time (e.g. 09:00 PM or 11:00 PM).
              </p>
            </div>
          ) : hasOverlapConflict ? (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Slot Conflict Detected! Room Already Booked</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                <strong>{selectedReserveRoom?.name}</strong> is already reserved during this time period by{' '}
                <strong>{conflictingBookings[0]?.reservedByName}</strong> for "
                <em>{conflictingBookings[0]?.title}</em>" (
                {new Date(conflictingBookings[0]?.startAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                —{' '}
                {new Date(conflictingBookings[0]?.endAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                ).
              </p>
              <p className="text-[11px] font-semibold text-rose-800">
                👉 Please adjust the start/end time or select another conference room.
              </p>
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Slot Available! No existing bookings collide with this time window.</span>
            </div>
          )}

          {/* Existing Scheduled Slots for this Room on Date */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                Existing Schedule for {selectedReserveRoom?.name} on {reserveDate}:
              </span>
              <span>{existingBookingsOnDate.length} Bookings</span>
            </div>

            {existingBookingsOnDate.length === 0 ? (
              <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-500 italic text-center border border-slate-200/50">
                Room is completely open and free all day on this date.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {existingBookingsOnDate.map((b) => {
                  const isThisOneConflicting = conflictingBookings.some((c) => c.id === b.id);

                  return (
                    <div
                      key={b.id}
                      className={`p-2 rounded-lg border text-[11px] flex items-center justify-between gap-2 ${
                        isThisOneConflicting
                          ? 'bg-rose-100/70 border-rose-300 text-rose-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0 truncate">
                        <p className="truncate font-medium">{b.title}</p>
                        <p className="text-[10px] text-slate-500">By {b.reservedByName}</p>
                      </div>
                      <div className="shrink-0 text-right font-mono text-[10px] font-bold">
                        {new Date(b.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(b.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};
