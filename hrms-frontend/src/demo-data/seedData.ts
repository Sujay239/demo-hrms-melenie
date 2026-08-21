export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "INACTIVE" | "DEACTIVATED";
  logoUrl?: string;
  defaultRegionId?: string;
  consultantCount: number;
  employeeCount: number;
  createdAt: string;

  // Company Parameters
  offerLetterExpiryDays?: number; // e.g. 7 or 14 days
  annualLeaveAllowance?: number; // e.g. 24 days
  industry?: string; // e.g. 'Software & Cloud Technology'
  countryCode?: string; // e.g. 'US', 'GB', 'SG', 'IN'
  currency?: string; // e.g. 'USD', 'EUR', 'GBP', 'INR'
  workWeekDays?: number; // e.g. 5 days
  dailyWorkingHours?: number; // e.g. 8 hours
  probationPeriodDays?: number; // e.g. 90 days
  noticePeriodDays?: number; // e.g. 30 days
  timezone?: string; // e.g. 'America/New_York (EST)'
  adminEmail?: string; // e.g. 'hr@company.com'
  websiteUrl?: string; // e.g. 'https://company.com'

  // Per-Company Feature Toggles
  features?: TenantFeatures;
}

export interface TenantFeatures {
  onboarding?: boolean; // Onboarding Cases & New Hire Checklist
  leaveManagement?: boolean; // Leave Requests, Balances & Types
  attendance?: boolean; // Clock-in / Clock-out & Overtime Logs
  knowledgeBase?: boolean; // Company Knowledge Base Articles
  announcements?: boolean; // Bulletin & Announcements
  helpDesk?: boolean; // Help Desk Tickets
  meetingRooms?: boolean; // Room Reservations
  documentVault?: boolean; // Official Company Documents
  orgStructure?: boolean; // Regions, Departments, Designations
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "SUPER_ADMIN" | "CONSULTANT" | "TENANT_ADMIN" | "EMPLOYEE" | "NEW_HIRE";
  tenantId?: string;
  assignedTenantIds?: string[];
  status: "ACTIVE" | "INACTIVE" | "PENDING_ACTIVATION" | "SUSPENDED";
  isPermanent?: boolean;
  avatarUrl?: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  phone?: string;
}

export interface Region {
  id: string;
  tenantId: string;
  name: string;
  countryCode: string;
  timeZone: string;
  locale: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface Department {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  parentDepartmentId?: string | null;
  headEmployeeId?: string | null;
  status: "ACTIVE" | "INACTIVE";
}

export interface Designation {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  departmentId?: string | null;
  status: "ACTIVE" | "INACTIVE";
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
  employmentStatus: "ACTIVE" | "INACTIVE" | "ON_LEAVE";
  isPermanent?: boolean;
  avatarUrl?: string;

  // Personal Information
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Other" | "Prefer not to say";
  maritalStatus?: "Single" | "Married" | "Divorced" | "Widowed";
  nationality?: string;
  bloodGroup?: "O+" | "A+" | "B+" | "AB+" | "O-" | "A-" | "B-" | "AB-";
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  currentAddress?: string;
  permanentAddress?: string;

  // Job & Team Information
  employmentType?:
    | "Full Time"
    | "Part Time"
    | "Contract"
    | "Intern"
    | "Probation";
  confirmationDate?: string;
  workLocation?: string;
  teamName?: string;
  skills?: string[];

  // Compensation Information
  ctcAnnual?: number | string;
  basicSalary?: number | string;
  variablePay?: number | string;
  allowances?: number | string;
  paymentMode?: "Bank Transfer" | "Direct Deposit" | "Check" | "Cash";
  bankName?: string;
  bankAccountNumber?: string;
  ifscRoutingCode?: string;
}

export interface DocumentRecord {
  id: string;
  tenantId: string;
  name: string;
  category:
    | "EMPLOYMENT"
    | "IDENTIFICATION"
    | "MEDICAL"
    | "OFFER"
    | "TAX"
    | "OTHER";
  status: "CLEAN" | "PENDING_SCAN" | "QUARANTINED";
  ownerType: "EMPLOYEE" | "NEW_HIRE" | "TENANT";
  ownerId: string;
  version: number;
  fileSize: string;
  mimeType: string;
  updatedAt: string;
  isSensitive?: boolean;
  fileUrl?: string;
}

export interface LeaveType {
  id: string;
  tenantId: string;
  name: string;
  code?: string;
  category?:
    | "PAID"
    | "SICK"
    | "CASUAL"
    | "PARENTAL"
    | "UNPAID"
    | "COMPENSATORY";
  description?: string;
  requiresDoc?: boolean;
  status?: "ACTIVE" | "INACTIVE";
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
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  appliedDate: string;
}

export interface Holiday {
  id: string;
  tenantId: string;
  regionId: string;
  name: string;
  date: string;
  kind: "COMMON" | "FLEXIBLE";
  status: "ACTIVE" | "INACTIVE";
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
  status: "PRESENT" | "ABSENT" | "LATE" | "ON_LEAVE" | "HALF_DAY";
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
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface KBAttachment {
  id: string;
  name: string;
  size: string;
  type: string; // 'image' | 'pdf' | 'docx' | string
  dataUrl?: string;
  uploadedAt: string;
}

export interface KBArticle {
  id: string;
  tenantId: string;
  title: string;
  categoryId: string;
  categoryName: string;
  content: string;
  tags: string[];
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  updatedAt: string;
  targetDepartmentId?: string | null;
  targetDepartmentName?: string | null;
  attachments?: KBAttachment[];
}

export interface Announcement {
  id: string;
  tenantId: string;
  title: string;
  content: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  publishAt: string;
  expiresAt: string;
  target: "TENANT_WIDE" | "DEPARTMENT";
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
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "OPEN" | "IN_PROGRESS" | "WAITING" | "RESOLVED" | "CLOSED";
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
  status: "ACTIVE" | "INACTIVE";
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
  status: "ACTIVE" | "INACTIVE";
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
  status: "CONFIRMED" | "CANCELLED";
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

export type AllowedDocumentType = "PDF" | "IMAGE" | "PDF_OR_IMAGE" | "ANY";

export interface OnboardingDocRequirement {
  id: string;
  title: string;
  description?: string;
  allowedType: AllowedDocumentType;
  isRequired: boolean;
}

export const DEFAULT_ONBOARDING_DOCUMENTS: OnboardingDocRequirement[] = [
  {
    id: "doc-gov-id",
    title: "Government Photo ID (US Passport / State Driver's License / Real ID)",
    description: "Clear copy of official national or state identity card",
    allowedType: "PDF_OR_IMAGE",
    isRequired: true,
  },
  {
    id: "doc-tax-w4",
    title: "Tax & Withholding Forms (Form W-4 / Form I-9)",
    description: "Official declaration for tax withholding & payroll registration",
    allowedType: "PDF",
    isRequired: true,
  },
  {
    id: "doc-education",
    title: "Educational Degree & Academic Transcripts",
    description: "Highest degree certificate or graduation diploma",
    allowedType: "PDF",
    isRequired: false,
  },
  {
    id: "doc-bank-void",
    title: "Voided Check / Direct Deposit Bank Verification",
    description: "Bank document confirming account holder name and routing details",
    allowedType: "PDF_OR_IMAGE",
    isRequired: true,
  },
];

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
  requiredDocsChecklist?: OnboardingDocRequirement[];
  uploadedDocs?: OnboardingDocumentUpload[];
  acknowledgementSigned: boolean;
  acknowledgementName?: string;
  acknowledgementPlace?: string;
  acknowledgementDate?: string;
  status: "IN_PROGRESS" | "SUBMITTED_FOR_REVIEW" | "APPROVED" | "REJECTED";
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  avatarUrl?: string;
  notes?: string;
}

// =========================================================
// CLEAN INITIAL MASTER DATASETS (NO FAKE DEMO RECORDS)
// =========================================================

export const INITIAL_TENANTS: Tenant[] = [];

export const INITIAL_USERS: User[] = [
  {
    id: "user-superadmin",
    name: "Super Admin",
    email: "admin@Peopleworkplaces.hr",
    password: "password123",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
  },
];

export const INITIAL_REGIONS: Region[] = [];
export const INITIAL_DEPARTMENTS: Department[] = [];
export const INITIAL_DESIGNATIONS: Designation[] = [];
export const INITIAL_EMPLOYEES: Employee[] = [];
export const INITIAL_DOCUMENTS: DocumentRecord[] = [];
export const INITIAL_LEAVE_TYPES: LeaveType[] = [];
export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [];
export const INITIAL_HOLIDAYS: Holiday[] = [];
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_OVERTIME: OvertimeRequest[] = [];
export const INITIAL_KB_ARTICLES: KBArticle[] = [];
export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];
export const INITIAL_TICKETS: Ticket[] = [];
export const INITIAL_BUILDINGS: Building[] = [];
export const INITIAL_ROOMS: Room[] = [];
export const INITIAL_RESERVATIONS: RoomReservation[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
export const INITIAL_ONBOARDING_CASES: OnboardingCase[] = [];
