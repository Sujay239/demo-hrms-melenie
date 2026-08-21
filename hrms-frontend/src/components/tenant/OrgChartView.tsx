import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Employee, Department, Designation, Region, User, AttendanceRecord } from '@/demo-data/seedData';
import { Avatar } from '@/components/ui/Avatar';
import { mockStorage, KEYS } from '@/services/mock-storage';
import {
  Users,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Lock,
  Globe,
  Search,
  Move,
  CheckCircle2,
} from 'lucide-react';

interface EmployeeWithRole {
  employee: Employee;
  department?: Department;
  designation?: Designation;
  roleType: 'CEO' | 'Manager' | 'Team Lead' | 'Employee';
}

interface DepartmentBranch {
  department: Department;
  manager: EmployeeWithRole;
  teamLead?: EmployeeWithRole;
  employees: EmployeeWithRole[];
}

export interface OrgChartViewProps {
  employees: Employee[];
  departments: Department[];
  designations: Designation[];
  regions: Region[];
  currentUser: any;
  isTenantAdmin: boolean;
  myEmployee?: Employee;
  onSelectEmployee: (employee: Employee) => void;
}

export const OrgChartView: React.FC<OrgChartViewProps> = ({
  employees,
  departments,
  designations,
  regions,
  currentUser,
  isTenantAdmin,
  myEmployee,
  onSelectEmployee,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Check if current user has Admin/HR scope
  const myDept = departments.find((d) => d.id === myEmployee?.departmentId);
  const isHR =
    myDept?.name?.toLowerCase().includes('hr') ||
    myDept?.name?.toLowerCase().includes('human resource') ||
    myDept?.name?.toLowerCase().includes('people');

  const hasFullAccess = isTenantAdmin || isHR;

  // Attendance Records for Live "In Office" presence
  const currentTenantId = employees[0]?.tenantId || '';
  const attendance = mockStorage.getTenantItems<AttendanceRecord>(KEYS.ATTENDANCE, currentTenantId);
  const todayStr = new Date().toISOString().split('T')[0];

  const getAttendanceStatus = (emp: Employee, roleType: string) => {
    if (roleType === 'CEO') return true; // Administrator is always online
    const record = attendance.find(
      (a) =>
        (a.employeeId === emp.id ||
          a.employeeId === emp.employeeId ||
          a.employeeName?.toLowerCase() === emp.name?.toLowerCase()) &&
        a.date === todayStr
    );
    if (record) {
      return record.status === 'PRESENT' || record.status === 'HALF_DAY' || !record.clockOutTime;
    }
    return emp.employmentStatus === 'ACTIVE';
  };

  // Isolated mouse wheel zoom on canvas ONLY
  useEffect(() => {
    const canvas = canvasContainerRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoomLevel((prev) => {
        const next = Math.round(prev * zoomFactor);
        return Math.min(200, Math.max(30, next));
      });
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Panning handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (
      (e.target as HTMLElement).closest('.org-node-card') ||
      (e.target as HTMLElement).closest('.interactive-control')
    ) {
      return;
    }
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  const resetCanvas = () => {
    setZoomLevel(85);
    setPan({ x: 0, y: 0 });
  };

  // Helper to score seniority / designation rank
  const getSeniorityScore = (emp: Employee) => {
    const desig = designations.find((d) => d.id === emp.designationId)?.name.toLowerCase() || '';
    if (desig.includes('director') || desig.includes('vp') || desig.includes('vice president')) return 80;
    if (desig.includes('head') || desig.includes('manager') || desig.includes('lead manager')) return 70;
    if (desig.includes('architect') || desig.includes('principal') || desig.includes('lead') || desig.includes('staff')) return 60;
    if (desig.includes('senior')) return 50;
    return 30;
  };

  // Build Structured Department Branches (Admin at Apex -> Department Managers -> Team Leads -> Employees)
  const { topAdminNode, departmentBranches } = useMemo(() => {
    let activeEmployees = employees;
    if (!hasFullAccess) {
      if (myEmployee?.departmentId) {
        activeEmployees = employees.filter((e) => e.departmentId === myEmployee.departmentId);
      }
    } else if (selectedDeptId !== 'ALL') {
      activeEmployees = employees.filter((e) => e.departmentId === selectedDeptId);
    }

    if (activeEmployees.length === 0) {
      return { topAdminNode: null, departmentBranches: [] };
    }

    // Top Administrator / Executive (Shown when viewing company-wide tree)
    let adminNode: EmployeeWithRole | null = null;

    if (hasFullAccess && selectedDeptId === 'ALL') {
      const users = mockStorage.getItem<User>(KEYS.USERS);
      const tenantAdminUser =
        users.find((u) => u.role === 'TENANT_ADMIN' && u.tenantId === currentTenantId) ||
        users.find((u) => u.role === 'TENANT_ADMIN' || u.role === 'SUPER_ADMIN') ||
        currentUser;

      adminNode = {
        employee: {
          id: tenantAdminUser.id || 'admin-root',
          tenantId: currentTenantId || '',
          employeeId: 'ADM-001',
          name: tenantAdminUser.name || 'Company Administrator',
          email: tenantAdminUser.email || 'admin@company.com',
          departmentId: '',
          designationId: '',
          regionId: '',
          joiningDate: '2024-01-01',
          employmentStatus: 'ACTIVE',
          avatarUrl: tenantAdminUser.avatarUrl,
        },
        designation: {
          id: 'desig-admin',
          tenantId: '',
          name: 'Executive & Company Administrator',
          status: 'ACTIVE',
        },
        roleType: 'CEO',
      };
    }

    // Build Department Branches
    const branches: DepartmentBranch[] = [];

    const deptList =
      hasFullAccess && selectedDeptId === 'ALL'
        ? departments
        : departments.filter((d) => activeEmployees.some((e) => e.departmentId === d.id));

    deptList.forEach((dept) => {
      const deptEmps = activeEmployees.filter((e) => e.departmentId === dept.id);
      if (deptEmps.length === 0) return;

      const sortedEmps = [...deptEmps].sort((a, b) => getSeniorityScore(b) - getSeniorityScore(a));

      const managerEmp = sortedEmps[0];
      const managerObj: EmployeeWithRole = {
        employee: managerEmp,
        department: dept,
        designation: designations.find((d) => d.id === managerEmp.designationId),
        roleType: 'Manager',
      };

      let teamLeadObj: EmployeeWithRole | undefined = undefined;
      let employeesList: EmployeeWithRole[] = [];

      if (sortedEmps.length > 1) {
        const leadEmp = sortedEmps[1];
        teamLeadObj = {
          employee: leadEmp,
          department: dept,
          designation: designations.find((d) => d.id === leadEmp.designationId),
          roleType: 'Team Lead',
        };

        const remainingEmps = sortedEmps.slice(2);
        employeesList = remainingEmps.map((emp) => ({
          employee: emp,
          department: dept,
          designation: designations.find((d) => d.id === emp.designationId),
          roleType: 'Employee',
        }));
      }

      branches.push({
        department: dept,
        manager: managerObj,
        teamLead: teamLeadObj,
        employees: employeesList,
      });
    });

    return { topAdminNode: adminNode, departmentBranches: branches };
  }, [employees, departments, designations, hasFullAccess, selectedDeptId, myEmployee, currentUser, currentTenantId]);

  // Card component with Green Presence Marker
  const renderCard = (node: EmployeeWithRole) => {
    const { employee, designation } = node;
    const isSelf = myEmployee?.id === employee.id || (currentUser?.id && employee.id === currentUser.id);
    const isPresent = getAttendanceStatus(employee, node.roleType);

    const matchesSearch =
      searchTerm.trim() !== '' &&
      (employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        designation?.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      <div
        key={employee.id}
        onClick={() => {
          if (node.roleType !== 'CEO') {
            onSelectEmployee(employee);
          }
        }}
        className={`org-node-card bg-white rounded-2xl border transition-all duration-150 p-3.5 flex items-center gap-3.5 w-56 sm:w-60 cursor-pointer select-none shadow-xs hover:shadow-md hover:border-slate-300 ${
          matchesSearch
            ? 'ring-3 ring-orange-500 border-[#FF6900] bg-orange-50/30 scale-105 z-30 shadow-lg'
            : isSelf
            ? 'border-indigo-500 ring-2 ring-indigo-100 shadow-md'
            : 'border-slate-200'
        }`}
      >
        {/* Avatar with Green Status Marker */}
        <div className="relative shrink-0">
          <Avatar
            src={employee.avatarUrl}
            name={employee.name}
            size="md"
            className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-100"
          />
          {/* Green presence marker */}
          <span
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
              isPresent ? 'bg-emerald-500 shadow-xs' : 'bg-slate-300'
            }`}
            title={isPresent ? '🟢 Present in Office' : '⚪ Offline / Absent'}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {employee.name}
            </h4>
            {isSelf && (
              <span className="text-[8px] font-bold bg-indigo-600 text-white px-1.5 py-0.2 rounded-full shrink-0">
                You
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 font-normal truncate mt-0.5">
            {designation?.name || (node.roleType === 'CEO' ? 'Company Administrator' : 'Team Member')}
          </p>

          {/* Presence Status Tag */}
          <div className="mt-1">
            {isPresent ? (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                In Office
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[9px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.2 rounded-md border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                Offline
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Scope selector & Presence Legend */}
        <div className="flex flex-wrap items-center gap-3">
          {hasFullAccess ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Scope:</span>
              </span>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="interactive-control text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6900]/20 cursor-pointer"
              >
                <option value="ALL">🌐 Full Organization Tree (Admin Head)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    🏢 {d.name} Only
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-xl border border-purple-200 text-xs font-semibold text-purple-900">
              <Lock className="w-3.5 h-3.5 text-purple-600" />
              <span>
                Department Hierarchy: <strong>{myDept?.name || 'Your Department'}</strong>
              </span>
            </div>
          )}

          {/* Search in Canvas */}
          <div className="relative min-w-[190px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Find colleague in tree..."
              className="interactive-control w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6900]/20"
            />
          </div>

          {/* Green Marker Presence Legend */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Present In Office</span>
            <span className="text-slate-300">|</span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="text-slate-400">Offline</span>
          </div>
        </div>

        {/* Zoom & Canvas controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1 text-xs text-slate-400 mr-1 hidden md:flex">
            <Move className="w-3.5 h-3.5" />
            <span className="text-[11px]">Scroll mouse to zoom • Drag to pan</span>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 interactive-control">
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.max(30, prev - 10))}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold text-slate-700 w-11 text-center select-none">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.min(200, prev + 10))}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={resetCanvas}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modern Canvas Area */}
      <div
        ref={canvasContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`w-full min-h-[660px] max-h-[82vh] overflow-hidden bg-[#F8FAFC] border border-slate-200/90 rounded-3xl p-12 relative flex items-center justify-center shadow-inner ${
          isPanning ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {departmentBranches.length > 0 || topAdminNode ? (
          <div
            className="transition-transform duration-75 origin-center flex flex-col items-center select-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel / 100})`,
            }}
          >
            {/* Level 1: Company Administrator at Apex */}
            {topAdminNode && (
              <div className="flex flex-col items-center relative">
                {renderCard(topAdminNode)}

                {/* Vertical trunk line from Admin */}
                {departmentBranches.length > 0 && (
                  <div className="w-0.5 h-10 bg-slate-300" />
                )}
              </div>
            )}

            {/* Level 2 to 4: Department Columns */}
            {departmentBranches.length > 0 && (
              <div className="flex flex-col items-center w-full">
                {/* Horizontal connector bar spanning all department columns */}
                {departmentBranches.length > 1 && topAdminNode && (
                  <div
                    className="h-0.5 bg-slate-300"
                    style={{
                      width: `calc(100% - ${230}px)`,
                    }}
                  />
                )}

                {/* Columns Container */}
                <div className="flex items-start justify-center gap-10 sm:gap-14 pt-0">
                  {departmentBranches.map((branch, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      {/* Vertical line dropping from horizontal Admin trunk */}
                      {topAdminNode && <div className="w-0.5 h-8 bg-slate-300" />}

                      {/* Small Department Title above Manager */}
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5 text-center">
                        {branch.department.name}
                      </span>

                      {/* Level 2: Department Manager */}
                      {renderCard(branch.manager)}

                      {/* Level 3: Team Lead */}
                      {branch.teamLead && (
                        <div className="flex flex-col items-center w-full">
                          {/* Vertical line from Manager to Team Lead */}
                          <div className="w-0.5 h-8 bg-slate-300" />

                          {renderCard(branch.teamLead)}

                          {/* Level 4: Employees under Team Lead (Branching horizontally!) */}
                          {branch.employees.length > 0 && (
                            <div className="flex flex-col items-center w-full">
                              {/* Vertical stem down from Team Lead */}
                              <div className="w-0.5 h-8 bg-slate-300" />

                              {/* Horizontal connector bar for employees under this Team Lead */}
                              {branch.employees.length > 1 && (
                                <div
                                  className="h-0.5 bg-slate-300"
                                  style={{
                                    width: `calc(100% - ${220 / branch.employees.length}px)`,
                                  }}
                                />
                              )}

                              {/* Employees row */}
                              <div className="flex items-start justify-center gap-4 sm:gap-6 pt-0">
                                {branch.employees.map((empNode) => (
                                  <div
                                    key={empNode.employee.id}
                                    className="flex flex-col items-center"
                                  >
                                    {/* Vertical line dropping to employee card */}
                                    <div className="w-0.5 h-8 bg-slate-300" />
                                    {renderCard(empNode)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 relative z-10">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No Hierarchy Records Found</h4>
            <p className="text-xs text-slate-400 mt-1">
              No colleagues configured in this organizational scope.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
