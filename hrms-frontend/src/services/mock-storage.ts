import {
  Tenant,
  User,
  Region,
  Department,
  Designation,
  Employee,
  DocumentRecord,
  LeaveType,
  LeaveRequest,
  Holiday,
  FlexibleHolidaySelection,
  AttendanceRecord,
  OvertimeRequest,
  KBArticle,
  Announcement,
  Ticket,
  Building,
  Room,
  RoomReservation,
  AuditLog,
  OnboardingCase,
  INITIAL_TENANTS,
  INITIAL_USERS,
  INITIAL_REGIONS,
  INITIAL_DEPARTMENTS,
  INITIAL_DESIGNATIONS,
  INITIAL_EMPLOYEES,
  INITIAL_DOCUMENTS,
  INITIAL_LEAVE_TYPES,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_HOLIDAYS,
  INITIAL_ATTENDANCE,
  INITIAL_OVERTIME,
  INITIAL_KB_ARTICLES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_TICKETS,
  INITIAL_BUILDINGS,
  INITIAL_ROOMS,
  INITIAL_RESERVATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ONBOARDING_CASES,
} from '@/demo-data/seedData';

export const KEYS = {
  TENANTS: 'cyrcalur_tenants_v6',
  USERS: 'cyrcalur_users_v6',
  REGIONS: 'cyrcalur_regions_v6',
  DEPARTMENTS: 'cyrcalur_departments_v6',
  DESIGNATIONS: 'cyrcalur_designations_v6',
  EMPLOYEES: 'cyrcalur_employees_v6',
  DOCUMENTS: 'cyrcalur_documents_v6',
  LEAVE_TYPES: 'cyrcalur_leave_types_v6',
  LEAVE_REQUESTS: 'cyrcalur_leave_requests_v6',
  HOLIDAYS: 'cyrcalur_holidays_v6',
  ATTENDANCE: 'cyrcalur_attendance_v6',
  OVERTIME: 'cyrcalur_overtime_v6',
  KB_ARTICLES: 'cyrcalur_kb_articles_v6',
  ANNOUNCEMENTS: 'cyrcalur_announcements_v6',
  TICKETS: 'cyrcalur_tickets_v6',
  BUILDINGS: 'cyrcalur_buildings_v6',
  ROOMS: 'cyrcalur_rooms_v6',
  RESERVATIONS: 'cyrcalur_reservations_v6',
  AUDIT_LOGS: 'cyrcalur_audit_logs_v6',
  ONBOARDING_CASES: 'cyrcalur_onboarding_cases_v6',
  CURRENT_USER: 'cyrcalur_current_user_v6',
};

class MockStorage {
  constructor() {
    this.init();
  }

  private init() {
    this.ensureKey(KEYS.TENANTS, INITIAL_TENANTS);
    this.ensureKey(KEYS.USERS, INITIAL_USERS);
    this.ensureKey(KEYS.REGIONS, INITIAL_REGIONS);
    this.ensureKey(KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
    this.ensureKey(KEYS.DESIGNATIONS, INITIAL_DESIGNATIONS);
    this.ensureKey(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
    this.ensureKey(KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    this.ensureKey(KEYS.LEAVE_TYPES, INITIAL_LEAVE_TYPES);
    this.ensureKey(KEYS.LEAVE_REQUESTS, INITIAL_LEAVE_REQUESTS);
    this.ensureKey(KEYS.HOLIDAYS, INITIAL_HOLIDAYS);
    this.ensureKey(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    this.ensureKey(KEYS.OVERTIME, INITIAL_OVERTIME);
    this.ensureKey(KEYS.KB_ARTICLES, INITIAL_KB_ARTICLES);
    this.ensureKey(KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    this.ensureKey(KEYS.TICKETS, INITIAL_TICKETS);
    this.ensureKey(KEYS.BUILDINGS, INITIAL_BUILDINGS);
    this.ensureKey(KEYS.ROOMS, INITIAL_ROOMS);
    this.ensureKey(KEYS.RESERVATIONS, INITIAL_RESERVATIONS);
    this.ensureKey(KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    this.ensureKey(KEYS.ONBOARDING_CASES, INITIAL_ONBOARDING_CASES);

    if (!localStorage.getItem(KEYS.CURRENT_USER)) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    }
  }

  private ensureKey<T>(key: string, initialData: T[]) {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(initialData));
    }
  }

  public getItem<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public setItem<T>(key: string, value: T[]): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Tenants
  public getTenants(): Tenant[] {
    return this.getItem<Tenant>(KEYS.TENANTS);
  }

  public addTenant(tenant: Omit<Tenant, 'id' | 'createdAt' | 'consultantCount' | 'employeeCount'>): Tenant {
    const tenants = this.getTenants();
    const newTenant: Tenant = {
      ...tenant,
      id: `tenant-${Date.now()}`,
      consultantCount: 0,
      employeeCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.setItem(KEYS.TENANTS, [newTenant, ...tenants]);
    this.addAuditLog('TENANT_CREATED', 'TENANT', newTenant.id);
    return newTenant;
  }

  public updateTenant(id: string, updates: Partial<Tenant>): Tenant | null {
    const tenants = this.getTenants();
    const idx = tenants.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    tenants[idx] = { ...tenants[idx], ...updates };
    this.setItem(KEYS.TENANTS, tenants);
    this.addAuditLog('TENANT_UPDATED', 'TENANT', id);
    return tenants[idx];
  }

  // Users & Current Auth
  public getUsers(): User[] {
    return this.getItem<User>(KEYS.USERS);
  }

  public addUser(user: User): User {
    const users = this.getUsers();
    this.setItem(KEYS.USERS, [user, ...users]);
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    this.setItem(KEYS.USERS, users);
    return users[idx];
  }

  public getCurrentUser(): User {
    const stored = localStorage.getItem(KEYS.CURRENT_USER);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return INITIAL_USERS[0];
  }

  public setCurrentUser(user: User): void {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog>(KEYS.AUDIT_LOGS);
  }

  public addAuditLog(action: string, resourceType: string, resourceId: string): void {
    const logs = this.getAuditLogs();
    const currentUser = this.getCurrentUser();
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      tenantId: currentUser.tenantId || 'platform',
      actorId: currentUser.id,
      actorName: currentUser.name,
      action,
      resourceType,
      resourceId,
      timestamp: new Date().toISOString(),
      requestId: `req-${Math.random().toString(36).substring(2, 9)}`,
    };
    this.setItem(KEYS.AUDIT_LOGS, [newLog, ...logs]);
  }

  // Generic Tenant Item Helpers
  public getTenantItems<T extends { tenantId?: string }>(key: string, tenantId?: string): T[] {
    const items = this.getItem<T>(key);
    if (!tenantId) return items;
    return items.filter((item) => item.tenantId === tenantId || !item.tenantId);
  }

  public addTenantItem<T extends { id?: string; tenantId?: string }>(key: string, item: T): T {
    const items = this.getItem<T>(key);
    const newItem = {
      ...item,
      id: item.id || `id-${Date.now()}`,
    };
    this.setItem(key, [newItem, ...items]);
    return newItem;
  }

  public updateTenantItem<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | null {
    const items = this.getItem<T>(key);
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updates };
    this.setItem(key, items);
    return items[idx];
  }

  public removeTenantItem<T extends { id: string }>(key: string, id: string): void {
    const items = this.getItem<T>(key);
    this.setItem(
      key,
      items.filter((i) => i.id !== id)
    );
  }

  public deleteTenantItem<T extends { id: string }>(key: string, id: string): void {
    this.removeTenantItem<T>(key, id);
  }

  // Onboarding Workflow & Approval
  public getOnboardingCases(tenantId?: string): OnboardingCase[] {
    return this.getTenantItems<OnboardingCase>(KEYS.ONBOARDING_CASES, tenantId);
  }

  public approveOnboardingCase(caseId: string, approverName: string): OnboardingCase | null {
    const cases = this.getItem<OnboardingCase>(KEYS.ONBOARDING_CASES);
    const caseIdx = cases.findIndex((c) => c.id === caseId);
    if (caseIdx === -1) return null;

    const targetCase = cases[caseIdx];
    const updatedCase: OnboardingCase = {
      ...targetCase,
      status: 'APPROVED',
      approvedAt: new Date().toISOString(),
      approvedBy: approverName,
      personalDetailsCompleted: true,
      offerSignedUploaded: true,
      requiredDocsUploaded: true,
      acknowledgementSigned: true,
    };
    cases[caseIdx] = updatedCase;
    this.setItem(KEYS.ONBOARDING_CASES, cases);

    // 1. Upgrade User Role to EMPLOYEE (Permanent Access)
    const users = this.getUsers();
    const userIdx = users.findIndex((u) => u.id === targetCase.userId || u.email.toLowerCase() === targetCase.email.toLowerCase());
    if (userIdx !== -1) {
      users[userIdx] = {
        ...users[userIdx],
        role: 'EMPLOYEE',
        status: 'ACTIVE',
      };
      this.setItem(KEYS.USERS, users);

      // If active demo user in session matches, update session too
      const current = this.getCurrentUser();
      if (current.id === users[userIdx].id || current.email.toLowerCase() === users[userIdx].email.toLowerCase()) {
        this.setCurrentUser(users[userIdx]);
      }
    }

    // 2. Ensure Employee record in EMPLOYEES is ACTIVE
    const employees = this.getItem<Employee>(KEYS.EMPLOYEES);
    const empIdx = employees.findIndex((e) => e.email.toLowerCase() === targetCase.email.toLowerCase() || (targetCase.employeeId && e.employeeId === targetCase.employeeId));
    if (empIdx !== -1) {
      employees[empIdx] = {
        ...employees[empIdx],
        employmentStatus: 'ACTIVE',
      };
      this.setItem(KEYS.EMPLOYEES, employees);
    } else {
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        tenantId: targetCase.tenantId,
        employeeId: targetCase.employeeId || `EMP-${Date.now().toString().slice(-4)}`,
        name: targetCase.candidateName,
        email: targetCase.email,
        phone: targetCase.phone,
        departmentId: targetCase.departmentId,
        designationId: targetCase.designationId,
        regionId: 'region-acme-us',
        managerId: targetCase.managerId || null,
        joiningDate: targetCase.joiningDate,
        employmentStatus: 'ACTIVE',
        avatarUrl: targetCase.avatarUrl,
      };
      this.setItem(KEYS.EMPLOYEES, [newEmp, ...employees]);
    }

    // 3. Register Audit Log
    this.addAuditLog('ONBOARDING_APPROVED_PERMANENT', 'ONBOARDING_CASE', targetCase.id);

    return updatedCase;
  }

  public rejectOnboardingCase(caseId: string, reason: string, rejectorName: string): OnboardingCase | null {
    const cases = this.getItem<OnboardingCase>(KEYS.ONBOARDING_CASES);
    const caseIdx = cases.findIndex((c) => c.id === caseId);
    if (caseIdx === -1) return null;

    const targetCase = cases[caseIdx];
    const updatedCase: OnboardingCase = {
      ...targetCase,
      status: 'REJECTED',
      rejectionReason: reason || 'Onboarding compliance verification failed or was declined by HR.',
      rejectedAt: new Date().toISOString(),
      rejectedBy: rejectorName,
    };
    cases[caseIdx] = updatedCase;
    this.setItem(KEYS.ONBOARDING_CASES, cases);

    // Revoke User status / suspend permissions
    const users = this.getUsers();
    const userIdx = users.findIndex((u) => u.id === targetCase.userId || u.email.toLowerCase() === targetCase.email.toLowerCase());
    if (userIdx !== -1) {
      users[userIdx] = {
        ...users[userIdx],
        status: 'SUSPENDED',
      };
      this.setItem(KEYS.USERS, users);

      const current = this.getCurrentUser();
      if (current.id === users[userIdx].id || current.email.toLowerCase() === users[userIdx].email.toLowerCase()) {
        this.setCurrentUser(users[userIdx]);
      }
    }

    // Register Audit Log
    this.addAuditLog('ONBOARDING_REJECTED_REVOKED', 'ONBOARDING_CASE', targetCase.id);

    return updatedCase;
  }
}

export const mockStorage = new MockStorage();
