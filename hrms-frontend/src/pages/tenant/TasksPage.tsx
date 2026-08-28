import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { DatePicker } from '@/components/ui/DatePicker';
import { TaskForm } from '@/components/forms/TaskForm';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { Project, TaskItem, Employee } from '@/demo-data/seedData';
import {
  ListTodo,
  Plus,
  Search,
  Calendar,
  User,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit2,
  Trash2,
  ArrowLeft,
  CheckSquare,
  Eye,
} from 'lucide-react';

const PRIORITY_BADGES: Record<TaskItem['priority'], { label: string; variant: 'neutral' | 'sky' | 'amber' | 'rose' }> = {
  LOW: { label: 'Low', variant: 'neutral' },
  MEDIUM: { label: 'Medium', variant: 'sky' },
  HIGH: { label: 'High', variant: 'amber' },
  URGENT: { label: 'Urgent', variant: 'rose' },
};

const STATUS_BADGES: Record<TaskItem['status'], { label: string; variant: 'amber' | 'sky' | 'emerald' | 'rose' }> = {
  PENDING: { label: 'Pending', variant: 'amber' },
  IN_PROGRESS: { label: 'In Progress', variant: 'sky' },
  COMPLETED: { label: 'Completed', variant: 'emerald' },
  BLOCKED: { label: 'Blocked', variant: 'rose' },
};

export const TasksPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlProjectId = searchParams.get('projectId');

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];
  const currentUser = mockStorage.getCurrentUser();
  const isTenantAdmin = mockStorage.isTenantAdminFor(currentUser, currentTenant.id);

  // State
  const [tasks, setTasks] = useState<TaskItem[]>(() =>
    mockStorage.getTenantItems<TaskItem>(KEYS.TASKS, currentTenant?.id)
  );
  const [projects, setProjects] = useState<Project[]>(() =>
    mockStorage.getTenantItems<Project>(KEYS.PROJECTS, currentTenant?.id)
  );
  const [employees, setEmployees] = useState<Employee[]>(() =>
    mockStorage.getTenantItems<Employee>(KEYS.EMPLOYEES, currentTenant?.id)
  );

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>(urlProjectId || 'ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [selectedDetailTask, setSelectedDetailTask] = useState<TaskItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<string>('');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState<string>('');
  const [priority, setPriority] = useState<TaskItem['priority']>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskItem['status']>('PENDING');

  const reloadData = () => {
    setTasks(mockStorage.getTenantItems<TaskItem>(KEYS.TASKS, currentTenant?.id));
    setProjects(mockStorage.getTenantItems<Project>(KEYS.PROJECTS, currentTenant?.id));
    setEmployees(mockStorage.getTenantItems<Employee>(KEYS.EMPLOYEES, currentTenant?.id));
  };

  // Sync projectFilter when URL query param changes
  useEffect(() => {
    if (urlProjectId) {
      setProjectFilter(urlProjectId);
    }
  }, [urlProjectId]);

  // CONDITIONAL ASSIGNEE FILTERING:
  // "IF PROJECT SELECTED THEN SEELCT EMPLOYEE FILED ONLY SHOW THE EMP THAT ARE ASSIGNED TO THAT PROJECT OTHERWSIE SHOW ALL"
  const availableAssignees = useMemo(() => {
    if (!projectId) {
      return employees; // Show all employees if no project selected
    }
    const selectedProj = projects.find((p) => p.id === projectId);
    if (!selectedProj || !selectedProj.assignedEmployeeIds || selectedProj.assignedEmployeeIds.length === 0) {
      return employees; // Fallback to all if project has no assigned employees
    }
    const assignedSet = new Set(selectedProj.assignedEmployeeIds);
    const filtered = employees.filter((e) => assignedSet.has(e.id));
    return filtered.length > 0 ? filtered : employees;
  }, [projectId, projects, employees]);

  // Reset or clear assignee if current assignee is not in availableAssignees when project changes
  const handleProjectChangeInForm = (newProjId: string) => {
    setProjectId(newProjId);
    if (newProjId) {
      const selectedProj = projects.find((p) => p.id === newProjId);
      if (selectedProj && selectedProj.assignedEmployeeIds && selectedProj.assignedEmployeeIds.length > 0) {
        if (!selectedProj.assignedEmployeeIds.includes(assignedEmployeeId)) {
          // Default to first assigned employee of that project
          setAssignedEmployeeId(selectedProj.assignedEmployeeIds[0] || '');
        }
      }
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.assignedEmployeeName && t.assignedEmployeeName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchProject = projectFilter === 'ALL' || t.projectId === projectFilter;
      const matchPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
      return matchSearch && matchStatus && matchProject && matchPriority;
    });
  }, [tasks, searchTerm, statusFilter, projectFilter, priorityFilter]);

  const handleOpenModal = (task?: TaskItem) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setDescription(task.description || '');
      setProjectId(task.projectId || '');
      setAssignedEmployeeId(task.assignedEmployeeId || '');
      setPriority(task.priority);
      setDueDate(task.dueDate || '');
      setStatus(task.status);
    } else {
      setEditingTask(null);
      setTitle('');
      setDescription('');
      const defaultProj = projectFilter !== 'ALL' ? projectFilter : '';
      setProjectId(defaultProj);
      setAssignedEmployeeId('');
      setPriority('MEDIUM');
      setDueDate('');
      setStatus('PENDING'); // Default status: PENDING
    }
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Task Name / Title is required');
      return;
    }

    const selectedProj = projects.find((p) => p.id === projectId);
    const selectedEmp = employees.find((e) => e.id === assignedEmployeeId);

    if (editingTask) {
      mockStorage.updateTenantItem<TaskItem>(KEYS.TASKS, editingTask.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        projectId: projectId || undefined,
        projectName: selectedProj ? selectedProj.name : undefined,
        assignedEmployeeId: assignedEmployeeId || undefined,
        assignedEmployeeName: selectedEmp ? selectedEmp.name : undefined,
        priority,
        dueDate,
        status,
      });
      toast.success(`Task "${title}" updated!`);
    } else {
      const newTask: TaskItem = {
        id: `task-${Date.now()}`,
        tenantId: currentTenant.id,
        title: title.trim(),
        description: description.trim() || undefined,
        projectId: projectId || undefined,
        projectName: selectedProj ? selectedProj.name : undefined,
        assignedEmployeeId: assignedEmployeeId || undefined,
        assignedEmployeeName: selectedEmp ? selectedEmp.name : undefined,
        priority,
        dueDate,
        status: status || 'PENDING', // Default to PENDING
        createdAt: new Date().toISOString(),
      };
      mockStorage.addTenantItem<TaskItem>(KEYS.TASKS, newTask);
      toast.success(`🎉 Task "${title}" created successfully!`);
    }

    setIsModalOpen(false);
    reloadData();
  };

  const handleStatusChange = (taskId: string, newStatus: TaskItem['status']) => {
    mockStorage.updateTenantItem<TaskItem>(KEYS.TASKS, taskId, { status: newStatus });
    toast.success(`Task status updated to ${newStatus}`);
    reloadData();
  };

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    if (window.confirm(`Are you sure you want to delete task "${taskTitle}"?`)) {
      mockStorage.deleteTenantItem<TaskItem>(KEYS.TASKS, taskId);
      toast.success(`Task "${taskTitle}" deleted.`);
      reloadData();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Task Tracker & Execution</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Tasks</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Create, assign, prioritize, and track completion of team tasks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate(`/${slug}/projects`)}
            leftIcon={<FolderKanban className="w-4 h-4 text-indigo-600" />}
            className="font-semibold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            Projects Page
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => handleOpenModal()}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-xs"
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks or assignee..."
              className="pl-9 text-xs"
            />
          </div>

          <Select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="text-xs"
            options={[
              { value: 'ALL', label: 'All Projects (including Standalone)' },
              ...projects.map((p) => ({ value: p.id, label: `📁 ${p.name}` })),
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs"
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'BLOCKED', label: 'Blocked' },
            ]}
          />

          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs"
            options={[
              { value: 'ALL', label: 'All Priorities' },
              { value: 'LOW', label: 'Low Priority' },
              { value: 'MEDIUM', label: 'Medium Priority' },
              { value: 'HIGH', label: 'High Priority' },
              { value: 'URGENT', label: 'Urgent' },
            ]}
          />
        </div>
      </Card>

      {/* Tasks Table / Cards */}
      {filteredTasks.length === 0 ? (
        <Card className="p-12 text-center bg-slate-50/50 border border-slate-200/80 rounded-2xl">
          <ListTodo className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No Tasks Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {searchTerm || statusFilter !== 'ALL' || projectFilter !== 'ALL' || priorityFilter !== 'ALL'
              ? 'No tasks match your current filter criteria. Try resetting search filters.'
              : 'Create a new task to assign work items to team members.'}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenModal()}
            className="mt-4 bg-indigo-600 font-bold"
          >
            + Create Task
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((t) => {
            const pBadge = PRIORITY_BADGES[t.priority] || PRIORITY_BADGES.MEDIUM;
            const sBadge = STATUS_BADGES[t.status] || STATUS_BADGES.PENDING;

            return (
              <Card
                key={t.id}
                className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={sBadge.variant}>{sBadge.label}</Badge>
                    <Badge variant={pBadge.variant}>Priority: {pBadge.label}</Badge>
                    {t.projectName ? (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-md border border-indigo-100 flex items-center gap-1">
                        <FolderKanban className="w-3 h-3" />
                        <span>{t.projectName}</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[11px] font-semibold rounded-md border border-slate-200">
                        Standalone Task
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{t.title}</h4>
                  {t.description && (
                    <p className="text-xs text-slate-600 line-clamp-1 leading-relaxed">{t.description}</p>
                  )}
                </div>

                {/* Right Metadata & Status Select */}
                <div className="flex flex-wrap items-center gap-4 shrink-0 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                  {/* Assignee */}
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 uppercase shrink-0">
                      {t.assignedEmployeeName ? t.assignedEmployeeName.charAt(0) : '?'}
                    </div>
                    <span className="font-semibold">{t.assignedEmployeeName || 'Unassigned'}</span>
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center gap-1 text-xs text-slate-500 min-w-28">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.dueDate || 'No due date'}</span>
                  </div>

                  {/* Quick Status Select */}
                  <Select
                    value={t.status}
                    onChange={(e) => handleStatusChange(t.id, e.target.value as any)}
                    className="text-xs w-32 font-semibold"
                    options={[
                      { value: 'PENDING', label: 'Pending' },
                      { value: 'IN_PROGRESS', label: 'In Progress' },
                      { value: 'COMPLETED', label: 'Completed' },
                      { value: 'BLOCKED', label: 'Blocked' },
                    ]}
                  />

                  {/* Edit / Delete / View Details */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDetailTask(t)}
                      leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-600" />}
                      className="text-xs font-semibold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    >
                      View Details
                    </Button>

                    <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(t)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(t.id, t.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL: CREATE / EDIT TASK */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? `Edit Task: ${editingTask.title}` : 'Create New Task'}
        description="Configure task assignment, optional project link, priority, and due dates."
        maxWidth="2xl"
      >
        <TaskForm
          initialValues={editingTask || undefined}
          tenantId={currentTenant.id}
          onSubmit={(formData) => {
            if (editingTask) {
              mockStorage.updateTenantItem<TaskItem>(KEYS.TASKS, editingTask.id, formData);
              toast.success(`Task "${formData.title}" updated successfully!`);
            } else {
              const newTask: TaskItem = {
                id: `task-${Date.now()}`,
                tenantId: currentTenant.id,
                ...formData,
                createdAt: new Date().toISOString(),
              };
              mockStorage.addTenantItem<TaskItem>(KEYS.TASKS, newTask);
              toast.success(`🎉 Task "${formData.title}" created successfully!`);
            }
            setIsModalOpen(false);
            reloadData();
          }}
          onCancel={() => setIsModalOpen(false)}
          submitLabel={editingTask ? 'Save Task Changes' : 'Create Task'}
        />
      </Modal>

      {/* MODAL: VIEW TASK DETAILS */}
      <Modal
        isOpen={!!selectedDetailTask}
        onClose={() => setSelectedDetailTask(null)}
        title={selectedDetailTask ? `Task Details: ${selectedDetailTask.title}` : 'Task Details'}
        description="Full specifications, assignee, timeline, and project status for this task."
        maxWidth="2xl"
      >
        {selectedDetailTask && (
          <div className="space-y-5 text-xs pt-1">
            {/* Top Banner: Status & Priority */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={STATUS_BADGES[selectedDetailTask.status]?.variant || 'amber'}>
                  Status: {STATUS_BADGES[selectedDetailTask.status]?.label || selectedDetailTask.status}
                </Badge>
                <Badge variant={PRIORITY_BADGES[selectedDetailTask.priority]?.variant || 'sky'}>
                  Priority: {PRIORITY_BADGES[selectedDetailTask.priority]?.label || selectedDetailTask.priority}
                </Badge>
                <span className="px-2.5 py-0.5 bg-white text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 font-mono">
                  {selectedDetailTask.id}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold text-[11px]">Quick Update:</span>
                <Select
                  value={selectedDetailTask.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as any;
                    handleStatusChange(selectedDetailTask.id, newStatus);
                    setSelectedDetailTask({ ...selectedDetailTask, status: newStatus });
                  }}
                  className="text-xs w-32 font-semibold bg-white"
                  options={[
                    { value: 'PENDING', label: 'Pending' },
                    { value: 'IN_PROGRESS', label: 'In Progress' },
                    { value: 'COMPLETED', label: 'Completed' },
                    { value: 'BLOCKED', label: 'Blocked' },
                  ]}
                />
              </div>
            </div>

            {/* Grid: Project & Assignee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Project Link */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Associated Project
                </span>
                {selectedDetailTask.projectName ? (
                  <div className="flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-bold text-slate-900 text-sm">{selectedDetailTask.projectName}</span>
                  </div>
                ) : (
                  <span className="text-slate-500 font-medium italic">Standalone Task (No Project Link)</span>
                )}
              </div>

              {/* Assignee Details */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Assigned Employee
                </span>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 uppercase shrink-0">
                    {selectedDetailTask.assignedEmployeeName ? selectedDetailTask.assignedEmployeeName.charAt(0) : '?'}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      {selectedDetailTask.assignedEmployeeName || 'Unassigned'}
                    </span>
                    {selectedDetailTask.assignedEmployeeId && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        ID: {selectedDetailTask.assignedEmployeeId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Grid: Due Date & Creation Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Due Date</span>
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{selectedDetailTask.dueDate || 'No due date specified'}</span>
                </div>
              </div>

              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Created At</span>
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>
                    {selectedDetailTask.createdAt
                      ? new Date(selectedDetailTask.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Task Description & Acceptance Criteria
              </span>
              <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
                {selectedDetailTask.description || 'No detailed description provided for this task.'}
              </p>
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
                      const t = selectedDetailTask;
                      setSelectedDetailTask(null);
                      handleOpenModal(t);
                    }}
                    leftIcon={<Edit2 className="w-3.5 h-3.5 text-indigo-600" />}
                    className="text-xs font-bold"
                  >
                    Edit Task
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const t = selectedDetailTask;
                      setSelectedDetailTask(null);
                      handleDeleteTask(t.id, t.title);
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
                onClick={() => setSelectedDetailTask(null)}
                className="bg-indigo-600 font-bold ml-auto"
              >
                Close Details
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
