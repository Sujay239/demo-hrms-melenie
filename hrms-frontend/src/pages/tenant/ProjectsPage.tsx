import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { DatePicker } from '@/components/ui/DatePicker';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { Project, TaskItem, Employee } from '@/demo-data/seedData';
import {
  FolderKanban,
  Plus,
  Search,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Briefcase,
  Edit2,
  Trash2,
  ArrowRight,
  ListTodo,
  Eye,
} from 'lucide-react';

const STATUS_BADGES: Record<Project['status'], { label: string; variant: 'sky' | 'emerald' | 'amber' | 'neutral' }> = {
  PLANNING: { label: 'Planning', variant: 'sky' },
  IN_PROGRESS: { label: 'In Progress', variant: 'emerald' },
  COMPLETED: { label: 'Completed', variant: 'neutral' },
  ON_HOLD: { label: 'On Hold', variant: 'amber' },
};

export const ProjectsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];
  const currentUser = mockStorage.getCurrentUser();
  const isTenantAdmin = mockStorage.isTenantAdminFor(currentUser, currentTenant.id);

  // State
  const [projects, setProjects] = useState<Project[]>(() =>
    mockStorage.getTenantItems<Project>(KEYS.PROJECTS, currentTenant?.id)
  );
  const [tasks, setTasks] = useState<TaskItem[]>(() =>
    mockStorage.getTenantItems<TaskItem>(KEYS.TASKS, currentTenant?.id)
  );
  const [employees, setEmployees] = useState<Employee[]>(() =>
    mockStorage.getTenantItems<Employee>(KEYS.EMPLOYEES, currentTenant?.id)
  );

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedDetailProject, setSelectedDetailProject] = useState<Project | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [client, setClient] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<Project['status']>('IN_PROGRESS');
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>([]);

  const reloadData = () => {
    setProjects(mockStorage.getTenantItems<Project>(KEYS.PROJECTS, currentTenant?.id));
    setTasks(mockStorage.getTenantItems<TaskItem>(KEYS.TASKS, currentTenant?.id));
    setEmployees(mockStorage.getTenantItems<Employee>(KEYS.EMPLOYEES, currentTenant?.id));
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.client && p.client.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setName(project.name);
      setCode(project.code);
      setClient(project.client || '');
      setDescription(project.description || '');
      setStartDate(project.startDate);
      setDueDate(project.dueDate);
      setStatus(project.status);
      setAssignedEmployeeIds(project.assignedEmployeeIds || []);
    } else {
      setEditingProject(null);
      setName('');
      setCode('');
      setClient('');
      setDescription('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setDueDate('');
      setStatus('IN_PROGRESS');
      setAssignedEmployeeIds([]);
    }
    setIsModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error('Project Name and Code are required');
      return;
    }
    if (startDate && dueDate && startDate > dueDate) {
      toast.error('Due date must be on or after start date');
      return;
    }

    if (editingProject) {
      mockStorage.updateTenantItem<Project>(KEYS.PROJECTS, editingProject.id, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        client: client.trim() || undefined,
        description: description.trim() || undefined,
        startDate,
        dueDate,
        status,
        assignedEmployeeIds,
      });
      toast.success(`Project "${name}" updated!`);
    } else {
      const newProj: Project = {
        id: `proj-${Date.now()}`,
        tenantId: currentTenant.id,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        client: client.trim() || undefined,
        description: description.trim() || undefined,
        startDate,
        dueDate,
        status,
        assignedEmployeeIds,
        createdAt: new Date().toISOString(),
      };
      mockStorage.addTenantItem<Project>(KEYS.PROJECTS, newProj);
      toast.success(`🎉 Project "${name}" created successfully!`);
    }

    setIsModalOpen(false);
    reloadData();
  };

  const handleDeleteProject = (projId: string, projName: string) => {
    if (window.confirm(`Are you sure you want to delete project "${projName}"?`)) {
      mockStorage.deleteTenantItem<Project>(KEYS.PROJECTS, projId);
      toast.success(`Project "${projName}" deleted.`);
      reloadData();
    }
  };

  const getProjectProgress = (projId: string) => {
    const projTasks = tasks.filter((t) => t.projectId === projId);
    if (projTasks.length === 0) return { total: 0, completed: 0, percentage: 0 };
    const completed = projTasks.filter((t) => t.status === 'COMPLETED').length;
    const percentage = Math.round((completed / projTasks.length) * 100);
    return { total: projTasks.length, completed, percentage };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <FolderKanban className="w-4 h-4" />
            <span>Portfolio & Project Management</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Projects</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Organize company deliverables, assign team members, and track project progress.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate(`/${slug}/tasks`)}
            leftIcon={<ListTodo className="w-4 h-4 text-indigo-600" />}
            className="font-semibold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            Tasks Page
          </Button>

          {isTenantAdmin && (
            <Button
              variant="primary"
              size="md"
              onClick={() => handleOpenModal()}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-xs"
            >
               Create Project
            </Button>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects by name, code, or client..."
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs w-44"
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'PLANNING', label: 'Planning' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'ON_HOLD', label: 'On Hold' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="p-12 text-center bg-slate-50/50 border border-slate-200/80 rounded-2xl">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No Projects Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {searchTerm || statusFilter !== 'ALL'
              ? 'No projects match your current filters. Try resetting search criteria.'
              : 'Get started by creating your first project and assigning team members.'}
          </p>
          {isTenantAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenModal()}
              className="mt-4 bg-indigo-600 font-bold"
            >
              + Create Project
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((proj) => {
            const badge = STATUS_BADGES[proj.status] || STATUS_BADGES.IN_PROGRESS;
            const progress = getProjectProgress(proj.id);
            const assignedEmps = employees.filter((e) => (proj.assignedEmployeeIds || []).includes(e.id));

            return (
              <Card
                key={proj.id}
                className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Code & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 font-mono">
                      {proj.code}
                    </span>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1">{proj.name}</h3>
                  {proj.client && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>{proj.client}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                    {proj.description || 'No detailed description provided.'}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                      <span>Tasks Progress</span>
                      <span>
                        {progress.completed}/{progress.total} ({progress.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Info & Team Avatars */}
                <div className="mt-5 pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due {proj.dueDate || 'N/A'}</span>
                    </div>

                    {/* Team Member Avatars */}
                    <div className="flex items-center -space-x-1.5 overflow-hidden">
                      {assignedEmps.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">No assigned team</span>
                      ) : (
                        assignedEmps.slice(0, 4).map((emp) => (
                          <div
                            key={emp.id}
                            className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-700 uppercase"
                            title={emp.name}
                          >
                            {emp.name.charAt(0)}
                          </div>
                        ))
                      )}
                      {assignedEmps.length > 4 && (
                        <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-600">
                          +{assignedEmps.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDetailProject(proj)}
                        leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-600" />}
                        className="text-xs font-semibold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                      >
                        View Details
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/${slug}/tasks?projectId=${proj.id}`)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold p-0"
                      >
                        <span>Tasks ({progress.total})</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>

                    {isTenantAdmin && (
                      <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(proj)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit project"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(proj.id, proj.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL: CREATE / EDIT PROJECT */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? `Edit Project: ${editingProject.name}` : 'Create New Project'}
        description="Configure project details and assign team members."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveProject} className="space-y-4 text-xs pt-1 min-h-[380px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <FormField label="Project Name" required>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mobile App Redesign"
                    required
                  />
                </FormField>
              </div>

              <FormField label="Project Code" required>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MOB-APP"
                  maxLength={10}
                  required
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Client / Department">
                <Input
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="e.g. Marketing Team"
                />
              </FormField>

              <FormField label="Status" required>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  options={[
                    { value: 'PLANNING', label: 'Planning' },
                    { value: 'IN_PROGRESS', label: 'In Progress' },
                    { value: 'COMPLETED', label: 'Completed' },
                    { value: 'ON_HOLD', label: 'On Hold' },
                  ]}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Start Date" required>
                <DatePicker value={startDate} onChange={setStartDate} required />
              </FormField>

              <FormField label="Due Date" required>
                <DatePicker value={dueDate} onChange={setDueDate} minDate={startDate} required />
              </FormField>
            </div>

            {/* Assigned Employees (MultiSelect) */}
            <FormField label="Assigned Team Members" helperText="Select one or more employees assigned to this project">
              <MultiSelect
                value={assignedEmployeeIds}
                onChange={setAssignedEmployeeIds}
                options={employees.map((e) => ({
                  value: e.id,
                  label: `${e.name} (${e.employeeId || 'EMP'})`,
                }))}
                placeholder="Select employees to assign to project..."
              />
            </FormField>

            <FormField label="Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed scope, objectives, or deliverable notes..."
                className="w-full min-h-20 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 mt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-indigo-600 font-bold">
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VIEW PROJECT DETAILS */}
      <Modal
        isOpen={!!selectedDetailProject}
        onClose={() => setSelectedDetailProject(null)}
        title={selectedDetailProject ? `Project Details: ${selectedDetailProject.name}` : 'Project Details'}
        description="Comprehensive view of project parameters, assigned team, task breakdown, and timelines."
        maxWidth="3xl"
      >
        {selectedDetailProject && (() => {
          const proj = selectedDetailProject;
          const badge = STATUS_BADGES[proj.status] || STATUS_BADGES.IN_PROGRESS;
          const progress = getProjectProgress(proj.id);
          const assignedEmps = employees.filter((e) => (proj.assignedEmployeeIds || []).includes(e.id));
          const projTasks = tasks.filter((t) => t.projectId === proj.id);

          return (
            <div className="space-y-5 text-xs pt-1">
              {/* Top Banner: Status & Quick Switcher */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 font-mono">
                    {proj.code}
                  </span>
                  <Badge variant={badge.variant}>
                    Status: {badge.label}
                  </Badge>
                  <span className="px-2 py-0.5 bg-white text-slate-500 text-[11px] font-mono rounded border border-slate-200">
                    ID: {proj.id}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold text-[11px]">Quick Update:</span>
                  <Select
                    value={proj.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as any;
                      mockStorage.updateTenantItem<Project>(KEYS.PROJECTS, proj.id, { status: newStatus });
                      toast.success(`Project status updated to ${newStatus}`);
                      setSelectedDetailProject({ ...proj, status: newStatus });
                      reloadData();
                    }}
                    className="text-xs w-36 font-semibold bg-white"
                    options={[
                      { value: 'PLANNING', label: 'Planning' },
                      { value: 'IN_PROGRESS', label: 'In Progress' },
                      { value: 'COMPLETED', label: 'Completed' },
                      { value: 'ON_HOLD', label: 'On Hold' },
                    ]}
                  />
                </div>
              </div>

              {/* Grid: Client & Timelines */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Client / Department
                  </span>
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Briefcase className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{proj.client || 'Internal / N/A'}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Start Date</span>
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{proj.startDate || 'N/A'}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Target Due Date</span>
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>{proj.dueDate || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar Section */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Overall Deliverables & Task Progress</span>
                  <span className="text-indigo-600">
                    {progress.completed} of {progress.total} Tasks Completed ({progress.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>

              {/* Description Section */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Project Overview & Objectives
                </span>
                <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
                  {proj.description || 'No detailed project description provided.'}
                </p>
              </div>

              {/* Assigned Team Members Section */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Assigned Team Members ({assignedEmps.length})
                  </span>
                </div>

                {assignedEmps.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No employees assigned to this project yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {assignedEmps.map((emp) => (
                      <div
                        key={emp.id}
                        className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80"
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 uppercase shrink-0">
                          {emp.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-slate-900 text-xs block truncate">{emp.name}</span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {emp.employeeId || 'EMP'} • {emp.email}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Project Tasks Breakdown */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ListTodo className="w-4 h-4 text-indigo-600" />
                    Project Tasks Breakdown ({projTasks.length})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedDetailProject(null);
                      navigate(`/${slug}/tasks?projectId=${proj.id}`);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold p-0"
                  >
                    <span>Manage Tasks</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>

                {projTasks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No tasks created for this project yet.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {projTasks.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs"
                      >
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <span className="font-semibold text-slate-900 block truncate">{t.title}</span>
                          <span className="text-[11px] text-slate-500">
                            Assigned to: <strong>{t.assignedEmployeeName || 'Unassigned'}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge size="sm">{t.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {isTenantAdmin && (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDetailProject(null);
                        handleOpenModal(proj);
                      }}
                      leftIcon={<Edit2 className="w-3.5 h-3.5 text-indigo-600" />}
                      className="text-xs font-bold"
                    >
                      Edit Project
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDetailProject(null);
                        handleDeleteProject(proj.id, proj.name);
                      }}
                      leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                      className="text-xs font-bold border-rose-200 text-rose-700 hover:bg-rose-50"
                    >
                      Delete
                    </Button>
                  </div>
                )}

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedDetailProject(null)}
                  className="bg-indigo-600 font-bold ml-auto"
                >
                  Close Details
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};
