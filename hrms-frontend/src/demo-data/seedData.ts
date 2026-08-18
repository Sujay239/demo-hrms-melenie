export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED';
  logoUrl?: string;
  defaultRegionId: string;
  consultantCount: number;
  employeeCount: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'CONSULTANT' | 'TENANT_ADMIN' | 'EMPLOYEE' | 'NEW_HIRE';
  tenantId?: string;
  assignedTenantIds?: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_ACTIVATION';
  avatarUrl?: string;
}

export interface Region {
  id: string;
  tenantId: string;
  name: string;
  countryCode: string;
  timeZone: string;
  locale: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Department {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  parentDepartmentId?: string | null;
  headEmployeeId?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Designation {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  departmentId?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Employee {
  id: string;
  tenantId: string;
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  departmentId: string;
  designationId: string;
  regionId: string;
  managerId?: string | null;
  joiningDate: string;
  employmentStatus: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  avatarUrl?: string;
}

export interface DocumentRecord {
  id: string;
  tenantId: string;
  name: string;
  category: 'EMPLOYMENT' | 'IDENTIFICATION' | 'MEDICAL' | 'OFFER' | 'TAX' | 'OTHER';
  status: 'CLEAN' | 'PENDING_SCAN' | 'QUARANTINED';
  ownerType: 'EMPLOYEE' | 'NEW_HIRE' | 'TENANT';
  ownerId: string;
  version: number;
  fileSize: string;
  mimeType: string;
  updatedAt: string;
  isSensitive?: boolean;
}

export interface LeaveType {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  status: 'ACTIVE' | 'INACTIVE';
  annualAllowance: number;
  monthlyCredit: number;
  maxConsecutiveDays: number;
}

export interface LeaveRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  requestedDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  appliedDate: string;
}

export interface Holiday {
  id: string;
  tenantId: string;
  regionId: string;
  name: string;
  date: string;
  kind: 'COMMON' | 'FLEXIBLE';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface FlexibleHolidaySelection {
  id: string;
  tenantId: string;
  employeeId: string;
  holidayId: string;
  selectedAt: string;
}

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockInTime?: string;
  clockOutTime?: string;
  totalMinutes: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE';
  correctionRequested?: boolean;
  correctionReason?: string;
}

export interface OvertimeRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  date: string;
  requestedMinutes: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface KBArticle {
  id: string;
  tenantId: string;
  title: string;
  categoryId: string;
  categoryName: string;
  content: string;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  updatedAt: string;
  targetDepartmentId?: string | null;
}

export interface Announcement {
  id: string;
  tenantId: string;
  title: string;
  content: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  publishAt: string;
  expiresAt: string;
  target: 'TENANT_WIDE' | 'DEPARTMENT';
  targetDepartmentId?: string;
  readByIds: string[];
}

export interface TicketComment {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  tenantId: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  departmentId: string;
  departmentName: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';
  createdById: string;
  createdByName: string;
  assigneeName?: string;
  createdAt: string;
  comments: TicketComment[];
}

export interface Building {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  floors: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Room {
  id: string;
  tenantId: string;
  buildingId: string;
  buildingName: string;
  floor: number;
  name: string;
  capacity: number;
  facilities: string[];
  status: 'ACTIVE' | 'INACTIVE';
}

export interface RoomReservation {
  id: string;
  tenantId: string;
  roomId: string;
  roomName: string;
  reservedById: string;
  reservedByName: string;
  title: string;
  startAt: string;
  endAt: string;
  status: 'CONFIRMED' | 'CANCELLED';
}

export interface AuditLog {
  id: string;
  tenantId: string;
  actorId: string;
  actorName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  requestId: string;
}

// SEED DATASETS
export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant-acme',
    name: 'Acme Corporation',
    slug: 'acme-corp',
    status: 'ACTIVE',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    defaultRegionId: 'region-acme-us',
    consultantCount: 1,
    employeeCount: 42,
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'tenant-globex',
    name: 'Globex Industries',
    slug: 'globex-industries',
    status: 'ACTIVE',
    logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80',
    defaultRegionId: 'region-globex-eu',
    consultantCount: 0,
    employeeCount: 18,
    createdAt: '2026-03-20T10:30:00Z',
  },
  {
    id: 'tenant-initech',
    name: 'Initech Solutions',
    slug: 'initech-solutions',
    status: 'INACTIVE',
    logoUrl: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80',
    defaultRegionId: 'region-initech-us',
    consultantCount: 0,
    employeeCount: 8,
    createdAt: '2026-05-04T14:15:00Z',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-superadmin',
    name: 'Alex Rivera (Super Admin)',
    email: 'admin@cyrcalur.hr',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-consultant-1',
    name: 'Morgan Vance (Consultant)',
    email: 'consultant@cyrcalur.hr',
    role: 'CONSULTANT',
    assignedTenantIds: ['tenant-acme'],
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-acme-admin',
    name: 'Sarah Connor (HR Admin)',
    email: 'hr@acme-corp.com',
    role: 'TENANT_ADMIN',
    tenantId: 'tenant-acme',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-acme-emp-1',
    name: 'Asha Rao (Engineering Lead)',
    email: 'asha@acme-corp.com',
    role: 'EMPLOYEE',
    tenantId: 'tenant-acme',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-acme-emp-2',
    name: 'David Chen (Software Engineer)',
    email: 'david@acme-corp.com',
    role: 'EMPLOYEE',
    tenantId: 'tenant-acme',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-acme-newhire',
    name: 'Sam Lee (New Hire)',
    email: 'newhire@acme-corp.com',
    role: 'NEW_HIRE',
    tenantId: 'tenant-acme',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_REGIONS: Region[] = [
  {
    id: 'region-acme-us',
    tenantId: 'tenant-acme',
    name: 'North America (US East)',
    countryCode: 'US',
    timeZone: 'America/New_York',
    locale: 'en-US',
    status: 'ACTIVE',
  },
  {
    id: 'region-acme-in',
    tenantId: 'tenant-acme',
    name: 'India East',
    countryCode: 'IN',
    timeZone: 'Asia/Kolkata',
    locale: 'en-IN',
    status: 'ACTIVE',
  },
  {
    id: 'region-globex-eu',
    tenantId: 'tenant-globex',
    name: 'Europe (London)',
    countryCode: 'GB',
    timeZone: 'Europe/London',
    locale: 'en-GB',
    status: 'ACTIVE',
  },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-acme-eng',
    tenantId: 'tenant-acme',
    name: 'Engineering',
    description: 'Product Engineering and Core Infrastructure',
    parentDepartmentId: null,
    headEmployeeId: 'emp-acme-asha',
    status: 'ACTIVE',
  },
  {
    id: 'dept-acme-hr',
    tenantId: 'tenant-acme',
    name: 'Human Resources',
    description: 'People Operations and Talent Acquisition',
    parentDepartmentId: null,
    headEmployeeId: null,
    status: 'ACTIVE',
  },
  {
    id: 'dept-acme-fe',
    tenantId: 'tenant-acme',
    name: 'Frontend Team',
    description: 'Web & Mobile Applications',
    parentDepartmentId: 'dept-acme-eng',
    headEmployeeId: 'emp-acme-david',
    status: 'ACTIVE',
  },
];

export const INITIAL_DESIGNATIONS: Designation[] = [
  {
    id: 'desig-acme-lead',
    tenantId: 'tenant-acme',
    name: 'Staff Software Engineer',
    description: 'Technical lead for engineering squads',
    departmentId: 'dept-acme-eng',
    status: 'ACTIVE',
  },
  {
    id: 'desig-acme-swe',
    tenantId: 'tenant-acme',
    name: 'Software Engineer',
    description: 'Individual contributor',
    departmentId: 'dept-acme-eng',
    status: 'ACTIVE',
  },
  {
    id: 'desig-acme-hrmgr',
    tenantId: 'tenant-acme',
    name: 'HR Operations Manager',
    description: 'Manages people processes and onboarding',
    departmentId: 'dept-acme-hr',
    status: 'ACTIVE',
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-acme-asha',
    tenantId: 'tenant-acme',
    employeeId: 'EMP-1001',
    name: 'Asha Rao',
    email: 'asha@acme-corp.com',
    phone: '+91 98765 43210',
    departmentId: 'dept-acme-eng',
    designationId: 'desig-acme-lead',
    regionId: 'region-acme-in',
    managerId: null,
    joiningDate: '2024-03-15',
    employmentStatus: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'emp-acme-david',
    tenantId: 'tenant-acme',
    employeeId: 'EMP-1002',
    name: 'David Chen',
    email: 'david@acme-corp.com',
    phone: '+1 415 555 0192',
    departmentId: 'dept-acme-fe',
    designationId: 'desig-acme-swe',
    regionId: 'region-acme-us',
    managerId: 'emp-acme-asha',
    joiningDate: '2025-01-10',
    employmentStatus: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc-101',
    tenantId: 'tenant-acme',
    name: 'Employment_Agreement_Asha_Rao.pdf',
    category: 'EMPLOYMENT',
    status: 'CLEAN',
    ownerType: 'EMPLOYEE',
    ownerId: 'emp-acme-asha',
    version: 1,
    fileSize: '1.2 MB',
    mimeType: 'application/pdf',
    updatedAt: '2026-08-10T11:00:00Z',
  },
  {
    id: 'doc-102',
    tenantId: 'tenant-acme',
    name: 'Passport_Scan_David_Chen.pdf',
    category: 'IDENTIFICATION',
    status: 'CLEAN',
    ownerType: 'EMPLOYEE',
    ownerId: 'emp-acme-david',
    version: 2,
    fileSize: '850 KB',
    mimeType: 'application/pdf',
    updatedAt: '2026-08-12T14:30:00Z',
    isSensitive: true,
  },
  {
    id: 'doc-103',
    tenantId: 'tenant-acme',
    name: 'Offer_Letter_Sam_Lee.pdf',
    category: 'OFFER',
    status: 'CLEAN',
    ownerType: 'NEW_HIRE',
    ownerId: 'user-acme-newhire',
    version: 1,
    fileSize: '450 KB',
    mimeType: 'application/pdf',
    updatedAt: '2026-08-15T09:15:00Z',
  },
];

export const INITIAL_LEAVE_TYPES: LeaveType[] = [
  {
    id: 'lt-sick',
    tenantId: 'tenant-acme',
    name: 'Sick Leave',
    code: 'SL',
    status: 'ACTIVE',
    annualAllowance: 12,
    monthlyCredit: 1.0,
    maxConsecutiveDays: 3,
  },
  {
    id: 'lt-pto',
    tenantId: 'tenant-acme',
    name: 'Paid Time Off (PTO)',
    code: 'PTO',
    status: 'ACTIVE',
    annualAllowance: 18,
    monthlyCredit: 1.5,
    maxConsecutiveDays: 10,
  },
];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lr-201',
    tenantId: 'tenant-acme',
    employeeId: 'emp-acme-david',
    employeeName: 'David Chen',
    leaveTypeId: 'lt-pto',
    leaveTypeName: 'Paid Time Off (PTO)',
    startDate: '2026-09-10',
    endDate: '2026-09-12',
    requestedDays: 3,
    reason: 'Family vacation',
    status: 'PENDING',
    appliedDate: '2026-08-17T10:00:00Z',
  },
  {
    id: 'lr-202',
    tenantId: 'tenant-acme',
    employeeId: 'emp-acme-asha',
    employeeName: 'Asha Rao',
    leaveTypeId: 'lt-sick',
    leaveTypeName: 'Sick Leave',
    startDate: '2026-08-05',
    endDate: '2026-08-05',
    requestedDays: 1,
    reason: 'Medical checkup',
    status: 'APPROVED',
    appliedDate: '2026-08-04T08:30:00Z',
  },
];

export const INITIAL_HOLIDAYS: Holiday[] = [
  {
    id: 'hol-1',
    tenantId: 'tenant-acme',
    regionId: 'region-acme-in',
    name: 'Independence Day',
    date: '2026-08-15',
    kind: 'COMMON',
    status: 'ACTIVE',
  },
  {
    id: 'hol-2',
    tenantId: 'tenant-acme',
    regionId: 'region-acme-in',
    name: 'Regional Cultural Festival',
    date: '2026-10-20',
    kind: 'FLEXIBLE',
    status: 'ACTIVE',
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-301',
    tenantId: 'tenant-acme',
    employeeId: 'emp-acme-asha',
    employeeName: 'Asha Rao',
    date: '2026-08-18',
    clockInTime: '09:00 AM',
    clockOutTime: '06:00 PM',
    totalMinutes: 540,
    status: 'PRESENT',
  },
  {
    id: 'att-302',
    tenantId: 'tenant-acme',
    employeeId: 'emp-acme-david',
    employeeName: 'David Chen',
    date: '2026-08-18',
    clockInTime: '09:15 AM',
    clockOutTime: '06:30 PM',
    totalMinutes: 555,
    status: 'PRESENT',
    correctionRequested: false,
  },
];

export const INITIAL_OVERTIME: OvertimeRequest[] = [
  {
    id: 'ot-401',
    tenantId: 'tenant-acme',
    employeeId: 'emp-acme-david',
    employeeName: 'David Chen',
    date: '2026-08-16',
    requestedMinutes: 120,
    reason: 'Critical production deployment release',
    status: 'APPROVED',
  },
];

export const INITIAL_KB_ARTICLES: KBArticle[] = [
  {
    id: 'kb-501',
    tenantId: 'tenant-acme',
    title: 'Company Expense & Travel Policy 2026',
    categoryId: 'cat-policies',
    categoryName: 'Company Policies',
    content: 'All business travel and expense claims must be pre-approved by the department head and submitted within 30 days of occurrence.',
    tags: ['expenses', 'policy', 'travel'],
    status: 'PUBLISHED',
    updatedAt: '2026-07-01T00:00:00Z',
  },
  {
    id: 'kb-502',
    tenantId: 'tenant-acme',
    title: 'Engineering Git Workflow & Architecture Standards',
    categoryId: 'cat-eng',
    categoryName: 'Engineering',
    content: 'We adhere strictly to mandatory backend layering: Route -> Controller -> Service -> Repository -> Database.',
    tags: ['engineering', 'standards'],
    status: 'PUBLISHED',
    updatedAt: '2026-08-10T12:00:00Z',
    targetDepartmentId: 'dept-acme-eng',
  },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-601',
    tenantId: 'tenant-acme',
    title: 'Office Facility Upgrades & Maintenance Window',
    content: 'Please note that facility maintenance will take place this coming Friday from 6 PM to 10 PM. Internet connectivity may be intermittent.',
    priority: 'HIGH',
    publishAt: '2026-08-18T00:00:00Z',
    expiresAt: '2026-08-25T00:00:00Z',
    target: 'TENANT_WIDE',
    readByIds: ['user-acme-emp-1'],
  },
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'tkt-701',
    tenantId: 'tenant-acme',
    ticketNumber: 'TKT-00104',
    subject: 'VPN Connection Timeout Issue',
    description: 'Unable to connect to the internal staging VPN endpoint since this morning.',
    category: 'IT Support',
    departmentId: 'dept-acme-eng',
    departmentName: 'Engineering',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    createdById: 'emp-acme-david',
    createdByName: 'David Chen',
    assigneeName: 'IT Operations',
    createdAt: '2026-08-18T08:30:00Z',
    comments: [
      {
        id: 'c-1',
        authorName: 'IT Support Bot',
        authorRole: 'SYSTEM',
        content: 'Ticket assigned to IT Operations queue.',
        createdAt: '2026-08-18T08:31:00Z',
      },
    ],
  },
];

export const INITIAL_BUILDINGS: Building[] = [
  {
    id: 'bld-1',
    tenantId: 'tenant-acme',
    name: 'HQ Tower Alpha',
    address: '100 Innovation Way, Tech Park',
    floors: 5,
    status: 'ACTIVE',
  },
];

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-1',
    tenantId: 'tenant-acme',
    buildingId: 'bld-1',
    buildingName: 'HQ Tower Alpha',
    floor: 3,
    name: 'Innovation Hub (Conf A)',
    capacity: 12,
    facilities: ['Video Conf', 'Whiteboard', '4K TV'],
    status: 'ACTIVE',
  },
  {
    id: 'room-2',
    tenantId: 'tenant-acme',
    buildingId: 'bld-1',
    buildingName: 'HQ Tower Alpha',
    floor: 3,
    name: 'Focus Pod 3B',
    capacity: 4,
    facilities: ['Monitor', 'Whiteboard'],
    status: 'ACTIVE',
  },
];

export const INITIAL_RESERVATIONS: RoomReservation[] = [
  {
    id: 'res-1',
    tenantId: 'tenant-acme',
    roomId: 'room-1',
    roomName: 'Innovation Hub (Conf A)',
    reservedById: 'emp-acme-asha',
    reservedByName: 'Asha Rao',
    title: 'Sprint Planning Sync',
    startAt: '2026-08-19T10:00:00Z',
    endAt: '2026-08-19T11:00:00Z',
    status: 'CONFIRMED',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-901',
    tenantId: 'tenant-acme',
    actorId: 'user-acme-admin',
    actorName: 'Sarah Connor',
    action: 'TENANT_LOGO_UPDATED',
    resourceType: 'TENANT',
    resourceId: 'tenant-acme',
    timestamp: '2026-08-18T09:00:00Z',
    requestId: 'req-abc-123',
  },
  {
    id: 'aud-902',
    tenantId: 'tenant-acme',
    actorId: 'user-acme-emp-1',
    actorName: 'Asha Rao',
    action: 'DOCUMENT_DOWNLOADED',
    resourceType: 'DOCUMENT',
    resourceId: 'doc-101',
    timestamp: '2026-08-18T11:20:00Z',
    requestId: 'req-xyz-789',
  },
];
