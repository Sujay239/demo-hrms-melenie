import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { DatePicker } from '@/components/ui/DatePicker';
import { TimePicker } from '@/components/ui/TimePicker';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { ShiftDefinition, ShiftAssignment, Employee } from '@/demo-data/seedData';
import {
  Calendar,
  Clock,
  Plus,
  ArrowLeft,
  Users,
  Settings,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  Layers,
} from 'lucide-react';

export const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const totalMins = i * 30;
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  const time24 = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  const period = hrs >= 12 ? 'PM' : 'AM';
  const hrs12 = hrs % 12 === 0 ? 12 : hrs % 12;
  const label = `${String(hrs12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period} (${time24})`;
  return { value: time24, label };
});

const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const isPM = /pm/i.test(timeStr);
  const isAM = /am/i.test(timeStr);
  const clean = timeStr.replace(/[^0-9:]/g, '');
  const parts = clean.split(':').map(Number);
  let hours = parts[0] || 0;
  const mins = parts[1] || 0;
  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;
  return hours * 60 + mins;
};

const SHIFT_COLOR_STYLES: Record<string, { bg: string; text: string; border: string; dotClass: string }> = {
  blue: { bg: 'bg-sky-50', text: 'text-sky-900', border: 'border-sky-200', dotClass: 'bg-sky-400' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-900', border: 'border-slate-300', dotClass: 'bg-slate-700' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-900', border: 'border-rose-200', dotClass: 'bg-red-600' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-900', border: 'border-indigo-200', dotClass: 'bg-indigo-500' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-200', dotClass: 'bg-emerald-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200', dotClass: 'bg-amber-500' },
};

const DEFAULT_SHIFTS: ShiftDefinition[] = [
  {
    id: 'shift-gen',
    tenantId: 't-001',
    name: 'General Shift',
    code: 'GEN',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    breakDurationMins: 60,
    color: 'blue',
    isDefault: true,
  },
  {
    id: 'shift-night',
    tenantId: 't-001',
    name: 'Night Shift',
    code: 'NIGHT',
    startTime: '10:00 PM',
    endTime: '06:00 AM',
    breakDurationMins: 60,
    color: 'slate',
  },
  {
    id: 'shift-day',
    tenantId: 't-001',
    name: 'Day Shift',
    code: 'DAY',
    startTime: '08:00 AM',
    endTime: '05:00 PM',
    breakDurationMins: 60,
    color: 'rose',
  },
];

export const ShiftRosterPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];
  const currentUser = mockStorage.getCurrentUser();
  const isTenantAdmin = mockStorage.isTenantAdminFor(currentUser, currentTenant.id);

  // Data State
  const [employees, setEmployees] = useState<Employee[]>(() =>
    mockStorage.getTenantItems<Employee>(KEYS.EMPLOYEES, currentTenant.id)
  );
  const [shifts, setShifts] = useState<ShiftDefinition[]>(() => {
    const loaded = mockStorage.getTenantItems<ShiftDefinition>(KEYS.SHIFTS, currentTenant?.id);
    return loaded && loaded.length > 0 ? loaded : DEFAULT_SHIFTS;
  });
  const [assignments, setAssignments] = useState<ShiftAssignment[]>(() =>
    mockStorage.getTenantItems<ShiftAssignment>(KEYS.SHIFT_ASSIGNMENTS, currentTenant.id)
  );

  // Filters & Week Navigation
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  
  // Calculate current week start (Monday)
  const [weekStartDate, setWeekStartDate] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  });

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftDefinition | null>(null);

  // Shift Assignment Form
  const [assignEmpId, setAssignEmpId] = useState('ALL');
  const [assignShiftId, setAssignShiftId] = useState(shifts[0]?.id || '');
  const [assignStartTime, setAssignStartTime] = useState(shifts[0]?.startTime || '09:00');
  const [assignEndTime, setAssignEndTime] = useState(shifts[0]?.endTime || '18:00');
  const [assignStartDate, setAssignStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignEndDate, setAssignEndDate] = useState(() => {
    const end = new Date();
    end.setDate(end.getDate() + 7);
    return end.toISOString().split('T')[0];
  });
  const [assignNotes, setAssignNotes] = useState('');

  // Shift Definition Form
  const [shiftName, setShiftName] = useState('');
  const [shiftCode, setShiftCode] = useState('');
  const [shiftStartTime, setShiftStartTime] = useState('09:00');
  const [shiftEndTime, setShiftEndTime] = useState('17:00');
  const [shiftBreakMins, setShiftBreakMins] = useState('60');
  const [shiftColor, setShiftColor] = useState('indigo');

  const reloadData = () => {
    setEmployees(mockStorage.getTenantItems<Employee>(KEYS.EMPLOYEES, currentTenant.id));
    const loaded = mockStorage.getTenantItems<ShiftDefinition>(KEYS.SHIFTS, currentTenant?.id);
    setShifts(loaded && loaded.length > 0 ? loaded : DEFAULT_SHIFTS);
    setAssignments(mockStorage.getTenantItems<ShiftAssignment>(KEYS.SHIFT_ASSIGNMENTS, currentTenant.id));
  };

  // Compute 7 calendar days for the active week view
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStartDate);
      d.setDate(weekStartDate.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekStartDate]);

  const handlePrevWeek = () => {
    const prev = new Date(weekStartDate);
    prev.setDate(prev.getDate() - 7);
    setWeekStartDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(weekStartDate);
    next.setDate(next.getDate() + 7);
    setWeekStartDate(next);
  };

  const handleTodayWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    setWeekStartDate(new Date(d.setDate(diff)));
  };

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.employeeId && emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchDept = selectedDept === 'ALL' || emp.departmentId === selectedDept;
      return matchSearch && matchDept;
    });
  }, [employees, searchTerm, selectedDept]);

  // Lookup shift assigned to an employee on a specific date string (YYYY-MM-DD)
  const getAssignedShiftForDate = (employeeId: string, dateStr: string): ShiftDefinition | null => {
    // Check specific assignments for this employee or ALL employees covering dateStr
    const directAssign = assignments.find(
      (a) => (a.employeeId === employeeId || a.employeeId === 'ALL') && dateStr >= a.startDate && dateStr <= a.endDate
    );

    if (directAssign) {
      const found = shifts.find((s) => s.id === directAssign.shiftId || s.name === directAssign.shiftName);
      if (found) return found;
    }

    return null;
  };

  const handleShiftChangeInAssign = (shiftId: string) => {
    setAssignShiftId(shiftId);
    const found = shifts.find((s) => s.id === shiftId);
    if (found) {
      setAssignStartTime(found.startTime);
      setAssignEndTime(found.endTime);
    }
  };

  // Open Assign Modal for specific employee and date
  const handleOpenAssignForCell = (empId: string, defaultDate: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (defaultDate < todayStr) {
      toast.error('🚫 Shift assignments cannot be created for past dates prior to today.');
      return;
    }
    setAssignEmpId(empId);
    const activeShifts = shifts.length > 0 ? shifts : DEFAULT_SHIFTS;
    const firstShift = activeShifts[0];
    setAssignShiftId(firstShift?.id || 'shift-gen');
    setAssignStartTime(firstShift?.startTime || '09:00 AM');
    setAssignEndTime(firstShift?.endTime || '06:00 PM');
    setAssignStartDate(defaultDate);
    setAssignEndDate(defaultDate);
    setAssignNotes('');
    setIsAssignModalOpen(true);
  };

  // Save Shift Assignment
  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignShiftId) {
      toast.error('Please select a shift');
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    if (assignStartDate < todayStr) {
      toast.error('🚫 Invalid Date: Cannot assign shifts for past dates prior to today.');
      return;
    }
    if (assignStartDate > assignEndDate) {
      toast.error('End date must be on or after start date');
      return;
    }

    const startMins = parseTimeToMinutes(assignStartTime);
    const endMins = parseTimeToMinutes(assignEndTime);
    const isOvernight = startMins >= 12 * 60 && endMins <= 10 * 60;
    if (startMins >= endMins && !isOvernight) {
      toast.error('🚫 Invalid Time: Shift start time must be earlier than shift end time.');
      return;
    }

    const selectedShift = shifts.find((s) => s.id === assignShiftId);
    const targetEmps = assignEmpId === 'ALL' ? employees : employees.filter((e) => e.id === assignEmpId);

    targetEmps.forEach((emp) => {
      const newAssign: ShiftAssignment = {
        id: `sa-${Date.now()}-${emp.id}`,
        tenantId: currentTenant.id,
        employeeId: emp.id,
        employeeName: emp.name,
        shiftId: selectedShift?.id || assignShiftId,
        shiftName: selectedShift?.name || 'Assigned Shift',
        startDate: assignStartDate,
        endDate: assignEndDate,
        notes: assignNotes.trim() || undefined,
      };

      mockStorage.addTenantItem<ShiftAssignment>(KEYS.SHIFT_ASSIGNMENTS, newAssign);
    });

    mockStorage.addAuditLog('SHIFT_ROSTER_ASSIGNED', 'SHIFT', `sa-${Date.now()}`);
    toast.success(`🎉 Shift "${selectedShift?.name}" assigned to ${targetEmps.length} employee(s)!`);
    setIsAssignModalOpen(false);
    reloadData();
  };

  // Open Shift Definition Form
  const handleOpenShiftModal = (shift?: ShiftDefinition) => {
    if (shift) {
      setEditingShift(shift);
      setShiftName(shift.name);
      setShiftCode(shift.code);
      setShiftStartTime(shift.startTime);
      setShiftEndTime(shift.endTime);
      setShiftBreakMins(String(shift.breakDurationMins));
      setShiftColor(shift.color || 'indigo');
    } else {
      setEditingShift(null);
      setShiftName('');
      setShiftCode('');
      setShiftStartTime('09:00 AM');
      setShiftEndTime('05:00 PM');
      setShiftBreakMins('60');
      setShiftColor('indigo');
    }
    setIsShiftModalOpen(true);
  };

  // Save Shift Definition
  const handleSaveShiftDefinition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftName.trim() || !shiftCode.trim()) {
      toast.error('Shift Name and Code are required');
      return;
    }

    const startMins = parseTimeToMinutes(shiftStartTime);
    const endMins = parseTimeToMinutes(shiftEndTime);
    const isOvernight = startMins >= 12 * 60 && endMins <= 10 * 60;
    if (startMins >= endMins && !isOvernight && shiftCode !== 'NIGHT') {
      toast.error('🚫 Invalid Time: Shift start time must be earlier than shift end time.');
      return;
    }

    if (editingShift) {
      mockStorage.updateTenantItem<ShiftDefinition>(KEYS.SHIFTS, editingShift.id, {
        name: shiftName.trim(),
        code: shiftCode.trim().toUpperCase(),
        startTime: shiftStartTime,
        endTime: shiftEndTime,
        breakDurationMins: parseInt(shiftBreakMins, 10) || 60,
        color: shiftColor,
      });
      toast.success(`Shift "${shiftName}" updated!`);
    } else {
      const newShift: ShiftDefinition = {
        id: `shift-${Date.now()}`,
        tenantId: currentTenant.id,
        name: shiftName.trim(),
        code: shiftCode.trim().toUpperCase(),
        startTime: shiftStartTime,
        endTime: shiftEndTime,
        breakDurationMins: parseInt(shiftBreakMins, 10) || 60,
        color: shiftColor,
      };
      mockStorage.addTenantItem<ShiftDefinition>(KEYS.SHIFTS, newShift);
      toast.success(`Shift "${shiftName}" created!`);
    }

    setIsShiftModalOpen(false);
    reloadData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">
              Shift Roster & Scheduling
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">Employee Shift Roster</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage work shifts, assign weekly/monthly employee schedules, and configure shift timeframes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isTenantAdmin && (
            <>
              <Button
                variant="outline"
                size="md"
                onClick={() => handleOpenShiftModal()}
                leftIcon={<Settings className="w-4 h-4 text-indigo-600" />}
                className="font-semibold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                Add Shifts ({shifts.length})
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  const activeShifts = shifts.length > 0 ? shifts : DEFAULT_SHIFTS;
                  const firstShift = activeShifts[0];
                  setAssignEmpId('ALL');
                  setAssignShiftId(firstShift?.id || 'shift-gen');
                  setAssignStartTime(firstShift?.startTime || '09:00 AM');
                  setAssignEndTime(firstShift?.endTime || '06:00 PM');
                  setIsAssignModalOpen(true);
                }}
                leftIcon={<Plus className="w-4 h-4" />}
                className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-xs"
              >
                Assign Shift
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Week Navigator & Search Controls */}
      <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Week Selector */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevWeek} title="Previous Week">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleTodayWeek} className="font-semibold text-xs">
              Current Week
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextWeek} title="Next Week">
              <ChevronRight className="w-4 h-4" />
            </Button>

            <span className="text-xs font-bold text-slate-800 ml-2">
              {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
              {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {/* Search & Filter Inputs */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48"
              />
            </div>
          </div>
        </div>

        {/* Legend of Shift Badges */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-bold text-[10px] uppercase">Available Shifts Legend:</span>
          {shifts.map((s) => {
            const style = SHIFT_COLOR_STYLES[s.color] || SHIFT_COLOR_STYLES.blue;
            return (
              <div
                key={s.id}
                onClick={() => isTenantAdmin && handleOpenShiftModal(s)}
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl border text-xs font-bold ${style.bg} ${style.text} ${style.border} ${
                  isTenantAdmin ? 'cursor-pointer hover:shadow-2xs transition-all' : ''
                }`}
                title={`Click to edit ${s.name}`}
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${style.dotClass}`} />
                <span>{s.name} [{s.startTime}:00 - {s.endTime}:00]</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Roster Grid Matrix */}
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4 min-w-[200px] border-r border-slate-200">Employee Details</th>
                {weekDays.map((d, idx) => {
                  const dateStr = d.toISOString().split('T')[0];
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                  const dateNum = d.getDate();

                  return (
                    <th
                      key={idx}
                      className={`py-3 px-3 text-center min-w-[130px] border-r border-slate-200/60 ${
                        isToday ? 'bg-indigo-50/70 text-indigo-900 font-extrabold' : ''
                      }`}
                    >
                      <div>{dayName}</div>
                      <div className="text-xs font-extrabold text-slate-800 mt-0.5">{dateNum}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No employees found matching the current search filters.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Employee Info Cell */}
                    <td className="py-3 px-4 border-r border-slate-200 bg-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{emp.name}</div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {emp.teamName || emp.workLocation || 'Employee'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Day Cells */}
                    {weekDays.map((d, idx) => {
                      const dateStr = d.toISOString().split('T')[0];
                      const assignedShift = getAssignedShiftForDate(emp.id, dateStr);
                      const style = assignedShift
                        ? SHIFT_COLOR_STYLES[assignedShift.color] || SHIFT_COLOR_STYLES.indigo
                        : SHIFT_COLOR_STYLES.indigo;

                      return (
                        <td
                          key={idx}
                          className="py-2.5 px-2 text-center border-r border-slate-100 align-middle"
                        >
                          {assignedShift ? (
                            <div
                              onClick={() => isTenantAdmin && handleOpenAssignForCell(emp.id, dateStr)}
                              className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all ${
                                style.bg
                              } ${style.text} ${style.border} ${
                                isTenantAdmin ? 'cursor-pointer hover:shadow-xs hover:scale-102' : ''
                              }`}
                              title={`${assignedShift.name}: ${assignedShift.startTime} - ${assignedShift.endTime}`}
                            >
                              <div className="flex items-center justify-center gap-1 font-extrabold truncate">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${style.dotClass}`} />
                                <span className="truncate">{assignedShift.name}</span>
                              </div>
                              <div className="text-[10px] opacity-80 font-normal mt-0.5">
                                [{assignedShift.startTime}:00 - {assignedShift.endTime}:00]
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => isTenantAdmin && handleOpenAssignForCell(emp.id, dateStr)}
                              className="w-full py-2.5 rounded-xl border border-dashed border-slate-200 text-[11px] text-slate-400 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                            >
                              + Assign
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL: ASSIGN SHIFT */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Shift Schedule"
        description="Assign a work shift to employees across a custom date range timeframe."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveAssignment} className="space-y-4 text-xs pt-1 min-h-[380px] flex flex-col justify-between">
          <FormField label="Target Employee" required>
            <Select
              value={assignEmpId}
              onChange={(e) => setAssignEmpId(e.target.value)}
              options={[
                { value: 'ALL', label: '👥 ALL EMPLOYEES (Organization Wide)' },
                ...employees
                  .filter((e) => e.isPermanent !== false && e.employmentStatus !== 'INACTIVE')
                  .map((e) => ({ value: e.id, label: `${e.name} (${e.employeeId || 'EMP'})` })),
              ]}
            />
          </FormField>

          <FormField label="Select Shift Definition" required helperText="Selecting auto-populates standard shift hours">
            <Select
              value={assignShiftId}
              onChange={(e) => handleShiftChangeInAssign(e.target.value)}
              options={shifts.map((s) => ({
                value: s.id,
                label: `${s.name} [${s.startTime}:00 - ${s.endTime}:00]`,
              }))}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Shift Start Time" required helperText="Auto-populated on shift selection, click to pick custom time">
              <TimePicker
                value={assignStartTime}
                onChange={setAssignStartTime}
              />
            </FormField>

            <FormField label="Shift End Time" required helperText="Auto-populated on shift selection, click to pick custom time">
              <TimePicker
                value={assignEndTime}
                onChange={setAssignEndTime}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start Date" required helperText="Must be today or a future date">
              <DatePicker
                value={assignStartDate}
                onChange={setAssignStartDate}
                minDate={new Date().toISOString().split('T')[0]}
                required
              />
            </FormField>

            <FormField label="End Date" required>
              <DatePicker
                value={assignEndDate}
                onChange={setAssignEndDate}
                minDate={assignStartDate || new Date().toISOString().split('T')[0]}
                required
              />
            </FormField>
          </div>

          <FormField label="Notes / Schedule Instructions">
            <Input
              value={assignNotes}
              onChange={(e) => setAssignNotes(e.target.value)}
              placeholder="e.g. Mandatory weekend rotation schedule"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Shift Schedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: SHIFT DEFINITIONS MANAGEMENT */}
      <Modal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        title={editingShift ? `Edit Shift: ${editingShift.name}` : 'Create Shift Definition'}
        description="Configure standard work shift times, codes, break durations, and color badges."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveShiftDefinition} className="space-y-4 text-xs pt-1 min-h-[380px] flex flex-col justify-between">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <FormField label="Shift Name" required>
                <Input
                  value={shiftName}
                  onChange={(e) => setShiftName(e.target.value)}
                  placeholder="e.g. Morning Shift"
                  required
                />
              </FormField>
            </div>

            <FormField label="Short Code" required>
              <Input
                value={shiftCode}
                onChange={(e) => setShiftCode(e.target.value.toUpperCase())}
                placeholder="e.g. MORN"
                maxLength={6}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Start Time" required>
              <TimePicker
                value={shiftStartTime}
                onChange={setShiftStartTime}
              />
            </FormField>

            <FormField label="End Time" required>
              <TimePicker
                value={shiftEndTime}
                onChange={setShiftEndTime}
              />
            </FormField>
            <FormField label="Break (Mins)">
              <Input
                type="number"
                value={shiftBreakMins}
                onChange={(e) => setShiftBreakMins(e.target.value)}
                placeholder="60"
              />
            </FormField>
          </div>

          <FormField label="Badge Color Theme">
            <Select
              value={shiftColor}
              onChange={(e) => setShiftColor(e.target.value)}
              options={[
                { value: 'blue', label: 'Light Blue Dot (General Shift)' },
                { value: 'slate', label: 'Dark Charcoal Dot (Night Shift)' },
                { value: 'rose', label: 'Bright Red Dot (Day Shift)' },
                { value: 'emerald', label: 'Emerald Dot (Morning Shift)' },
                { value: 'amber', label: 'Amber Dot (Swing Shift)' },
                { value: 'indigo', label: 'Indigo Dot (Standard)' },
              ]}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsShiftModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingShift ? 'Save Changes' : 'Create Shift'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
