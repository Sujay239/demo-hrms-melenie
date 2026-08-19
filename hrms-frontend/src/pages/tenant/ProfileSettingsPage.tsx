import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { FormField } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { Employee, Department, Designation, Region, Tenant } from '@/demo-data/seedData';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  DollarSign,
  Award,
  Upload,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Lock,
  Edit3,
  Save,
  CreditCard,
  Heart,
  Home,
  UserCheck,
} from 'lucide-react';

export const ProfileSettingsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const currentUser = mockStorage.getCurrentUser();
  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];

  const employees = mockStorage.getTenantItems<Employee>(KEYS.EMPLOYEES, currentTenant.id);
  const departments = mockStorage.getTenantItems<Department>(KEYS.DEPARTMENTS, currentTenant.id);
  const designations = mockStorage.getTenantItems<Designation>(KEYS.DESIGNATIONS, currentTenant.id);
  const regions = mockStorage.getTenantItems<Region>(KEYS.REGIONS, currentTenant.id);

  // Find matching employee record for active user
  const myEmployee =
    employees.find(
      (e) =>
        e.email.toLowerCase() === currentUser.email.toLowerCase() ||
        e.id === currentUser.id ||
        (currentUser.name && e.name.toLowerCase() === currentUser.name.toLowerCase())
    ) || employees[0];

  const deptObj = departments.find((d) => d.id === myEmployee?.departmentId);
  const desigObj = designations.find((d) => d.id === myEmployee?.designationId);
  const regionObj = regions.find((r) => r.id === myEmployee?.regionId);
  const managerObj = employees.find((e) => e.id === myEmployee?.managerId);

  // Editable Form State
  const [phone, setPhone] = useState(myEmployee?.phone || '+91 98765 43210');
  const [currentAddress, setCurrentAddress] = useState(
    myEmployee?.currentAddress || '21, 5th Cross, Koramangala, Bangalore - 560034, India'
  );
  const [permanentAddress, setPermanentAddress] = useState(
    myEmployee?.permanentAddress || myEmployee?.currentAddress || '21, 5th Cross, Koramangala, Bangalore - 560034, India'
  );
  const [emergencyContactName, setEmergencyContactName] = useState(
    myEmployee?.emergencyContactName || 'Family Contact'
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    myEmployee?.emergencyContactPhone || '+91 91234 56789'
  );
  const [avatarUrl, setAvatarUrl] = useState(myEmployee?.avatarUrl || currentUser.avatarUrl || '');
  const [skills, setSkills] = useState<string[]>(
    myEmployee?.skills || ['JavaScript', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS']
  );
  const [newSkillInput, setNewSkillInput] = useState('');
  const [activeTab, setActiveTab] = useState<'Personal' | 'Job' | 'Compensation' | 'Skills'>('Personal');

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
        const result = reader.result as string;
        setAvatarUrl(result);
        toast.success(`Photo "${file.name}" selected! Click "Save Changes" to apply.`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    if (skills.includes(newSkillInput.trim())) {
      toast.error('Skill already exists');
      return;
    }
    setSkills([...skills, newSkillInput.trim()]);
    setNewSkillInput('');
    toast.success('Skill added');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (myEmployee) {
      const updated: Partial<Employee> = {
        phone,
        currentAddress,
        permanentAddress,
        emergencyContactName,
        emergencyContactPhone,
        avatarUrl,
        skills,
      };

      mockStorage.updateTenantItem<Employee>(KEYS.EMPLOYEES, myEmployee.id, updated);
    }

    // Update currentUser in mock storage if matching
    mockStorage.setCurrentUser({
      ...currentUser,
      avatarUrl,
    });

    mockStorage.addAuditLog('EMPLOYEE_PROFILE_UPDATED', 'USER', currentUser.id);
    toast.success('🎉 Your profile information has been successfully updated!');
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200 pb-16">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar with upload trigger */}
            <div className="relative group">
              <Avatar
                src={avatarUrl}
                name={myEmployee?.name || currentUser.name}
                size="lg"
                className="w-20 h-20 ring-4 ring-indigo-50 shadow-md text-xl"
              />
              <label
                htmlFor="profile-avatar-upload"
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Change Profile Photo"
              >
                <Upload className="w-5 h-5" />
              </label>
              <input
                id="profile-avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarFileUpload}
                className="hidden"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900">{myEmployee?.name || currentUser.name}</h2>
                <Badge variant="emerald" size="sm">
                  {myEmployee?.employmentStatus || 'ACTIVE'}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 font-medium">
                {desigObj?.name || 'Senior Software Engineer'} • {deptObj?.name || 'Engineering'}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {myEmployee?.employeeId || 'EMP-1001'}
                </span>
                <span>•</span>
                <span>{myEmployee?.email || currentUser.email}</span>
                <span>•</span>
                <span>{myEmployee?.workLocation || regionObj?.name || 'Bangalore, India'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              onClick={handleSaveProfile}
              leftIcon={<Save className="w-4 h-4" />}
              className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-xs"
            >
              Save Profile Updates
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-slate-100 mt-6 pt-3 overflow-x-auto text-xs font-bold">
          {[
            { key: 'Personal', label: 'Personal Information', icon: User },
            { key: 'Job', label: 'Job & Organizational Details', icon: Briefcase },
            { key: 'Compensation', label: 'My Compensation & Bank', icon: DollarSign },
            { key: 'Skills', label: 'Skills & Capabilities', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT: 1. PERSONAL INFORMATION */}
      {activeTab === 'Personal' && (
        <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in">
          <Card className="shadow-xs border border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-4 h-4 text-indigo-600" />
                <span>Personal & Contact Information</span>
              </CardTitle>
              <span className="text-xs text-slate-400">Keep your emergency and residential info updated</span>
            </CardHeader>
            <CardContent className="pt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Full Legal Name</span>
                  <p className="font-bold text-slate-900 text-sm">{myEmployee?.name || currentUser.name}</p>
                  <span className="text-[10px] text-slate-400">Fixed HR record</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Date of Birth</span>
                  <p className="font-bold text-slate-900 text-sm">{myEmployee?.dateOfBirth || '12 Feb 1994'}</p>
                  <span className="text-[10px] text-slate-400">Identity verification</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Gender & Marital Status</span>
                  <p className="font-bold text-slate-900 text-sm">
                    {myEmployee?.gender || 'Female'} • {myEmployee?.maritalStatus || 'Single'}
                  </p>
                  <span className="text-[10px] text-slate-400">Demographic info</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <FormField label="Primary Contact Phone" required helperText="Direct mobile number for work communication">
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                  />
                </FormField>

                <FormField label="Official Work Email" helperText="Assigned company address">
                  <Input value={myEmployee?.email || currentUser.email} disabled className="bg-slate-50" />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <FormField label="Current Residential Address" required>
                  <Input
                    value={currentAddress}
                    onChange={(e) => setCurrentAddress(e.target.value)}
                    placeholder="Residential address"
                    required
                  />
                </FormField>

                <FormField label="Permanent Address">
                  <Input
                    value={permanentAddress}
                    onChange={(e) => setPermanentAddress(e.target.value)}
                    placeholder="Permanent domicile address"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <FormField label="Emergency Contact (Name & Relationship)" required helperText="e.g. John Mitchell (Father)">
                  <Input
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="John Mitchell (Father)"
                    required
                  />
                </FormField>

                <FormField label="Emergency Contact Phone" required>
                  <Input
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="+91 91234 56789"
                    required
                  />
                </FormField>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-slate-100 bg-slate-50/50">
              <Button type="submit" leftIcon={<Save className="w-4 h-4" />}>
                Save Personal Info Changes
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* TAB CONTENT: 2. JOB & ORGANIZATIONAL DETAILS */}
      {activeTab === 'Job' && (
        <Card className="shadow-xs border border-slate-200 animate-in fade-in">
          <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>Job Placement & Organizational Details</span>
            </CardTitle>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
              <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED HR PARAMETERS
            </span>
          </CardHeader>
          <CardContent className="pt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Department</span>
              <p className="font-bold text-slate-900 text-sm">{deptObj?.name || 'Engineering'}</p>
              <p className="text-[10px] text-slate-500">Business Unit</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Designation</span>
              <p className="font-bold text-slate-900 text-sm">{desigObj?.name || 'Senior Software Engineer'}</p>
              <p className="text-[10px] text-slate-500">Official Job Role</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Employee ID</span>
              <p className="font-mono font-bold text-indigo-600 text-sm">{myEmployee?.employeeId || 'EMP-1001'}</p>
              <p className="text-[10px] text-slate-500">Organizational Code</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Employment Type</span>
              <p className="font-bold text-slate-900 text-sm">{myEmployee?.employmentType || 'Full Time'}</p>
              <p className="text-[10px] text-slate-500">Contract Class</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Date of Joining</span>
              <p className="font-bold text-slate-900 text-sm">
                {myEmployee?.joiningDate ? new Date(myEmployee.joiningDate).toLocaleDateString() : '15 Jan 2023'}
              </p>
              <p className="text-[10px] text-slate-500">Tenure Start</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Confirmation Date</span>
              <p className="font-bold text-slate-900 text-sm">
                {myEmployee?.confirmationDate
                  ? new Date(myEmployee.confirmationDate).toLocaleDateString()
                  : '15 Jul 2023'}
              </p>
              <p className="text-[10px] text-slate-500">Probation Passed</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Office Location</span>
              <p className="font-bold text-slate-900 text-sm">
                {myEmployee?.workLocation || regionObj?.name || 'Bangalore, India'}
              </p>
              <p className="text-[10px] text-slate-500">Primary Workplace</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Reporting Supervisor</span>
              <p className="font-bold text-slate-900 text-sm">{managerObj?.name || 'Michael Brown (VP Engineering)'}</p>
              <p className="text-[10px] text-slate-500">Direct Manager</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Assigned Team / Pod</span>
              <p className="font-bold text-indigo-700 text-sm">{myEmployee?.teamName || 'Backend Team'}</p>
              <p className="text-[10px] text-slate-500">Operational Unit</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB CONTENT: 3. COMPENSATION & PAYROLL (CONFIDENTIAL VIEW OWN) */}
      {activeTab === 'Compensation' && (
        <Card className="shadow-xs border border-slate-200 animate-in fade-in">
          <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>My Annual Compensation & Payroll Details</span>
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Confidential individual payroll ledger for <strong>{myEmployee?.name || currentUser.name}</strong>.
              </p>
            </div>
            <Badge variant="emerald" size="sm">
              RESTRICTED TO YOU
            </Badge>
          </CardHeader>

          <CardContent className="pt-5 space-y-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                <span className="text-indigo-600 font-bold block text-[11px] uppercase">Total CTC (Annual)</span>
                <p className="text-2xl font-extrabold text-indigo-950 mt-1">{myEmployee?.ctcAnnual || '₹18,00,000'}</p>
                <span className="text-[10px] text-indigo-600 font-medium">Gross Annual Package</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[11px] uppercase">Basic Salary</span>
                <p className="text-lg font-bold text-slate-900 mt-1">{myEmployee?.basicSalary || '₹9,00,000'}</p>
                <span className="text-[10px] text-slate-500">Fixed Base</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[11px] uppercase">Variable Pay</span>
                <p className="text-lg font-bold text-slate-900 mt-1">{myEmployee?.variablePay || '₹2,00,000'}</p>
                <span className="text-[10px] text-slate-500">Performance bonus</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[11px] uppercase">Special Allowances</span>
                <p className="text-lg font-bold text-slate-900 mt-1">{myEmployee?.allowances || '₹7,00,000'}</p>
                <span className="text-[10px] text-slate-500">HRA, Medical & Travel</span>
              </div>
            </div>

            {/* Banking Details */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-slate-600" />
                <span>Direct Deposit & Banking Information</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Payment Mode</span>
                  <strong className="text-slate-900">{myEmployee?.paymentMode || 'Bank Transfer'}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Bank Name</span>
                  <strong className="text-slate-900">{myEmployee?.bankName || 'HDFC Bank'}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Bank Account Number</span>
                  <strong className="font-mono text-slate-900">{myEmployee?.bankAccountNumber || 'XXXX XXXX 1234'}</strong>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB CONTENT: 4. SKILLS & CAPABILITIES */}
      {activeTab === 'Skills' && (
        <Card className="shadow-xs border border-slate-200 animate-in fade-in">
          <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Skills & Technical Capabilities</span>
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Showcase your domain expertise and tools in the company directory.
              </p>
            </div>
            <Badge variant="indigo" size="sm">
              {skills.length} SKILLS
            </Badge>
          </CardHeader>

          <CardContent className="pt-5 space-y-5 text-xs">
            {/* Add Skill Input */}
            <div className="flex items-center gap-2 max-w-md">
              <Input
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Type a new skill (e.g. Docker, Python, GraphQL)..."
              />
              <Button type="button" onClick={handleAddSkill} variant="outline" size="sm">
                Add Skill
              </Button>
            </div>

            {/* Current Skills List */}
            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-indigo-50 text-indigo-700 font-semibold px-3 py-1.5 rounded-xl text-xs border border-indigo-100 flex items-center gap-2 shadow-2xs"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-indigo-400 hover:text-rose-600 font-bold cursor-pointer"
                    title="Remove skill"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </CardContent>

          <CardFooter className="flex justify-end border-t border-slate-100 bg-slate-50/50">
            <Button type="button" onClick={handleSaveProfile} leftIcon={<Save className="w-4 h-4" />}>
              Save Skill Set
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};
