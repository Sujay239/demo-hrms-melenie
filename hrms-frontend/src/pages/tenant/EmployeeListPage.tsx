import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { DataTable, Column } from '@/components/ui/DataTable';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { Employee, Department, Designation, Region, Tenant } from '@/demo-data/seedData';
import {
  Search,
  Plus,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  UserCheck,
  Calendar,
  ShieldAlert,
  Edit2,
  Trash2,
  Users,
  Eye,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CreditCard,
  FileText,
  User,
  Heart,
  Award,
  DollarSign,
  Layers,
  Clock,
  Home,
  CheckCircle2,
  Upload,
  ArrowRight,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  SGD: 'S$',
  AED: 'AED',
  AUD: 'A$',
  CAD: 'C$',
};

export const EmployeeListPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const currentUser = mockStorage.getCurrentUser();

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileActiveTab, setProfileActiveTab] = useState<
    'Overview' | 'PersonalInfo' | 'JobDetails' | 'Compensation' | 'Documents' | 'Attendance' | 'Leave'
  >('Overview');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form State - Personal Info (Clean empty values)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Female');
  const [maritalStatus, setMaritalStatus] = useState<'Single' | 'Married' | 'Divorced' | 'Widowed'>('Single');
  const [nationality, setNationality] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Form State - Job Details (Clean empty values)
  const [employeeId, setEmployeeId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [designationId, setDesignationId] = useState('');
  const [regionId, setRegionId] = useState('');
  const [managerId, setManagerId] = useState('');
  const [employmentType, setEmploymentType] = useState<'Full Time' | 'Part Time' | 'Contract' | 'Intern' | 'Probation'>('Full Time');
  const [joiningDate, setJoiningDate] = useState('');
  const [confirmationDate, setConfirmationDate] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [teamName, setTeamName] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState<'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'>('ACTIVE');
  const [skillsInput, setSkillsInput] = useState('');

  // Form State - Compensation & Auto Currency
  const [currency, setCurrency] = useState('INR');
  const [ctcAnnual, setCtcAnnual] = useState('');
  const [basicSalary, setBasicSalary] = useState('');
  const [variablePay, setVariablePay] = useState('');
  const [allowances, setAllowances] = useState('');
  const [paymentMode, setPaymentMode] = useState<'Bank Transfer' | 'Direct Deposit' | 'Check' | 'Cash'>('Bank Transfer');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [ifscRoutingCode, setIfscRoutingCode] = useState('');

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];
  const isAdmin = mockStorage.isTenantAdminFor(currentUser, currentTenant.id);

  const [employees, setEmployees] = useState<Employee[]>(() =>
    mockStorage.getTenantItems<Employee>(KEYS.EMPLOYEES, currentTenant?.id)
  );
  const departments = mockStorage.getTenantItems<Department>(KEYS.DEPARTMENTS, currentTenant?.id);
  const designations = mockStorage.getTenantItems<Designation>(KEYS.DESIGNATIONS, currentTenant?.id);
  const regions = mockStorage.getTenantItems<Region>(KEYS.REGIONS, currentTenant?.id);

  const myEmployee = employees.find(
    (e) =>
      e.email.toLowerCase() === currentUser.email.toLowerCase() ||
      e.id === currentUser.id ||
      (currentUser.name && e.name.toLowerCase() === currentUser.name.toLowerCase())
  );

  const reloadEmployees = () => {
    setEmployees(mockStorage.getTenantItems<Employee>(KEYS.EMPLOYEES, currentTenant?.id));
  };

  const currencySymbol = CURRENCY_SYMBOLS[currency] || '₹';

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setCurrentStep(1);

    // Auto-generate employee code suggestion
    const nextSeq = String(employees.length + 1).padStart(4, '0');
    setEmployeeId(`TN-${nextSeq}`);

    // Clean initial state (No dummy prefilled data)
    setName('');
    setEmail('');
    setPhone('');
    setDateOfBirth('');
    setGender('Female');
    setMaritalStatus('Single');
    setNationality('');
    setEmergencyContactName('');
    setEmergencyContactPhone('');
    setCurrentAddress('');
    setPermanentAddress('');
    setAvatarUrl('');

    setDepartmentId(departments[0]?.id || '');
    setDesignationId(designations[0]?.id || '');
    setRegionId(regions[0]?.id || currentTenant.defaultRegionId || '');
    setManagerId('');
    setEmploymentType('Full Time');
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setConfirmationDate('');
    setWorkLocation('');
    setTeamName('');
    setEmploymentStatus('ACTIVE');
    setSkillsInput('');

    // Auto default to tenant currency
    setCurrency(currentTenant.currency || 'INR');
    setCtcAnnual('');
    setBasicSalary('');
    setVariablePay('');
    setAllowances('');
    setPaymentMode('Bank Transfer');
    setBankName('');
    setBankAccountNumber('');
    setIfscRoutingCode('');

    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setCurrentStep(1);
    setEmployeeId(emp.employeeId);
    setName(emp.name);
    setEmail(emp.email);
    setPhone(emp.phone || '');
    setDateOfBirth(emp.dateOfBirth || '');
    setGender(emp.gender || 'Female');
    setMaritalStatus(emp.maritalStatus || 'Single');
    setNationality(emp.nationality || '');
    setEmergencyContactName(emp.emergencyContactName || '');
    setEmergencyContactPhone(emp.emergencyContactPhone || '');
    setCurrentAddress(emp.currentAddress || '');
    setPermanentAddress(emp.permanentAddress || emp.currentAddress || '');
    setAvatarUrl(emp.avatarUrl || '');

    setDepartmentId(emp.departmentId);
    setDesignationId(emp.designationId);
    setRegionId(emp.regionId);
    setManagerId(emp.managerId || '');
    setEmploymentType(emp.employmentType || 'Full Time');
    setJoiningDate(emp.joiningDate || '');
    setConfirmationDate(emp.confirmationDate || '');
    setWorkLocation(emp.workLocation || '');
    setTeamName(emp.teamName || '');
    setEmploymentStatus(emp.employmentStatus);
    setSkillsInput(emp.skills ? emp.skills.join(', ') : '');

    // Extract numeric values from compensation strings if formatted
    const cleanNumber = (val?: string | number) => {
      if (!val) return '';
      return String(val).replace(/[^0-9.]/g, '');
    };

    setCurrency(currentTenant.currency || 'INR');
    setCtcAnnual(cleanNumber(emp.ctcAnnual));
    setBasicSalary(cleanNumber(emp.basicSalary));
    setVariablePay(cleanNumber(emp.variablePay));
    setAllowances(cleanNumber(emp.allowances));
    setPaymentMode(emp.paymentMode || 'Bank Transfer');
    setBankName(emp.bankName || '');
    setBankAccountNumber(emp.bankAccountNumber || '');
    setIfscRoutingCode(emp.ifscRoutingCode || '');

    setIsAddModalOpen(true);
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Avatar file size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file (PNG, JPG, WEBP)');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        toast.success(`Photo "${file.name}" selected!`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenProfile = (emp: Employee) => {
    setSelectedEmployee(emp);
    setProfileActiveTab('Overview');
    setIsProfileModalOpen(true);
  };

  // Step Validation Helpers
  const validateStep1 = (): boolean => {
    if (!name.trim()) {
      toast.error('Please enter the employee full name.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid work email address.');
      return false;
    }
    if (!phone.trim()) {
      toast.error('Please enter a primary phone number.');
      return false;
    }
    if (!dateOfBirth) {
      toast.error('Please select the date of birth.');
      return false;
    }
    if (!nationality.trim()) {
      toast.error('Please enter the nationality.');
      return false;
    }
    if (!emergencyContactName.trim() || !emergencyContactPhone.trim()) {
      toast.error('Please enter emergency contact name and phone number.');
      return false;
    }
    if (!currentAddress.trim()) {
      toast.error('Please enter the current residential address.');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!employeeId.trim()) {
      toast.error('Please enter a unique Employee ID.');
      return false;
    }
    if (!departmentId) {
      toast.error('Please select a department.');
      return false;
    }
    if (!designationId) {
      toast.error('Please select a designation / job role.');
      return false;
    }
    if (!regionId) {
      toast.error('Please select a work region.');
      return false;
    }
    if (!joiningDate) {
      toast.error('Please select the date of joining.');
      return false;
    }
    if (!workLocation.trim()) {
      toast.error('Please enter the work location (e.g. Bangalore, India).');
      return false;
    }
    if (editingEmployee && managerId === editingEmployee.id) {
      toast.error('Hierarchy Violation: An employee cannot be their own supervisor.');
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    if (!ctcAnnual.trim() || isNaN(Number(ctcAnnual))) {
      toast.error('Please enter a valid annual CTC amount.');
      return false;
    }
    if (!basicSalary.trim() || isNaN(Number(basicSalary))) {
      toast.error('Please enter a valid basic salary amount.');
      return false;
    }
    if (!bankName.trim()) {
      toast.error('Please enter the bank name.');
      return false;
    }
    if (!bankAccountNumber.trim()) {
      toast.error('Please enter the bank account number.');
      return false;
    }
    return true;
  };

  const validateStep4 = (): boolean => {
    if (!teamName.trim()) {
      toast.error('Please enter the assigned team / pod name.');
      return false;
    }
    if (!skillsInput.trim()) {
      toast.error('Please enter at least one technical or domain skill.');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();

    // Verify all steps
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }
    if (!validateStep2()) {
      setCurrentStep(2);
      return;
    }
    if (!validateStep3()) {
      setCurrentStep(3);
      return;
    }
    if (!validateStep4()) {
      setCurrentStep(4);
      return;
    }

    const skillsArray = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Format compensation with chosen currency symbol
    const formatComp = (amt: string) => {
      if (!amt.trim()) return `${currencySymbol}0`;
      const num = Number(amt);
      return isNaN(num) ? `${currencySymbol}${amt}` : `${currencySymbol}${num.toLocaleString()}`;
    };

    const payload: Partial<Employee> = {
      employeeId: employeeId.trim(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      departmentId,
      designationId,
      regionId,
      managerId: managerId || null,
      joiningDate,
      employmentStatus,
      avatarUrl: avatarUrl.trim() || undefined,

      dateOfBirth,
      gender,
      maritalStatus,
      nationality,
      emergencyContactName,
      emergencyContactPhone,
      currentAddress,
      permanentAddress: permanentAddress || currentAddress,

      employmentType,
      confirmationDate: confirmationDate || undefined,
      workLocation,
      teamName,
      skills: skillsArray,

      ctcAnnual: formatComp(ctcAnnual),
      basicSalary: formatComp(basicSalary),
      variablePay: formatComp(variablePay),
      allowances: formatComp(allowances),
      paymentMode,
      bankName,
      bankAccountNumber,
      ifscRoutingCode,
    };

    if (editingEmployee) {
      mockStorage.updateTenantItem<Employee>(KEYS.EMPLOYEES, editingEmployee.id, payload);
      mockStorage.addAuditLog('EMPLOYEE_UPDATED', 'EMPLOYEE', editingEmployee.id);
      toast.success(`Employee profile for ${name} updated successfully!`);
    } else {
      const duplicate = employees.find((e) => e.employeeId.toLowerCase() === employeeId.trim().toLowerCase());
      if (duplicate) {
        toast.error(`Employee ID "${employeeId}" already exists. Please enter a unique ID.`);
        setCurrentStep(2);
        return;
      }

      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        tenantId: currentTenant.id,
        employeeId: payload.employeeId || `TN-${Date.now()}`,
        name: payload.name || '',
        email: payload.email || '',
        phone: payload.phone,
        departmentId: payload.departmentId || '',
        designationId: payload.designationId || '',
        regionId: payload.regionId || '',
        managerId: payload.managerId,
        joiningDate: payload.joiningDate || new Date().toISOString().split('T')[0],
        employmentStatus: payload.employmentStatus || 'ACTIVE',
        avatarUrl: payload.avatarUrl,

        dateOfBirth: payload.dateOfBirth,
        gender: payload.gender,
        maritalStatus: payload.maritalStatus,
        nationality: payload.nationality,
        emergencyContactName: payload.emergencyContactName,
        emergencyContactPhone: payload.emergencyContactPhone,
        currentAddress: payload.currentAddress,
        permanentAddress: payload.permanentAddress,

        employmentType: payload.employmentType,
        confirmationDate: payload.confirmationDate,
        workLocation: payload.workLocation,
        teamName: payload.teamName,
        skills: payload.skills,

        ctcAnnual: payload.ctcAnnual,
        basicSalary: payload.basicSalary,
        variablePay: payload.variablePay,
        allowances: payload.allowances,
        paymentMode,
        bankName,
        bankAccountNumber,
        ifscRoutingCode,
      };

      mockStorage.addTenantItem<Employee>(KEYS.EMPLOYEES, newEmp);
      mockStorage.addAuditLog('EMPLOYEE_CREATED', 'EMPLOYEE', newEmp.id);
      toast.success(`🎉 New employee "${name}" successfully registered!`);
    }

    setIsAddModalOpen(false);
    reloadEmployees();
  };

  const handleDeactivateEmployee = (emp: Employee) => {
    const nextStatus = emp.employmentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    mockStorage.updateTenantItem<Employee>(KEYS.EMPLOYEES, emp.id, {
      employmentStatus: nextStatus,
    });
    mockStorage.addAuditLog('EMPLOYEE_STATUS_CHANGED', 'EMPLOYEE', emp.id);
    toast.success(`Status for ${emp.name} updated to ${nextStatus}`);
    reloadEmployees();
    if (selectedEmployee?.id === emp.id) {
      setSelectedEmployee({ ...emp, employmentStatus: nextStatus });
    }
  };

  // Filtered List
  const filtered = employees.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());

    const matchesDept = departmentFilter === 'ALL' || e.departmentId === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || e.employmentStatus === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const pageSize = 10;
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Selected Employee Relationships
  const managerObj = employees.find((e) => e.id === selectedEmployee?.managerId);
  const deptObj = departments.find((d) => d.id === selectedEmployee?.departmentId);
  const desigObj = designations.find((d) => d.id === selectedEmployee?.designationId);
  const regionObj = regions.find((r) => r.id === selectedEmployee?.regionId);

  // Is viewing self or admin
  const isViewingSelfOrAdmin = isAdmin || selectedEmployee?.id === myEmployee?.id;

  const columns: Column<Employee>[] = [
    {
      key: 'name',
      header: 'Employee',
      render: (e) => (
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => handleOpenProfile(e)}
        >
          <Avatar src={e.avatarUrl} name={e.name} size="sm" />
          <div>
            <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <span>{e.name}</span>
              {e.id === myEmployee?.id && (
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-100">
                  You
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500">{e.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'employeeId',
      header: 'Employee ID',
      render: (e) => (
        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
          {e.employeeId}
        </span>
      ),
    },
    {
      key: 'departmentId',
      header: 'Department',
      render: (e) => {
        const dept = departments.find((d) => d.id === e.departmentId);
        return <span className="text-xs font-semibold text-slate-800">{dept?.name || e.departmentId}</span>;
      },
    },
    {
      key: 'designationId',
      header: 'Designation',
      render: (e) => {
        const desig = designations.find((d) => d.id === e.designationId);
        return <span className="text-xs text-slate-600">{desig?.name || e.designationId}</span>;
      },
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (e) => <span className="text-xs text-slate-600">{e.phone || '+91 98765 43210'}</span>,
    },
    {
      key: 'workLocation',
      header: 'Location / Address',
      render: (e) => {
        const reg = regions.find((r) => r.id === e.regionId);
        return <span className="text-xs text-slate-500">{e.workLocation || e.currentAddress || reg?.name || 'Bangalore, India'}</span>;
      },
    },
    {
      key: 'employmentStatus',
      header: 'Status',
      render: (e) => (
        <Badge
          variant={
            e.employmentStatus === 'ACTIVE'
              ? 'emerald'
              : e.employmentStatus === 'ON_LEAVE'
              ? 'amber'
              : 'neutral'
          }
          size="sm"
        >
          {e.employmentStatus}
        </Badge>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (e) => {
        const canEdit = isAdmin || e.id === myEmployee?.id;
        return (
          <div className="flex items-center gap-1.5 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenProfile(e)}
              className="p-1.5 text-slate-500 hover:text-indigo-600"
              title="View Profile"
            >
              <Eye className="w-4 h-4" />
            </Button>
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenEditModal(e)}
                className="p-1.5 text-slate-500 hover:text-indigo-600"
                title="Edit Employee"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Human Resource Information System</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Directory</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {isAdmin
              ? `Maintain organizational members, detailed profile cards, compensation records, and reporting lines for ${currentTenant.name}.`
              : `Company colleague directory. View team member contacts, office locations, and technical skills.`}
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-xs"
          >
            Add Employee
          </Button>
        )}
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-indigo-600">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Staff</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{employees.length}</h3>
          <p className="text-xs text-slate-400 mt-1">Active enterprise directory</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Employees</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">
            {employees.filter((e) => e.employmentStatus === 'ACTIVE').length}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Full-time on duty</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">On Leave</p>
          <h3 className="text-2xl font-bold text-amber-600 mt-1">
            {employees.filter((e) => e.employmentStatus === 'ON_LEAVE').length}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Approved PTO / Sabbatical</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-600">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Departments</p>
          <h3 className="text-2xl font-bold text-purple-600 mt-1">{departments.length}</h3>
          <p className="text-xs text-slate-400 mt-1">Business functional units</p>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by name, employee ID (e.g. TN-1001), or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Departments ({departments.length})</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Employee Data Table */}
      <DataTable
        columns={columns}
        data={paginated}
        keyExtractor={(e) => e.id}
        pagination={{
          page,
          pageSize,
          total: filtered.length,
          totalPages,
        }}
        onPageChange={setPage}
      />

      {/* ============================================================ */}
      {/* ADD / EDIT EMPLOYEE STEP-BY-STEP GUIDED WIZARD MODAL         */}
      {/* ============================================================ */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="3xl"
        title={editingEmployee ? `Edit Employee (${editingEmployee.name})` : 'New Employee Onboarding'}
        description="Step-by-step registration. Fill out each required step before saving."
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous Step
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>

              {currentStep < 4 ? (
                <Button
                  onClick={handleNextStep}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  {currentStep === 1
                    ? 'Next: Job Details'
                    : currentStep === 2
                    ? 'Next: Compensation'
                    : 'Next: Team & Skills'}
                </Button>
              ) : (
                <Button
                  onClick={handleSaveEmployee}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  {editingEmployee ? 'Save Profile Changes' : 'Create Employee Record'}
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Step Progress Indicators */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { num: 1, title: 'Personal Info', icon: User },
              { num: 2, title: 'Job Details', icon: Briefcase },
              { num: 3, title: 'Compensation', icon: DollarSign },
              { num: 4, title: 'Team & Skills', icon: Award },
            ].map((step) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => {
                    if (step.num < currentStep) setCurrentStep(step.num);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    isCurrent
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-2xs font-bold'
                      : isCompleted
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800 font-semibold cursor-pointer'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isCurrent
                        ? 'bg-indigo-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? '✓' : step.num}
                  </div>
                  <div className="min-w-0 hidden sm:block truncate">
                    <p className="text-[11px] leading-tight truncate">{step.title}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs pt-1">
            {/* STEP 1: PERSONAL INFORMATION */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center gap-2 text-indigo-900 font-semibold">
                  <User className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Step 1 of 4: Enter employee identity and emergency contacts.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Full Name" required>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sarah Mitchell"
                      required
                    />
                  </FormField>

                  <FormField label="Work Email Address" required>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. s.mitchell@company.com"
                      required
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="Date of Birth" required>
                    <Input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                    />
                  </FormField>

                  <FormField label="Gender" required>
                    <Select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      options={[
                        { value: 'Female', label: 'Female' },
                        { value: 'Male', label: 'Male' },
                        { value: 'Other', label: 'Other' },
                        { value: 'Prefer not to say', label: 'Prefer not to say' },
                      ]}
                    />
                  </FormField>

                  <FormField label="Marital Status" required>
                    <Select
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value as any)}
                      options={[
                        { value: 'Single', label: 'Single' },
                        { value: 'Married', label: 'Married' },
                        { value: 'Divorced', label: 'Divorced' },
                        { value: 'Widowed', label: 'Widowed' },
                      ]}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Nationality" required>
                    <Input
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="e.g. Indian"
                      required
                    />
                  </FormField>

                  <FormField label="Primary Contact Phone" required>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 91234 56789"
                      required
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <FormField label="Emergency Contact (Name & Relation)" required helperText="e.g. John Mitchell (Father)">
                    <Input
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      placeholder="John Mitchell (Father)"
                      required
                    />
                  </FormField>

                  <FormField label="Emergency Phone Number" required>
                    <Input
                      type="tel"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      placeholder="+91 91234 56789"
                      required
                    />
                  </FormField>
                </div>

                <FormField label="Current Residential Address" required>
                  <Input
                    value={currentAddress}
                    onChange={(e) => setCurrentAddress(e.target.value)}
                    placeholder="21, 5th Cross, Koramangala, Bangalore - 560034, India"
                    required
                  />
                </FormField>

                <FormField label="Employee Profile Photo / Avatar" helperText="Upload PNG, JPG, or WEBP photo from your computer (Max 5MB)">
                  <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <Avatar
                      src={avatarUrl}
                      name={name || 'New Employee'}
                      size="lg"
                      className="w-16 h-16 ring-2 ring-indigo-500/30 shrink-0"
                    />

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="avatar-file-upload"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 cursor-pointer shadow-2xs transition-all"
                        >
                          <Upload className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{avatarUrl ? 'Change Photo from File' : 'Upload Photo from File'}</span>
                        </label>
                        <input
                          id="avatar-file-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileUpload}
                          className="hidden"
                        />

                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={() => setAvatarUrl('')}
                            className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-semibold transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Select a headshot image from your local device to set the employee avatar.
                      </p>
                    </div>
                  </div>
                </FormField>
              </div>
            )}

            {/* STEP 2: JOB DETAILS */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center gap-2 text-indigo-900 font-semibold">
                  <Briefcase className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Step 2 of 4: Organizational placement, department, and reporting manager.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Employee ID" required helperText="Unique organizational code">
                    <Input
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="e.g. TN-1001"
                      required
                    />
                  </FormField>

                  <FormField label="Employment Type" required>
                    <Select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value as any)}
                      options={[
                        { value: 'Full Time', label: 'Full Time' },
                        { value: 'Part Time', label: 'Part Time' },
                        { value: 'Contract', label: 'Contract' },
                        { value: 'Intern', label: 'Intern' },
                        { value: 'Probation', label: 'Probation' },
                      ]}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="Department" required>
                    <Select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      options={departments.map((d) => ({ value: d.id, label: d.name }))}
                    />
                  </FormField>

                  <FormField label="Designation / Job Role" required>
                    <Select
                      value={designationId}
                      onChange={(e) => setDesignationId(e.target.value)}
                      options={designations.map((d) => ({ value: d.id, label: d.name }))}
                    />
                  </FormField>

                  <FormField label="Work Region / Office" required>
                    <Select
                      value={regionId}
                      onChange={(e) => setRegionId(e.target.value)}
                      options={regions.map((r) => ({ value: r.id, label: `${r.name} (${r.countryCode})` }))}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="Date of Joining" required>
                    <Input
                      type="date"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      required
                    />
                  </FormField>

                  <FormField label="Confirmation Date">
                    <Input
                      type="date"
                      value={confirmationDate}
                      onChange={(e) => setConfirmationDate(e.target.value)}
                    />
                  </FormField>

                  <FormField label="Work Location / City" required>
                    <Input
                      value={workLocation}
                      onChange={(e) => setWorkLocation(e.target.value)}
                      placeholder="e.g. Bangalore, India"
                      required
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Reporting Manager" helperText="Prevents self-supervisor cycles">
                    <Select
                      value={managerId}
                      onChange={(e) => setManagerId(e.target.value)}
                      placeholder="None (Direct / Executive)"
                      options={[
                        { value: '', label: 'None (Direct / Executive)' },
                        ...employees
                          .filter((e) => (editingEmployee ? e.id !== editingEmployee.id : true))
                          .map((e) => ({ value: e.id, label: `${e.name} (${e.employeeId})` })),
                      ]}
                    />
                  </FormField>

                  <FormField label="Employment Status" required>
                    <Select
                      value={employmentStatus}
                      onChange={(e) => setEmploymentStatus(e.target.value as any)}
                      options={[
                        { value: 'ACTIVE', label: 'ACTIVE — Regular Duty' },
                        { value: 'ON_LEAVE', label: 'ON_LEAVE — Sabbatical / Leave' },
                        { value: 'INACTIVE', label: 'INACTIVE — Resigned / Suspended' },
                      ]}
                    />
                  </FormField>
                </div>
              </div>
            )}

            {/* STEP 3: COMPENSATION & AUTOMATIC CURRENCY */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between gap-2 text-indigo-900">
                  <div className="flex items-center gap-2 font-semibold">
                    <DollarSign className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Step 3 of 4: Set salary components and payroll bank details.</span>
                  </div>

                  {/* Auto Currency Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">Currency:</span>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="bg-white border border-indigo-200 text-xs rounded-lg px-2 py-1 font-bold text-indigo-700 shadow-2xs focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="INR">INR (₹) — Rupee</option>
                      <option value="USD">USD ($) — Dollar</option>
                      <option value="EUR">EUR (€) — Euro</option>
                      <option value="GBP">GBP (£) — Pound</option>
                      <option value="SGD">SGD (S$) — Singapore Dollar</option>
                      <option value="AED">AED (د.إ) — Dirham</option>
                      <option value="AUD">AUD (A$) — Australian Dollar</option>
                      <option value="CAD">CAD (C$) — Canadian Dollar</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Annual CTC Package" required helperText={`Enter numeric value (Currency: ${currencySymbol})`}>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-sm font-bold text-indigo-600 pointer-events-none">
                        {currencySymbol}
                      </span>
                      <Input
                        type="number"
                        value={ctcAnnual}
                        onChange={(e) => setCtcAnnual(e.target.value)}
                        placeholder="1800000"
                        className="pl-8"
                        required
                      />
                    </div>
                  </FormField>

                  <FormField label="Basic Salary (Annual)" required helperText={`Enter numeric value (Currency: ${currencySymbol})`}>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-sm font-bold text-indigo-600 pointer-events-none">
                        {currencySymbol}
                      </span>
                      <Input
                        type="number"
                        value={basicSalary}
                        onChange={(e) => setBasicSalary(e.target.value)}
                        placeholder="900000"
                        className="pl-8"
                        required
                      />
                    </div>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Variable Pay / Performance Bonus" helperText={`Optional bonus (Currency: ${currencySymbol})`}>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-sm font-bold text-indigo-600 pointer-events-none">
                        {currencySymbol}
                      </span>
                      <Input
                        type="number"
                        value={variablePay}
                        onChange={(e) => setVariablePay(e.target.value)}
                        placeholder="200000"
                        className="pl-8"
                      />
                    </div>
                  </FormField>

                  <FormField label="Special Allowances" helperText={`HRA, Travel, Medical allowances (Currency: ${currencySymbol})`}>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-sm font-bold text-indigo-600 pointer-events-none">
                        {currencySymbol}
                      </span>
                      <Input
                        type="number"
                        value={allowances}
                        onChange={(e) => setAllowances(e.target.value)}
                        placeholder="700000"
                        className="pl-8"
                      />
                    </div>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                  <FormField label="Payment Mode" required>
                    <Select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as any)}
                      options={[
                        { value: 'Bank Transfer', label: 'Bank Transfer' },
                        { value: 'Direct Deposit', label: 'Direct Deposit' },
                        { value: 'Check', label: 'Check' },
                        { value: 'Cash', label: 'Cash' },
                      ]}
                    />
                  </FormField>

                  <FormField label="Bank Account Number" required>
                    <Input
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="e.g. 50100234567890"
                      required
                    />
                  </FormField>

                  <FormField label="Bank Name & IFSC / Routing" required>
                    <Input
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. HDFC Bank (HDFC0001234)"
                      required
                    />
                  </FormField>
                </div>
              </div>
            )}

            {/* STEP 4: TEAM & SKILLS */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center gap-2 text-indigo-900 font-semibold">
                  <Award className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Step 4 of 4: Finalize team assignment and technical skills list.</span>
                </div>

                <FormField label="Assigned Team / Pod" required helperText="e.g. Backend Team, Core UI Pod, DevOps SRE">
                  <Input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Backend Team"
                    required
                  />
                </FormField>

                <FormField
                  label="Technical & Domain Skills (Comma separated)"
                  required
                  helperText="e.g. JavaScript, React, Node.js, TypeScript, PostgreSQL, AWS"
                >
                  <Input
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="JavaScript, React, Node.js, TypeScript, PostgreSQL, AWS"
                    required
                  />
                </FormField>

                {/* Registration Review Summary */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 mt-4">
                  <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Registration Summary</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
                    <div>
                      <span className="text-slate-400 block">Name</span>
                      <strong className="text-slate-900">{name || '--'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Employee ID</span>
                      <strong className="text-indigo-600">{employeeId || '--'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Annual CTC</span>
                      <strong className="text-emerald-700">{ctcAnnual ? `${currencySymbol}${Number(ctcAnnual).toLocaleString()}` : '--'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Team</span>
                      <strong className="text-slate-900">{teamName || '--'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </Modal>

      {/* ============================================================ */}
      {/* DETAILED EMPLOYEE PROFILE MODAL (ROLE-SENSITIVE)             */}
      {/* ============================================================ */}
      {selectedEmployee && (
        <Modal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          maxWidth={isViewingSelfOrAdmin ? '4xl' : '2xl'}
          title={`${selectedEmployee.name} (${selectedEmployee.employeeId})`}
          description={`${desigObj?.name || 'Senior Software Engineer'} • ${deptObj?.name || 'Engineering'} • ${selectedEmployee.workLocation || selectedEmployee.currentAddress || 'Bangalore, India'}`}
          footer={
            <div className="flex items-center justify-between w-full">
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 font-semibold"
                  onClick={() => handleDeactivateEmployee(selectedEmployee)}
                >
                  {selectedEmployee.employmentStatus === 'ACTIVE' ? 'Deactivate Employee' : 'Activate Employee'}
                </Button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                {(isAdmin || selectedEmployee.id === myEmployee?.id) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsProfileModalOpen(false);
                      handleOpenEditModal(selectedEmployee);
                    }}
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Edit Profile
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsProfileModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6 text-xs">
            {/* PUBLIC DIRECTORY VIEW FOR PEER EMPLOYEES (NO COMPENSATION / SENSITIVE DATA) */}
            {!isViewingSelfOrAdmin ? (
              <div className="space-y-5 animate-in fade-in">
                {/* Privacy Shield Banner */}
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-start gap-2.5 text-indigo-900 text-xs">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-indigo-950">Employee Privacy Protected</p>
                    <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                      Personal emergency contacts, compensation packages, and banking records are restricted to HR Administrators and the employee account owner.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Public Contact Card */}
                  <Card className="p-4 space-y-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-600" />
                      <span>Contact & Work Details</span>
                    </h4>
                    <div className="space-y-2 text-[11px] text-slate-600">
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Full Name</span>
                        <strong className="text-slate-800">{selectedEmployee.name}</strong>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Work Email</span>
                        <a href={`mailto:${selectedEmployee.email}`} className="text-indigo-600 hover:underline font-medium">
                          {selectedEmployee.email}
                        </a>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Direct Phone</span>
                        <span className="text-slate-800 font-medium">{selectedEmployee.phone || '+91 98765 43210'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Department</span>
                        <span className="text-slate-800">{deptObj?.name || 'Engineering'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Designation</span>
                        <span className="text-slate-800">{desigObj?.name || 'Senior Software Engineer'}</span>
                      </div>
                      <div className="pt-1">
                        <span className="text-slate-400 block text-[10px]">Workplace Address</span>
                        <span className="text-slate-700 leading-tight block">
                          {selectedEmployee.workLocation || selectedEmployee.currentAddress || regionObj?.name || 'Bangalore, India'}
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Team & Skills Card */}
                  <div className="space-y-4">
                    <Card className="p-4 space-y-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-indigo-600" />
                        <span>Team Information</span>
                      </h4>
                      <div className="space-y-2 text-[11px]">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                          <span className="text-slate-400">Assigned Team</span>
                          <strong className="text-indigo-600 font-bold">{selectedEmployee.teamName || 'Backend Team'}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Employment Class</span>
                          <span className="text-slate-800 font-medium">{selectedEmployee.employmentType || 'Full Time'}</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 space-y-2.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Award className="w-4 h-4 text-indigo-600" />
                        <span>Skills & Capabilities</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(selectedEmployee.skills || ['JavaScript', 'React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS']).map((sk) => (
                          <span
                            key={sk}
                            className="bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full text-[10px] border border-indigo-100"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            ) : (
              /* FULL ADMIN / SELF PROFILE VIEW WITH ALL 4 CARDS */
              <>
                {/* Top Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
                  {[
                    { key: 'Overview', label: 'Overview', icon: User },
                    { key: 'PersonalInfo', label: 'Personal Info', icon: Heart },
                    { key: 'JobDetails', label: 'Job Details', icon: Briefcase },
                    { key: 'Compensation', label: 'Compensation', icon: DollarSign },
                    { key: 'Documents', label: 'Documents', icon: FileText },
                    { key: 'Attendance', label: 'Attendance', icon: Clock },
                    { key: 'Leave', label: 'Leave', icon: Calendar },
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    const isActive = profileActiveTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setProfileActiveTab(tab.key as any)}
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* TAB CONTENT: OVERVIEW */}
                {profileActiveTab === 'Overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
                    {/* 1. PERSONAL INFORMATION CARD */}
                    <Card className="p-4 space-y-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
                      <h4 className="font-bold text-slate-900 text-sm">Personal Information</h4>
                      <div className="space-y-2 text-[11px] text-slate-600">
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Full Name</span>
                          <strong className="text-slate-800">{selectedEmployee.name}</strong>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Date of Birth</span>
                          <span className="text-slate-800">{selectedEmployee.dateOfBirth || '12 Feb 1994'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Gender</span>
                          <span className="text-slate-800">{selectedEmployee.gender || 'Female'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Marital Status</span>
                          <span className="text-slate-800">{selectedEmployee.maritalStatus || 'Single'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Nationality</span>
                          <span className="text-slate-800">{selectedEmployee.nationality || 'Indian'}</span>
                        </div>
                        <div className="border-b border-slate-100 pb-1">
                          <span className="text-slate-400 block text-[10px]">Emergency Contact</span>
                          <span className="text-slate-800 font-medium block">
                            {selectedEmployee.emergencyContactName || 'John Mitchell (Father)'}
                          </span>
                          <span className="text-slate-500 font-mono text-[10px]">
                            {selectedEmployee.emergencyContactPhone || '+91 91234 56789'}
                          </span>
                        </div>
                        <div className="pt-1">
                          <span className="text-slate-400 block text-[10px]">Current Address</span>
                          <span className="text-slate-700 leading-tight block">
                            {selectedEmployee.currentAddress || '21, 5th Cross, Koramangala, Bangalore - 560034, India'}
                          </span>
                        </div>
                      </div>
                    </Card>

                    {/* 2. JOB INFORMATION CARD */}
                    <Card className="p-4 space-y-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
                      <h4 className="font-bold text-slate-900 text-sm">Job Information</h4>
                      <div className="space-y-2 text-[11px] text-slate-600">
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Department</span>
                          <strong className="text-slate-800">{deptObj?.name || 'Engineering'}</strong>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Designation</span>
                          <span className="text-slate-800">{desigObj?.name || 'Senior Software Engineer'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Employee ID</span>
                          <span className="font-mono font-bold text-indigo-600">{selectedEmployee.employeeId}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Employment Type</span>
                          <span className="text-slate-800">{selectedEmployee.employmentType || 'Full Time'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Date of Joining</span>
                          <span className="text-slate-800">
                            {selectedEmployee.joiningDate ? new Date(selectedEmployee.joiningDate).toLocaleDateString() : '15 Jan 2023'}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Confirmation Date</span>
                          <span className="text-slate-800">
                            {selectedEmployee.confirmationDate ? new Date(selectedEmployee.confirmationDate).toLocaleDateString() : '15 Jul 2023'}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Work Location</span>
                          <span className="text-slate-800">{selectedEmployee.workLocation || regionObj?.name || 'Bangalore, India'}</span>
                        </div>
                        <div className="pt-1 flex justify-between">
                          <span className="text-slate-400">Reporting Manager</span>
                          <strong className="text-slate-800">{managerObj?.name || 'Michael Brown'}</strong>
                        </div>
                      </div>
                    </Card>

                    {/* 3. COMPENSATION INFORMATION CARD */}
                    <Card className="p-4 space-y-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
                      <h4 className="font-bold text-slate-900 text-sm">Compensation Information</h4>
                      <div className="space-y-2 text-[11px] text-slate-600">
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">CTC (Annual)</span>
                          <strong className="text-slate-900 font-bold">{selectedEmployee.ctcAnnual || '₹18,00,000'}</strong>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Basic Salary</span>
                          <span className="text-slate-800">{selectedEmployee.basicSalary || '₹9,00,000'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Variable Pay</span>
                          <span className="text-slate-800">{selectedEmployee.variablePay || '₹2,00,000'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Allowances</span>
                          <span className="text-slate-800">{selectedEmployee.allowances || '₹7,00,000'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Payment Mode</span>
                          <span className="text-slate-800">{selectedEmployee.paymentMode || 'Bank Transfer'}</span>
                        </div>
                        <div className="pt-1">
                          <span className="text-slate-400 block text-[10px]">Bank Account</span>
                          <span className="font-mono text-slate-800 block">{selectedEmployee.bankAccountNumber || 'XXXX XXXX 1234'}</span>
                          <span className="text-[10px] text-slate-400">{selectedEmployee.bankName || 'HDFC Bank'}</span>
                        </div>
                      </div>
                    </Card>

                    {/* 4. TEAM & SKILLS CARDS (STACKED) */}
                    <div className="space-y-4">
                      {/* Team Information */}
                      <Card className="p-4 space-y-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
                        <h4 className="font-bold text-slate-900 text-sm">Team Information</h4>
                        <div className="space-y-2 text-[11px]">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                            <span className="text-slate-400">Team</span>
                            <strong className="text-indigo-600 font-bold">{selectedEmployee.teamName || 'Backend Team'}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] mb-1.5">Team Members</span>
                            <div className="flex items-center -space-x-1.5 overflow-hidden">
                              {employees.slice(0, 4).map((m, idx) => (
                                <Avatar key={m.id || idx} src={m.avatarUrl} name={m.name} size="sm" className="ring-2 ring-white" />
                              ))}
                              {employees.length > 4 && (
                                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 ring-2 ring-white">
                                  +{employees.length - 4}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Skills Information */}
                      <Card className="p-4 space-y-2.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
                        <h4 className="font-bold text-slate-900 text-sm">Skills</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {(selectedEmployee.skills || ['JavaScript', 'React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS']).map((sk) => (
                            <span
                              key={sk}
                              className="bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full text-[10px] border border-indigo-100"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </Card>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: PERSONAL INFO */}
                {profileActiveTab === 'PersonalInfo' && (
                  <Card className="p-5 space-y-4 animate-in fade-in">
                    <h4 className="text-base font-bold text-slate-900">Personal & Emergency Contact Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                        <span className="text-slate-400 text-[10px] font-semibold uppercase">Date of Birth</span>
                        <p className="font-bold text-slate-900">{selectedEmployee.dateOfBirth || '12 Feb 1994'}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                        <span className="text-slate-400 text-[10px] font-semibold uppercase">Gender & Marital Status</span>
                        <p className="font-bold text-slate-900">{selectedEmployee.gender || 'Female'} • {selectedEmployee.maritalStatus || 'Single'}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                        <span className="text-slate-400 text-[10px] font-semibold uppercase">Nationality</span>
                        <p className="font-bold text-slate-900">{selectedEmployee.nationality || 'Indian'}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                        <span className="text-slate-400 text-[10px] font-semibold uppercase">Emergency Contact</span>
                        <p className="font-bold text-slate-900">{selectedEmployee.emergencyContactName || 'John Mitchell (Father)'} ({selectedEmployee.emergencyContactPhone || '+91 91234 56789'})</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* TAB CONTENT: COMPENSATION */}
                {profileActiveTab === 'Compensation' && (
                  <Card className="p-5 space-y-4 animate-in fade-in">
                    <h4 className="text-base font-bold text-slate-900">Annual Compensation & Payroll Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                        <span className="text-indigo-600 text-[10px] font-bold uppercase">Total Annual CTC</span>
                        <p className="text-xl font-extrabold text-indigo-950 mt-1">{selectedEmployee.ctcAnnual || '₹18,00,000'}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 text-[10px] font-semibold uppercase">Basic Salary</span>
                        <p className="text-base font-bold text-slate-900 mt-1">{selectedEmployee.basicSalary || '₹9,00,000'}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 text-[10px] font-semibold uppercase">Variable Pay</span>
                        <p className="text-base font-bold text-slate-900 mt-1">{selectedEmployee.variablePay || '₹2,00,000'}</p>
                      </div>
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
