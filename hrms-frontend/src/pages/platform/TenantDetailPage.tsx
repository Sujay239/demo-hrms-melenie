import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Select } from '@/components/ui/Select';
import { toast } from '@/components/ui/Toast';
import { mockStorage } from '@/services/mock-storage';
import { Tenant, TenantFeatures } from '@/demo-data/seedData';
import { Switch } from '@/components/ui/Switch';
import {
  ArrowLeft,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  Ban,
  Building2,
  Calendar,
  Clock,
  Globe,
  Mail,
  ShieldCheck,
  FileText,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles,
  Edit3,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  Users,
  Megaphone,
  Ticket,
  DoorOpen,
  BookOpen,
  Check,
  X,
  Upload,
  RotateCcw,
} from 'lucide-react';

export const TenantDetailPage: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();

  const [tenants, setTenants] = useState<Tenant[]>(() => mockStorage.getTenants());
  const tenant = tenants.find((t) => t.id === tenantId) || null;

  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'DEACTIVATED'>(
    tenant?.status || 'ACTIVE'
  );

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(tenant?.name || '');
  const [editSlug, setEditSlug] = useState(tenant?.slug || '');
  const [editLogoUrl, setEditLogoUrl] = useState(tenant?.logoUrl || '');
  const [editIndustry, setEditIndustry] = useState(tenant?.industry || 'Software & Cloud Technology');
  const [editAdminEmail, setEditAdminEmail] = useState(tenant?.adminEmail || '');
  const [editWebsiteUrl, setEditWebsiteUrl] = useState(tenant?.websiteUrl || '');
  const [editOfferExpiry, setEditOfferExpiry] = useState<number>(tenant?.offerLetterExpiryDays || 14);
  const [editLeaveAllowance, setEditLeaveAllowance] = useState<number>(tenant?.annualLeaveAllowance || 24);
  const [editProbationDays, setEditProbationDays] = useState<number>(tenant?.probationPeriodDays || 90);
  const [editNoticeDays, setEditNoticeDays] = useState<number>(tenant?.noticePeriodDays || 30);
  const [editWorkWeek, setEditWorkWeek] = useState<number>(tenant?.workWeekDays || 5);
  const [editDailyHours, setEditDailyHours] = useState<number>(tenant?.dailyWorkingHours || 8);
  const [editCurrency, setEditCurrency] = useState(tenant?.currency || 'USD');
  const [editTimezone, setEditTimezone] = useState(tenant?.timezone || 'America/New_York (EST)');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Feature Flags State
  const currentFeatures: TenantFeatures = tenant?.features || {
    onboarding: true,
    leaveManagement: true,
    attendance: true,
    knowledgeBase: true,
    announcements: true,
    helpDesk: true,
    meetingRooms: true,
    documentVault: true,
    orgStructure: true,
  };

  const [features, setFeatures] = useState<TenantFeatures>(currentFeatures);

  if (!tenant) {
    return (
      <div className="p-8 text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Tenant / Company Not Found</h3>
        <p className="text-sm text-slate-500">The requested company ID does not exist in directory.</p>
        <Button onClick={() => navigate('/admin/tenants')}>Back to Company Directory</Button>
      </div>
    );
  }

  const reloadTenant = () => {
    const updated = mockStorage.getTenants();
    setTenants(updated);
  };

  const handleStatusChange = (newStatus: 'ACTIVE' | 'DEACTIVATED') => {
    mockStorage.updateTenant(tenant.id, { status: newStatus });
    setStatus(newStatus);
    reloadTenant();
    toast.success(`Company portal status updated to ${newStatus}`);
  };

  const handleToggleFeature = (featureKey: keyof TenantFeatures, currentVal: boolean = true) => {
    const newVal = !currentVal;
    const updatedFeats = {
      ...features,
      [featureKey]: newVal,
    };
    setFeatures(updatedFeats);

    mockStorage.updateTenant(tenant.id, { features: updatedFeats });
    reloadTenant();

    if (newVal) {
      toast.success(`Feature enabled for ${tenant.name}`);
    } else {
      toast.error(`Feature disabled for ${tenant.name}`);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error('File size exceeds 3MB limit');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditLogoUrl(reader.result as string);
        toast.success('New company logo loaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCompanyEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName || !editSlug) {
      toast.error('Company Name and Slug are required');
      return;
    }

    setIsSavingEdit(true);
    setTimeout(() => {
      mockStorage.updateTenant(tenant.id, {
        name: editName,
        slug: editSlug,
        logoUrl: editLogoUrl || undefined,
        industry: editIndustry,
        adminEmail: editAdminEmail,
        websiteUrl: editWebsiteUrl,
        offerLetterExpiryDays: Number(editOfferExpiry) || 14,
        annualLeaveAllowance: Number(editLeaveAllowance) || 24,
        probationPeriodDays: Number(editProbationDays) || 90,
        noticePeriodDays: Number(editNoticeDays) || 30,
        workWeekDays: Number(editWorkWeek) || 5,
        dailyWorkingHours: Number(editDailyHours) || 8,
        currency: editCurrency,
        timezone: editTimezone,
      });

      setIsSavingEdit(false);
      setIsEditModalOpen(false);
      reloadTenant();
      toast.success(`🎉 Company "${editName}" details updated successfully!`);
    }, 300);
  };

  const featureConfigs = [
    {
      key: 'onboarding' as keyof TenantFeatures,
      title: 'New Hire Onboarding & Checklist',
      desc: 'Allows new hires to fill details, e-sign offer letter on digital pad, upload docs, and sign policies.',
      icon: UserPlus,
      color: 'indigo',
    },
    {
      key: 'leaveManagement' as keyof TenantFeatures,
      title: 'Leave & PTO Management',
      desc: 'Leave balance accounts, PTO applications, approvals workflow, and official holiday calendars.',
      icon: Calendar,
      color: 'amber',
    },
    {
      key: 'attendance' as keyof TenantFeatures,
      title: 'Time & Attendance Tracking',
      desc: 'Real-time clock-in / clock-out tracking, timesheets, and overtime approval workflows.',
      icon: Clock,
      color: 'emerald',
    },
    {
      key: 'knowledgeBase' as keyof TenantFeatures,
      title: 'Company Knowledge Base',
      desc: 'Internal documentation, handbook policies, and department standard operating procedures.',
      icon: BookOpen,
      color: 'sky',
    },
    {
      key: 'announcements' as keyof TenantFeatures,
      title: 'Announcements & Broadcasts',
      desc: 'Company-wide bulletin boards, town hall notices, and urgent workplace alerts.',
      icon: Megaphone,
      color: 'rose',
    },
    {
      key: 'helpDesk' as keyof TenantFeatures,
      title: 'Help Desk & IT Support Tickets',
      desc: 'Internal service desk for IT equipment requests, HR questions, and facility issues.',
      icon: Ticket,
      color: 'violet',
    },
    {
      key: 'meetingRooms' as keyof TenantFeatures,
      title: 'Meeting Room Reservations',
      desc: 'Conference room calendar scheduling, focus pod booking, and occupancy management.',
      icon: DoorOpen,
      color: 'teal',
    },
    {
      key: 'documentVault' as keyof TenantFeatures,
      title: 'Company Document Vault',
      desc: 'Official company repository for policy PDFs, templates, and employee uploaded files.',
      icon: FileText,
      color: 'blue',
    },
    {
      key: 'orgStructure' as keyof TenantFeatures,
      title: 'Organizational Structure (Depts & Roles)',
      desc: 'Management of Regions, Departments, Designations, and reporting relationships.',
      icon: Building2,
      color: 'purple',
    },
  ];

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200 pb-12">
      {/* Top Header & Breadcrumbs */}
      <div>
        <Link
          to="/admin/tenants"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Company Directory
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Logo on white surface */}
            <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1.5 shadow-xs flex items-center justify-center shrink-0">
              {tenant.logoUrl ? (
                <img src={tenant.logoUrl} alt={tenant.name} className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-indigo-600 rounded-lg text-white font-bold text-lg flex items-center justify-center">
                  {tenant.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900">{tenant.name}</h2>
                <Badge status={status} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-semibold">
                  cyrcalur.hr/{tenant.slug}
                </span>
                <span>•</span>
                <span>{tenant.industry || 'Software & Cloud Technology'}</span>
                <span>•</span>
                <span>{tenant.employeeCount || 12} Employees</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditName(tenant.name);
                setEditSlug(tenant.slug);
                setEditLogoUrl(tenant.logoUrl || '');
                setEditIndustry(tenant.industry || 'Software & Cloud Technology');
                setEditAdminEmail(tenant.adminEmail || '');
                setEditWebsiteUrl(tenant.websiteUrl || '');
                setEditOfferExpiry(tenant.offerLetterExpiryDays || 14);
                setEditLeaveAllowance(tenant.annualLeaveAllowance || 24);
                setEditProbationDays(tenant.probationPeriodDays || 90);
                setEditNoticeDays(tenant.noticePeriodDays || 30);
                setEditWorkWeek(tenant.workWeekDays || 5);
                setEditDailyHours(tenant.dailyWorkingHours || 8);
                setEditCurrency(tenant.currency || 'USD');
                setEditTimezone(tenant.timezone || 'America/New_York (EST)');
                setIsEditModalOpen(true);
              }}
              leftIcon={<Edit3 className="w-3.5 h-3.5 text-indigo-600" />}
              className="font-semibold"
            >
              Edit Company Details
            </Button>

            <Link
              to={`/${tenant.slug}/dashboard`}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-xs"
            >
              Visit Portal <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns Left (Details & Feature Flags), 1 Column Right (Status & Summary) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
        <div className="xl:col-span-8 space-y-6">
          {/* ============================================================ */}
          {/* SECTION 1: SUPER ADMIN PER-COMPANY FEATURE TOGGLES          */}
          {/* ============================================================ */}
          <Card className="shadow-xs border border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <span>Super Admin Feature Flags & Module Toggles</span>
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enable or disable operational software modules specifically for <strong>{tenant.name}</strong>.
                </p>
              </div>
              <Badge variant="indigo" size="sm">
                SUPER ADMIN SCOPE
              </Badge>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {featureConfigs.map((feat) => {
                const Icon = feat.icon;
                const isEnabled = features[feat.key] !== false;

                return (
                  <div
                    key={feat.key}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                      isEnabled
                        ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                        : 'bg-slate-50 border-slate-200/60 opacity-80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                          isEnabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold ${isEnabled ? 'text-slate-900' : 'text-slate-500'}`}>
                          {feat.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>

                    {/* iOS-Style Toggle Switch */}
                    <div className="self-end shrink-0 pt-1">
                      <Switch
                        checked={isEnabled}
                        onChange={() => handleToggleFeature(feat.key, isEnabled)}
                        label={isEnabled ? 'Active' : 'Disabled'}
                        size="md"
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* SECTION 2: POLICIES & PARAMETERS OVERVIEW */}
          <Card className="shadow-xs border border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" /> Company Parameters & HR Policies
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-indigo-600 hover:bg-indigo-50"
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit Parameters
              </Button>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[11px]">Offer Expiration</span>
                <span className="font-bold text-slate-900 text-base mt-1 block font-mono">
                  {tenant.offerLetterExpiryDays || 14} Days
                </span>
                <span className="text-[10px] text-slate-500">Lapse window</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[11px]">Annual PTO Leaves</span>
                <span className="font-bold text-emerald-700 text-base mt-1 block font-mono">
                  {tenant.annualLeaveAllowance || 24} Days
                </span>
                <span className="text-[10px] text-slate-500">Per employee / yr</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[11px]">Probation Period</span>
                <span className="font-bold text-slate-900 text-base mt-1 block font-mono">
                  {tenant.probationPeriodDays || 90} Days
                </span>
                <span className="text-[10px] text-slate-500">Evaluation window</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[11px]">Notice Period</span>
                <span className="font-bold text-slate-900 text-base mt-1 block font-mono">
                  {tenant.noticePeriodDays || 30} Days
                </span>
                <span className="text-[10px] text-slate-500">Separation timeline</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 col-span-2">
                <span className="text-slate-400 font-semibold block text-[11px]">Working Schedule</span>
                <span className="font-bold text-slate-900 text-sm mt-1 block">
                  {tenant.workWeekDays || 5} Days / Week • {tenant.dailyWorkingHours || 8} Hours / Day
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 col-span-2">
                <span className="text-slate-400 font-semibold block text-[11px]">Currency & Timezone</span>
                <span className="font-bold text-slate-900 text-sm mt-1 block">
                  {tenant.currency || 'USD'} • {tenant.timezone || 'America/New_York (EST)'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Lifecycle Actions & Meta */}
        <div className="xl:col-span-4 space-y-6">
          <Card className="shadow-xs border border-slate-200 space-y-4">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-bold">Portal Lifecycle Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Access Status:</span>
                <Badge status={status} />
              </div>

              {status === 'ACTIVE' ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Company portal is active. Deactivating will block normal access for employees and admins.
                  </p>
                  <Button
                    variant="destructive"
                    className="w-full text-xs font-semibold"
                    leftIcon={<Ban className="w-4 h-4" />}
                    onClick={() => handleStatusChange('DEACTIVATED')}
                  >
                    Deactivate Company Portal
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Company portal is currently suspended. Activate to restore employee access.
                  </p>
                  <Button
                    variant="primary"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold"
                    leftIcon={<CheckCircle className="w-4 h-4" />}
                    onClick={() => handleStatusChange('ACTIVE')}
                  >
                    Activate Company Portal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Organization Meta */}
          <Card className="shadow-xs border border-slate-200 p-4 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Company Information
            </h4>
            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">Tenant ID:</span>
                <span className="font-mono text-slate-900 font-bold">{tenant.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">Domain URL:</span>
                <span className="font-mono text-indigo-600 font-semibold">/{tenant.slug}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">Admin Email:</span>
                <span className="font-semibold text-slate-900">{tenant.adminEmail || `hr@${tenant.slug}.com`}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">Website:</span>
                <a
                  href={tenant.websiteUrl || `https://${tenant.slug}.com`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  Visit <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-slate-400">Created:</span>
                <span className="text-slate-800">{new Date(tenant.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ============================================================ */}
      {/* EDIT COMPANY DETAILS MODAL                                   */}
      {/* ============================================================ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <Card className="max-w-2xl w-full p-6 space-y-5 bg-white shadow-2xl rounded-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-lg text-slate-900">Edit Company Details</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCompanyEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Company Full Name" required>
                  <Input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </FormField>

                <FormField label="Domain Slug (URL)" required helperText={`cyrcalur.hr/${editSlug}`}>
                  <Input
                    type="text"
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    required
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Industry / Sector">
                  <Select
                    value={editIndustry}
                    onChange={(e) => setEditIndustry(e.target.value)}
                    options={[
                      { value: 'Software & Cloud Technology', label: 'Software & Cloud Technology' },
                      { value: 'Financial Services & Fintech', label: 'Financial Services & Fintech' },
                      { value: 'Healthcare & Biotechnology', label: 'Healthcare & Biotechnology' },
                      { value: 'Manufacturing & Heavy Industry', label: 'Manufacturing & Heavy Industry' },
                      { value: 'Supply Chain & Global Logistics', label: 'Supply Chain & Global Logistics' },
                      { value: 'Consulting & Professional Services', label: 'Consulting & Professional Services' },
                      { value: 'E-Commerce & Retail', label: 'E-Commerce & Retail' },
                    ]}
                  />
                </FormField>

                <FormField label="HR / Admin Contact Email">
                  <Input
                    type="email"
                    value={editAdminEmail}
                    onChange={(e) => setEditAdminEmail(e.target.value)}
                    placeholder="hr@company.com"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Offer Letter Expiry (Days)" required>
                  <Input
                    type="number"
                    min="1"
                    max="90"
                    value={editOfferExpiry}
                    onChange={(e) => setEditOfferExpiry(Number(e.target.value))}
                    required
                  />
                </FormField>

                <FormField label="Annual PTO Leave Allowance (Days)" required>
                  <Input
                    type="number"
                    min="5"
                    max="60"
                    value={editLeaveAllowance}
                    onChange={(e) => setEditLeaveAllowance(Number(e.target.value))}
                    required
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Probation Period (Days)">
                  <Input
                    type="number"
                    min="0"
                    max="365"
                    value={editProbationDays}
                    onChange={(e) => setEditProbationDays(Number(e.target.value))}
                  />
                </FormField>

                <FormField label="Standard Notice Period (Days)">
                  <Input
                    type="number"
                    min="0"
                    max="180"
                    value={editNoticeDays}
                    onChange={(e) => setEditNoticeDays(Number(e.target.value))}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Work Week Days">
                  <Select
                    value={String(editWorkWeek)}
                    onChange={(e) => setEditWorkWeek(Number(e.target.value))}
                    options={[
                      { value: '5', label: '5 Days (Mon - Fri)' },
                      { value: '5.5', label: '5.5 Days (Mon - Sat Half)' },
                      { value: '6', label: '6 Days (Mon - Sat)' },
                      { value: '4', label: '4 Days (Mon - Thu)' },
                    ]}
                  />
                </FormField>

                <FormField label="Daily Working Hours">
                  <Select
                    value={String(editDailyHours)}
                    onChange={(e) => setEditDailyHours(Number(e.target.value))}
                    options={[
                      { value: '8', label: '8.0 Hours / Day' },
                      { value: '7.5', label: '7.5 Hours / Day' },
                      { value: '8.5', label: '8.5 Hours / Day' },
                      { value: '9', label: '9.0 Hours / Day' },
                    ]}
                  />
                </FormField>
              </div>

              {/* Logo Upload */}
              <FormField label="Company Logo (Mandated White Surface)">
                <div className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="w-20 h-14 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1 shadow-xs shrink-0">
                    {editLogoUrl ? (
                      <img src={editLogoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <Building2 className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-slate-500" /> Change Logo
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                    {editLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setEditLogoUrl('')}
                        className="text-xs text-rose-600 hover:underline block"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </FormField>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSavingEdit} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
