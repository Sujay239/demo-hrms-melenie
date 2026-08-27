import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { DatePicker } from '@/components/ui/DatePicker';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { DataTable, Column } from '@/components/ui/DataTable';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { AttendanceRecord, OvertimeRequest } from '@/demo-data/seedData';
import {
  Clock,
  Play,
  Square,
  Plus,
  Coffee,
  CheckCircle2,
  XCircle,
  FileEdit,
  Timer,
  Calendar,
  AlertCircle,
  TrendingUp,
  Sparkles,
  UserCheck,
  ShieldCheck,
  Edit2,
  CalendarDays,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TimePicker } from '@/components/ui/TimePicker';

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

const getMinutesDiff = (inTime?: string, outTime?: string): number => {
  if (!inTime || !outTime) return 0;
  const start = parseTimeToMinutes(inTime);
  const end = parseTimeToMinutes(outTime);
  const diff = end - start;
  return diff > 0 ? diff : 0;
};

export const AttendancePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Modals
  const [isOtModalOpen, setIsOtModalOpen] = useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);

  // Overtime Form
  const [otMinutes, setOtMinutes] = useState('120');
  const [otReason, setOtReason] = useState('');

  // Correction Form
  const [corrDate, setCorrDate] = useState(new Date().toISOString().split('T')[0]);
  const [corrClockIn, setCorrClockIn] = useState('09:00');
  const [corrClockOut, setCorrClockOut] = useState('18:00');
  const [corrReason, setCorrReason] = useState('');

  // Admin Manual Attendance Form
  const [manualEmployeeId, setManualEmployeeId] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualClockIn, setManualClockIn] = useState('09:00 AM');
  const [manualClockOut, setManualClockOut] = useState('05:00 PM');
  const [manualStatus, setManualStatus] = useState<'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE'>('PRESENT');
  const [manualNotes, setManualNotes] = useState('');

  // Admin Edit Attendance Form
  const [editDate, setEditDate] = useState('');
  const [editClockIn, setEditClockIn] = useState('');
  const [editClockOut, setEditClockOut] = useState('');
  const [editStatus, setEditStatus] = useState<'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE'>('PRESENT');
  const [editNotes, setEditNotes] = useState('');

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];
  const currentUser = mockStorage.getCurrentUser();
  const isTenantAdmin = mockStorage.isTenantAdminFor(currentUser, currentTenant.id);

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() =>
    mockStorage.getTenantItems<AttendanceRecord>(KEYS.ATTENDANCE, currentTenant.id)
  );
  const [overtime, setOvertime] = useState<OvertimeRequest[]>(() =>
    mockStorage.getTenantItems<OvertimeRequest>(KEYS.OVERTIME, currentTenant.id)
  );

  const employees = mockStorage.getTenantItems<any>(KEYS.EMPLOYEES, currentTenant.id);

  const reloadData = () => {
    setAttendance(mockStorage.getTenantItems<AttendanceRecord>(KEYS.ATTENDANCE, currentTenant.id));
    setOvertime(mockStorage.getTenantItems<OvertimeRequest>(KEYS.OVERTIME, currentTenant.id));
  };

  // Clock State
  const [clockState, setClockState] = useState<'CLOCKED_OUT' | 'CLOCKED_IN' | 'ON_BREAK'>('CLOCKED_OUT');
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Check today's active clock-in on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const openRecord = attendance.find(
      (a) =>
        (a.employeeId === currentUser.id ||
          (a.employeeName && currentUser.name && a.employeeName.toLowerCase() === currentUser.name.toLowerCase())) &&
        a.date === today &&
        !a.clockOutTime
    );

    if (openRecord) {
      const inTime = openRecord.clockInTime || '';
      setClockState('CLOCKED_IN');
      setClockInTime(inTime || null);
      const startMins = parseTimeToMinutes(inTime);
      const nowMins = parseTimeToMinutes(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      const diffSecs = Math.max(0, (nowMins - startMins) * 60);
      setElapsedSeconds(diffSecs);
    }
  }, [attendance, currentUser]);

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
      if (clockState === 'CLOCKED_IN') {
        setElapsedSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [clockState]);

  // Scoped data by role (Employees only see their own attendance/overtime records)
  const displayAttendance = useMemo(() => {
    const records = isTenantAdmin
      ? attendance
      : attendance.filter(
          (a) =>
            a.employeeId === currentUser.id ||
            (a.employeeName &&
              currentUser.name &&
              a.employeeName.toLowerCase() === currentUser.name.toLowerCase())
        );

    // Normalize duration calculations for display
    return records.map((r) => {
      let totalMins = typeof r.totalMinutes === 'number' ? r.totalMinutes : 0;
      if (r.clockInTime && r.clockOutTime && totalMins === 0) {
        totalMins = getMinutesDiff(r.clockInTime, r.clockOutTime);
      }
      return {
        ...r,
        totalMinutes: totalMins,
      };
    });
  }, [attendance, isTenantAdmin, currentUser]);

  const displayOvertime = useMemo(() => {
    return isTenantAdmin
      ? overtime
      : overtime.filter(
          (o) =>
            o.employeeId === currentUser.id ||
            (o.employeeName &&
              currentUser.name &&
              o.employeeName.toLowerCase() === currentUser.name.toLowerCase())
        );
  }, [overtime, isTenantAdmin, currentUser]);

  // Precise KPI Metrics
  const uniqueDaysPresent = useMemo(() => {
    const dates = new Set(
      displayAttendance
        .filter((a) => a.status === 'PRESENT' || a.status === 'HALF_DAY' || a.status === 'LATE')
        .map((a) => a.date)
    );
    return dates.size;
  }, [displayAttendance]);

  const totalLoggedMinutes = useMemo(() => {
    return displayAttendance.reduce((acc, a) => acc + (a.totalMinutes || 0), 0);
  }, [displayAttendance]);

  const formatElapsed = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleClockIn = () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const today = new Date().toISOString().split('T')[0];

    // Check if there is already an open record for today
    const existingOpen = attendance.find(
      (a) =>
        (a.employeeId === currentUser.id ||
          (a.employeeName && currentUser.name && a.employeeName.toLowerCase() === currentUser.name.toLowerCase())) &&
        a.date === today &&
        !a.clockOutTime
    );

    if (existingOpen) {
      setClockState('CLOCKED_IN');
      setClockInTime(existingOpen.clockInTime || now);
      toast.info(`Resumed existing active shift from ${existingOpen.clockInTime || now}.`);
      return;
    }

    setClockState('CLOCKED_IN');
    setClockInTime(now);
    setElapsedSeconds(0);

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      tenantId: currentTenant.id,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      date: today,
      clockInTime: now,
      totalMinutes: 0,
      status: 'PRESENT',
    };

    mockStorage.addTenantItem<AttendanceRecord>(KEYS.ATTENDANCE, newRecord);
    mockStorage.addAuditLog('EMPLOYEE_CLOCK_IN', 'ATTENDANCE', newRecord.id);
    toast.success(`🎉 Clocked in successfully at ${now}! Have a productive day.`);
    reloadData();
  };

  const handleToggleBreak = () => {
    if (clockState === 'CLOCKED_IN') {
      setClockState('ON_BREAK');
      toast.info('☕ Break started. Working timer paused.');
    } else if (clockState === 'ON_BREAK') {
      setClockState('CLOCKED_IN');
      toast.success('▶️ Break ended. Working timer resumed.');
    }
  };

  const handleClockOut = () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const today = new Date().toISOString().split('T')[0];

    // Calculate actual worked minutes from elapsedSeconds or time diff
    const elapsedMins = Math.max(0, Math.round(elapsedSeconds / 60));

    setClockState('CLOCKED_OUT');
    setClockInTime(null);
    setElapsedSeconds(0);

    // Find and update today's open record
    const todayRecord = attendance.find(
      (a) =>
        (a.employeeId === currentUser.id ||
          (a.employeeName && currentUser.name && a.employeeName.toLowerCase() === currentUser.name.toLowerCase())) &&
        a.date === today &&
        !a.clockOutTime
    );

    if (todayRecord) {
      const calculatedMins =
        elapsedMins > 0 ? elapsedMins : getMinutesDiff(todayRecord.clockInTime, now);

      mockStorage.updateTenantItem<AttendanceRecord>(KEYS.ATTENDANCE, todayRecord.id, {
        clockOutTime: now,
        totalMinutes: calculatedMins,
      });
    }

    mockStorage.addAuditLog('EMPLOYEE_CLOCK_OUT', 'ATTENDANCE', `att-${Date.now()}`);
    toast.success(`Clocked out at ${now}. Today's logged session saved.`);
    reloadData();
  };

  const handleRequestOvertime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otReason.trim()) {
      toast.error('Overtime justification is required');
      return;
    }

    const newOt: OvertimeRequest = {
      id: `ot-${Date.now()}`,
      tenantId: currentTenant.id,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      requestedMinutes: parseInt(otMinutes, 10),
      reason: otReason.trim(),
      status: 'PENDING',
    };

    mockStorage.addTenantItem<OvertimeRequest>(KEYS.OVERTIME, newOt);
    mockStorage.addAuditLog('OVERTIME_REQUESTED', 'OVERTIME', newOt.id);
    toast.success('Overtime compensation request submitted for manager review!');
    setIsOtModalOpen(false);
    setOtReason('');
    reloadData();
  };

  const handleRequestCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!corrReason.trim() || !corrClockIn || !corrClockOut) {
      toast.error('All fields are required');
      return;
    }

    if (parseTimeToMinutes(corrClockIn) >= parseTimeToMinutes(corrClockOut)) {
      toast.error('🚫 Invalid Time: Clock-in time must be earlier than clock-out time.');
      return;
    }

    const calculatedMins = getMinutesDiff(corrClockIn, corrClockOut) || 480;

    // Save correction entry with accurately calculated duration
    const newCorr: AttendanceRecord = {
      id: `att-corr-${Date.now()}`,
      tenantId: currentTenant.id,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      date: corrDate,
      clockInTime: corrClockIn,
      clockOutTime: corrClockOut,
      totalMinutes: calculatedMins,
      status: 'PRESENT',
    };

    mockStorage.addTenantItem<AttendanceRecord>(KEYS.ATTENDANCE, newCorr);
    mockStorage.addAuditLog('ATTENDANCE_CORRECTION_SUBMITTED', 'ATTENDANCE', newCorr.id);
    toast.success('Time correction request submitted for admin review!');
    setIsCorrectionModalOpen(false);
    setCorrReason('');
    reloadData();
  };

  const handleOpenManualModal = () => {
    setManualEmployeeId(employees[0]?.id || '');
    setManualDate(new Date().toISOString().split('T')[0]);
    setManualClockIn('09:00 AM');
    setManualClockOut('05:00 PM');
    setManualStatus('PRESENT');
    setManualNotes('');
    setIsManualModalOpen(true);
  };

  const handleCreateManualAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmployeeId) {
      toast.error('Please select an employee');
      return;
    }

    if (manualClockIn && manualClockOut && parseTimeToMinutes(manualClockIn) >= parseTimeToMinutes(manualClockOut)) {
      toast.error('🚫 Invalid Time: Clock-in time must be earlier than clock-out time.');
      return;
    }

    const emp = employees.find((e: any) => e.id === manualEmployeeId);
    const calculatedMins = getMinutesDiff(manualClockIn, manualClockOut) || (manualStatus === 'PRESENT' ? 480 : 0);

    const newRecord: AttendanceRecord = {
      id: `att-manual-${Date.now()}`,
      tenantId: currentTenant.id,
      employeeId: manualEmployeeId,
      employeeName: emp ? emp.name : 'Employee',
      date: manualDate,
      clockInTime: manualClockIn,
      clockOutTime: manualClockOut,
      totalMinutes: calculatedMins,
      status: manualStatus,
      notes: manualNotes.trim() || undefined,
    };

    mockStorage.addTenantItem<AttendanceRecord>(KEYS.ATTENDANCE, newRecord);
    mockStorage.addAuditLog('ADMIN_MANUAL_ATTENDANCE_CREATED', 'ATTENDANCE', newRecord.id);
    toast.success(`Attendance record created for ${newRecord.employeeName}!`);
    setIsManualModalOpen(false);
    reloadData();
  };

  const handleOpenEditModal = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setEditDate(rec.date);
    setEditClockIn(rec.clockInTime || '09:00 AM');
    setEditClockOut(rec.clockOutTime || '05:00 PM');
    setEditStatus(rec.status);
    setEditNotes(rec.notes || '');
  };

  const handleSaveEditAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    if (editClockIn && editClockOut && parseTimeToMinutes(editClockIn) >= parseTimeToMinutes(editClockOut)) {
      toast.error('🚫 Invalid Time: Clock-in time must be earlier than clock-out time.');
      return;
    }

    const calculatedMins = getMinutesDiff(editClockIn, editClockOut) || (editStatus === 'PRESENT' ? 480 : 0);

    mockStorage.updateTenantItem<AttendanceRecord>(KEYS.ATTENDANCE, editingRecord.id, {
      date: editDate,
      clockInTime: editClockIn,
      clockOutTime: editClockOut,
      totalMinutes: calculatedMins,
      status: editStatus,
      notes: editNotes.trim() || undefined,
    });

    mockStorage.addAuditLog('ADMIN_ATTENDANCE_UPDATED', 'ATTENDANCE', editingRecord.id);
    toast.success(`Attendance record for ${editingRecord.employeeName} updated successfully!`);
    setEditingRecord(null);
    reloadData();
  };

  const handleOtApprove = (id: string, status: 'APPROVED' | 'REJECTED') => {
    mockStorage.updateTenantItem<OvertimeRequest>(KEYS.OVERTIME, id, { status });
    mockStorage.addAuditLog(`OVERTIME_${status}`, 'OVERTIME', id);
    if (status === 'APPROVED') {
      toast.success('Overtime hours approved for payroll credit!');
    } else {
      toast.error('Overtime request rejected.');
    }
    reloadData();
  };

  const attColumns: Column<AttendanceRecord>[] = [
    {
      key: 'employeeName',
      header: 'Employee',
      render: (a) => (
        <div>
          <div className="font-semibold text-slate-900">{a.employeeName}</div>
          <div className="text-xs text-slate-400 font-mono">{a.date}</div>
        </div>
      ),
    },
    {
      key: 'clockInTime',
      header: 'Clock In',
      render: (a) => <span className="font-mono text-xs font-bold text-slate-700">{a.clockInTime || '--:--'}</span>,
    },
    {
      key: 'clockOutTime',
      header: 'Clock Out',
      render: (a) => (
        <span className="font-mono text-xs font-bold text-slate-700">
          {a.clockOutTime ? (
            a.clockOutTime
          ) : (
            <span className="text-emerald-600 font-bold animate-pulse">Shift In Progress</span>
          )}
        </span>
      ),
    },
    {
      key: 'totalMinutes',
      header: 'Working Duration',
      render: (a) => {
        if (!a.clockOutTime) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Active ({Math.floor(elapsedSeconds / 60)}m logged)
            </span>
          );
        }

        const hrs = Math.floor((a.totalMinutes || 0) / 60);
        const mins = (a.totalMinutes || 0) % 60;
        return (
          <span className="text-xs font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono">
            {hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (a) => (
        <Badge
          variant={
            a.status === 'PRESENT'
              ? 'emerald'
              : a.status === 'HALF_DAY'
              ? 'amber'
              : a.status === 'LATE'
              ? 'neutral'
              : 'neutral'
          }
        >
          {a.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (a) => {
        if (!isTenantAdmin) return null;
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEditModal(a)}
            className="h-7 px-2 border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            title="Edit attendance record"
          >
            <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Edit</span>
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            <span>Time Tracking & Shift Compliance</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance & Overtime</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {isTenantAdmin
              ? `Real-time shift logs, duration calculations, and overtime approval workflows for ${currentTenant.name}.`
              : `Punch in/out shifts, view your daily working duration, and request time corrections.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate(`/${slug}/shifts`)}
            leftIcon={<CalendarDays className="w-4 h-4 text-indigo-600" />}
            className="font-semibold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            Shift Roster
          </Button>

          {isTenantAdmin && (
            <Button
              variant="outline"
              size="md"
              onClick={handleOpenManualModal}
              leftIcon={<Plus className="w-4 h-4 text-emerald-600" />}
              className="font-semibold border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              Add Attendance
            </Button>
          )}

          <Button
            variant="outline"
            size="md"
            onClick={() => setIsCorrectionModalOpen(true)}
            leftIcon={<FileEdit className="w-4 h-4 text-indigo-600" />}
            className="font-semibold"
          >
            Submit Time Correction
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsOtModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-xs"
          >
            Request Overtime
          </Button>
        </div>
      </div>

      {/* Hero Interactive Punch Clock Card */}
      <Card className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-0 shadow-xl p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-400/30 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5" />
                Live Digital Shift Punch
              </span>
              <span className="text-xs font-mono text-slate-400">{currentTime}</span>
            </div>

            <h3 className="text-3xl font-extrabold tracking-tight">
              {clockState === 'CLOCKED_IN' ? (
                <span className="text-emerald-400 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  Clocked In ({formatElapsed(elapsedSeconds)})
                </span>
              ) : clockState === 'ON_BREAK' ? (
                <span className="text-amber-400 flex items-center gap-2">
                  <Coffee className="w-6 h-6 animate-bounce" />
                  On Break (Paused)
                </span>
              ) : (
                <span className="text-slate-300">You are currently Clocked Out</span>
              )}
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              {clockState === 'CLOCKED_IN'
                ? `Started shift today at ${clockInTime}. Standard working window: ${currentTenant.dailyWorkingHours || 8} hours.`
                : 'Punch in to begin tracking shift hours, overtime calculations, and break sessions.'}
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {clockState === 'CLOCKED_OUT' ? (
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Play className="w-5 h-5 fill-current" />}
                onClick={handleClockIn}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm px-6 py-3 shadow-lg cursor-pointer"
              >
                Clock In Now
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleToggleBreak}
                  leftIcon={<Coffee className="w-4 h-4 text-amber-300" />}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold"
                >
                  {clockState === 'ON_BREAK' ? 'Resume Working' : 'Take a Break'}
                </Button>

                <Button
                  variant="destructive"
                  size="lg"
                  leftIcon={<Square className="w-4 h-4 fill-current" />}
                  onClick={handleClockOut}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Clock Out
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Summary KPI Cards (Accurate Calculation) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-emerald-600">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Days Present</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{uniqueDaysPresent} Days</h3>
          <p className="text-xs text-slate-400 mt-1">Distinct calendar shift days</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-600">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Logged Hours</p>
          <h3 className="text-2xl font-bold text-indigo-600 mt-1">
            {totalLoggedMinutes >= 60
              ? `${Math.floor(totalLoggedMinutes / 60)}h ${totalLoggedMinutes % 60}m`
              : `${totalLoggedMinutes} mins`}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Actual calculated work time</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overtime Requests</p>
          <h3 className="text-2xl font-bold text-amber-600 mt-1">{displayOvertime.length}</h3>
          <p className="text-xs text-slate-400 mt-1">
            {displayOvertime.filter((o) => o.status === 'APPROVED').length} Approved
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-600">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Standard Work Schedule</p>
          <h3 className="text-2xl font-bold text-purple-600 mt-1">
            {currentTenant.workWeekDays || 5}d / wk
          </h3>
          <p className="text-xs text-slate-400 mt-1">{currentTenant.dailyWorkingHours || 8} hrs / shift target</p>
        </Card>
      </div>

      {/* Attendance Records Table */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>
            {isTenantAdmin ? 'Organization Attendance Timesheet Log' : 'My Personal Attendance Timesheet Log'} (
            {displayAttendance.length})
          </span>
        </h3>
        <DataTable
          columns={attColumns}
          data={displayAttendance}
          keyExtractor={(a) => a.id}
          emptyTitle="No attendance records"
          emptyDescription="Clock in to record your daily working hours."
        />
      </div>

      {/* Overtime Requests Queue */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-600" />
          <span>
            {isTenantAdmin ? 'Overtime Claims & Approvals' : 'My Overtime Claims'} ({displayOvertime.length})
          </span>
        </h3>
        <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-200 shadow-xs">
          {displayOvertime.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No overtime requests filed.</div>
          ) : (
            displayOvertime.map((ot) => (
              <div key={ot.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{ot.employeeName}</span>
                    <Badge variant="indigo" size="sm">
                      {ot.requestedMinutes} mins ({Math.round(ot.requestedMinutes / 60)} hrs)
                    </Badge>
                    <Badge status={ot.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Date: <strong className="text-slate-800">{ot.date}</strong> • Reason: {ot.reason}
                  </p>
                </div>

                {ot.status === 'PENDING' && isTenantAdmin && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs font-semibold"
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      onClick={() => handleOtApprove(ot.id, 'APPROVED')}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs font-semibold"
                      leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      onClick={() => handleOtApprove(ot.id, 'REJECTED')}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* REQUEST OVERTIME MODAL                     */}
      {/* ========================================== */}
      <Modal
        isOpen={isOtModalOpen}
        onClose={() => setIsOtModalOpen(false)}
        maxWidth="md"
        title="Request Overtime Compensation"
        description="Submit additional hours worked beyond scheduled shifts for payroll review."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsOtModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRequestOvertime}>
              Submit Overtime Claim
            </Button>
          </div>
        }
      >
        <form onSubmit={handleRequestOvertime} className="space-y-4 text-xs">
          <FormField label="Requested Duration" required>
            <Select
              value={otMinutes}
              onChange={(e) => setOtMinutes(e.target.value)}
              options={[
                { value: '30', label: '30 Minutes (0.5 Hour)' },
                { value: '60', label: '60 Minutes (1.0 Hour)' },
                { value: '90', label: '90 Minutes (1.5 Hours)' },
                { value: '120', label: '120 Minutes (2.0 Hours)' },
                { value: '180', label: '180 Minutes (3.0 Hours)' },
                { value: '240', label: '240 Minutes (4.0 Hours)' },
              ]}
            />
          </FormField>

          <FormField label="Business Justification / Project Work" required>
            <Input
              value={otReason}
              onChange={(e) => setOtReason(e.target.value)}
              placeholder="e.g. Critical release deployment and emergency database migration"
              required
            />
          </FormField>
        </form>
      </Modal>

      {/* ========================================== */}
      {/* TIME CORRECTION MODAL                      */}
      {/* ========================================== */}
      <Modal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
        maxWidth="2xl"
        title="Submit Timesheet Correction"
        description="Fix missing clock-in or clock-out timestamps for previous shifts."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsCorrectionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRequestCorrection}>
              Submit Correction
            </Button>
          </div>
        }
      >
        <form onSubmit={handleRequestCorrection} className="space-y-4 text-xs">
          <FormField label="Shift Date" required>
            <DatePicker
              value={corrDate}
              onChange={setCorrDate}
              placeholder="Select shift date"
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Actual Clock In Time" required>
              <Input
                type="time"
                value={corrClockIn}
                onChange={(e) => setCorrClockIn(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Actual Clock Out Time" required>
              <Input
                type="time"
                value={corrClockOut}
                onChange={(e) => setCorrClockOut(e.target.value)}
                required
              />
            </FormField>
          </div>

          <FormField label="Reason for Correction" required>
            <Input
              value={corrReason}
              onChange={(e) => setCorrReason(e.target.value)}
              placeholder="e.g. Card reader was offline / forgot to clock out"
              required
            />
          </FormField>
        </form>
      </Modal>
      {/* MODAL: ADMIN MANUAL ATTENDANCE ENTRY */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Manually Add Attendance Record"
        description="Admin Entry: Create an attendance timesheet log for an employee."
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateManualAttendance} className="space-y-4 text-xs pt-1 min-h-[380px] flex flex-col justify-between">
          <FormField label="Employee" required>
            <Select
              value={manualEmployeeId}
              onChange={(e) => setManualEmployeeId(e.target.value)}
              placeholder="Select Employee"
              options={employees.map((e: any) => ({ value: e.id, label: `${e.name} (${e.employeeId || 'EMP'})` }))}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date" required>
              <DatePicker value={manualDate} onChange={setManualDate} required />
            </FormField>

            <FormField label="Status" required>
              <Select
                value={manualStatus}
                onChange={(e) => setManualStatus(e.target.value as any)}
                options={[
                  { value: 'PRESENT', label: 'PRESENT — Full Shift' },
                  { value: 'LATE', label: 'LATE — Late Arrival' },
                  { value: 'HALF_DAY', label: 'HALF_DAY — Partial Shift' },
                  { value: 'ABSENT', label: 'ABSENT — No Show' },
                  { value: 'ON_LEAVE', label: 'ON_LEAVE — Approved Time Off' },
                ]}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Clock In Time" required>
              <TimePicker
                value={manualClockIn}
                onChange={setManualClockIn}
              />
            </FormField>

            <FormField label="Clock Out Time" required>
              <TimePicker
                value={manualClockOut}
                onChange={setManualClockOut}
              />
            </FormField>
          </div>

          <FormField label="Notes / Reason">
            <Input
              value={manualNotes}
              onChange={(e) => setManualNotes(e.target.value)}
              placeholder="e.g. Manual entry authorized by HR"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsManualModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Attendance Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADMIN EDIT ATTENDANCE RECORD */}
      {editingRecord && (
        <Modal
          isOpen={!!editingRecord}
          onClose={() => setEditingRecord(null)}
          title={`Edit Attendance: ${editingRecord.employeeName}`}
          description={`Modify timesheet entry for ${editingRecord.date}`}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveEditAttendance} className="space-y-4 text-xs pt-1 min-h-[380px] flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Date" required>
                <DatePicker value={editDate} onChange={setEditDate} required />
              </FormField>

              <FormField label="Status" required>
                <Select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  options={[
                    { value: 'PRESENT', label: 'PRESENT' },
                    { value: 'LATE', label: 'LATE' },
                    { value: 'HALF_DAY', label: 'HALF_DAY' },
                    { value: 'ABSENT', label: 'ABSENT' },
                    { value: 'ON_LEAVE', label: 'ON_LEAVE' },
                  ]}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Clock In Time">
                <TimePicker
                  value={editClockIn}
                  onChange={setEditClockIn}
                />
              </FormField>

              <FormField label="Clock Out Time">
                <TimePicker
                  value={editClockOut}
                  onChange={setEditClockOut}
                />
              </FormField>
            </div>

            <FormField label="Notes">
              <Input
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="e.g. Time correction verified by Admin"
              />
            </FormField>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setEditingRecord(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Attendance Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
