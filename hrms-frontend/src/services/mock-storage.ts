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
} from '@/demo-data/seedData';

export const KEYS = {
  TENANTS: 'cyrcalur_tenants_v2',
  USERS: 'cyrcalur_users_v2',
  REGIONS: 'cyrcalur_regions_v2',
  DEPARTMENTS: 'cyrcalur_departments_v2',
  DESIGNATIONS: 'cyrcalur_designations_v2',
  EMPLOYEES: 'cyrcalur_employees_v2',
  DOCUMENTS: 'cyrcalur_documents_v2',
  LEAVE_TYPES: 'cyrcalur_leave_types_v2',
  LEAVE_REQUESTS: 'cyrcalur_leave_requests_v2',
  HOLIDAYS: 'cyrcalur_holidays_v2',
  ATTENDANCE: 'cyrcalur_attendance_v2',
  OVERTIME: 'cyrcalur_overtime_v2',
  KB_ARTICLES: 'cyrcalur_kb_articles_v2',
  ANNOUNCEMENTS: 'cyrcalur_announcements_v2',
  TICKETS: 'cyrcalur_tickets_v2',
  BUILDINGS: 'cyrcalur_buildings_v2',
  ROOMS: 'cyrcalur_rooms_v2',
  RESERVATIONS: 'cyrcalur_reservations_v2',
  AUDIT_LOGS: 'cyrcalur_audit_logs_v2',
  CURRENT_USER: 'cyrcalur_current_user_v2',
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
}

export const mockStorage = new MockStorage();
