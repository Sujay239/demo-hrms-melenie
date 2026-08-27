import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { DataTable, Column } from '@/components/ui/DataTable';
import { mockStorage, KEYS } from '@/services/mock-storage';
import {
  Employee,
  Department,
  Designation,
  Region,
  Tenant,
  User as UserType,
  OnboardingCase,
  OnboardingDocRequirement,
  AllowedDocumentType,
  DEFAULT_ONBOARDING_DOCUMENTS,
} from '@/demo-data/seedData';
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
  Download,
  ArrowRight,
  ShieldCheck,
  Lock,
  GitGraph,
  ListFilter,
  Globe,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { OrgChartView } from '@/components/tenant/OrgChartView';
import countryData from '@/data/country_and_codes.json';
import languagesData from '@/data/languages.json';
import { useFormDraft } from '@/hooks/useFormDraft';
import { MultiSelect } from '@/components/ui/MultiSelect';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  SGD: 'S$',
  AED: 'AED',
  INR: '₹',
};

export const EmployeeListPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeDirectoryTab, setActiveDirectoryTab] = useState<'LIST' | 'ORG_CHART'>('LIST');
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const currentUser = mockStorage.getCurrentUser();

  // Modals & Draft State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileActiveTab, setProfileActiveTab] = useState<'Overview' | 'Documents'>('Overview');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form State - Personal Info (Clean empty values, no defaults)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say' | ''>('');
  const [maritalStatus, setMaritalStatus] = useState<'Single' | 'Married' | 'Divorced' | 'Widowed' | ''>('');
  const [nationality, setNationality] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Inline Modals for Department & Designation add
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [newDeptParentId, setNewDeptParentId] = useState('');

  const [isAddDesigModalOpen, setIsAddDesigModalOpen] = useState(false);
  const [newDesigName, setNewDesigName] = useState('');
  const [newDesigDesc, setNewDesigDesc] = useState('');
  const [newDesigDeptId, setNewDesigDeptId] = useState('');

  const [isAddRegionModalOpen, setIsAddRegionModalOpen] = useState(false);
  const [newRegionName, setNewRegionName] = useState('');
  const [newRegionCountryCode, setNewRegionCountryCode] = useState('US');
  const [newRegionTimeZone, setNewRegionTimeZone] = useState('UTC');

  const [customTeams, setCustomTeams] = useState<string[]>([
    'Backend Team',
    'Frontend Engineering',
    'Core UI Pod',
    'DevOps & SRE',
    'Product Management',
    'Quality Assurance',
    'Security & Compliance',
    'Data Science & Analytics',
    'Executive Leadership',
    'Sales & Customer Success',
  ]);
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [newCustomTeamName, setNewCustomTeamName] = useState('');

  // Form State - Job Details (Clean empty values, no defaults)
  const [employeeId, setEmployeeId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [designationId, setDesignationId] = useState('');
  const [regionId, setRegionId] = useState('');
  const [managerId, setManagerId] = useState('');
  const [employmentType, setEmploymentType] = useState<'Full Time' | 'Part Time' | 'Contract' | 'Intern' | 'Probation' | ''>('');
  const [joiningDate, setJoiningDate] = useState('');
  const [confirmationDate, setConfirmationDate] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [teamName, setTeamName] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState<'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'>('ACTIVE');
  const [isPermanent, setIsPermanent] = useState<boolean>(false);
  const [skillsInput, setSkillsInput] = useState('');

  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];
  const isAdmin = mockStorage.isTenantAdminFor(currentUser, currentTenant?.id);

  // Dynamic Onboarding Document Requirements state
  const [docRequirements, setDocRequirements] = useState<OnboardingDocRequirement[]>(() =>
    mockStorage.getOnboardingDocRequirements(currentTenant?.id)
  );

  const handleAddDocRequirement = () => {
    const newReq: OnboardingDocRequirement = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: '',
      description: '',
      allowedType: 'PDF',
      isRequired: true,
    };
    setDocRequirements((prev) => [...prev, newReq]);
  };

  const handleRemoveDocRequirement = (id: string) => {
    setDocRequirements((prev) => prev.filter((d) => d.id !== id));
  };

  const handleUpdateDocRequirement = (id: string, updates: Partial<OnboardingDocRequirement>) => {
    setDocRequirements((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  const handleSaveAsDefaultTemplate = () => {
    const validDocs = docRequirements.filter((d) => d.title.trim().length > 0);
    if (validDocs.length === 0) {
      toast.error('Please add at least one document requirement with a title.');
      return;
    }
    mockStorage.saveOnboardingDocRequirements(currentTenant.id, validDocs);
    toast.success('💾 Saved as company onboarding document template! Future new hires will automatically use this checklist.');
  };

  const handleResetToDefaultTemplate = () => {
    const defaults = mockStorage.getOnboardingDocRequirements(currentTenant.id);
    setDocRequirements(defaults);
    toast.success('Loaded saved company document requirements template.');
  };

  // Form State - Compensation & Auto Currency
  const [currency, setCurrency] = useState(currentTenant?.currency || 'USD');
  const [ctcAnnual, setCtcAnnual] = useState('');
  const [basicSalary, setBasicSalary] = useState('');
  const [variablePay, setVariablePay] = useState('');
  const [allowances, setAllowances] = useState('');
  const [paymentMode, setPaymentMode] = useState<'Bank Transfer' | 'Direct Deposit' | 'Check' | 'Cash'>('Direct Deposit');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [ifscRoutingCode, setIfscRoutingCode] = useState('');

  const [employees, setEmployees] = useState<Employee[]>(() =>
    mockStorage.getTenantItems<Employee>(KEYS.EMPLOYEES, currentTenant?.id)
  );
  const [departments, setDepartments] = useState<Department[]>(() =>
    mockStorage.getTenantItems<Department>(KEYS.DEPARTMENTS, currentTenant?.id)
  );
  const [designations, setDesignations] = useState<Designation[]>(() =>
    mockStorage.getTenantItems<Designation>(KEYS.DESIGNATIONS, currentTenant?.id)
  );
  const [regionsList, setRegionsList] = useState<Region[]>(() =>
    mockStorage.getTenantItems<Region>(KEYS.REGIONS, currentTenant?.id)
  );

  const availableTeams = Array.from(
    new Set([
      ...customTeams,
      ...employees.map((e) => e.teamName).filter(Boolean) as string[],
    ])
  ).sort();

  const myEmployee = employees.find(
    (e) =>
      e.email.toLowerCase() === currentUser.email.toLowerCase() ||
      e.id === currentUser.id ||
      (currentUser.name && e.name.toLowerCase() === currentUser.name.toLowerCase())
  );

  const reloadEmployees = () => {
    setEmployees(mockStorage.getTenantItems<Employee>(KEYS.EMPLOYEES, currentTenant?.id));
  };

  const tenantCurrency = currentTenant?.currency || 'USD';
  const currencySymbol = CURRENCY_SYMBOLS[currency || tenantCurrency] || CURRENCY_SYMBOLS[tenantCurrency] || '$';

  const formatSalary = (val?: number | string | null) => {
    if (val === undefined || val === null || val === '') return '--';
    const cleanStr = String(val).replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanStr);
    if (isNaN(num)) return String(val);
    return `${currencySymbol}${num.toLocaleString('en-US')}`;
  };

  const handleCountrySelectChange = (cName: string) => {
    const found = countryData.find((c) => c.country === cName);
    if (found) {
      setSelectedCountry(found.country);
      setPhoneCountryCode(found.code);
      if (!nationality) {
        setNationality(found.country);
      }
      const updatedPhone = phoneDigits ? `+${found.code} ${phoneDigits}` : `+${found.code}`;
      setPhone(updatedPhone);
    }
  };

  const handlePhoneDigitsChange = (val: string) => {
    const cleanDigits = val.replace(/[^0-9]/g, '');
    setPhoneDigits(cleanDigits);
    setPhone(cleanDigits ? `+${phoneCountryCode} ${cleanDigits}` : '');
  };

  const handleCreateDepartmentInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) {
      toast.error('Department name is required');
      return;
    }
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      tenantId: currentTenant.id,
      name: newDeptName.trim(),
      description: newDeptDesc.trim() || undefined,
      parentDepartmentId: newDeptParentId || null,
      status: 'ACTIVE',
    };
    mockStorage.addTenantItem<Department>(KEYS.DEPARTMENTS, newDept);

    const updatedDepts = mockStorage.getTenantItems<Department>(KEYS.DEPARTMENTS, currentTenant.id);
    setDepartments(updatedDepts);
    setDepartmentId(newDept.id);

    toast.success(`Department "${newDept.name}" created and selected!`);
    setIsAddDeptModalOpen(false);
    setNewDeptName('');
    setNewDeptDesc('');
    setNewDeptParentId('');
  };

  const handleCreateDesignationInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesigName.trim()) {
      toast.error('Designation title is required');
      return;
    }
    const newDesig: Designation = {
      id: `desig-${Date.now()}`,
      tenantId: currentTenant.id,
      name: newDesigName.trim(),
      description: newDesigDesc.trim() || undefined,
      departmentId: newDesigDeptId || departmentId || null,
      status: 'ACTIVE',
    };
    mockStorage.addTenantItem<Designation>(KEYS.DESIGNATIONS, newDesig);

    const updatedDesigs = mockStorage.getTenantItems<Designation>(KEYS.DESIGNATIONS, currentTenant.id);
    setDesignations(updatedDesigs);
    setDesignationId(newDesig.id);

    toast.success(`Designation "${newDesig.name}" created and selected!`);
    setIsAddDesigModalOpen(false);
    setNewDesigName('');
    setNewDesigDesc('');
    setNewDesigDeptId('');
  };

  const handleCreateRegionInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegionName.trim()) {
      toast.error('Region name is required');
      return;
    }
    const newRegion: Region = {
      id: `region-${Date.now()}`,
      tenantId: currentTenant.id,
      name: newRegionName.trim(),
      countryCode: newRegionCountryCode.trim() || 'US',
      timeZone: newRegionTimeZone.trim() || 'UTC',
      locale: 'en-US',
      status: 'ACTIVE',
    };
    mockStorage.addTenantItem<Region>(KEYS.REGIONS, newRegion);

    const updatedRegions = mockStorage.getTenantItems<Region>(KEYS.REGIONS, currentTenant.id);
    setRegionsList(updatedRegions);
    setRegionId(newRegion.id);

    toast.success(`Region "${newRegion.name}" created and selected!`);
    setIsAddRegionModalOpen(false);
    setNewRegionName('');
    setNewRegionCountryCode('US');
    setNewRegionTimeZone('UTC');
  };

  const handleCreateTeamInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomTeamName.trim()) {
      toast.error('Team name is required');
      return;
    }
    const nameToSave = newCustomTeamName.trim();
    if (!customTeams.includes(nameToSave)) {
      setCustomTeams((prev) => [...prev, nameToSave]);
    }
    setTeamName(nameToSave);
    toast.success(`Team "${nameToSave}" created and selected!`);
    setIsAddTeamModalOpen(false);
    setNewCustomTeamName('');
  };

  const addEmployeeDraftData = {
    currentStep,
    employeeId,
    name,
    email,
    selectedCountry,
    phoneCountryCode,
    phoneDigits,
    phone,
    dateOfBirth,
    gender,
    maritalStatus,
    nationality,
    emergencyContactName,
    emergencyContactPhone,
    currentAddress,
    permanentAddress,
    avatarUrl,
    departmentId,
    designationId,
    regionId,
    managerId,
    employmentType,
    joiningDate,
    confirmationDate,
    workLocation,
    teamName,
    employmentStatus,
    isPermanent,
    skillsInput,
    selectedLanguages,
    currency,
    ctcAnnual,
    basicSalary,
    variablePay,
    allowances,
    paymentMode,
    bankName,
    bankAccountNumber,
    ifscRoutingCode,
  };

  const { clearDraft: clearAddEmployeeDraft } = useFormDraft({
    draftKey: 'add_employee',
    data: addEmployeeDraftData,
    enabled: isAddModalOpen && !editingEmployee,
  });

  const handleClearAddEmployeeDraft = () => {
    clearAddEmployeeDraft();
    setHasRestoredDraft(false);

    setSelectedCountry('');
    setPhoneCountryCode('');
    setPhoneDigits('');
    setPhone('');
    setName('');
    setEmail('');
    setDateOfBirth('');
    setGender('' as any);
    setMaritalStatus('' as any);
    setNationality('');
    setSelectedLanguages([]);
    setEmergencyContactName('');
    setEmergencyContactPhone('');
    setCurrentAddress('');
    setPermanentAddress('');
    setAvatarUrl('');
    setDepartmentId('');
    setDesignationId('');
    setRegionId('');
    setManagerId('');
    setEmploymentType('' as any);
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setConfirmationDate('');
    setWorkLocation('');
    setTeamName('');
    setEmploymentStatus('INACTIVE');
    setIsPermanent(false);
    setSkillsInput('');
    setCurrency(currentTenant?.currency || 'INR');
    setCtcAnnual('');
    setBasicSalary('');
    setVariablePay('');
    setAllowances('');
    setPaymentMode('Bank Transfer');
    setBankName('');
    setBankAccountNumber('');
    setIfscRoutingCode('');
    setCurrentStep(1);

    toast.success('Form draft cleared.');
  };

  const handleOpenAddModal = () => {
    setEditingEmployee(null);

    const savedDraft = mockStorage.getFormDraft<any>('add_employee');
    if (savedDraft?.data && (savedDraft.data.name || savedDraft.data.email || savedDraft.data.phoneDigits || savedDraft.data.currentStep > 1)) {
      const d = savedDraft.data;
      setEmployeeId(d.employeeId || `TN-${String(employees.length + 1).padStart(4, '0')}`);
      setName(d.name || '');
      setEmail(d.email || '');
      setSelectedCountry(d.selectedCountry || 'United States');
      setPhoneCountryCode(d.phoneCountryCode || '1');
      setPhoneDigits(d.phoneDigits || '');
      setPhone(d.phone || '');
      setDateOfBirth(d.dateOfBirth || '');
      setGender(d.gender || 'Female');
      setMaritalStatus(d.maritalStatus || 'Single');
      setNationality(d.nationality || d.selectedCountry || '');
      setEmergencyContactName(d.emergencyContactName || '');
      setEmergencyContactPhone(d.emergencyContactPhone || '');
      setCurrentAddress(d.currentAddress || '');
      setPermanentAddress(d.permanentAddress || '');
      setAvatarUrl(d.avatarUrl || '');

      setDepartmentId(d.departmentId || departments[0]?.id || '');
      setDesignationId(d.designationId || designations[0]?.id || '');
      setRegionId(d.regionId || regionsList[0]?.id || '');
      setManagerId(d.managerId || '');
      setEmploymentType(d.employmentType || 'Full Time');
      setJoiningDate(d.joiningDate || new Date().toISOString().split('T')[0]);
      setConfirmationDate(d.confirmationDate || '');
      setWorkLocation(d.workLocation || '');
      setTeamName(d.teamName || '');
      setEmploymentStatus(d.employmentStatus || 'INACTIVE');
      setIsPermanent(d.isPermanent ?? false);
      setSkillsInput(d.skillsInput || '');
      setSelectedLanguages(d.selectedLanguages || (d.languagesInput ? d.languagesInput.split(',').map((s: string) => s.trim()) : []));

      setCurrency(d.currency || currentTenant?.currency || 'INR');
      setCtcAnnual(d.ctcAnnual || '');
      setBasicSalary(d.basicSalary || '');
      setVariablePay(d.variablePay || '');
      setAllowances(d.allowances || '');
      setPaymentMode(d.paymentMode || 'Bank Transfer');
      setBankName(d.bankName || '');
      setBankAccountNumber(d.bankAccountNumber || '');
      setIfscRoutingCode(d.ifscRoutingCode || '');

      setCurrentStep(d.currentStep || 1);
      setHasRestoredDraft(true);
      toast.info('⚡ Restored unsaved employee draft! Resume your work or click "Clear Draft".');
    } else {
      setHasRestoredDraft(false);
      setCurrentStep(1);

      // Auto-generate employee code suggestion
      const nextSeq = String(employees.length + 1).padStart(4, '0');
      setEmployeeId(`TN-${nextSeq}`);

      // Clean initial state (No pre-selected default values)
      setSelectedCountry('');
      setPhoneCountryCode('');
      setPhoneDigits('');
      setName('');
      setEmail('');
      setPhone('');
      setDateOfBirth('');
      setGender('' as any);
      setMaritalStatus('' as any);
      setNationality('');
      setSelectedLanguages([]);
      setEmergencyContactName('');
      setEmergencyContactPhone('');
      setCurrentAddress('');
      setPermanentAddress('');
      setAvatarUrl('');

      setDepartmentId('');
      setDesignationId('');
      setRegionId('');
      setManagerId('');
      setEmploymentType('' as any);
      setJoiningDate(new Date().toISOString().split('T')[0]);
      setConfirmationDate('');
      setWorkLocation('');
      setTeamName('');
      setEmploymentStatus('INACTIVE');
      setIsPermanent(false);
      setSkillsInput('');

      // Auto default to tenant currency
      setCurrency(currentTenant?.currency || 'INR');
      setCtcAnnual('');
      setBasicSalary('');
      setVariablePay('');
      setAllowances('');
      setPaymentMode('Bank Transfer');
      setBankName('');
      setBankAccountNumber('');
      setIfscRoutingCode('');

      // Reset doc requirements template from storage
      setDocRequirements(mockStorage.getOnboardingDocRequirements(currentTenant?.id));
    }

    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setCurrentStep(1);
    setEmployeeId(emp.employeeId);
    setName(emp.name);
    setEmail(emp.email);

    let initialCountry = 'United States';
    let initialCode = '1';
    let digits = emp.phone || '';

    if (emp.phone && emp.phone.trim().startsWith('+')) {
      const trimmed = emp.phone.trim().substring(1);
      const spaceIdx = trimmed.indexOf(' ');
      const codePart = spaceIdx !== -1 ? trimmed.substring(0, spaceIdx) : trimmed;
      const match = countryData.find((c) => c.code === codePart);
      if (match) {
        initialCountry = match.country;
        initialCode = match.code;
        digits = spaceIdx !== -1 ? trimmed.substring(spaceIdx + 1) : '';
      }
    } else if (emp.nationality) {
      const match = countryData.find((c) => c.country.toLowerCase() === emp.nationality?.toLowerCase());
      if (match) {
        initialCountry = match.country;
        initialCode = match.code;
      }
    }

    setSelectedCountry(initialCountry);
    setPhoneCountryCode(initialCode);
    const cleanDigits = digits.replace(/[^0-9]/g, '');
    setPhoneDigits(cleanDigits);
    setPhone(emp.phone || (cleanDigits ? `+${initialCode} ${cleanDigits}` : ''));

    setDateOfBirth(emp.dateOfBirth || '');
    setGender(emp.gender || 'Female');
    setMaritalStatus(emp.maritalStatus || 'Single');
    setNationality(emp.nationality || initialCountry);
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
    setIsPermanent(emp.isPermanent ?? (emp.employmentStatus === 'ACTIVE'));
    setSkillsInput(emp.skills ? emp.skills.join(', ') : '');
    setSelectedLanguages(emp.languagesKnown || []);

    // Extract numeric values from compensation strings if formatted
    const cleanNumber = (val?: string | number) => {
      if (!val) return '';
      return String(val).replace(/[^0-9.]/g, '');
    };

    setCurrency(currentTenant?.currency || 'INR');
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
    if (!dateOfBirth) {
      toast.error('Please select the date of birth.');
      return false;
    }
    if (!gender) {
      toast.error('Please select gender.');
      return false;
    }
    if (!maritalStatus) {
      toast.error('Please select marital status.');
      return false;
    }
    if (!selectedCountry) {
      toast.error('Please select a country.');
      return false;
    }
    if (!nationality.trim()) {
      toast.error('Please enter the nationality.');
      return false;
    }
    if (!phoneDigits.trim()) {
      toast.error('Please enter a primary phone number.');
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
    if (!employmentType) {
      toast.error('Please select an employment type.');
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
      toast.error('Please enter the work location (e.g. New York, NY, USA).');
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

    const isBankPayment = paymentMode === 'Bank Transfer' || paymentMode === 'Direct Deposit';
    const finalBankName = isBankPayment ? bankName : '';
    const finalBankAccountNumber = isBankPayment ? bankAccountNumber : '';
    const finalIfscRoutingCode = isBankPayment ? ifscRoutingCode : '';

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
      employmentStatus: isPermanent ? (employmentStatus || 'ACTIVE') : 'INACTIVE',
      isPermanent: isPermanent,
      avatarUrl: avatarUrl.trim() || undefined,

      dateOfBirth,
      gender: gender || undefined,
      maritalStatus: maritalStatus || undefined,
      nationality,
      languagesKnown: selectedLanguages,
      emergencyContactName,
      emergencyContactPhone,
      currentAddress,
      permanentAddress: permanentAddress || currentAddress,

      employmentType: employmentType || undefined,
      confirmationDate: confirmationDate || undefined,
      workLocation,
      teamName,
      skills: skillsArray,

      ctcAnnual: formatComp(ctcAnnual),
      basicSalary: formatComp(basicSalary),
      variablePay: formatComp(variablePay),
      allowances: formatComp(allowances),
      paymentMode,
      bankName: finalBankName,
      bankAccountNumber: finalBankAccountNumber,
      ifscRoutingCode: finalIfscRoutingCode,
    };

    if (editingEmployee) {
      mockStorage.updateTenantItem<Employee>(KEYS.EMPLOYEES, editingEmployee.id, payload);
      
      // Also sync matching user account
      const users = mockStorage.getItem<UserType>(KEYS.USERS);
      const userIdx = users.findIndex(
        (u) =>
          u.email.toLowerCase() === editingEmployee.email.toLowerCase() ||
          u.id === editingEmployee.id ||
          u.id === `user-${editingEmployee.id}`
      );
      if (userIdx !== -1) {
        users[userIdx] = {
          ...users[userIdx],
          name: payload.name || users[userIdx].name,
          role: isPermanent ? 'EMPLOYEE' : 'NEW_HIRE',
          status: isPermanent ? 'ACTIVE' : 'PENDING_ACTIVATION',
          isPermanent: isPermanent,
          phone: payload.phone || users[userIdx].phone,
        };
        mockStorage.setItem(KEYS.USERS, users);
      }

      mockStorage.addAuditLog('EMPLOYEE_UPDATED', 'EMPLOYEE', editingEmployee.id);
      toast.success(`Employee profile for ${name} updated successfully!`);
    } else {
      const duplicate = employees.find((e) => e.employeeId.toLowerCase() === employeeId.trim().toLowerCase());
      if (duplicate) {
        toast.error(`Employee ID "${employeeId}" already exists. Please enter a unique ID.`);
        setCurrentStep(2);
        return;
      }

      const newEmpId = `emp-${Date.now()}`;
      const newEmp: Employee = {
        id: newEmpId,
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
        employmentStatus: isPermanent ? (payload.employmentStatus || 'ACTIVE') : 'INACTIVE',
        isPermanent: isPermanent,
        avatarUrl: payload.avatarUrl,

        dateOfBirth: payload.dateOfBirth,
        gender: payload.gender,
        maritalStatus: payload.maritalStatus,
        nationality: payload.nationality,
        languagesKnown: payload.languagesKnown,
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
        bankName: payload.bankName,
        bankAccountNumber: payload.bankAccountNumber,
        ifscRoutingCode: payload.ifscRoutingCode,
      };

      mockStorage.addTenantItem<Employee>(KEYS.EMPLOYEES, newEmp);

      // Create or synchronize corresponding user login account
      const users = mockStorage.getItem<UserType>(KEYS.USERS);
      const existingUserIdx = users.findIndex((u) => u.email.toLowerCase() === newEmp.email.toLowerCase());
      const userId = `user-${newEmp.id}`;

      if (existingUserIdx !== -1) {
        users[existingUserIdx] = {
          ...users[existingUserIdx],
          name: newEmp.name,
          role: isPermanent ? 'EMPLOYEE' : 'NEW_HIRE',
          status: isPermanent ? 'ACTIVE' : 'PENDING_ACTIVATION',
          isPermanent: isPermanent,
          tenantId: currentTenant.id,
          phone: newEmp.phone,
          avatarUrl: newEmp.avatarUrl,
        };
        mockStorage.setItem(KEYS.USERS, users);
      } else {
        const newUser: UserType = {
          id: userId,
          name: newEmp.name,
          email: newEmp.email,
          password: 'password123',
          role: isPermanent ? 'EMPLOYEE' : 'NEW_HIRE',
          tenantId: currentTenant.id,
          status: isPermanent ? 'ACTIVE' : 'PENDING_ACTIVATION',
          isPermanent: isPermanent,
          phone: newEmp.phone,
          avatarUrl: newEmp.avatarUrl,
        };
        mockStorage.setItem(KEYS.USERS, [newUser, ...users]);
      }

      // If not permanent, automatically register into Onboarding Cases workflow
      if (!isPermanent) {
        const cases = mockStorage.getItem<OnboardingCase>(KEYS.ONBOARDING_CASES);
        const deptName = departments.find((d) => d.id === newEmp.departmentId)?.name || 'General';
        const desigName = designations.find((d) => d.id === newEmp.designationId)?.name || 'Staff Member';
        const mgrName = employees.find((e) => e.id === newEmp.managerId)?.name || 'Department Manager';
        const regName = regionsList.find((r) => r.id === newEmp.regionId)?.name || 'Headquarters';
        const validDocRequirements = docRequirements.filter((d) => d.title.trim().length > 0);

        const newCase: OnboardingCase = {
          id: `onb-${Date.now()}`,
          tenantId: currentTenant.id,
          userId: userId,
          employeeId: newEmp.employeeId,
          candidateName: newEmp.name,
          email: newEmp.email,
          phone: newEmp.phone,
          address: newEmp.currentAddress,
          emergencyContact: newEmp.emergencyContactName ? `${newEmp.emergencyContactName} (${newEmp.emergencyContactPhone || ''})` : undefined,
          departmentId: newEmp.departmentId,
          departmentName: deptName,
          designationId: newEmp.designationId,
          designationName: desigName,
          managerId: newEmp.managerId,
          managerName: mgrName,
          joiningDate: newEmp.joiningDate,
          regionName: regName,
          personalDetailsCompleted: false,
          offerSignedUploaded: false,
          requiredDocsUploaded: false,
          requiredDocsChecklist: validDocRequirements.length > 0 ? validDocRequirements : undefined,
          acknowledgementSigned: false,
          status: 'IN_PROGRESS',
          submittedAt: new Date().toISOString(),
          avatarUrl: newEmp.avatarUrl,
        };
        mockStorage.setItem(KEYS.ONBOARDING_CASES, [newCase, ...cases]);
        toast.success(`🎉 ${name} added! Onboarding case initiated (isPermanent: false).`);
      } else {
        toast.success(`🎉 Permanent employee "${name}" successfully registered!`);
      }

      mockStorage.addAuditLog('EMPLOYEE_CREATED', 'EMPLOYEE', newEmp.id);
    }

    clearAddEmployeeDraft();
    setHasRestoredDraft(false);
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
    
    let matchesStatus = true;
    if (statusFilter === 'ALL') {
      matchesStatus = true;
    } else if (statusFilter === 'PERMANENT') {
      matchesStatus = e.isPermanent !== false;
    } else if (statusFilter === 'ONBOARDING') {
      matchesStatus = e.isPermanent === false;
    } else {
      matchesStatus = e.employmentStatus === statusFilter;
    }

    return matchesSearch && matchesDept && matchesStatus;
  });

  const pageSize = 10;
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Selected Employee Relationships
  const managerObj = employees.find((e) => e.id === selectedEmployee?.managerId);
  const deptObj = departments.find((d) => d.id === selectedEmployee?.departmentId);
  const desigObj = designations.find((d) => d.id === selectedEmployee?.designationId);
  const regionObj = regionsList.find((r) => r.id === selectedEmployee?.regionId);

  // Is viewing self or admin
  const isViewingSelfOrAdmin = Boolean(
    isAdmin ||
    (selectedEmployee && (
      selectedEmployee.id === myEmployee?.id ||
      (currentUser?.email && selectedEmployee.email?.toLowerCase() === currentUser.email?.toLowerCase()) ||
      (currentUser?.id && selectedEmployee.id === currentUser.id)
    ))
  );

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
      render: (e) => <span className="text-xs text-slate-600">{e.phone || '+1 (555) 234-5678'}</span>,
    },
    {
      key: 'workLocation',
      header: 'Location / Address',
      render: (e) => {
        const reg = regionsList.find((r) => r.id === e.regionId);
        return <span className="text-xs text-slate-500">{e.workLocation || e.currentAddress || reg?.name || 'New York, NY, USA'}</span>;
      },
    },
    {
      key: 'employmentStatus',
      header: 'Status & Classification',
      render: (e) => (
        <div className="flex flex-col gap-1 items-start">
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
          {e.isPermanent === false ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
              <Clock className="w-3 h-3 text-amber-600" />
              Onboarding
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Permanent
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (e) => {
        return (
          <div className="flex items-center gap-1.5 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenProfile(e)}
              className="p-1.5 text-slate-500 hover:text-indigo-600 cursor-pointer"
              title="View Profile"
            >
              <Eye className="w-4 h-4" />
            </Button>
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenEditModal(e)}
                className="p-1.5 text-slate-500 hover:text-indigo-600 cursor-pointer"
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">People</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Find a colleague or see how the company is organised.
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAddModal}
            className="bg-[#FF6900] hover:bg-[#E05D00] text-white font-bold shadow-xs cursor-pointer"
          >
            Add Employee
          </Button>
        )}
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-orange-500">
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

      {/* Navigation View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveDirectoryTab('LIST')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeDirectoryTab === 'LIST'
                ? 'border-[#FF6900] text-[#FF6900]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Directory</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDirectoryTab('ORG_CHART')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeDirectoryTab === 'ORG_CHART'
                ? 'border-[#FF6900] text-[#FF6900]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Org chart</span>
          </button>
        </div>
      </div>

      {activeDirectoryTab === 'LIST' ? (
        <>
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
                className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
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
                className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Statuses & Classifications</option>
                <option value="PERMANENT">🛡️ Permanent Confirmed</option>
                <option value="ONBOARDING">⏳ Onboarding / New Hires</option>
                <option value="ACTIVE">Active on Duty</option>
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
        </>
      ) : (
        <OrgChartView
          employees={employees}
          departments={departments}
          designations={designations}
          regions={regionsList}
          currentUser={currentUser}
          isTenantAdmin={isAdmin}
          myEmployee={myEmployee}
          onSelectEmployee={(emp) => handleOpenProfile(emp)}
        />
      )}

      {/* ============================================================ */}
      {/* ADD / EDIT EMPLOYEE STEP-BY-STEP GUIDED WIZARD MODAL         */}
      {/* ============================================================ */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        closeOnOverlayClick={false}
        maxWidth="4xl"
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
            {hasRestoredDraft && !editingEmployee && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2 text-amber-900 text-xs shadow-2xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Draft Restored:</strong> Unsaved changes from your previous session were automatically loaded.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClearAddEmployeeDraft}
                  className="px-2.5 py-1 text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-100/80 hover:bg-amber-200 rounded-lg border border-amber-300 transition-colors shrink-0 cursor-pointer"
                >
                  Clear Draft
                </button>
              </div>
            )}

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
                    <DatePicker
                      value={dateOfBirth}
                      onChange={setDateOfBirth}
                      placeholder="Select birth date"
                      required
                    />
                  </FormField>

                  <FormField label="Gender" required>
                    <Select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      placeholder="Select Gender"
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
                      placeholder="Select Marital Status"
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
                  <FormField label="Country" required helperText="Auto-selects phone country code">
                    <Select
                      value={selectedCountry}
                      onChange={(e) => handleCountrySelectChange(e.target.value)}
                      placeholder="Select Country"
                      options={countryData.map((c) => ({
                        value: c.country,
                        label: `${c.country} (+${c.code})`,
                      }))}
                    />
                  </FormField>

                  <FormField label="Nationality" required>
                    <Input
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="e.g. American"
                      required
                    />
                  </FormField>
                </div>

                <FormField label="Languages Known" helperText="Select one or more languages from list">
                  <MultiSelect
                    options={languagesData.map((l) => ({ value: l.name, label: l.name }))}
                    value={selectedLanguages}
                    onChange={setSelectedLanguages}
                    placeholder="Select languages..."
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Primary Contact Phone" required helperText="Numbers only">
                    <div className="flex items-center w-full">
                      <span className="flex h-10 items-center justify-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 px-3 text-xs font-bold text-indigo-700 select-none shrink-0 shadow-2xs">
                        +{phoneCountryCode || '--'}
                      </span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={phoneDigits}
                        onChange={(e) => handlePhoneDigitsChange(e.target.value)}
                        placeholder="9876543210"
                        className="rounded-l-none"
                        required
                      />
                    </div>
                  </FormField>

                  <FormField label="Current Residential Address" required>
                    <Input
                      value={currentAddress}
                      onChange={(e) => setCurrentAddress(e.target.value)}
                      placeholder="350 5th Avenue, New York, NY 10118, USA"
                      required
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <FormField label="Emergency Contact (Name & Relation)" helperText="Optional e.g. John Mitchell (Father)">
                    <Input
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      placeholder="John Mitchell (Father)"
                    />
                  </FormField>

                  <FormField label="Emergency Phone Number" helperText="Optional numbers only">
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="5550192834"
                    />
                  </FormField>
                </div>

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
                      placeholder="Select Employment Type"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Department" required>
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 min-w-0">
                        <Select
                          value={departmentId}
                          onChange={(e) => setDepartmentId(e.target.value)}
                          placeholder="Select Department"
                          options={departments.map((d) => ({ value: d.id, label: d.name }))}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddDeptModalOpen(true)}
                        className="h-10 px-2.5 font-semibold shrink-0 border-indigo-200 text-indigo-700 hover:bg-indigo-50 flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="Add New Department"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </Button>
                    </div>
                  </FormField>

                  <FormField label="Designation / Job Role" required>
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 min-w-0">
                        <Select
                          value={designationId}
                          onChange={(e) => setDesignationId(e.target.value)}
                          placeholder="Select Designation"
                          options={designations.map((d) => ({ value: d.id, label: d.name }))}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddDesigModalOpen(true)}
                        className="h-10 px-2.5 font-semibold shrink-0 border-indigo-200 text-indigo-700 hover:bg-indigo-50 flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="Add New Designation"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </Button>
                    </div>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Work Region / Office" required>
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 min-w-0">
                        <Select
                          value={regionId}
                          onChange={(e) => setRegionId(e.target.value)}
                          placeholder="Select Region"
                          options={regionsList.map((r) => ({ value: r.id, label: `${r.name} (${r.countryCode})` }))}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddRegionModalOpen(true)}
                        className="h-10 px-2.5 font-semibold shrink-0 border-indigo-200 text-indigo-700 hover:bg-indigo-50 flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="Add New Region"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </Button>
                    </div>
                  </FormField>

                  <FormField label="Work Location / City" required>
                    <Input
                      value={workLocation}
                      onChange={(e) => setWorkLocation(e.target.value)}
                      placeholder="e.g. New York, NY, USA"
                      required
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Date of Joining" required>
                    <DatePicker
                      value={joiningDate}
                      onChange={setJoiningDate}
                      placeholder="Select joining date"
                      placement="top"
                      required
                    />
                  </FormField>

                  <FormField label="Confirmation Date">
                    <DatePicker
                      value={confirmationDate}
                      onChange={setConfirmationDate}
                      placeholder="Select confirmation date"
                      placement="top"
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
                      <option value="USD">USD ($) — US Dollar</option>
                      <option value="EUR">EUR (€) — Euro</option>
                      <option value="GBP">GBP (£) — British Pound</option>
                      <option value="CAD">CAD (C$) — Canadian Dollar</option>
                      <option value="AUD">AUD (A$) — Australian Dollar</option>
                      <option value="SGD">SGD (S$) — Singapore Dollar</option>
                      <option value="AED">AED (AED) — Dirham</option>
                      <option value="INR">INR (₹) — Indian Rupee</option>
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
                        placeholder="125000"
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
                        placeholder="95000"
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
                        placeholder="15000"
                        className="pl-8"
                      />
                    </div>
                  </FormField>

                  <FormField label="Special Allowances" helperText={`Housing, Travel, Health allowances (Currency: ${currencySymbol})`}>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-sm font-bold text-indigo-600 pointer-events-none">
                        {currencySymbol}
                      </span>
                      <Input
                        type="number"
                        value={allowances}
                        onChange={(e) => setAllowances(e.target.value)}
                        placeholder="15000"
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
                        { value: 'Direct Deposit', label: 'Direct Deposit' },
                        { value: 'Bank Transfer', label: 'Bank Transfer / Wire' },
                        { value: 'Check', label: 'Paper Check' },
                        { value: 'Cash', label: 'Cash' },
                      ]}
                    />
                  </FormField>

                  {(paymentMode === 'Bank Transfer' || paymentMode === 'Direct Deposit') && (
                    <>
                      <FormField label="Bank Account Number" helperText="Optional">
                        <Input
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value)}
                          placeholder="e.g. 987654321098"
                        />
                      </FormField>

                      <FormField label="Bank Name & Routing / IFSC" helperText="Optional">
                        <Input
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="e.g. JPMorgan Chase (IFSC: HDFC0001234)"
                        />
                      </FormField>
                    </>
                  )}
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

                <FormField label="Assigned Team / Pod" required helperText="Select team/pod from dropdown or click + Add to create new">
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 min-w-0">
                      <Select
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="Select Team / Pod"
                        options={availableTeams.map((t) => ({ value: t, label: t }))}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddTeamModalOpen(true)}
                      className="h-10 px-2.5 font-semibold shrink-0 border-indigo-200 text-indigo-700 hover:bg-indigo-50 flex items-center gap-1 shadow-2xs cursor-pointer"
                      title="Add New Team"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </Button>
                  </div>
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

                {/* Permanent Confirmation vs Onboarding Workflow Selector */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 mt-3">
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span>Employment Classification & Access Mode</span>
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Set whether this employee is confirmed as permanent or must complete new hire onboarding before accessing resources.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div
                      onClick={() => setIsPermanent(false)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        !isPermanent
                          ? 'border-amber-500 bg-amber-50/60 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                            !isPermanent
                              ? 'border-amber-600 bg-amber-600'
                              : 'border-slate-300 bg-white'
                          }`}
                        />
                        <span className="text-xs font-bold text-slate-900">
                          ⏳ New Hire (Onboarding Required)
                        </span>
                      </div>
                    </div>

                    <div
                      onClick={() => setIsPermanent(true)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        isPermanent
                          ? 'border-emerald-500 bg-emerald-50/60 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                            isPermanent
                              ? 'border-emerald-600 bg-emerald-600'
                              : 'border-slate-300 bg-white'
                          }`}
                        />
                        <span className="text-xs font-bold text-slate-900">
                          🛡️ Direct Permanent Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Onboarding Documents Requirement Checklist (Dynamic & Configurable) */}
                {!isPermanent && (
                  <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3 mt-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          <span>Required Onboarding Documents & Expected Formats</span>
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                            {docRequirements.length} Docs
                          </span>
                        </h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Specify custom documents this new hire must upload with expected file types (PDF, Image, etc.).
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSaveAsDefaultTemplate}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          title="Save this list as the company's reusable document template for future employees"
                        >
                          💾 Save as Default
                        </button>
                        <button
                          type="button"
                          onClick={handleResetToDefaultTemplate}
                          className="text-[11px] font-semibold text-slate-600 hover:text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          title="Reset/Load the saved default company document checklist"
                        >
                          🔄 Load Default
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      {docRequirements.map((doc, idx) => (
                        <div
                          key={doc.id}
                          className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={doc.title}
                              onChange={(e) =>
                                handleUpdateDocRequirement(doc.id, { title: e.target.value })
                              }
                              placeholder="e.g. Government Photo ID, Degree Certificate, Voided Check..."
                              className="flex-1 text-xs font-semibold text-slate-900 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveDocRequirement(doc.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                              title="Delete requirement"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-slate-500 font-medium shrink-0">Format:</span>
                              <select
                                value={doc.allowedType}
                                onChange={(e) =>
                                  handleUpdateDocRequirement(doc.id, {
                                    allowedType: e.target.value as AllowedDocumentType,
                                  })
                                }
                                className="w-full text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                              >
                                <option value="PDF">📄 PDF Document (.pdf)</option>
                                <option value="IMAGE">🖼️ Photo / Image (.jpg, .png, .webp)</option>
                                <option value="PDF_OR_IMAGE">📄🖼️ PDF or Image</option>
                                <option value="ANY">📁 Any File Format</option>
                              </select>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700 font-medium">
                              <input
                                type="checkbox"
                                checked={doc.isRequired}
                                onChange={(e) =>
                                  handleUpdateDocRequirement(doc.id, { isRequired: e.target.checked })
                                }
                                className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                              />
                              <span>Mandatory for onboarding approval</span>
                            </label>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddDocRequirement}
                        className="w-full py-2 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/50 text-indigo-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Document Requirement</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Registration Review Summary */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 mt-4 shadow-xs">
                  <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Registration Summary</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] text-slate-600">
                    <div>
                      <span className="text-slate-400 block">Name</span>
                      <strong className="text-slate-900">{name || '--'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Employee ID</span>
                      <strong className="text-indigo-600">{employeeId || '--'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Classification</span>
                      <strong className={isPermanent ? 'text-emerald-700' : 'text-amber-700'}>
                        {isPermanent ? 'Permanent' : 'Onboarding'}
                      </strong>
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
          description={`${desigObj?.name || 'Senior Software Engineer'} • ${deptObj?.name || 'Engineering'} • ${selectedEmployee.workLocation || selectedEmployee.currentAddress || 'New York, NY, USA'}`}
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
                {isAdmin && (
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
                      Confidential compensation, banking accounts, and private HR documentation are restricted to HR Administrators and the employee account owner.
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
                        <span className="text-slate-800 font-medium">{selectedEmployee.phone || '+1 (212) 555-0100'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Department</span>
                        <span className="text-slate-800">{deptObj?.name || 'Engineering'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Designation</span>
                        <span className="text-slate-800">{desigObj?.name || 'Senior Software Engineer'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Emergency Contact</span>
                        <span className="text-slate-800 font-medium">
                          {selectedEmployee.emergencyContactName ? `${selectedEmployee.emergencyContactName} (${selectedEmployee.emergencyContactPhone || selectedEmployee.emergencyContactRelation || ''})` : 'Available via HR Desk'}
                        </span>
                      </div>
                      <div className="pt-1">
                        <span className="text-slate-400 block text-[10px]">Work Location / Office</span>
                        <span className="text-slate-700 leading-tight block">
                          {selectedEmployee.workLocation || regionObj?.name || 'New York HQ'}
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
                {/* Top Navigation Tabs - Strictly Overview and Documents */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
                  {[
                    { key: 'Overview', label: 'Overview', icon: User },
                    { key: 'Documents', label: 'Documents', icon: FileText },
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    const isActive = profileActiveTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setProfileActiveTab(tab.key as any)}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer text-xs font-bold ${
                          isActive
                            ? 'bg-[#FF6900]/10 text-[#FF6900] border border-[#FF6900]/20 shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
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
                          <span className="text-slate-800">{selectedEmployee.dateOfBirth || '1990-05-14'}</span>
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
                          <span className="text-slate-800">{selectedEmployee.nationality || 'American'}</span>
                        </div>
                        <div className="border-b border-slate-100 pb-1">
                          <span className="text-slate-400 block text-[10px]">Emergency Contact</span>
                          <span className="text-slate-800 font-medium block">
                            {selectedEmployee.emergencyContactName || 'Sarah Miller (Spouse)'}
                          </span>
                          <span className="text-slate-500 font-mono text-[10px]">
                            {selectedEmployee.emergencyContactPhone || '+1 (212) 555-0199'}
                          </span>
                        </div>
                        <div className="pt-1">
                          <span className="text-slate-400 block text-[10px]">Current Address</span>
                          <span className="text-slate-700 leading-tight block">
                            {selectedEmployee.currentAddress || '120 Broadway, Suite 1400, New York, NY 10005'}
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
                          <span className="font-mono font-bold text-[#FF6900]">{selectedEmployee.employeeId}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Employment Type</span>
                          <span className="text-slate-800">{selectedEmployee.employmentType || 'Full Time'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Date of Joining</span>
                          <span className="text-slate-800">
                            {selectedEmployee.joiningDate ? new Date(selectedEmployee.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' }) : '3/15/2024'}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Confirmation Date</span>
                          <span className="text-slate-800">
                            {selectedEmployee.confirmationDate ? new Date(selectedEmployee.confirmationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' }) : '6/15/2024'}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Work Location</span>
                          <span className="text-slate-800">{selectedEmployee.workLocation || regionObj?.name || 'New York HQ'}</span>
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
                          <strong className="text-slate-900 font-bold">{formatSalary(selectedEmployee.ctcAnnual)}</strong>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Basic Salary</span>
                          <span className="text-slate-800">{formatSalary(selectedEmployee.basicSalary)}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Variable Pay</span>
                          <span className="text-slate-800">{formatSalary(selectedEmployee.variablePay)}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Allowances</span>
                          <span className="text-slate-800">{formatSalary(selectedEmployee.allowances)}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400">Payment Mode</span>
                          <span className="text-slate-800">{selectedEmployee.paymentMode || 'Direct Deposit'}</span>
                        </div>
                        <div className="pt-1">
                          <span className="text-slate-400 block text-[10px]">Bank Account</span>
                          <span className="font-mono text-slate-800 block">{selectedEmployee.bankAccountNumber || '•••• •••• 9283'}</span>
                          <span className="text-[10px] text-slate-400">{selectedEmployee.bankName || 'JPMorgan Chase Bank, N.A.'}</span>
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
                            <strong className="text-[#FF6900] font-bold">{selectedEmployee.teamName || 'Core Platform Architecture'}</strong>
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
                          {(selectedEmployee.skills || ['Go', 'Kubernetes', 'AWS', 'Distributed Systems', 'PostgreSQL', 'Kafka']).map((sk) => (
                            <span
                              key={sk}
                              className="bg-orange-50 text-orange-800 font-semibold px-2.5 py-1 rounded-full text-[10px] border border-orange-200"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </Card>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: DOCUMENTS */}
                {profileActiveTab === 'Documents' && (
                  <Card className="p-5 space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Official Employment Documents</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Verified HR, legal, and compliance documents for {selectedEmployee.name}</p>
                      </div>
                      <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100">
                        6 Documents On File
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      {[
                        { title: 'Employment Agreement & Offer Letter', size: '2.4 MB', type: 'PDF', date: selectedEmployee.joiningDate || '2024-03-15', status: 'Signed & Executed' },
                        { title: 'Federal W-4 Tax Withholding Certificate', size: '850 KB', type: 'PDF', date: selectedEmployee.joiningDate || '2024-03-15', status: 'Verified' },
                        { title: 'Form I-9 Identity & Work Eligibility Verification', size: '1.8 MB', type: 'PDF', date: selectedEmployee.joiningDate || '2024-03-15', status: 'Verified' },
                        { title: 'Direct Deposit Authorization & Bank Mandate', size: '420 KB', type: 'PDF', date: selectedEmployee.joiningDate || '2024-03-15', status: 'Active' },
                        { title: 'Intellectual Property & Security Compliance NDA', size: '1.2 MB', type: 'PDF', date: selectedEmployee.joiningDate || '2024-03-15', status: 'Signed' },
                        { title: 'Educational Credentials & Background Screening', size: '3.5 MB', type: 'PDF', date: selectedEmployee.joiningDate || '2024-03-15', status: 'Verified' },
                      ].map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-orange-100/60 text-[#FF6900] flex items-center justify-center font-bold text-xs shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 text-xs truncate group-hover:text-[#FF6900] transition-colors">
                                {doc.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                                <span>{doc.type} • {doc.size}</span>
                                <span>•</span>
                                <span>{doc.date}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 hidden sm:inline-block">
                              {doc.status}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                toast.success(`Downloading ${doc.title}...`);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-white rounded-lg transition-colors cursor-pointer"
                              title="Download Document"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        </Modal>
      )}

      {/* INLINE ADD DEPARTMENT MODAL */}
      <Modal
        isOpen={isAddDeptModalOpen}
        onClose={() => setIsAddDeptModalOpen(false)}
        title="Add New Department"
        description="Create a new department in organizational hierarchy"
      >
        <form onSubmit={handleCreateDepartmentInline} className="space-y-4 text-xs pt-1">
          <FormField label="Department Name" required>
            <Input
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              placeholder="e.g. Artificial Intelligence & Automation"
              required
            />
          </FormField>

          <FormField label="Description">
            <Input
              value={newDeptDesc}
              onChange={(e) => setNewDeptDesc(e.target.value)}
              placeholder="e.g. Responsible for AI R&D and ML systems"
            />
          </FormField>

          <FormField label="Parent Department">
            <Select
              value={newDeptParentId}
              onChange={(e) => setNewDeptParentId(e.target.value)}
              placeholder="None (Top Level Department)"
              options={[
                { value: '', label: 'None (Top Level Department)' },
                ...departments.map((d) => ({ value: d.id, label: d.name })),
              ]}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsAddDeptModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Department
            </Button>
          </div>
        </form>
      </Modal>

      {/* INLINE ADD DESIGNATION MODAL */}
      <Modal
        isOpen={isAddDesigModalOpen}
        onClose={() => setIsAddDesigModalOpen(false)}
        title="Add New Designation"
        description="Create a new job role / title designation"
      >
        <form onSubmit={handleCreateDesignationInline} className="space-y-4 text-xs pt-1">
          <FormField label="Designation Title" required>
            <Input
              value={newDesigName}
              onChange={(e) => setNewDesigName(e.target.value)}
              placeholder="e.g. Senior AI Systems Architect"
              required
            />
          </FormField>

          <FormField label="Department">
            <Select
              value={newDesigDeptId}
              onChange={(e) => setNewDesigDeptId(e.target.value)}
              options={[
                { value: '', label: 'All Departments / General' },
                ...departments.map((d) => ({ value: d.id, label: d.name })),
              ]}
            />
          </FormField>

          <FormField label="Description">
            <Input
              value={newDesigDesc}
              onChange={(e) => setNewDesigDesc(e.target.value)}
              placeholder="e.g. Oversees enterprise AI models and architecture"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsAddDesigModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Designation
            </Button>
          </div>
        </form>
      </Modal>

      {/* INLINE ADD REGION MODAL */}
      <Modal
        isOpen={isAddRegionModalOpen}
        onClose={() => setIsAddRegionModalOpen(false)}
        title="Add New Work Region / Office"
        description="Create a new office location or geographical region"
      >
        <form onSubmit={handleCreateRegionInline} className="space-y-4 text-xs pt-1">
          <FormField label="Region / Office Name" required>
            <Input
              value={newRegionName}
              onChange={(e) => setNewRegionName(e.target.value)}
              placeholder="e.g. European HQ (Berlin)"
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Country ISO Code" required>
              <Input
                value={newRegionCountryCode}
                onChange={(e) => setNewRegionCountryCode(e.target.value.toUpperCase())}
                placeholder="e.g. US, IN, DE"
                required
              />
            </FormField>

            <FormField label="Time Zone">
              <Input
                value={newRegionTimeZone}
                onChange={(e) => setNewRegionTimeZone(e.target.value)}
                placeholder="e.g. UTC, Asia/Kolkata"
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsAddRegionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Region
            </Button>
          </div>
        </form>
      </Modal>

      {/* INLINE ADD TEAM MODAL */}
      <Modal
        isOpen={isAddTeamModalOpen}
        onClose={() => setIsAddTeamModalOpen(false)}
        title="Add New Team / Pod"
        description="Create a new team or pod assignment for your organization"
      >
        <form onSubmit={handleCreateTeamInline} className="space-y-4 text-xs pt-1">
          <FormField label="Team / Pod Name" required>
            <Input
              value={newCustomTeamName}
              onChange={(e) => setNewCustomTeamName(e.target.value)}
              placeholder="e.g. Mobile Engineering Pod"
              required
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsAddTeamModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create & Select Team
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
