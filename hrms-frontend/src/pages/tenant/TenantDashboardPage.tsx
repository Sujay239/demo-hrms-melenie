import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { Employee, LeaveRequest, Ticket as TicketType, Announcement, Holiday, AttendanceRecord, KBArticle, Department } from '@/demo-data/seedData';
import { Users, Clock, Calendar, CheckSquare, Megaphone, Ticket, ArrowRight, Plus, BookOpen, Paperclip } from 'lucide-react';

export const TenantDashboardPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const currentUser = mockStorage.getCurrentUser();
  const tenants = mockStorage.getTenants();
  const tenant = tenants.find((t) => t.slug === slug) || tenants[0];

  if (!tenant) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-bold text-slate-800">Company Not Found</h3>
        <Link to="/admin" className="text-indigo-600 text-xs hover:underline mt-2 inline-block">Return to Platform Admin</Link>
      </div>
    );
  }

  const isTenantAdmin = mockStorage.isTenantAdminFor(currentUser, tenant.id);

  const employees = mockStorage.getTenantItems<Employee>(KEYS.EMPLOYEES, tenant.id);
  const departments = mockStorage.getTenantItems<Department>(KEYS.DEPARTMENTS, tenant.id);
  const leaveRequests = mockStorage.getTenantItems<LeaveRequest>(KEYS.LEAVE_REQUESTS, tenant.id);
  const tickets = mockStorage.getTenantItems<TicketType>(KEYS.TICKETS, tenant.id);
  const announcements = mockStorage.getTenantItems<Announcement>(KEYS.ANNOUNCEMENTS, tenant.id);
  const holidays = mockStorage.getTenantItems<Holiday>(KEYS.HOLIDAYS, tenant.id);
  const attendance = mockStorage.getTenantItems<AttendanceRecord>(KEYS.ATTENDANCE, tenant.id);

  const myEmployee = employees.find(
    (e) =>
      e.email?.toLowerCase() === currentUser.email?.toLowerCase() ||
      e.id === currentUser.id ||
      (currentUser.name && e.name?.toLowerCase() === currentUser.name?.toLowerCase())
  );

  const myDepartment = departments.find((d) => d.id === myEmployee?.departmentId);
  const myDeptName = myDepartment?.name;

  const rawKbArticles = mockStorage.getTenantItems<KBArticle>(KEYS.KB_ARTICLES, tenant.id);
  const kbArticles = rawKbArticles.filter((a) => {
    if (isTenantAdmin) return true;
    if (!a.targetDepartmentId || a.targetDepartmentId === 'ALL') return true;
    const myDeptId = myEmployee?.departmentId;
    return (
      (myDeptId && a.targetDepartmentId === myDeptId) ||
      (myDeptName && a.targetDepartmentName?.toLowerCase() === myDeptName.toLowerCase()) ||
      (myDeptName && a.targetDepartmentId.toLowerCase() === myDeptName.toLowerCase())
    );
  });

  const pendingLeaves = leaveRequests.filter((lr) => lr.status === 'PENDING').length;
  const openTickets = tickets.filter((tk) => tk.status === 'OPEN' || tk.status === 'IN_PROGRESS' || tk.status === 'WAITING').length;
  const today = new Date().toISOString().split('T')[0];
  const presentCount = attendance.filter((a) => a.date === today && (a.status === 'PRESENT' || a.status === 'HALF_DAY')).length;
  const attendanceRate = employees.length > 0 ? Math.round((presentCount / employees.length) * 100) : 100;

  // Check today's active shift for employee
  const todayAttendance = attendance.find(
    (a) => (a.employeeId === currentUser.id || a.employeeName === currentUser.name) && a.date === today && !a.clockOutTime
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#FF6900] via-[#E05D00] to-[#C800A1] rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-md text-white">
            {isTenantAdmin ? 'Tenant Operations Dashboard' : 'Employee Self-Service Dashboard'}
          </span>
          <h2 className="text-2xl font-bold mt-2">Welcome to {tenant.name}</h2>
          <p className="text-sm text-indigo-100 mt-1">
            Logged in as <span className="font-semibold text-white">{currentUser.name}</span> ({mockStorage.getRoleLabel(currentUser.role)})
          </p>
        </div>

        
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Employees</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{employees.length}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Company team members</p>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Shift Punch</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{presentCount} Present</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">{attendanceRate}% active presence</p>
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

      {/* Sections */}
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
            {announcements.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No announcements published yet.
                {isTenantAdmin && (
                  <div className="mt-2">
                    <Link to={`/${tenant.slug}/announcements`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add First Announcement
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              announcements.slice(0, 3).map((ann) => (
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
              ))
            )}
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
            {holidays.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No holidays configured yet.
                {isTenantAdmin && (
                  <div className="mt-2">
                    <Link to={`/${tenant.slug}/holidays`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Configure Holidays
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              holidays.slice(0, 4).map((hol) => (
                <div key={hol.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-semibold text-slate-900">{hol.name}</h5>
                    <p className="text-xs text-slate-500">{hol.date}</p>
                  </div>
                  <Badge variant={hol.kind === 'FLEXIBLE' ? 'amber' : 'sky'} size="sm">
                    {hol.kind}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Knowledge Base & Step Guides Section */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#FF6900]" /> Company Knowledge Base & Step Guides
            </CardTitle>
            <Link to={`/${tenant.slug}/knowledge-base`} className="text-xs font-semibold text-[#FF6900] hover:text-[#E05D00] flex items-center gap-1">
              Browse All Articles ({kbArticles.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {kbArticles.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No Knowledge Base articles published yet.
                {isTenantAdmin && (
                  <div className="mt-2">
                    <Link to={`/${tenant.slug}/knowledge-base`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Publish First Article
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {kbArticles.slice(0, 3).map((article) => {
                  const docCount = article.attachments?.length || 0;
                  return (
                    <Link
                      key={article.id}
                      to={`/${tenant.slug}/knowledge-base`}
                      className="p-3.5 bg-slate-50 hover:bg-orange-50/20 rounded-xl border border-slate-200 hover:border-[#FF6900]/40 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {article.categoryName}
                          </span>
                          {docCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FF6900] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                              <Paperclip className="w-3 h-3" /> {docCount}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#FF6900] transition-colors line-clamp-1">
                          {article.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {article.content}
                        </p>
                      </div>
                      <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{new Date(article.updatedAt).toLocaleDateString()}</span>
                        <span className="font-semibold text-[#FF6900] group-hover:translate-x-0.5 transition-transform">Read Guide &rarr;</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
