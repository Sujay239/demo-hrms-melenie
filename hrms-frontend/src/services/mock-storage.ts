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
  OnboardingDocRequirement,
  DEFAULT_ONBOARDING_DOCUMENTS,
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
} from "@/demo-data/seedData";

export const KEYS = {
  TENANTS: "tenants",
  USERS: "users",
  REGIONS: "regions",
  DEPARTMENTS: "departments",
  DESIGNATIONS: "designations",
  EMPLOYEES: "employees",
  DOCUMENTS: "documents",
  LEAVE_TYPES: "leave-types",
  LEAVE_REQUESTS: "leave-requests",
  HOLIDAYS: "holidays",
  ATTENDANCE: "attendance",
  OVERTIME: "overtime",
  KB_ARTICLES: "kb-articles",
  ANNOUNCEMENTS: "announcements",
  TICKETS: "tickets",
  BUILDINGS: "buildings",
  ROOMS: "rooms",
  RESERVATIONS: "reservations",
  AUDIT_LOGS: "audit-logs",
  ONBOARDING_CASES: "onboarding-cases",
  ONBOARDING_DOC_TEMPLATES: "onboarding-doc-templates",
  CURRENT_USER: "Peopleworkplaces_current_user_v7",
};

const DEFAULT_INITIAL_MAP: Record<string, any[]> = {
  [KEYS.TENANTS]: INITIAL_TENANTS,
  [KEYS.USERS]: INITIAL_USERS,
  [KEYS.REGIONS]: INITIAL_REGIONS,
  [KEYS.DEPARTMENTS]: INITIAL_DEPARTMENTS,
  [KEYS.DESIGNATIONS]: INITIAL_DESIGNATIONS,
  [KEYS.EMPLOYEES]: INITIAL_EMPLOYEES,
  [KEYS.DOCUMENTS]: INITIAL_DOCUMENTS,
  [KEYS.LEAVE_TYPES]: INITIAL_LEAVE_TYPES,
  [KEYS.LEAVE_REQUESTS]: INITIAL_LEAVE_REQUESTS,
  [KEYS.HOLIDAYS]: INITIAL_HOLIDAYS,
  [KEYS.ATTENDANCE]: INITIAL_ATTENDANCE,
  [KEYS.OVERTIME]: INITIAL_OVERTIME,
  [KEYS.KB_ARTICLES]: INITIAL_KB_ARTICLES,
  [KEYS.ANNOUNCEMENTS]: INITIAL_ANNOUNCEMENTS,
  [KEYS.TICKETS]: INITIAL_TICKETS,
  [KEYS.BUILDINGS]: INITIAL_BUILDINGS,
  [KEYS.ROOMS]: INITIAL_ROOMS,
  [KEYS.RESERVATIONS]: INITIAL_RESERVATIONS,
  [KEYS.AUDIT_LOGS]: INITIAL_AUDIT_LOGS,
  [KEYS.ONBOARDING_CASES]: INITIAL_ONBOARDING_CASES,
};

class MockStorage {
  private memoryCache: Record<string, any[]> = {};
  private isInitialized = false;

  constructor() {
    this.initSync();
    this.syncFromDisk();
  }

  private initSync() {
    Object.keys(DEFAULT_INITIAL_MAP).forEach((key) => {
      const stored = localStorage.getItem(`json_${key}`);
      if (stored) {
        try {
          this.memoryCache[key] = JSON.parse(stored);
        } catch {
          this.memoryCache[key] = DEFAULT_INITIAL_MAP[key] || [];
        }
      } else {
        this.memoryCache[key] = DEFAULT_INITIAL_MAP[key] || [];
        localStorage.setItem(
          `json_${key}`,
          JSON.stringify(this.memoryCache[key]),
        );
      }
    });

    if (!localStorage.getItem(KEYS.CURRENT_USER)) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    }
    this.isInitialized = true;
  }

  public async syncFromDisk(): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      const keys = Object.keys(DEFAULT_INITIAL_MAP);
      await Promise.all(
        keys.map(async (key) => {
          try {
            const res = await fetch(`/api/data/${key}`);
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data)) {
                this.memoryCache[key] = data;
                localStorage.setItem(`json_${key}`, JSON.stringify(data));
              }
            }
          } catch {
            // Server might not be reachable yet or in static build
          }
        }),
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new CustomEvent("dataSynced"));
      }
    } catch {
      // Ignored
    }
  }

  private persistKey<T>(key: string, data: T[]): void {
    this.memoryCache[key] = data;
    try {
      localStorage.setItem(`json_${key}`, JSON.stringify(data));
    } catch (e) {
      console.warn(`localStorage save error for key "${key}":`, e);
    }

    // Always asynchronously persist to backend JSON file on disk
    if (typeof window !== "undefined") {
      fetch(`/api/data/${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).catch((err) => {
        console.warn(`Failed to write to disk at /api/data/${key}:`, err);
      });
    }
  }

  public getItem<T>(key: string): T[] {
    if (this.memoryCache[key]) {
      return this.memoryCache[key] as T[];
    }
    try {
      const stored = localStorage.getItem(`json_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.memoryCache[key] = parsed;
        return parsed;
      }
    } catch {
      // fallback
    }
    return (DEFAULT_INITIAL_MAP[key] || []) as T[];
  }

  public setItem<T>(key: string, value: T[]): void {
    this.persistKey(key, value);
  }

  public async uploadFile(
    fileName: string,
    fileData: string,
  ): Promise<{ url: string; fileName: string }> {
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileData }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return { url: fileData, fileName };
  }

  private tenantMetrics(
    tenantId: string,
    users: User[],
    employees: Employee[],
  ) {
    return {
      consultantCount: users.filter(
        (u) =>
          u.role === "CONSULTANT" &&
          (u.assignedTenantIds || []).includes(tenantId),
      ).length,
      employeeCount: employees.filter(
        (e) => e.tenantId === tenantId && e.employmentStatus === "ACTIVE",
      ).length,
    };
  }

  private syncTenantMetrics(): Tenant[] {
    const tenants = this.getItem<Tenant>(KEYS.TENANTS);
    const users = this.getItem<User>(KEYS.USERS);
    const employees = this.getItem<Employee>(KEYS.EMPLOYEES);
    let changed = false;

    const synced = tenants.map((tenant) => {
      const metrics = this.tenantMetrics(tenant.id, users, employees);
      if (
        tenant.consultantCount !== metrics.consultantCount ||
        tenant.employeeCount !== metrics.employeeCount
      ) {
        changed = true;
        return { ...tenant, ...metrics };
      }
      return tenant;
    });

    if (changed) {
      this.setItem(KEYS.TENANTS, synced);
    }

    return synced;
  }

  public getRoleLabel(role: User["role"]): string {
    const labels: Record<User["role"], string> = {
      SUPER_ADMIN: "Super Admin",
      CONSULTANT: "Consultant",
      TENANT_ADMIN: "Company Admin",
      EMPLOYEE: "Employee",
      NEW_HIRE: "New Hire",
    };
    return labels[role] || role;
  }

  public getVisibleTenantsForUser(
    user: User = this.getCurrentUser(),
  ): Tenant[] {
    const tenants = this.getTenants();
    if (user.role === "SUPER_ADMIN") return tenants;
    if (user.role === "CONSULTANT") {
      const assignedTenantIds = new Set(user.assignedTenantIds || []);
      return tenants.filter((tenant) => assignedTenantIds.has(tenant.id));
    }
    if (user.tenantId) {
      return tenants.filter((tenant) => tenant.id === user.tenantId);
    }
    return [];
  }

  public getAccessibleTenant(
    user: User,
    requestedSlug?: string,
  ): Tenant | null {
    const visibleTenants = this.getVisibleTenantsForUser(user);
    if (!requestedSlug) return visibleTenants[0] || null;
    return (
      visibleTenants.find((tenant) => tenant.slug === requestedSlug) || null
    );
  }

  public isTenantAdminFor(user: User, tenantId?: string): boolean {
    if (user.role === "TENANT_ADMIN")
      return Boolean(tenantId && user.tenantId === tenantId);
    if (user.role === "CONSULTANT")
      return Boolean(
        tenantId && (user.assignedTenantIds || []).includes(tenantId),
      );
    return false;
  }

  private syncUserFromEmployee(
    employee: Employee,
    previousEmployee?: Employee,
  ): void {
    const users = this.getUsers();
    const normalizedEmail = employee.email.toLowerCase();
    const previousEmail = previousEmployee?.email.toLowerCase();
    const userIdx = users.findIndex((u) => {
      const sameTenant = u.tenantId === employee.tenantId;
      const emailMatch =
        u.email.toLowerCase() === normalizedEmail ||
        (!!previousEmail && u.email.toLowerCase() === previousEmail);
      const legacyNameMatch =
        !!previousEmployee &&
        sameTenant &&
        u.name.toLowerCase() === previousEmployee.name.toLowerCase();
      return sameTenant && (emailMatch || legacyNameMatch);
    });

    if (userIdx === -1) return;

    users[userIdx] = {
      ...users[userIdx],
      name: employee.name,
      email: employee.email,
      avatarUrl: employee.avatarUrl || users[userIdx].avatarUrl,
      status: employee.employmentStatus === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      tenantId: employee.tenantId,
    };
    this.setItem(KEYS.USERS, users);

    const current = this.getCurrentUser();
    if (current.id === users[userIdx].id) {
      this.setCurrentUser(users[userIdx]);
    }
  }

  private createUserForEmployee(employee: Employee): void {
    const users = this.getUsers();
    const exists = users.some(
      (u) => u.email.toLowerCase() === employee.email.toLowerCase(),
    );
    if (exists) return;

    this.setItem<User>(KEYS.USERS, [
      {
        id: `user-${employee.id}`,
        name: employee.name,
        email: employee.email,
        password: "password123",
        role: "EMPLOYEE",
        tenantId: employee.tenantId,
        status:
          employee.employmentStatus === "INACTIVE" ? "INACTIVE" : "ACTIVE",
        avatarUrl: employee.avatarUrl,
      },
      ...users,
    ]);
  }

  // Tenants
  public getTenants(): Tenant[] {
    return this.syncTenantMetrics();
  }

  public addTenant(
    tenant: Omit<
      Tenant,
      "id" | "createdAt" | "consultantCount" | "employeeCount"
    >,
    adminPassword?: string,
  ): { tenant: Tenant; adminUser: User; generatedPassword: string } {
    const tenants = this.getTenants();
    const newTenant: Tenant = {
      ...tenant,
      id: `tenant-${Date.now()}`,
      consultantCount: 0,
      employeeCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.setItem(KEYS.TENANTS, [newTenant, ...tenants]);

    // Create Company Admin with generated credentials
    const generatedPassword =
      adminPassword ||
      `${tenant.slug.charAt(0).toUpperCase() + tenant.slug.slice(1)}@${Math.floor(1000 + Math.random() * 9000)}`;
    const adminEmail = tenant.adminEmail || `admin@${tenant.slug}.com`;

    const adminUser: User = {
      id: `user-admin-${newTenant.id}`,
      name: `${tenant.name} Admin`,
      email: adminEmail,
      password: generatedPassword,
      role: "TENANT_ADMIN",
      tenantId: newTenant.id,
      status: "ACTIVE",
    };

    const users = this.getUsers().filter(
      (u) => u.email.toLowerCase() !== adminEmail.toLowerCase(),
    );
    this.setItem(KEYS.USERS, [adminUser, ...users]);

    this.addAuditLog("TENANT_CREATED", "TENANT", newTenant.id);
    return { tenant: newTenant, adminUser, generatedPassword };
  }

  public updateTenant(id: string, updates: Partial<Tenant>): Tenant | null {
    const tenants = this.getTenants();
    const idx = tenants.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    tenants[idx] = { ...tenants[idx], ...updates };
    this.setItem(KEYS.TENANTS, tenants);
    this.addAuditLog("TENANT_UPDATED", "TENANT", id);
    return tenants[idx];
  }

  public deleteTenant(id: string): void {
    const tenants = this.getTenants();
    this.setItem(
      KEYS.TENANTS,
      tenants.filter((t) => t.id !== id),
    );
    // Remove users belonging to this tenant
    const users = this.getUsers();
    this.setItem(
      KEYS.USERS,
      users.filter((u) => u.tenantId !== id),
    );
    this.addAuditLog("TENANT_DELETED", "TENANT", id);
  }

  // Users & Current Auth
  public getUsers(): User[] {
    return this.getItem<User>(KEYS.USERS);
  }

  public addUser(user: User): User {
    const users = this.getUsers();
    this.setItem(KEYS.USERS, [user, ...users]);
    if (user.role === "CONSULTANT") {
      this.syncTenantMetrics();
    }
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    this.setItem(KEYS.USERS, users);
    if (
      users[idx].role === "CONSULTANT" ||
      updates.role === "CONSULTANT" ||
      updates.assignedTenantIds
    ) {
      this.syncTenantMetrics();
    }
    return users[idx];
  }

  public deleteUser(id: string): void {
    const users = this.getUsers();
    this.setItem(
      KEYS.USERS,
      users.filter((u) => u.id !== id),
    );
  }

  public getCurrentUser(): User {
    const stored = localStorage.getItem(KEYS.CURRENT_USER);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          // Re-verify against latest users in case of updates or deletions
          const latestUsers = this.getUsers();
          const found = latestUsers.find(
            (u) =>
              u.id === parsed.id ||
              u.email.toLowerCase() === parsed.email.toLowerCase(),
          );
          if (found) {
            if (JSON.stringify(found) !== stored) {
              localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(found));
            }
            return found;
          }

          // If the user was removed from users data, invalidate stale cached session
          if (parsed.role !== "SUPER_ADMIN") {
            localStorage.removeItem(KEYS.CURRENT_USER);
            return INITIAL_USERS[0];
          }
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_USERS[0];
  }

  public setCurrentUser(user: User): void {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  }

  public logout(): void {
    localStorage.removeItem(KEYS.CURRENT_USER);
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog>(KEYS.AUDIT_LOGS);
  }

  public addAuditLog(
    action: string,
    resourceType: string,
    resourceId: string,
  ): void {
    const logs = this.getAuditLogs();
    const currentUser = this.getCurrentUser();
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      tenantId: currentUser.tenantId || "platform",
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

  // Generic Tenant Item Helpers (Ensures 100% tenant isolation)
  public getTenantItems<T extends { tenantId?: string }>(
    key: string,
    tenantId?: string,
  ): T[] {
    const items = this.getItem<T>(key);
    if (!tenantId) return items;
    return items.filter((item) => item.tenantId === tenantId);
  }

  public addTenantItem<T extends { id?: string; tenantId?: string }>(
    key: string,
    item: T,
  ): T {
    const items = this.getItem<T>(key);
    const newItem = {
      ...item,
      id: item.id || `${key.slice(0, 4)}-${Date.now()}`,
    };
    this.setItem(key, [newItem, ...items]);
    if (key === KEYS.EMPLOYEES) {
      this.createUserForEmployee(newItem as unknown as Employee);
      this.syncTenantMetrics();
    }
    return newItem;
  }

  public updateTenantItem<T extends { id: string }>(
    key: string,
    id: string,
    updates: Partial<T>,
  ): T | null {
    const items = this.getItem<T>(key);
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    const previous = items[idx];
    items[idx] = { ...items[idx], ...updates };
    this.setItem(key, items);
    if (key === KEYS.EMPLOYEES) {
      this.syncUserFromEmployee(
        items[idx] as unknown as Employee,
        previous as unknown as Employee,
      );
      this.syncTenantMetrics();
    }
    return items[idx];
  }

  public removeTenantItem<T extends { id: string }>(
    key: string,
    id: string,
  ): void {
    const items = this.getItem<T>(key);
    this.setItem(
      key,
      items.filter((i) => i.id !== id),
    );
    if (key === KEYS.EMPLOYEES) {
      this.syncTenantMetrics();
    }
  }

  public deleteTenantItem<T extends { id: string }>(
    key: string,
    id: string,
  ): void {
    this.removeTenantItem<T>(key, id);
  }

  // Onboarding Workflow & Approval
  public getOnboardingDocRequirements(tenantId?: string): OnboardingDocRequirement[] {
    const key = tenantId ? `${KEYS.ONBOARDING_DOC_TEMPLATES}_${tenantId}` : KEYS.ONBOARDING_DOC_TEMPLATES;
    const stored = this.getItem<OnboardingDocRequirement>(key);
    if (!stored || stored.length === 0) {
      return [...DEFAULT_ONBOARDING_DOCUMENTS];
    }
    return stored;
  }

  public saveOnboardingDocRequirements(tenantId: string, requirements: OnboardingDocRequirement[]): void {
    const key = tenantId ? `${KEYS.ONBOARDING_DOC_TEMPLATES}_${tenantId}` : KEYS.ONBOARDING_DOC_TEMPLATES;
    this.setItem(key, requirements);
  }

  public getOnboardingCases(tenantId?: string): OnboardingCase[] {
    return this.getTenantItems<OnboardingCase>(KEYS.ONBOARDING_CASES, tenantId);
  }

  public approveOnboardingCase(
    caseId: string,
    approverName: string,
  ): OnboardingCase | null {
    const cases = this.getItem<OnboardingCase>(KEYS.ONBOARDING_CASES);
    const caseIdx = cases.findIndex((c) => c.id === caseId);
    if (caseIdx === -1) return null;

    const targetCase = cases[caseIdx];
    const updatedCase: OnboardingCase = {
      ...targetCase,
      status: "APPROVED",
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
    const userIdx = users.findIndex(
      (u) =>
        u.id === targetCase.userId ||
        u.email.toLowerCase() === targetCase.email.toLowerCase(),
    );
    if (userIdx !== -1) {
      users[userIdx] = {
        ...users[userIdx],
        role: "EMPLOYEE",
        status: "ACTIVE",
        isPermanent: true,
      };
      this.setItem(KEYS.USERS, users);

      const current = this.getCurrentUser();
      if (
        current.id === users[userIdx].id ||
        current.email.toLowerCase() === users[userIdx].email.toLowerCase()
      ) {
        this.setCurrentUser(users[userIdx]);
      }
    }

    // 2. Ensure Employee record in EMPLOYEES is ACTIVE and Permanent
    const employees = this.getItem<Employee>(KEYS.EMPLOYEES);
    const empIdx = employees.findIndex(
      (e) =>
        e.email.toLowerCase() === targetCase.email.toLowerCase() ||
        (targetCase.employeeId && e.employeeId === targetCase.employeeId),
    );
    if (empIdx !== -1) {
      employees[empIdx] = {
        ...employees[empIdx],
        employmentStatus: "ACTIVE",
        isPermanent: true,
      };
      this.setItem(KEYS.EMPLOYEES, employees);
    } else {
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        tenantId: targetCase.tenantId,
        employeeId:
          targetCase.employeeId || `EMP-${Date.now().toString().slice(-4)}`,
        name: targetCase.candidateName,
        email: targetCase.email,
        phone: targetCase.phone,
        departmentId: targetCase.departmentId,
        designationId: targetCase.designationId,
        regionId:
          this.getTenants().find((tenant) => tenant.id === targetCase.tenantId)
            ?.defaultRegionId || "",
        managerId: targetCase.managerId || null,
        joiningDate: targetCase.joiningDate,
        employmentStatus: "ACTIVE",
        isPermanent: true,
        avatarUrl: targetCase.avatarUrl,
      };
      this.setItem(KEYS.EMPLOYEES, [newEmp, ...employees]);
    }

    // 3. Register Audit Log
    this.addAuditLog(
      "ONBOARDING_APPROVED_PERMANENT",
      "ONBOARDING_CASE",
      targetCase.id,
    );

    return updatedCase;
  }

  public rejectOnboardingCase(
    caseId: string,
    reason: string,
    rejectorName: string,
  ): OnboardingCase | null {
    const cases = this.getItem<OnboardingCase>(KEYS.ONBOARDING_CASES);
    const caseIdx = cases.findIndex((c) => c.id === caseId);
    if (caseIdx === -1) return null;

    const targetCase = cases[caseIdx];
    const updatedCase: OnboardingCase = {
      ...targetCase,
      status: "REJECTED",
      rejectionReason:
        reason ||
        "Onboarding compliance verification failed or was declined by HR.",
      rejectedAt: new Date().toISOString(),
      rejectedBy: rejectorName,
    };
    cases[caseIdx] = updatedCase;
    this.setItem(KEYS.ONBOARDING_CASES, cases);

    // Revoke User status / suspend permissions
    const users = this.getUsers();
    const userIdx = users.findIndex(
      (u) =>
        u.id === targetCase.userId ||
        u.email.toLowerCase() === targetCase.email.toLowerCase(),
    );
    if (userIdx !== -1) {
      users[userIdx] = {
        ...users[userIdx],
        status: "SUSPENDED",
        isPermanent: false,
      };
      this.setItem(KEYS.USERS, users);

      const current = this.getCurrentUser();
      if (
        current.id === users[userIdx].id ||
        current.email.toLowerCase() === users[userIdx].email.toLowerCase()
      ) {
        this.setCurrentUser(users[userIdx]);
      }
    }

    // Update Employee record
    const employees = this.getItem<Employee>(KEYS.EMPLOYEES);
    const empIdx = employees.findIndex(
      (e) =>
        e.email.toLowerCase() === targetCase.email.toLowerCase() ||
        (targetCase.employeeId && e.employeeId === targetCase.employeeId),
    );
    if (empIdx !== -1) {
      employees[empIdx] = {
        ...employees[empIdx],
        employmentStatus: "INACTIVE",
        isPermanent: false,
      };
      this.setItem(KEYS.EMPLOYEES, employees);
    }

    // Register Audit Log
    this.addAuditLog(
      "ONBOARDING_REJECTED_REVOKED",
      "ONBOARDING_CASE",
      targetCase.id,
    );

    return updatedCase;
  }
}

export const mockStorage = new MockStorage();
