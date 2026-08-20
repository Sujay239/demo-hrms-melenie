import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { Employee, LeaveRequest, Ticket as TicketType, Announcement, Holiday, AttendanceRecord } from '@/demo-data/seedData';
import { Users, Clock, Calendar, CheckSquare, Megaphone, Ticket, ArrowRight } from 'lucide-react';

export const TenantDashboardPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const currentUser = mockStorage.getCurrentUser();
  const tenants = mockStorage.getTenants();
  const tenant = tenants.find((t) => t.slug === slug) || tenants[0];

  const isTenantAdmin = mockStorage.isTenantAdminFor(currentUser, tenant.id);

  const employees = mockStorage.getTenantItems<Employee>(KEYS.EMPLOYEES, tenant.id);
  const leaveRequests = mockStorage.getTenantItems<LeaveRequest>(KEYS.LEAVE_REQUESTS, tenant.id);
  const tickets = mockStorage.getTenantItems<TicketType>(KEYS.TICKETS, tenant.id);
  const announcements = mockStorage.getTenantItems<Announcement>(KEYS.ANNOUNCEMENTS, tenant.id);
  const holidays = mockStorage.getTenantItems<Holiday>(KEYS.HOLIDAYS, tenant.id);
  const attendance = mockStorage.getTenantItems<AttendanceRecord>(KEYS.ATTENDANCE, tenant.id);

  const pendingLeaves = leaveRequests.filter((lr) => lr.status === 'PENDING').length;
  const openTickets = tickets.filter((tk) => tk.status === 'OPEN' || tk.status === 'IN_PROGRESS' || tk.status === 'WAITING').length;
  const presentCount = attendance.filter((a) => a.status === 'PRESENT').length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 95;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-md text-white">
            {isTenantAdmin ? 'Tenant Operations Dashboard' : 'Employee Self-Service Dashboard'}
          </span>
          <h2 className="text-2xl font-bold mt-2">Welcome to {tenant.name}</h2>
          <p className="text-sm text-indigo-100 mt-1">
            Logged in as <span className="font-semibold text-white">{currentUser.name}</span> ({mockStorage.getRoleLabel(currentUser.role)})
          </p>
        </div>

        {!isTenantAdmin && (
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/20 flex items-center gap-3">
            <div>
              <p className="text-xs text-indigo-200">Today's Attendance Status</p>
              <p className="text-sm font-bold text-white">CLOCKED IN (09:00 AM)</p>
            </div>
            <Button variant="secondary" size="sm">
              Clock Out
            </Button>
          </div>
        )}
      </div>

      {/* Metrics Row - Predefined Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Employees</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{employees.length || tenant.employeeCount}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Verified directory members</p>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Attendance</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{attendanceRate}%</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">{presentCount} present on record</p>
        </Card>

        <Card className="border-l-4 border-l-amber-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Leave</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{pendingLeaves}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Awaiting manager approval</p>
        </Card>

        <Card className="border-l-4 border-l-sky-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Open Tickets</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{openTickets}</h3>
            </div>
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
              <Ticket className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Active help desk queue</p>
        </Card>
      </div>

      {/* Predefined Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-indigo-600" /> Recent Announcements
            </CardTitle>
            <Link to={`/${tenant.slug}/announcements`} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.slice(0, 3).map((ann) => (
              <div key={ann.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900">{ann.title}</span>
                  <Badge variant={ann.priority === 'HIGH' ? 'rose' : ann.priority === 'MEDIUM' ? 'amber' : 'neutral'} size="sm">
                    {ann.priority} PRIORITY
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {ann.content}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-600" /> Upcoming Holidays
            </CardTitle>
            <Link to={`/${tenant.slug}/holidays`} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {holidays.slice(0, 4).map((hol) => (
              <div key={hol.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-semibold text-slate-900">{hol.name}</h5>
                  <p className="text-xs text-slate-500">{hol.date}</p>
                </div>
                <Badge variant={hol.kind === 'FLEXIBLE' ? 'amber' : 'sky'} size="sm">
                  {hol.kind}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
