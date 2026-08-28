import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { FormField } from '@/components/ui/FormField';
import { Avatar } from '@/components/ui/Avatar';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import countryData from '@/data/country_and_codes.json';
import languagesData from '@/data/languages.json';
import { useFormDraft } from '@/hooks/useFormDraft';
import {
  Employee,
  Department,
  Designation,
  Region,
  OnboardingCase,
  OnboardingDocRequirement,
  AllowedDocumentType,
  DEFAULT_ONBOARDING_DOCUMENTS,
} from '@/demo-data/seedData';
import {
  Plus,
  Trash2,
  Sparkles,
  DollarSign,
  Award,
  Briefcase,
  User,
  ShieldCheck,
  FileText,
  Upload,
  ArrowRight,
} from 'lucide-react';

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

interface EmployeeOnboardingFormProps {
  tenantId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EmployeeOnboardingForm: React.FC<EmployeeOnboardingFormProps> = ({
  tenantId,
  onSuccess,
  onCancel,
}) => {
  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.id === tenantId) || tenants[0];
  const currentUser = mockStorage.getCurrentUser();

  const departments = useMemo(() => mockStorage.getTenantItems<Department>(KEYS.DEPARTMENTS, tenantId), [tenantId]);
  const designations = useMemo(() => mockStorage.getTenantItems<Designation>(KEYS.DESIGNATIONS, tenantId), [tenantId]);
  const regionsList = useMemo(() => mockStorage.getTenantItems<Region>(KEYS.REGIONS, tenantId), [tenantId]);
  const employees = useMemo(
    () =>
      mockStorage
        .getTenantItems<Employee>(KEYS.EMPLOYEES, tenantId)
        .filter((e) => e.isPermanent !== false && e.employmentStatus !== 'INACTIVE'),
    [tenantId]
  );

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  // Step 1: Personal Info
  const [employeeId, setEmployeeId] = useState(`EMP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('United States');
  const [phoneCountryCode, setPhoneCountryCode] = useState('1');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other' | 'Prefer not to say'>('Female');
  const [maritalStatus, setMaritalStatus] = useState<'Single' | 'Married' | 'Divorced' | 'Widowed'>('Single');
  const [nationality, setNationality] = useState('American');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English']);
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Step 2: Job Details
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [designationId, setDesignationId] = useState(designations[0]?.id || '');
  const [regionId, setRegionId] = useState(regionsList[0]?.id || '');
  const [managerId, setManagerId] = useState('');
  const [employmentType, setEmploymentType] = useState<
    'Full Time' | 'Part Time' | 'Contract' | 'Intern' | 'Probation'
  >('Full Time');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [confirmationDate, setConfirmationDate] = useState('');
  const [workLocation, setWorkLocation] = useState('New York, NY, USA');
  const [teamName, setTeamName] = useState('Core Platform Pod');
  const [employmentStatus, setEmploymentStatus] = useState<'ACTIVE' | 'ON_LEAVE' | 'INACTIVE'>('ACTIVE');

  // Step 3: Compensation
  const [currency, setCurrency] = useState(currentTenant?.currency || 'USD');
  const [ctcAnnual, setCtcAnnual] = useState('120000');
  const [basicSalary, setBasicSalary] = useState('90000');
  const [variablePay, setVariablePay] = useState('15000');
  const [allowances, setAllowances] = useState('15000');
  const [paymentMode, setPaymentMode] = useState<'Bank Transfer' | 'Direct Deposit' | 'Check' | 'Cash'>('Direct Deposit');
  const [bankName, setBankName] = useState('JPMorgan Chase Bank');
  const [bankAccountNumber, setBankAccountNumber] = useState('987654321098');
  const [ifscRoutingCode, setIfscRoutingCode] = useState('021000021');

  // Step 4: Team, Skills & Classification
  const [isPermanent, setIsPermanent] = useState(false);
  const [skillsInput, setSkillsInput] = useState('React, TypeScript, Node.js, SQL');
  const [docRequirements, setDocRequirements] = useState<OnboardingDocRequirement[]>(() => {
    try {
      const raw = localStorage.getItem(`company_default_doc_checklist_${tenantId}`);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return DEFAULT_ONBOARDING_DOCUMENTS;
  });

  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';

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

  const { clearDraft } = useFormDraft({
    draftKey: `add_employee_${tenantId}`,
    data: addEmployeeDraftData,
    enabled: true,
  });

  useEffect(() => {
    const savedDraft =
      mockStorage.getFormDraft<any>(`add_employee_${tenantId}`) ||
      mockStorage.getFormDraft<any>(`add_employee`) ||
      mockStorage.getFormDraft<any>(`new_employee_draft_${tenantId}`);

    if (
      savedDraft?.data &&
      (savedDraft.data.name ||
        savedDraft.data.email ||
        savedDraft.data.phoneDigits ||
        savedDraft.data.currentStep > 1)
    ) {
      const d = savedDraft.data;
      if (d.employeeId) setEmployeeId(d.employeeId);
      if (d.name) setName(d.name);
      if (d.email) setEmail(d.email);
      if (d.selectedCountry) setSelectedCountry(d.selectedCountry);
      if (d.phoneCountryCode) setPhoneCountryCode(d.phoneCountryCode);
      if (d.phoneDigits) setPhoneDigits(d.phoneDigits);
      if (d.phone) setPhone(d.phone);
      if (d.dateOfBirth) setDateOfBirth(d.dateOfBirth);
      if (d.gender) setGender(d.gender);
      if (d.maritalStatus) setMaritalStatus(d.maritalStatus);
      if (d.nationality) setNationality(d.nationality);
      if (d.emergencyContactName) setEmergencyContactName(d.emergencyContactName);
      if (d.emergencyContactPhone) setEmergencyContactPhone(d.emergencyContactPhone);
      if (d.currentAddress) setCurrentAddress(d.currentAddress);
      if (d.permanentAddress) setPermanentAddress(d.permanentAddress);
      if (d.avatarUrl) setAvatarUrl(d.avatarUrl);

      if (d.departmentId) setDepartmentId(d.departmentId);
      if (d.designationId) setDesignationId(d.designationId);
      if (d.regionId) setRegionId(d.regionId);
      if (d.managerId) setManagerId(d.managerId);
      if (d.employmentType) setEmploymentType(d.employmentType);
      if (d.joiningDate) setJoiningDate(d.joiningDate);
      if (d.confirmationDate) setConfirmationDate(d.confirmationDate);
      if (d.workLocation) setWorkLocation(d.workLocation);
      if (d.teamName) setTeamName(d.teamName);
      if (d.employmentStatus) setEmploymentStatus(d.employmentStatus);
      if (d.isPermanent !== undefined) setIsPermanent(d.isPermanent);
      if (d.skillsInput) setSkillsInput(d.skillsInput);
      if (d.selectedLanguages) setSelectedLanguages(d.selectedLanguages);

      if (d.currency) setCurrency(d.currency);
      if (d.ctcAnnual) setCtcAnnual(d.ctcAnnual);
      if (d.basicSalary) setBasicSalary(d.basicSalary);
      if (d.variablePay) setVariablePay(d.variablePay);
      if (d.allowances) setAllowances(d.allowances);
      if (d.paymentMode) setPaymentMode(d.paymentMode);
      if (d.bankName) setBankName(d.bankName);
      if (d.bankAccountNumber) setBankAccountNumber(d.bankAccountNumber);
      if (d.ifscRoutingCode) setIfscRoutingCode(d.ifscRoutingCode);

      if (d.currentStep) setCurrentStep(d.currentStep);
      setHasRestoredDraft(true);
      toast.info('⚡ Restored unsaved employee draft! Resume your work or click "Clear Draft".');
    }
  }, [tenantId]);

  const handleClearDraft = () => {
    clearDraft();
    mockStorage.clearFormDraft(`add_employee_${tenantId}`);
    mockStorage.clearFormDraft(`add_employee`);
    mockStorage.clearFormDraft(`new_employee_draft_${tenantId}`);
    setHasRestoredDraft(false);
    setName('');
    setEmail('');
    setPhoneDigits('');
    setPhone('');
    setCurrentStep(1);
    toast.success('Employee draft cleared.');
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

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar photo file exceeds 5MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        toast.success('Avatar photo updated!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddDocRequirement = () => {
    const newDoc: OnboardingDocRequirement = {
      id: `req-${Date.now()}`,
      title: '',
      allowedType: 'PDF_OR_IMAGE',
      isRequired: true,
      description: 'Please upload a legible digital copy.',
    };
    setDocRequirements([...docRequirements, newDoc]);
  };

  const handleUpdateDocRequirement = (id: string, updates: Partial<OnboardingDocRequirement>) => {
    setDocRequirements(docRequirements.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const handleRemoveDocRequirement = (id: string) => {
    setDocRequirements(docRequirements.filter((d) => d.id !== id));
  };

  const handleSaveAsDefaultTemplate = () => {
    const valid = docRequirements.filter((d) => d.title.trim().length > 0);
    if (valid.length === 0) {
      toast.error('Add at least one document requirement with a valid title.');
      return;
    }
    localStorage.setItem(`company_default_doc_checklist_${tenantId}`, JSON.stringify(valid));
    toast.success('✅ Saved as company default onboarding document checklist template!');
  };

  const handleResetToDefaultTemplate = () => {
    try {
      const raw = localStorage.getItem(`company_default_doc_checklist_${tenantId}`);
      if (raw) {
        setDocRequirements(JSON.parse(raw));
        toast.success('Loaded saved company document checklist template.');
        return;
      }
    } catch {
      // fallback
    }
    setDocRequirements(DEFAULT_ONBOARDING_DOCUMENTS);
    toast.info('Loaded standard default document template.');
  };

  const handleSaveEmployee = () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Full Name and Email are required');
      return;
    }

    const assignedEmployeeId = employeeId.trim() || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      tenantId,
      employeeId: assignedEmployeeId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      departmentId: departmentId || (departments[0]?.id || 'dept-gen'),
      designationId: designationId || (designations[0]?.id || 'desig-gen'),
      regionId: regionId || (regionsList[0]?.id || 'reg-auto-computation-1'),
      managerId: managerId || null,
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      confirmationDate: confirmationDate || undefined,
      employmentType: employmentType || 'Full Time',
      workLocation: workLocation.trim() || undefined,
      teamName: teamName || undefined,
      skills: skillsInput ? skillsInput.split(',').map((s) => s.trim()).filter(Boolean) : [],
      employmentStatus: 'ACTIVE',
      isPermanent: isPermanent,
      avatarUrl: avatarUrl.trim() || undefined,
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || undefined,
      maritalStatus: maritalStatus || undefined,
      nationality: nationality.trim() || undefined,
      languagesKnown: selectedLanguages,
      emergencyContactName: emergencyContactName.trim() || undefined,
      emergencyContactPhone: emergencyContactPhone.trim() || undefined,
      currentAddress: currentAddress.trim() || undefined,
      permanentAddress: permanentAddress.trim() || undefined,
      ctcAnnual: ctcAnnual ? parseFloat(ctcAnnual) : undefined,
      basicSalary: basicSalary ? parseFloat(basicSalary) : undefined,
      variablePay: variablePay ? parseFloat(variablePay) : undefined,
      allowances: allowances ? parseFloat(allowances) : undefined,
      paymentMode,
      bankName: bankName.trim() || undefined,
      bankAccountNumber: bankAccountNumber.trim() || undefined,
      ifscRoutingCode: ifscRoutingCode.trim() || undefined,
    };

    mockStorage.addTenantItem<Employee>(KEYS.EMPLOYEES, newEmp);

    if (!isPermanent) {
      const validDocReqs = docRequirements.filter((d) => d.title.trim().length > 0);
      const newCase: OnboardingCase = {
        id: `onb-${Date.now()}`,
        tenantId,
        userId: newEmp.id,
        employeeId: newEmp.employeeId,
        candidateName: newEmp.name,
        email: newEmp.email,
        phone: newEmp.phone,
        departmentId: newEmp.departmentId,
        departmentName: departments.find((d) => d.id === newEmp.departmentId)?.name || 'General',
        designationId: newEmp.designationId,
        designationName: designations.find((d) => d.id === newEmp.designationId)?.name || 'Member',
        managerName: 'HR Admin',
        joiningDate: newEmp.joiningDate,
        regionName: 'Main Campus',
        personalDetailsCompleted: true,
        offerSignedUploaded: false,
        requiredDocsUploaded: false,
        acknowledgementSigned: false,
        status: 'IN_PROGRESS',
        requiredDocsChecklist: validDocReqs.length > 0 ? validDocReqs : DEFAULT_ONBOARDING_DOCUMENTS,
        uploadedDocs: [],
      };
      mockStorage.addTenantItem<OnboardingCase>(KEYS.ONBOARDING_CASES, newCase);
    }

    clearDraft();
    mockStorage.clearFormDraft(`add_employee_${tenantId}`);
    mockStorage.clearFormDraft(`add_employee`);
    mockStorage.clearFormDraft(`new_employee_draft_${tenantId}`);
    setHasRestoredDraft(false);
    toast.success(`🎉 Employee "${newEmp.name}" enrolled successfully!`);
    onSuccess?.();
  };

  const steps = [
    { num: 1, title: 'Personal Info', icon: User },
    { num: 2, title: 'Job Details', icon: Briefcase },
    { num: 3, title: 'Compensation', icon: DollarSign },
    { num: 4, title: 'Team & Access', icon: Award },
  ];

  return (
    <div className="space-y-4">
      {/* 4-Step Wizard Navigation */}
      <div className="grid grid-cols-4 gap-2 border-b border-slate-200 pb-3">
        {steps.map((step) => {
          const isCompleted = currentStep > step.num;
          const isCurrent = currentStep === step.num;

          return (
            <button
              key={step.num}
              type="button"
              onClick={() => {
                if (step.num < currentStep) setCurrentStep(step.num);
              }}
              className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
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

      {/* Draft Restored Banner */}
      {hasRestoredDraft && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2 text-amber-900 text-xs shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Draft Restored:</strong> Unsaved changes from your previous session were automatically loaded.
            </span>
          </div>
          <button
            type="button"
            onClick={handleClearDraft}
            className="px-2.5 py-1 text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-100/80 hover:bg-amber-200 rounded-lg border border-amber-300 transition-colors shrink-0 cursor-pointer"
          >
            Clear Draft
          </button>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
          } else {
            handleSaveEmployee();
          }
        }}
        className="space-y-4 text-xs pt-1"
      >
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
              <FormField label="Country" required helperText="Auto-selects phone country code">
                <Select
                  value={selectedCountry}
                  onChange={(e) => handleCountrySelectChange(e.target.value)}
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
                options={languagesData.map((l) => ({
                  value: l.name,
                  label: l.name,
                }))}
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
                      htmlFor="avatar-file-upload-quick"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 cursor-pointer shadow-2xs transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{avatarUrl ? 'Change Photo from File' : 'Upload Photo from File'}</span>
                    </label>
                    <input
                      id="avatar-file-upload-quick"
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
                  placeholder="e.g. EMP-1001"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Department" required>
                <Select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  options={departments.map((d) => ({
                    value: d.id,
                    label: d.name,
                  }))}
                />
              </FormField>

              <FormField label="Designation / Job Role" required>
                <Select
                  value={designationId}
                  onChange={(e) => setDesignationId(e.target.value)}
                  options={designations.map((d) => ({
                    value: d.id,
                    label: d.name,
                  }))}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Work Region / Office" required>
                <Select
                  value={regionId}
                  onChange={(e) => setRegionId(e.target.value)}
                  options={regionsList.map((r) => ({
                    value: r.id,
                    label: `${r.name} (${r.countryCode})`,
                  }))}
                />
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
                  required
                />
              </FormField>

              <FormField label="Confirmation Date">
                <DatePicker
                  value={confirmationDate}
                  onChange={setConfirmationDate}
                  placeholder="Select confirmation date"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Reporting Manager" helperText="Direct Supervisor">
                <Select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  options={[
                    { value: '', label: 'None (Direct / Executive)' },
                    ...employees.map((e) => ({
                      value: e.id,
                      label: `${e.name} (${e.employeeId})`,
                    })),
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

        {/* STEP 3: COMPENSATION & CURRENCY */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between gap-2 text-indigo-900">
              <div className="flex items-center gap-2 font-semibold">
                <DollarSign className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Step 3 of 4: Set salary components and payroll bank details.</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">Currency:</span>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-white border border-indigo-200 text-xs rounded-lg px-2 py-1 font-bold text-indigo-700 shadow-2xs"
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
              <FormField label="Annual CTC Package" required helperText={`Currency: ${currencySymbol}`}>
                <Input
                  type="number"
                  value={ctcAnnual}
                  onChange={(e) => setCtcAnnual(e.target.value)}
                  placeholder="125000"
                  required
                />
              </FormField>

              <FormField label="Basic Salary (Annual)" required helperText={`Currency: ${currencySymbol}`}>
                <Input
                  type="number"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(e.target.value)}
                  placeholder="95000"
                  required
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Variable Pay / Bonus" helperText={`Optional (Currency: ${currencySymbol})`}>
                <Input
                  type="number"
                  value={variablePay}
                  onChange={(e) => setVariablePay(e.target.value)}
                  placeholder="15000"
                />
              </FormField>

              <FormField label="Special Allowances" helperText={`Housing, Travel, Health (Currency: ${currencySymbol})`}>
                <Input
                  type="number"
                  value={allowances}
                  onChange={(e) => setAllowances(e.target.value)}
                  placeholder="15000"
                />
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
                  placeholder="e.g. JPMorgan Chase"
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

            <FormField label="Assigned Team / Pod" required>
              <Input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Core Engineering Pod"
                required
              />
            </FormField>

            <FormField label="Technical & Domain Skills (Comma separated)" required>
              <Input
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="JavaScript, React, Node.js, TypeScript, PostgreSQL, AWS"
                required
              />
            </FormField>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 mt-3">
              <div>
                <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Employment Classification & Access Mode</span>
                </h5>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Set whether this employee is confirmed as permanent or must complete new hire onboarding.
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
                        !isPermanent ? 'border-amber-600 bg-amber-600' : 'border-slate-300 bg-white'
                      }`}
                    />
                    <span className="text-xs font-bold text-slate-900">⏳ New Hire (Onboarding Required)</span>
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
                        isPermanent ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white'
                      }`}
                    />
                    <span className="text-xs font-bold text-slate-900">🛡️ Direct Permanent Active</span>
                  </div>
                </div>
              </div>
            </div>

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
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveAsDefaultTemplate}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      💾 Save as Default
                    </button>
                    <button
                      type="button"
                      onClick={handleResetToDefaultTemplate}
                      className="text-[11px] font-semibold text-slate-600 hover:text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      🔄 Load Default
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  {docRequirements.map((doc, idx) => (
                    <div key={doc.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={doc.title}
                          onChange={(e) => handleUpdateDocRequirement(doc.id, { title: e.target.value })}
                          placeholder="e.g. Government Photo ID, Degree Certificate, Voided Check..."
                          className="flex-1 text-xs font-semibold text-slate-900 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveDocRequirement(doc.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
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
                            onChange={(e) => handleUpdateDocRequirement(doc.id, { isRequired: e.target.checked })}
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
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            {currentStep > 1 && (
              <Button type="button" variant="outline" size="sm" onClick={() => setCurrentStep(currentStep - 1)}>
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onCancel && (
              <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}

            {currentStep < 4 ? (
              <Button type="submit" variant="primary" size="sm" className="bg-indigo-600">
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <Button type="submit" variant="primary" size="sm" className="bg-indigo-600 font-bold">
                Complete Onboarding
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
