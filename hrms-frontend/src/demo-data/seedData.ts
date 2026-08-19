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

  // New Company Parameters
  offerLetterExpiryDays?: number;      // e.g. 7 or 14 days
  annualLeaveAllowance?: number;       // e.g. 24 days
  industry?: string;                   // e.g. 'Software & Cloud Technology'
  countryCode?: string;                // e.g. 'US', 'GB', 'SG', 'IN'
  currency?: string;                   // e.g. 'USD', 'EUR', 'GBP', 'INR'
  workWeekDays?: number;               // e.g. 5 days
  dailyWorkingHours?: number;          // e.g. 8 hours
  probationPeriodDays?: number;        // e.g. 90 days
  noticePeriodDays?: number;           // e.g. 30 days
  timezone?: string;                   // e.g. 'America/New_York (EST)'
  adminEmail?: string;                 // e.g. 'hr@acme-corp.com'
  websiteUrl?: string;                 // e.g. 'https://acme-corp.com'

  // Per-Company Feature Toggles
  features?: TenantFeatures;
}

export interface TenantFeatures {
  onboarding?: boolean;          // Onboarding Cases & New Hire Checklist
  leaveManagement?: boolean;     // Leave Requests, Balances & Types
  attendance?: boolean;          // Clock-in / Clock-out & Overtime Logs
  knowledgeBase?: boolean;       // Company Knowledge Base Articles
  announcements?: boolean;       // Bulletin & Announcements
  helpDesk?: boolean;            // Help Desk Tickets
  meetingRooms?: boolean;        // Room Reservations
  documentVault?: boolean;       // Official Company Documents
  orgStructure?: boolean;        // Regions, Departments, Designations
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'CONSULTANT' | 'TENANT_ADMIN' | 'EMPLOYEE' | 'NEW_HIRE';
  tenantId?: string;
  assignedTenantIds?: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_ACTIVATION' | 'SUSPENDED';
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

  // Personal Information
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  nationality?: string;
  bloodGroup?: 'O+' | 'A+' | 'B+' | 'AB+' | 'O-' | 'A-' | 'B-' | 'AB-';
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  currentAddress?: string;
  permanentAddress?: string;

  // Job & Team Information
  employmentType?: 'Full Time' | 'Part Time' | 'Contract' | 'Intern' | 'Probation';
  confirmationDate?: string;
  workLocation?: string;
  teamName?: string;
  skills?: string[];

  // Compensation Information
  ctcAnnual?: number | string;
  basicSalary?: number | string;
  variablePay?: number | string;
  allowances?: number | string;
  paymentMode?: 'Bank Transfer' | 'Direct Deposit' | 'Check' | 'Cash';
  bankName?: string;
  bankAccountNumber?: string;
  ifscRoutingCode?: string;
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
  code?: string;
  category?: 'PAID' | 'SICK' | 'CASUAL' | 'PARENTAL' | 'UNPAID' | 'COMPENSATORY';
  description?: string;
  requiresDoc?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
  annualAllowance: number;
  monthlyCredit: number;
  maxConsecutiveDays: number;
  carryForwardLimit?: number;
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
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE' | 'HALF_DAY';
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

export interface OnboardingDocumentUpload {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  fileDataUrl?: string;
  fileType?: string;
}

export interface OnboardingCase {
  id: string;
  tenantId: string;
  userId: string;
  employeeId?: string;
  candidateName: string;
  email: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  funFact?: string;
  departmentId: string;
  departmentName: string;
  designationId: string;
  designationName: string;
  managerId?: string | null;
  managerName: string;
  joiningDate: string;
  regionName: string;
  personalDetailsCompleted: boolean;
  offerSignedUploaded: boolean;
  offerSignedFileName?: string;
  offerSignedAt?: string;
  offerSignatureDataUrl?: string;
  requiredDocsUploaded: boolean;
  uploadedDocs?: OnboardingDocumentUpload[];
  acknowledgementSigned: boolean;
  acknowledgementName?: string;
  acknowledgementPlace?: string;
  acknowledgementDate?: string;
  status: 'IN_PROGRESS' | 'SUBMITTED_FOR_REVIEW' | 'APPROVED' | 'REJECTED';
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  avatarUrl?: string;
  notes?: string;
}

// ==========================================
// SEED DATASETS - COMPREHENSIVE & SYNCHRONIZED
// ==========================================

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant-acme',
    name: 'Acme Corporation',
    slug: 'acme-corp',
    status: 'ACTIVE',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    defaultRegionId: 'region-acme-us',
    consultantCount: 1,
    employeeCount: 12,
    offerLetterExpiryDays: 14,
    annualLeaveAllowance: 24,
    industry: 'Software & Cloud Technology',
    countryCode: 'US',
    currency: 'USD',
    workWeekDays: 5,
    dailyWorkingHours: 8,
    probationPeriodDays: 90,
    noticePeriodDays: 30,
    timezone: 'America/New_York (EST)',
    adminEmail: 'hr@acme-corp.com',
    websiteUrl: 'https://acme-corp.com',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'tenant-globex',
    name: 'Globex Industries',
    slug: 'globex-industries',
    status: 'ACTIVE',
    logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80',
    defaultRegionId: 'region-globex-eu',
    consultantCount: 1,
    employeeCount: 6,
    offerLetterExpiryDays: 7,
    annualLeaveAllowance: 28,
    industry: 'Advanced Manufacturing & Heavy Industrial',
    countryCode: 'GB',
    currency: 'GBP',
    workWeekDays: 5,
    dailyWorkingHours: 7.5,
    probationPeriodDays: 90,
    noticePeriodDays: 60,
    timezone: 'Europe/London (GMT)',
    adminEmail: 'hr@globex-industries.com',
    websiteUrl: 'https://globex-industries.com',
    createdAt: '2026-03-20T10:30:00Z',
  },
  {
    id: 'tenant-apex',
    name: 'Apex Global Logistics',
    slug: 'apex-logistics',
    status: 'ACTIVE',
    logoUrl: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80',
    defaultRegionId: 'region-apex-sg',
    consultantCount: 1,
    employeeCount: 8,
    offerLetterExpiryDays: 10,
    annualLeaveAllowance: 21,
    industry: 'Supply Chain & Global Logistics',
    countryCode: 'SG',
    currency: 'SGD',
    workWeekDays: 5.5,
    dailyWorkingHours: 8,
    probationPeriodDays: 60,
    noticePeriodDays: 30,
    timezone: 'Asia/Singapore (SGT)',
    adminEmail: 'ops@apex-logistics.com',
    websiteUrl: 'https://apex-logistics.com',
    createdAt: '2026-04-12T09:00:00Z',
  },
  {
    id: 'tenant-nexus',
    name: 'Nexus AI Labs',
    slug: 'nexus-labs',
    status: 'ACTIVE',
    logoUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=150&auto=format&fit=crop&q=80',
    defaultRegionId: 'region-nexus-us',
    consultantCount: 1,
    employeeCount: 5,
    offerLetterExpiryDays: 14,
    annualLeaveAllowance: 30,
    industry: 'Artificial Intelligence & Deep Tech',
    countryCode: 'US',
    currency: 'USD',
    workWeekDays: 5,
    dailyWorkingHours: 8,
    probationPeriodDays: 90,
    noticePeriodDays: 14,
    timezone: 'America/Los_Angeles (PST)',
    adminEmail: 'founders@nexus-labs.ai',
    websiteUrl: 'https://nexus-labs.ai',
    createdAt: '2026-06-01T11:20:00Z',
  },
  {
    id: 'tenant-initech',
    name: 'Initech Solutions',
    slug: 'initech-solutions',
    status: 'INACTIVE',
    logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80',
    defaultRegionId: 'region-initech-us',
    consultantCount: 0,
    employeeCount: 4,
    offerLetterExpiryDays: 7,
    annualLeaveAllowance: 20,
    industry: 'Enterprise IT Consulting',
    countryCode: 'US',
    currency: 'USD',
    workWeekDays: 5,
    dailyWorkingHours: 8,
    probationPeriodDays: 90,
    noticePeriodDays: 30,
    timezone: 'America/Chicago (CST)',
    adminEmail: 'admin@initech-solutions.com',
    websiteUrl: 'https://initech-solutions.com',
    createdAt: '2026-05-04T14:15:00Z',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-superadmin',
    name: 'Melenie',
    email: 'admin@cyrcalur.hr',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-consultant-1',
    name: 'Morgan Vance',
    email: 'consultant@cyrcalur.hr',
    role: 'CONSULTANT',
    assignedTenantIds: ['tenant-acme', 'tenant-globex', 'tenant-nexus'],
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-consultant-2',
    name: 'Priya Sharma',
    email: 'priya.consultant@cyrcalur.hr',
    role: 'CONSULTANT',
    assignedTenantIds: ['tenant-apex', 'tenant-initech'],
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-acme-admin',
    name: 'Sarah Connor',
    email: 'hr@acme-corp.com',
    role: 'TENANT_ADMIN',
    tenantId: 'tenant-acme',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-acme-emp-1',
    name: 'Asha Rao',
    email: 'asha@acme-corp.com',
    role: 'EMPLOYEE',
    tenantId: 'tenant-acme',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-acme-emp-2',
    name: 'David Chen',
    email: 'david@acme-corp.com',
    role: 'EMPLOYEE',
    tenantId: 'tenant-acme',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-acme-emp-3',
    name: 'Elena Rostova',
    email: 'elena@acme-corp.com',
    role: 'EMPLOYEE',
    tenantId: 'tenant-acme',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-acme-emp-4',
    name: 'Marcus Brody',
    email: 'marcus@acme-corp.com',
    role: 'EMPLOYEE',
    tenantId: 'tenant-acme',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-acme-emp-5',
    name: 'Chloe Bennett',
    email: 'chloe@acme-corp.com',
    role: 'EMPLOYEE',
    tenantId: 'tenant-acme',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-acme-newhire',
    name: 'Sam Lee',
    email: 'newhire@acme-corp.com',
    role: 'NEW_HIRE',
    tenantId: 'tenant-acme',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-globex-admin',
    name: 'Arthur Pendelton',
    email: 'admin@globex-industries.com',
    role: 'TENANT_ADMIN',
    tenantId: 'tenant-globex',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-apex-admin',
    name: 'Kenji Sato',
    email: 'admin@apex-logistics.com',
    role: 'TENANT_ADMIN',
    tenantId: 'tenant-apex',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
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
    name: 'India Tech Center (Bengaluru)',
    countryCode: 'IN',
    timeZone: 'Asia/Kolkata',
    locale: 'en-IN',
    status: 'ACTIVE',
  },
  {
    id: 'region-acme-eu',
    tenantId: 'tenant-acme',
    name: 'Europe Operations (Dublin)',
    countryCode: 'IE',
    timeZone: 'Europe/Dublin',
    locale: 'en-IE',
    status: 'ACTIVE',
  },
  {
    id: 'region-globex-eu',
    tenantId: 'tenant-globex',
    name: 'Europe Headquarters (London)',
    countryCode: 'GB',
    timeZone: 'Europe/London',
    locale: 'en-GB',
    status: 'ACTIVE',
  },
  {
    id: 'region-globex-de',
    tenantId: 'tenant-globex',
    name: 'Central Europe (Berlin)',
    countryCode: 'DE',
    timeZone: 'Europe/Berlin',
    locale: 'de-DE',
    status: 'ACTIVE',
  },
  {
    id: 'region-apex-sg',
    tenantId: 'tenant-apex',
    name: 'Asia Pacific HQ (Singapore)',
    countryCode: 'SG',
    timeZone: 'Asia/Singapore',
    locale: 'en-SG',
    status: 'ACTIVE',
  },
  {
    id: 'region-apex-jp',
    tenantId: 'tenant-apex',
    name: 'East Asia Hub (Tokyo)',
    countryCode: 'JP',
    timeZone: 'Asia/Tokyo',
    locale: 'ja-JP',
    status: 'ACTIVE',
  },
  {
    id: 'region-nexus-us',
    tenantId: 'tenant-nexus',
    name: 'Silicon Valley Center (San Francisco)',
    countryCode: 'US',
    timeZone: 'America/Los_Angeles',
    locale: 'en-US',
    status: 'ACTIVE',
  },
  {
    id: 'region-initech-us',
    tenantId: 'tenant-initech',
    name: 'US Central (Austin)',
    countryCode: 'US',
    timeZone: 'America/Chicago',
    locale: 'en-US',
    status: 'ACTIVE',
  },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  // Acme Corporation
  {
    id: 'dept-acme-eng',
    tenantId: 'tenant-acme',
    name: 'Engineering & Architecture',
    description: 'Product engineering, platform architecture, and quality assurance',
    parentDepartmentId: null,
    headEmployeeId: 'emp-acme-asha',
    status: 'ACTIVE',
  },
  {
    id: 'dept-acme-fe',
    tenantId: 'tenant-acme',
    name: 'Frontend Engineering',
    description: 'Web applications, mobile clients, and design systems',
    parentDepartmentId: 'dept-acme-eng',
    headEmployeeId: 'emp-acme-david',
    status: 'ACTIVE',
  },
  {
    id: 'dept-acme-be',
    tenantId: 'tenant-acme',
    name: 'Cloud & Platform Infrastructure',
    description: 'Microservices, database reliability, and DevOps pipelines',
    parentDepartmentId: 'dept-acme-eng',
    headEmployeeId: 'emp-acme-elena',
    status: 'ACTIVE',
  },
  {
    id: 'dept-acme-hr',
    tenantId: 'tenant-acme',
    name: 'People Operations & Talent',
    description: 'Global HR operations, talent acquisition, culture, and compliance',
    parentDepartmentId: null,
    headEmployeeId: 'emp-acme-sarah',
    status: 'ACTIVE',
  },
  {
    id: 'dept-acme-prod',
    tenantId: 'tenant-acme',
    name: 'Product Strategy & UX Design',
    description: 'Product roadmap, user research, wireframing, and UI design',
    parentDepartmentId: null,
    headEmployeeId: 'emp-acme-marcus',
    status: 'ACTIVE',
  },
  {
    id: 'dept-acme-fin',
    tenantId: 'tenant-acme',
    name: 'Finance & Corporate Operations',
    description: 'Financial forecasting, payroll accounting, and audits',
    parentDepartmentId: null,
    headEmployeeId: 'emp-acme-chloe',
    status: 'ACTIVE',
  },
  {
    id: 'dept-acme-sales',
    tenantId: 'tenant-acme',
    name: 'Enterprise Sales & Marketing',
    description: 'Global business development, partnerships, and brand strategy',
    parentDepartmentId: null,
    headEmployeeId: 'emp-acme-maya',
    status: 'ACTIVE',
  },

  // Globex Industries
  {
    id: 'dept-globex-exec',
    tenantId: 'tenant-globex',
    name: 'Executive Management',
    description: 'Strategic planning and corporate governance',
    parentDepartmentId: null,
    headEmployeeId: 'emp-globex-arthur',
    status: 'ACTIVE',
  },
  {
    id: 'dept-globex-ops',
    tenantId: 'tenant-globex',
    name: 'Global Operations & Manufacturing',
    description: 'Supply chain, quality control, and manufacturing facilities',
    parentDepartmentId: null,
    headEmployeeId: null,
    status: 'ACTIVE',
  },

  // Apex Logistics
  {
    id: 'dept-apex-log',
    tenantId: 'tenant-apex',
    name: 'Freight & Supply Chain',
    description: 'Air, ocean, and ground transportation logistics',
    parentDepartmentId: null,
    headEmployeeId: 'emp-apex-kenji',
    status: 'ACTIVE',
  },
  {
    id: 'dept-apex-tech',
    tenantId: 'tenant-apex',
    name: 'Logistics Systems Technology',
    description: 'Route optimization software and automated warehouse tracking',
    parentDepartmentId: null,
    headEmployeeId: null,
    status: 'ACTIVE',
  },
];

export const INITIAL_DESIGNATIONS: Designation[] = [
  // Acme
  {
    id: 'desig-acme-lead',
    tenantId: 'tenant-acme',
    name: 'Staff Software Engineer & Tech Lead',
    description: 'Technical architecture lead across cross-functional engineering pods',
    departmentId: 'dept-acme-eng',
    status: 'ACTIVE',
  },
  {
    id: 'desig-acme-srfe',
    tenantId: 'tenant-acme',
    name: 'Senior Frontend Engineer',
    description: 'Core UI/UX interface and component systems development',
    departmentId: 'dept-acme-fe',
    status: 'ACTIVE',
  },
  {
    id: 'desig-acme-jrfe',
    tenantId: 'tenant-acme',
    name: 'Associate Frontend Developer',
    description: 'Frontend component implementation and testing',
    departmentId: 'dept-acme-fe',
    status: 'ACTIVE',
  },
  {
    id: 'desig-acme-arch',
    tenantId: 'tenant-acme',
    name: 'Principal Cloud Architect',
    description: 'High-availability infrastructure and cloud scaling systems',
    departmentId: 'dept-acme-be',
    status: 'ACTIVE',
  },
  {
    id: 'desig-acme-devops',
    tenantId: 'tenant-acme',
    name: 'Senior DevOps & SRE Engineer',
    description: 'CI/CD automation, Kubernetes clusters, and observability monitoring',
    departmentId: 'dept-acme-be',
    status: 'ACTIVE',
  },
  {
    id: 'desig-acme-hrmgr',
    tenantId: 'tenant-acme',
    name: 'Director of People Operations',
    description: 'Human resource policies, talent strategy, and employee engagement',
    departmentId: 'dept-acme-hr',
    status: 'ACTIVE',
  },
  {
    id: 'desig-acme-recruiter',
    tenantId: 'tenant-acme',
    name: 'Senior Talent Acquisition Partner',
    description: 'Technical recruiting, candidate screening, and hiring pipelines',
    departmentId: 'dept-acme-hr',
    status: 'ACTIVE',
  },
  {
    id: 'desig-acme-pm',
    tenantId: 'tenant-acme',
    name: 'Principal Product Manager',
    description: 'Product roadmap discovery, user requirements, and delivery tracking',
    departmentId: 'dept-acme-prod',
    status: 'ACTIVE',
  },
  {
    id: 'desig-acme-ux',
    tenantId: 'tenant-acme',
    name: 'Lead Product & UX Designer',
    description: 'User interaction flows, design systems, and design reviews',
    departmentId: 'dept-acme-prod',
    status: 'ACTIVE',
  },
  {
    id: 'desig-acme-cfo',
    tenantId: 'tenant-acme',
    name: 'VP of Finance & Controller',
    description: 'Corporate financial strategy, regulatory compliance, and audits',
    departmentId: 'dept-acme-fin',
    status: 'ACTIVE',
  },
  {
    id: 'desig-acme-fa',
    tenantId: 'tenant-acme',
    name: 'Senior Financial Analyst',
    description: 'Budget forecasting, unit economics, and operational spend reports',
    departmentId: 'dept-acme-fin',
    status: 'ACTIVE',
  },
  {
    id: 'desig-acme-saleslead',
    tenantId: 'tenant-acme',
    name: 'Enterprise Growth Director',
    description: 'Large enterprise client partnerships and revenue expansion',
    departmentId: 'dept-acme-sales',
    status: 'ACTIVE',
  },

  // Globex
  {
    id: 'desig-globex-ceo',
    tenantId: 'tenant-globex',
    name: 'Managing Director & CEO',
    description: 'Executive leadership',
    departmentId: 'dept-globex-exec',
    status: 'ACTIVE',
  },
  {
    id: 'desig-globex-opslead',
    tenantId: 'tenant-globex',
    name: 'Head of Global Operations',
    description: 'Logistics and production operations',
    departmentId: 'dept-globex-ops',
    status: 'ACTIVE',
  },

  // Apex
  {
    id: 'desig-apex-vp',
    tenantId: 'tenant-apex',
    name: 'VP of APAC Logistics',
    description: 'Regional logistics network and operations',
    departmentId: 'dept-apex-log',
    status: 'ACTIVE',
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  // Acme Employees (Interconnected hierarchy)
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
    designationId: 'desig-acme-srfe',
    regionId: 'region-acme-us',
    managerId: 'emp-acme-asha',
    joiningDate: '2024-06-01',
    employmentStatus: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'emp-acme-elena',
    tenantId: 'tenant-acme',
    employeeId: 'EMP-1003',
    name: 'Elena Rostova',
    email: 'elena@acme-corp.com',
    phone: '+353 1 496 0123',
    departmentId: 'dept-acme-be',
    designationId: 'desig-acme-arch',
    regionId: 'region-acme-eu',
    managerId: 'emp-acme-asha',
    joiningDate: '2024-04-10',
    employmentStatus: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'emp-acme-vikram',
    tenantId: 'tenant-acme',
    employeeId: 'EMP-1004',
    name: 'Vikram Patel',
    email: 'vikram@acme-corp.com',
    phone: '+91 98234 56789',
    departmentId: 'dept-acme-be',
    designationId: 'desig-acme-devops',
    regionId: 'region-acme-in',
    managerId: 'emp-acme-elena',
    joiningDate: '2024-08-20',
    employmentStatus: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'emp-acme-sarah',
    tenantId: 'tenant-acme',
    employeeId: 'EMP-1005',
    name: 'Sarah Connor',
    email: 'hr@acme-corp.com',
    phone: '+1 212 555 0144',
    departmentId: 'dept-acme-hr',
    designationId: 'desig-acme-hrmgr',
    regionId: 'region-acme-us',
    managerId: null,
    joiningDate: '2023-11-01',
    employmentStatus: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'emp-acme-rahul',
    tenantId: 'tenant-acme',
    employeeId: 'EMP-1006',
    name: 'Rahul Verma',
    email: 'rahul@acme-corp.com',
    phone: '+91 98111 22334',
    departmentId: 'dept-acme-hr',
    designationId: 'desig-acme-recruiter',
    regionId: 'region-acme-in',
    managerId: 'emp-acme-sarah',
    joiningDate: '2025-01-15',
    employmentStatus: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'emp-acme-marcus',
    tenantId: 'tenant-acme',
    employeeId: 'EMP-1007',
    name: 'Marcus Brody',
    email: 'marcus@acme-corp.com',
    phone: '+1 415 555 0177',
    departmentId: 'dept-acme-prod',
    designationId: 'desig-acme-pm',
    regionId: 'region-acme-us',
    managerId: null,
    joiningDate: '2024-01-10',
    employmentStatus: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'emp-acme-sophia',
    tenantId: 'tenant-acme',
    employeeId: 'EMP-1008',
    name: 'Sophia Rodriguez',
    email: 'sophia@acme-corp.com',
    phone: '+1 415 555 0188',
    departmentId: 'dept-acme-prod',
    designationId: 'desig-acme-ux',
    regionId: 'region-acme-us',
    managerId: 'emp-acme-marcus',
    joiningDate: '2024-05-12',
    employmentStatus: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'emp-acme-chloe',
    tenantId: 'tenant-acme',
    employeeId: 'EMP-1009',
    name: 'Chloe Bennett',
    email: 'chloe@acme-corp.com',
    phone: '+1 212 555 0166',
    departmentId: 'dept-acme-fin',
    designationId: 'desig-acme-cfo',
    regionId: 'region-acme-us',
    managerId: null,
    joiningDate: '2023-09-01',
    employmentStatus: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'emp-acme-lucas',
    tenantId: 'tenant-acme',
    employeeId: 'EMP-1010',
    name: 'Lucas Vance',
    email: 'lucas@acme-corp.com',
    phone: '+1 212 555 0155',
    departmentId: 'dept-acme-fin',
    designationId: 'desig-acme-fa',
    regionId: 'region-acme-us',
    managerId: 'emp-acme-chloe',
    joiningDate: '2025-02-01',
    employmentStatus: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'emp-acme-maya',
    tenantId: 'tenant-acme',
    employeeId: 'EMP-1011',
    name: 'Maya Lin',
    email: 'maya@acme-corp.com',
    phone: '+1 415 555 0133',
    departmentId: 'dept-acme-sales',
    designationId: 'desig-acme-saleslead',
    regionId: 'region-acme-us',
    managerId: null,
    joiningDate: '2024-07-18',
    employmentStatus: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'emp-acme-sam',
    tenantId: 'tenant-acme',
    employeeId: 'EMP-1012',
    name: 'Sam Lee',
    email: 'newhire@acme-corp.com',
    phone: '+1 415 555 0122',
    departmentId: 'dept-acme-fe',
    designationId: 'desig-acme-jrfe',
    regionId: 'region-acme-us',
    managerId: 'emp-acme-david',
    joiningDate: '2026-08-01',
    employmentStatus: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  },

  // Globex Employees
  {
    id: 'emp-globex-arthur',
    tenantId: 'tenant-globex',
    employeeId: 'GLX-2001',
    name: 'Arthur Pendelton',
    email: 'admin@globex-industries.com',
    phone: '+44 20 7946 0912',
    departmentId: 'dept-globex-exec',
    designationId: 'desig-globex-ceo',
    regionId: 'region-globex-eu',
    managerId: null,
    joiningDate: '2023-01-10',
    employmentStatus: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'emp-globex-helena',
    tenantId: 'tenant-globex',
    employeeId: 'GLX-2002',
    name: 'Helena Weber',
    email: 'helena.weber@globex-industries.com',
    phone: '+49 30 1234 5678',
    departmentId: 'dept-globex-ops',
    designationId: 'desig-globex-opslead',
    regionId: 'region-globex-de',
    managerId: 'emp-globex-arthur',
    joiningDate: '2023-06-15',
    employmentStatus: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },

  // Apex Employees
  {
    id: 'emp-apex-kenji',
    tenantId: 'tenant-apex',
    employeeId: 'APX-3001',
    name: 'Kenji Sato',
    email: 'admin@apex-logistics.com',
    phone: '+65 6789 0123',
    departmentId: 'dept-apex-log',
    designationId: 'desig-apex-vp',
    regionId: 'region-apex-sg',
    managerId: null,
    joiningDate: '2024-02-01',
    employmentStatus: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
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
    fileSize: '1.4 MB',
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
  {
    id: 'doc-104',
    tenantId: 'tenant-acme',
    name: 'W4_Tax_Withholding_Elena_Rostova.pdf',
    category: 'TAX',
    status: 'CLEAN',
    ownerType: 'EMPLOYEE',
    ownerId: 'emp-acme-elena',
    version: 1,
    fileSize: '520 KB',
    mimeType: 'application/pdf',
    updatedAt: '2026-08-01T10:00:00Z',
    isSensitive: true,
  },
  {
    id: 'doc-105',
    tenantId: 'tenant-acme',
    name: 'Annual_Health_Fitness_Cert_Vikram_Patel.pdf',
    category: 'MEDICAL',
    status: 'CLEAN',
    ownerType: 'EMPLOYEE',
    ownerId: 'emp-acme-vikram',
    version: 1,
    fileSize: '680 KB',
    mimeType: 'application/pdf',
    updatedAt: '2026-07-22T16:45:00Z',
  },
  {
    id: 'doc-106',
    tenantId: 'tenant-acme',
    name: 'Executive_NDA_Chloe_Bennett.pdf',
    category: 'EMPLOYMENT',
    status: 'CLEAN',
    ownerType: 'EMPLOYEE',
    ownerId: 'emp-acme-chloe',
    version: 1,
    fileSize: '910 KB',
    mimeType: 'application/pdf',
    updatedAt: '2026-06-18T08:20:00Z',
  },
  {
    id: 'doc-107',
    tenantId: 'tenant-acme',
    name: 'Direct_Deposit_Authorization_Marcus_Brody.pdf',
    category: 'TAX',
    status: 'CLEAN',
    ownerType: 'EMPLOYEE',
    ownerId: 'emp-acme-marcus',
    version: 1,
    fileSize: '340 KB',
    mimeType: 'application/pdf',
    updatedAt: '2026-08-16T12:00:00Z',
    isSensitive: true,
  },
];

export const INITIAL_LEAVE_TYPES: LeaveType[] = [
  {
    id: 'lt-pto',
    tenantId: 'tenant-acme',
    name: 'Paid Time Off (PTO)',
    code: 'PTO',
    status: 'ACTIVE',
    annualAllowance: 20,
    monthlyCredit: 1.66,
    maxConsecutiveDays: 10,
  },
  {
    id: 'lt-sick',
    tenantId: 'tenant-acme',
    name: 'Sick & Medical Leave',
    code: 'SL',
    status: 'ACTIVE',
    annualAllowance: 12,
    monthlyCredit: 1.0,
    maxConsecutiveDays: 5,
  },
  {
    id: 'lt-casual',
    tenantId: 'tenant-acme',
    name: 'Casual Leave',
    code: 'CL',
    status: 'ACTIVE',
    annualAllowance: 8,
    monthlyCredit: 0.66,
    maxConsecutiveDays: 2,
  },
  {
    id: 'lt-parental',
    tenantId: 'tenant-acme',
    name: 'Parental Leave',
    code: 'PL',
    status: 'ACTIVE',
    annualAllowance: 60,
    monthlyCredit: 5.0,
    maxConsecutiveDays: 30,
  },
  {
    id: 'lt-bereavement',
    tenantId: 'tenant-acme',
    name: 'Bereavement Leave',
    code: 'BL',
    status: 'ACTIVE',
    annualAllowance: 5,
    monthlyCredit: 0.0,
    maxConsecutiveDays: 5,
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
    endDate: '2026-09-15',
    requestedDays: 4,
    reason: 'Family vacation and personal travel',
    status: 'PENDING',
    appliedDate: '2026-08-17T10:00:00Z',
  },
  {
    id: 'lr-202',
    tenantId: 'tenant-acme',
    employeeId: 'emp-acme-asha',
    employeeName: 'Asha Rao',
    leaveTypeId: 'lt-sick',
    leaveTypeName: 'Sick & Medical Leave',
    startDate: '2026-08-05',
    endDate: '2026-08-05',
    requestedDays: 1,
    reason: 'Annual preventive health checkup',
    status: 'APPROVED',
    appliedDate: '2026-08-04T08:30:00Z',
  },
  {
    id: 'lr-203',
    tenantId: 'tenant-acme',
    employeeId: 'emp-acme-vikram',
    employeeName: 'Vikram Patel',
    leaveTypeId: 'lt-casual',
    leaveTypeName: 'Casual Leave',
    startDate: '2026-08-22',
    endDate: '2026-08-22',
    requestedDays: 1,
    reason: 'Home utility installation and personal matters',
    status: 'APPROVED',
    appliedDate: '2026-08-18T11:15:00Z',
  },
  {
    id: 'lr-204',
    tenantId: 'tenant-acme',
    employeeId: 'emp-acme-sophia',
    employeeName: 'Sophia Rodriguez',
    leaveTypeId: 'lt-pto',
    leaveTypeName: 'Paid Time Off (PTO)',
    startDate: '2026-09-20',
    endDate: '2026-09-26',
    requestedDays: 5,
    reason: 'Design conference in Amsterdam and travel',
    status: 'PENDING',
    appliedDate: '2026-08-18T14:20:00Z',
  },
  {
    id: 'lr-205',
    tenantId: 'tenant-acme',
    employeeId: 'emp-acme-lucas',
    employeeName: 'Lucas Vance',
    leaveTypeId: 'lt-sick',
    leaveTypeName: 'Sick & Medical Leave',
    startDate: '2026-07-28',
    endDate: '2026-07-29',
    requestedDays: 2,
    reason: 'Seasonal fever and recovery',
    status: 'APPROVED',
    appliedDate: '2026-07-28T07:45:00Z',
  },
  {
    id: 'lr-206',
    tenantId: 'tenant-acme',
    employeeId: 'emp-acme-maya',
    employeeName: 'Maya Lin',
    leaveTypeId: 'lt-pto',
    leaveTypeName: 'Paid Time Off (PTO)',
    startDate: '2026-08-01',
    endDate: '2026-08-03',
    requestedDays: 3,
    reason: 'Personal time off',
    status: 'CANCELLED',
    appliedDate: '2026-07-25T09:00:00Z',
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
  {
    id: 'hol-3',
    tenantId: 'tenant-acme',
    regionId: 'region-acme-us',
    name: 'Labor Day',
    date: '2026-09-07',
    kind: 'COMMON',
    status: 'ACTIVE',
  },
  {
    id: 'hol-4',
    tenantId: 'tenant-acme',
    regionId: 'region-acme-us',
    name: 'Thanksgiving Day',
    date: '2026-11-26',
    kind: 'COMMON',
    status: 'ACTIVE',
  },
  {
    id: 'hol-5',
    tenantId: 'tenant-acme',
    regionId: 'region-acme-eu',
    name: 'St. Patrick\'s Day',
    date: '2026-03-17',
    kind: 'COMMON',
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
    clockOutTime: '06:05 PM',
    totalMinutes: 545,
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
  {
    id: 'att-303',
    tenantId: 'tenant-acme',
    employeeId: 'emp-acme-elena',
    employeeName: 'Elena Rostova',
    date: '2026-08-18',
    clockInTime: '08:45 AM',
    clockOutTime: '05:30 PM',
    totalMinutes: 525,
    status: 'PRESENT',
  },
  {
    id: 'att-304',
    tenantId: 'tenant-acme',
    employeeId: 'emp-acme-vikram',
    employeeName: 'Vikram Patel',
    date: '2026-08-18',
    clockInTime: '09:40 AM',
    clockOutTime: '07:10 PM',
    totalMinutes: 570,
    status: 'LATE',
  },
  {
    id: 'att-305',
    tenantId: 'tenant-acme',
    employeeId: 'emp-acme-sarah',
    employeeName: 'Sarah Connor',
    date: '2026-08-18',
    clockInTime: '08:50 AM',
    clockOutTime: '05:45 PM',
    totalMinutes: 535,
    status: 'PRESENT',
  },
  {
    id: 'att-306',
    tenantId: 'tenant-acme',
    employeeId: 'emp-acme-marcus',
    employeeName: 'Marcus Brody',
    date: '2026-08-18',
    clockInTime: '09:05 AM',
    clockOutTime: '06:15 PM',
    totalMinutes: 550,
    status: 'PRESENT',
  },
  {
    id: 'att-307',
    tenantId: 'tenant-acme',
    employeeId: 'emp-acme-chloe',
    employeeName: 'Chloe Bennett',
    date: '2026-08-18',
    clockInTime: '08:30 AM',
    clockOutTime: '05:30 PM',
    totalMinutes: 540,
    status: 'PRESENT',
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
    reason: 'Critical production deployment and migration release',
    status: 'APPROVED',
  },
  {
    id: 'ot-402',
    tenantId: 'tenant-acme',
    employeeId: 'emp-acme-vikram',
    employeeName: 'Vikram Patel',
    date: '2026-08-17',
    requestedMinutes: 90,
    reason: 'Kubernetes cluster failover testing and certificate rotation',
    status: 'APPROVED',
  },
  {
    id: 'ot-403',
    tenantId: 'tenant-acme',
    employeeId: 'emp-acme-lucas',
    employeeName: 'Lucas Vance',
    date: '2026-08-18',
    requestedMinutes: 60,
    reason: 'Q3 financial close reconciliation and compliance audits',
    status: 'PENDING',
  },
];

export const INITIAL_KB_ARTICLES: KBArticle[] = [
  {
    id: 'kb-501',
    tenantId: 'tenant-acme',
    title: 'Company Expense & Travel Policy 2026',
    categoryId: 'cat-policies',
    categoryName: 'Company Policies',
    content: 'All business travel and expense claims must be pre-approved by the department head and submitted within 30 days of occurrence with digital receipts attached.',
    tags: ['expenses', 'policy', 'travel', 'finance'],
    status: 'PUBLISHED',
    updatedAt: '2026-07-01T00:00:00Z',
  },
  {
    id: 'kb-502',
    tenantId: 'tenant-acme',
    title: 'Engineering Git Workflow & Architecture Standards',
    categoryId: 'cat-eng',
    categoryName: 'Engineering',
    content: 'We adhere strictly to mandatory backend layering: Route -> Controller -> Service -> Repository -> Database. All pull requests require 2 approvals and 85%+ unit test coverage.',
    tags: ['engineering', 'standards', 'git', 'architecture'],
    status: 'PUBLISHED',
    updatedAt: '2026-08-10T12:00:00Z',
    targetDepartmentId: 'dept-acme-eng',
  },
  {
    id: 'kb-503',
    tenantId: 'tenant-acme',
    title: 'Information Security & 2FA Enforcement Guidelines',
    categoryId: 'cat-security',
    categoryName: 'Security & Compliance',
    content: 'All employee workstations must enable full disk encryption (FileVault/BitLocker) and hardware security keys or authenticator apps for single sign-on.',
    tags: ['security', '2fa', 'compliance', 'passwords'],
    status: 'PUBLISHED',
    updatedAt: '2026-08-14T09:30:00Z',
  },
  {
    id: 'kb-504',
    tenantId: 'tenant-acme',
    title: 'Global Healthcare Benefits & Mental Wellness Support',
    categoryId: 'cat-benefits',
    categoryName: 'People & Culture',
    content: 'Acme Corporation covers 100% of employee healthcare premiums and provides free access to licensed mental wellness therapists through our global partner network.',
    tags: ['benefits', 'health', 'wellness', 'insurance'],
    status: 'PUBLISHED',
    updatedAt: '2026-08-05T14:00:00Z',
  },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-601',
    tenantId: 'tenant-acme',
    title: 'Q3 All-Hands Meeting & Annual Product Roadmap Keynote',
    content: 'Join our leadership team this Thursday at 10:00 AM EST for our global all-hands. We will celebrate team milestones, review Q3 metrics, and preview upcoming major launches.',
    priority: 'HIGH',
    publishAt: '2026-08-18T00:00:00Z',
    expiresAt: '2026-08-25T00:00:00Z',
    target: 'TENANT_WIDE',
    readByIds: ['user-acme-emp-1', 'user-acme-emp-2'],
  },
  {
    id: 'ann-602',
    tenantId: 'tenant-acme',
    title: 'Office Facility Upgrades & Scheduled Network Maintenance',
    content: 'Please note that facility maintenance will take place this Friday from 6:00 PM to 10:00 PM local time. On-premise Wi-Fi and VPN endpoints will undergo brief intermittent resets.',
    priority: 'MEDIUM',
    publishAt: '2026-08-17T00:00:00Z',
    expiresAt: '2026-08-22T00:00:00Z',
    target: 'TENANT_WIDE',
    readByIds: ['user-acme-emp-1'],
  },
  {
    id: 'ann-603',
    tenantId: 'tenant-acme',
    title: 'Welcome New Team Members to Acme Family!',
    content: 'Please give a warm welcome to Sam Lee who joined our Frontend Engineering pod this month. Connect on Slack and introduce yourselves!',
    priority: 'LOW',
    publishAt: '2026-08-15T00:00:00Z',
    expiresAt: '2026-08-30T00:00:00Z',
    target: 'TENANT_WIDE',
    readByIds: ['user-acme-emp-1', 'user-acme-emp-2', 'user-acme-emp-3'],
  },
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'tkt-701',
    tenantId: 'tenant-acme',
    ticketNumber: 'TKT-00101',
    subject: 'Staging Cloud VPN Connection Timeout Issue',
    description: 'Unable to connect to the internal staging VPN gateway endpoint since this morning after network DNS update.',
    category: 'IT Support',
    departmentId: 'dept-acme-eng',
    departmentName: 'Engineering & Architecture',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdById: 'emp-acme-david',
    createdByName: 'David Chen',
    assigneeName: 'Vikram Patel',
    createdAt: '2026-08-18T08:30:00Z',
    comments: [
      {
        id: 'c-1',
        authorName: 'IT Operations Bot',
        authorRole: 'SYSTEM',
        content: 'Ticket prioritized and routed to Cloud & Platform Infrastructure queue.',
        createdAt: '2026-08-18T08:31:00Z',
      },
      {
        id: 'c-2',
        authorName: 'Vikram Patel',
        authorRole: 'DevOps Lead',
        content: 'Investigating the gateway logs. We are rolling out a DNS certificate fix shortly.',
        createdAt: '2026-08-18T09:15:00Z',
      },
    ],
  },
  {
    id: 'tkt-702',
    tenantId: 'tenant-acme',
    ticketNumber: 'TKT-00102',
    subject: 'Request for Dual 4K Ergonomic Monitor Setup',
    description: 'Requesting dual external 4K monitors and ergonomic monitor arms for UI/UX wireframing workspace.',
    category: 'Facilities & Hardware',
    departmentId: 'dept-acme-prod',
    departmentName: 'Product Strategy & UX Design',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    createdById: 'emp-acme-sophia',
    createdByName: 'Sophia Rodriguez',
    assigneeName: 'Workplace Operations',
    createdAt: '2026-08-14T11:00:00Z',
    comments: [
      {
        id: 'c-3',
        authorName: 'Workplace Operations',
        authorRole: 'Facilities Admin',
        content: 'Hardware approved and delivered to Desk #304 in HQ Tower Alpha.',
        createdAt: '2026-08-16T15:00:00Z',
      },
    ],
  },
  {
    id: 'tkt-703',
    tenantId: 'tenant-acme',
    ticketNumber: 'TKT-00103',
    subject: 'Relocation Assistance & Tax Withholding Query',
    description: 'Need clarification on cross-border tax withholding adjustments following my regional transfer to the Dublin office.',
    category: 'Human Resources',
    departmentId: 'dept-acme-hr',
    departmentName: 'People Operations & Talent',
    priority: 'MEDIUM',
    status: 'WAITING',
    createdById: 'emp-acme-elena',
    createdByName: 'Elena Rostova',
    assigneeName: 'Sarah Connor',
    createdAt: '2026-08-16T14:20:00Z',
    comments: [
      {
        id: 'c-4',
        authorName: 'Sarah Connor',
        authorRole: 'HR Admin',
        content: 'Consulting with our Irish tax advisor to prepare your tailored dual-tax calculation summary.',
        createdAt: '2026-08-17T10:30:00Z',
      },
    ],
  },
  {
    id: 'tkt-704',
    tenantId: 'tenant-acme',
    ticketNumber: 'TKT-00104',
    subject: 'Production S3 Asset Bucket CORS Configuration',
    description: 'Need CORS origin headers updated to allow preview builds on staging domains.',
    category: 'DevOps & Cloud',
    departmentId: 'dept-acme-be',
    departmentName: 'Cloud & Platform Infrastructure',
    priority: 'LOW',
    status: 'CLOSED',
    createdById: 'emp-acme-asha',
    createdByName: 'Asha Rao',
    assigneeName: 'Vikram Patel',
    createdAt: '2026-08-12T09:00:00Z',
    comments: [
      {
        id: 'c-5',
        authorName: 'Vikram Patel',
        authorRole: 'DevOps Lead',
        content: 'Terraform script applied and CORS origin rule active across all staging environments.',
        createdAt: '2026-08-12T11:45:00Z',
      },
    ],
  },
];

export const INITIAL_BUILDINGS: Building[] = [
  {
    id: 'bld-1',
    tenantId: 'tenant-acme',
    name: 'HQ Tower Alpha',
    address: '100 Innovation Way, Silicon Valley, CA 94025',
    floors: 5,
    status: 'ACTIVE',
  },
  {
    id: 'bld-2',
    tenantId: 'tenant-acme',
    name: 'Cyber Heights Tech Park',
    address: 'Plot 42, Outer Ring Road, Bengaluru, KA 560103',
    floors: 6,
    status: 'ACTIVE',
  },
  {
    id: 'bld-3',
    tenantId: 'tenant-acme',
    name: 'Grand Canal Dock Center',
    address: '25 Grand Canal Quay, Dublin 2, Ireland',
    floors: 4,
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
    name: 'Innovation Hub (Conf 3A)',
    capacity: 16,
    facilities: ['4K Video Conf', 'Digital Whiteboard', 'Wireless Presentation', 'Audio Array'],
    status: 'ACTIVE',
  },
  {
    id: 'room-2',
    tenantId: 'tenant-acme',
    buildingId: 'bld-1',
    buildingName: 'HQ Tower Alpha',
    floor: 5,
    name: 'Executive Boardroom (Alpha 5A)',
    capacity: 24,
    facilities: ['Executive Video Wall', 'Polycom Microphones', 'Catering Station', 'Privacy Glass'],
    status: 'ACTIVE',
  },
  {
    id: 'room-3',
    tenantId: 'tenant-acme',
    buildingId: 'bld-1',
    buildingName: 'HQ Tower Alpha',
    floor: 3,
    name: 'Focus Pod 3B',
    capacity: 4,
    facilities: ['UltraWide Monitor', 'Glass Whiteboard', 'Acoustic Soundproofing'],
    status: 'ACTIVE',
  },
  {
    id: 'room-4',
    tenantId: 'tenant-acme',
    buildingId: 'bld-2',
    buildingName: 'Cyber Heights Tech Park',
    floor: 4,
    name: 'Turing Conference Hall',
    capacity: 32,
    facilities: ['Dual 4K Displays', 'Surround Sound', 'Podium Mic', 'Zoom Room Controller'],
    status: 'ACTIVE',
  },
  {
    id: 'room-5',
    tenantId: 'tenant-acme',
    buildingId: 'bld-2',
    buildingName: 'Cyber Heights Tech Park',
    floor: 2,
    name: 'Aryabhata Collaboration Lab',
    capacity: 12,
    facilities: ['Smart Whiteboard', 'Video Conf', 'High Speed Ports'],
    status: 'ACTIVE',
  },
];

export const INITIAL_RESERVATIONS: RoomReservation[] = [
  {
    id: 'res-1',
    tenantId: 'tenant-acme',
    roomId: 'room-1',
    roomName: 'Innovation Hub (Conf 3A)',
    reservedById: 'emp-acme-asha',
    reservedByName: 'Asha Rao',
    title: 'Sprint 34 Architecture & Platform Sync',
    startAt: '2026-08-19T10:00:00Z',
    endAt: '2026-08-19T11:30:00Z',
    status: 'CONFIRMED',
  },
  {
    id: 'res-2',
    tenantId: 'tenant-acme',
    roomId: 'room-2',
    roomName: 'Executive Boardroom (Alpha 5A)',
    reservedById: 'emp-acme-chloe',
    reservedByName: 'Chloe Bennett',
    title: 'Q3 Financial Review & Board Prep',
    startAt: '2026-08-19T14:00:00Z',
    endAt: '2026-08-19T15:30:00Z',
    status: 'CONFIRMED',
  },
  {
    id: 'res-3',
    tenantId: 'tenant-acme',
    roomId: 'room-3',
    roomName: 'Focus Pod 3B',
    reservedById: 'emp-acme-david',
    reservedByName: 'David Chen',
    title: 'Frontend 1:1 Mentorship Session with Sam',
    startAt: '2026-08-19T16:00:00Z',
    endAt: '2026-08-19T17:00:00Z',
    status: 'CONFIRMED',
  },
  {
    id: 'res-4',
    tenantId: 'tenant-acme',
    roomId: 'room-4',
    roomName: 'Turing Conference Hall',
    reservedById: 'emp-acme-vikram',
    reservedByName: 'Vikram Patel',
    title: 'DevOps Quarterly Retrospective & Training',
    startAt: '2026-08-20T09:30:00Z',
    endAt: '2026-08-20T11:00:00Z',
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
    timestamp: '2026-08-19T08:30:00Z',
    requestId: 'req-cyr-101',
  },
  {
    id: 'aud-902',
    tenantId: 'tenant-acme',
    actorId: 'user-acme-emp-1',
    actorName: 'Asha Rao',
    action: 'LEAVE_REQUEST_APPROVED',
    resourceType: 'LEAVE',
    resourceId: 'lr-202',
    timestamp: '2026-08-18T16:45:00Z',
    requestId: 'req-cyr-102',
  },
  {
    id: 'aud-903',
    tenantId: 'tenant-acme',
    actorId: 'user-superadmin',
    actorName: 'Melenie',
    action: 'CONSULTANT_ASSIGNED',
    resourceType: 'USER',
    resourceId: 'user-consultant-1',
    timestamp: '2026-08-18T14:10:00Z',
    requestId: 'req-cyr-103',
  },
  {
    id: 'aud-904',
    tenantId: 'tenant-acme',
    actorId: 'user-acme-emp-2',
    actorName: 'David Chen',
    action: 'DOCUMENT_UPLOADED',
    resourceType: 'DOCUMENT',
    resourceId: 'doc-102',
    timestamp: '2026-08-17T11:20:00Z',
    requestId: 'req-cyr-104',
  },
  {
    id: 'aud-905',
    tenantId: 'tenant-acme',
    actorId: 'user-acme-admin',
    actorName: 'Sarah Connor',
    action: 'NEW_HIRE_PROVISIONED',
    resourceType: 'EMPLOYEE',
    resourceId: 'emp-acme-sam',
    timestamp: '2026-08-15T09:00:00Z',
    requestId: 'req-cyr-105',
  },
];

export const INITIAL_ONBOARDING_CASES: OnboardingCase[] = [
  {
    id: 'onb-101',
    tenantId: 'tenant-acme',
    userId: 'user-acme-newhire',
    employeeId: 'EMP-1012',
    candidateName: 'Sam Lee',
    email: 'newhire@acme-corp.com',
    phone: '',
    address: '',
    emergencyContact: '',
    funFact: '',
    departmentId: 'dept-acme-fe',
    departmentName: 'Frontend Engineering',
    designationId: 'desig-acme-jrfe',
    designationName: 'Associate Frontend Developer',
    managerId: 'emp-acme-david',
    managerName: 'David Chen',
    joiningDate: '2026-08-01',
    regionName: 'North America (US East)',
    personalDetailsCompleted: false,
    offerSignedUploaded: false,
    offerSignedFileName: undefined,
    requiredDocsUploaded: false,
    uploadedDocs: [],
    acknowledgementSigned: false,
    status: 'IN_PROGRESS',
    submittedAt: undefined,
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    notes: 'Candidate onboarding invitation sent. Awaiting candidate submission.',
  },
  {
    id: 'onb-102',
    tenantId: 'tenant-acme',
    userId: 'user-onb-alex',
    employeeId: 'EMP-1013',
    candidateName: 'Alex Mercer',
    email: 'alex.mercer@acme-corp.com',
    phone: '+1 415 555 0199',
    departmentId: 'dept-acme-be',
    departmentName: 'Cloud & Platform Infrastructure',
    designationId: 'desig-acme-devops',
    designationName: 'Senior DevOps & SRE Engineer',
    managerId: 'emp-acme-elena',
    managerName: 'Elena Rostova',
    joiningDate: '2026-09-01',
    regionName: 'North America (US East)',
    personalDetailsCompleted: true,
    offerSignedUploaded: true,
    requiredDocsUploaded: false,
    acknowledgementSigned: true,
    status: 'IN_PROGRESS',
    submittedAt: undefined,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    notes: 'Awaiting passport/visa document scan re-submission.',
  },
  {
    id: 'onb-103',
    tenantId: 'tenant-acme',
    userId: 'user-onb-olivia',
    employeeId: 'EMP-1014',
    candidateName: 'Olivia Taylor',
    email: 'olivia.taylor@acme-corp.com',
    phone: '+1 212 555 0183',
    departmentId: 'dept-acme-hr',
    departmentName: 'People Operations & Talent',
    designationId: 'desig-acme-recruiter',
    designationName: 'Senior Talent Acquisition Partner',
    managerId: 'emp-acme-sarah',
    managerName: 'Sarah Connor',
    joiningDate: '2026-09-15',
    regionName: 'North America (US East)',
    personalDetailsCompleted: true,
    offerSignedUploaded: false,
    requiredDocsUploaded: false,
    acknowledgementSigned: false,
    status: 'IN_PROGRESS',
    submittedAt: undefined,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    notes: 'Offer letter sent out for signing via DocuSign.',
  },
  {
    id: 'onb-104',
    tenantId: 'tenant-globex',
    userId: 'user-onb-klaus',
    employeeId: 'GLX-2003',
    candidateName: 'Klaus Schmidt',
    email: 'klaus.schmidt@globex-industries.com',
    phone: '+49 30 9876 5432',
    departmentId: 'dept-globex-ops',
    departmentName: 'Global Operations & Manufacturing',
    designationId: 'desig-globex-opslead',
    designationName: 'Head of Global Operations',
    managerId: 'emp-globex-arthur',
    managerName: 'Arthur Pendelton',
    joiningDate: '2026-08-15',
    regionName: 'Central Europe (Berlin)',
    personalDetailsCompleted: true,
    offerSignedUploaded: true,
    requiredDocsUploaded: true,
    acknowledgementSigned: true,
    status: 'SUBMITTED_FOR_REVIEW',
    submittedAt: '2026-08-17T15:00:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    notes: 'Ready for German operations executive approval.',
  },
];
