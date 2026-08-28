import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import {
  Project,
  TaskItem,
  Department,
  Designation,
  Region,
  Room,
  KBArticle,
  Building,
} from '@/demo-data/seedData';

// Shared Form Components
import { ProjectForm } from '@/components/forms/ProjectForm';
import { TaskForm } from '@/components/forms/TaskForm';
import { EmployeeOnboardingForm } from '@/components/forms/EmployeeOnboardingForm';
import { RegionForm } from '@/components/forms/RegionForm';
import { DepartmentForm } from '@/components/forms/DepartmentForm';
import { DesignationForm } from '@/components/forms/DesignationForm';
import { MeetingRoomForm } from '@/components/forms/MeetingRoomForm';
import { KBArticleForm } from '@/components/forms/KBArticleForm';
import { TicketForm } from '@/components/forms/TicketForm';

export type QuickAddType =
  | 'PROJECT'
  | 'TASK'
  | 'EMPLOYEE'
  | 'REGION'
  | 'DEPARTMENT'
  | 'DESIGNATION'
  | 'MEETING_ROOM'
  | 'KB_ARTICLE'
  | 'TICKET'
  | null;

interface QuickAddModalProps {
  type: QuickAddType;
  isOpen: boolean;
  tenantId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  type,
  isOpen,
  tenantId,
  onClose,
  onSuccess,
}) => {
  const getModalConfig = () => {
    switch (type) {
      case 'PROJECT':
        return {
          title: 'Create New Project',
          description: 'Configure project details and assign team members.',
          maxWidth: '2xl' as const,
        };
      case 'TASK':
        return {
          title: 'Create New Task',
          description: 'Configure task assignment, optional project link, priority, and due dates.',
          maxWidth: '2xl' as const,
        };
      case 'EMPLOYEE':
        return {
          title: 'New Employee Onboarding',
          description: 'Step-by-step registration. Fill out each required step before saving.',
          maxWidth: '4xl' as const,
        };
      case 'DEPARTMENT':
        return {
          title: 'Create Department',
          description: 'Add a new structural unit within the company.',
          maxWidth: '2xl' as const,
        };
      case 'DESIGNATION':
        return {
          title: 'Create Job Designation',
          description: 'Add a new job title to assign to employees.',
          maxWidth: '2xl' as const,
        };
      case 'REGION':
        return {
          title: 'Add Tenant Region',
          description: 'Specify local region parameters for time zone and date formatting.',
          maxWidth: '2xl' as const,
        };
      case 'MEETING_ROOM':
        return {
          title: 'Add New Meeting Room',
          description: 'Configure room details, seating capacity, facilities, and location for your office.',
          maxWidth: '2xl' as const,
        };
      case 'KB_ARTICLE':
        return {
          title: 'Create Knowledge Base Article & Step Guide',
          description: 'Publish company-wide universal guidelines or department-restricted step guides.',
          maxWidth: '2xl' as const,
        };
      case 'TICKET':
        return {
          title: 'Create Help Desk Ticket',
          description: 'Submit a request to Platform Super Admin or internal company support.',
          maxWidth: '2xl' as const,
        };
      default:
        return {
          title: 'Quick Add',
          description: 'Create or register new items in the platform.',
          maxWidth: '2xl' as const,
        };
    }
  };

  const config = getModalConfig();

  const handleDone = () => {
    onClose();
    onSuccess?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={config.title}
      description={config.description}
      maxWidth={config.maxWidth}
    >
      <div className="pt-1">
        {type === 'PROJECT' && (
          <ProjectForm
            tenantId={tenantId}
            onSubmit={(formData) => {
              const newProj: Project = {
                id: `proj-${Date.now()}`,
                tenantId,
                ...formData,
                createdAt: new Date().toISOString(),
              };
              mockStorage.addTenantItem<Project>(KEYS.PROJECTS, newProj);
              toast.success(`🎉 Project "${formData.name}" created successfully!`);
              handleDone();
            }}
            onCancel={onClose}
            submitLabel="Create Project"
          />
        )}

        {type === 'TASK' && (
          <TaskForm
            tenantId={tenantId}
            onSubmit={(formData) => {
              const projects = mockStorage.getTenantItems<Project>(KEYS.PROJECTS, tenantId);
              const employees = mockStorage.getTenantItems(KEYS.EMPLOYEES, tenantId);
              const selectedP = projects.find((p) => p.id === formData.projectId);
              const selectedE = (employees as any[]).find((e) => e.id === formData.assignedEmployeeId);

              const newTask: TaskItem = {
                id: `task-${Date.now()}`,
                tenantId,
                ...formData,
                projectName: selectedP ? selectedP.name : undefined,
                assignedEmployeeName: selectedE ? selectedE.name : undefined,
                createdAt: new Date().toISOString(),
              };
              mockStorage.addTenantItem<TaskItem>(KEYS.TASKS, newTask);
              toast.success(`🎉 Task "${formData.title}" created successfully!`);
              handleDone();
            }}
            onCancel={onClose}
            submitLabel="Create Task"
          />
        )}

        {type === 'EMPLOYEE' && (
          <EmployeeOnboardingForm
            tenantId={tenantId}
            onSuccess={handleDone}
            onCancel={onClose}
          />
        )}

        {type === 'REGION' && (
          <RegionForm
            tenantId={tenantId}
            onSubmit={(formData) => {
              const newReg: Region = {
                id: `reg-${Date.now()}`,
                tenantId,
                ...formData,
              };
              mockStorage.addTenantItem<Region>(KEYS.REGIONS, newReg);
              toast.success(`🎉 Region/Office "${formData.name}" added!`);
              handleDone();
            }}
            onCancel={onClose}
            submitLabel="Add Region"
          />
        )}

        {type === 'DEPARTMENT' && (
          <DepartmentForm
            tenantId={tenantId}
            onSubmit={(formData) => {
              const newDept: Department = {
                id: `dept-${Date.now()}`,
                tenantId,
                ...formData,
              };
              mockStorage.addTenantItem<Department>(KEYS.DEPARTMENTS, newDept);
              toast.success(`🎉 Department "${formData.name}" created!`);
              handleDone();
            }}
            onCancel={onClose}
            submitLabel="Create Department"
          />
        )}

        {type === 'DESIGNATION' && (
          <DesignationForm
            tenantId={tenantId}
            onSubmit={(formData) => {
              const newDesig: Designation = {
                id: `desig-${Date.now()}`,
                tenantId,
                ...formData,
              };
              mockStorage.addTenantItem<Designation>(KEYS.DESIGNATIONS, newDesig);
              toast.success(`🎉 Designation "${formData.name}" added!`);
              handleDone();
            }}
            onCancel={onClose}
            submitLabel="Add Designation"
          />
        )}

        {type === 'MEETING_ROOM' && (
          <MeetingRoomForm
            tenantId={tenantId}
            onSubmit={(formData) => {
              const buildings = mockStorage.getTenantItems<Building>(KEYS.BUILDINGS, tenantId);
              const bld = buildings.find((b) => b.name === formData.buildingName) || buildings[0];
              const bldId = bld?.id || `bld-${Date.now()}`;

              const newRoom: Room = {
                id: `room-${Date.now()}`,
                tenantId,
                buildingId: bldId,
                buildingName: formData.buildingName || 'Main Campus',
                name: formData.name,
                floor: formData.floor,
                capacity: formData.capacity,
                facilities: formData.facilities,
                status: formData.status,
              };
              mockStorage.addTenantItem<Room>(KEYS.ROOMS, newRoom);
              mockStorage.addAuditLog('ROOM_CREATED', 'ROOM', newRoom.id);
              toast.success(`🎉 Meeting Room "${formData.name}" added!`);
              handleDone();
            }}
            onCancel={onClose}
            submitLabel="Add Meeting Room"
          />
        )}

        {type === 'KB_ARTICLE' && (
          <KBArticleForm
            tenantId={tenantId}
            onSubmit={(formData) => {
              const newKB: KBArticle = {
                id: `kb-${Date.now()}`,
                tenantId,
                title: formData.title,
                categoryId: formData.categoryId,
                categoryName: formData.categoryName,
                content: formData.content,
                tags: formData.tags,
                status: formData.status,
                updatedAt: new Date().toISOString(),
                targetDepartmentId: formData.targetDepartmentId,
                targetDepartmentName: formData.targetDepartmentName,
                attachments: formData.attachments,
              };
              mockStorage.addTenantItem<KBArticle>(KEYS.KB_ARTICLES, newKB);
              mockStorage.addAuditLog('KB_ARTICLE_CREATED', 'KB_ARTICLE', newKB.id);
              const scopeMsg = formData.targetDepartmentName
                ? `restricted to "${formData.targetDepartmentName}" department`
                : 'published company-wide';
              toast.success(`🎉 KB Article "${formData.title}" ${scopeMsg}!`);
              handleDone();
            }}
            onCancel={onClose}
            submitLabel="Publish Article"
          />
        )}

        {type === 'TICKET' && (
          <TicketForm
            tenantId={tenantId}
            onSubmit={(formData) => {
              const currentUser = mockStorage.getCurrentUser();
              const tenants = mockStorage.getTenants();
              const currentTenant = tenants.find((t) => t.id === tenantId);
              const newTicket = {
                id: `tkt-${Date.now()}`,
                tenantId,
                tenantName: currentTenant ? currentTenant.name : 'Company Portal',
                ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
                subject: formData.subject,
                category: formData.category,
                description: formData.description || formData.subject,
                departmentId: 'dept-it',
                departmentName:
                  formData.targetScope === 'PLATFORM_SUPER_ADMIN'
                    ? 'Platform Core Support'
                    : 'IT & Infrastructure',
                priority: (formData.priority === 'URGENT' ? 'HIGH' : formData.priority) as any,
                status: 'OPEN' as const,
                targetScope: formData.targetScope,
                createdById: currentUser?.id || 'user-admin',
                createdByName: currentUser?.name || 'Company Admin',
                createdAt: new Date().toISOString(),
                comments: [
                  {
                    id: `comm-${Date.now()}`,
                    authorName: currentUser?.name || 'Company Admin',
                    authorRole: 'TENANT_ADMIN',
                    content:
                      formData.targetScope === 'PLATFORM_SUPER_ADMIN'
                        ? 'Reported directly to Platform Super Admin Dashboard.'
                        : 'Opened ticket for internal company support.',
                    createdAt: new Date().toISOString(),
                  },
                ],
              };
              mockStorage.addTenantItem(KEYS.TICKETS, newTicket);
              if (formData.targetScope === 'PLATFORM_SUPER_ADMIN') {
                toast.success(`🐞 Ticket #${newTicket.ticketNumber} reported directly to Super Admin Dashboard!`);
              } else {
                toast.success(`🎉 Internal Support Ticket #${newTicket.ticketNumber} created!`);
              }
              handleDone();
            }}
            onCancel={onClose}
            submitLabel="Submit Ticket"
          />
        )}
      </div>
    </Modal>
  );
};
