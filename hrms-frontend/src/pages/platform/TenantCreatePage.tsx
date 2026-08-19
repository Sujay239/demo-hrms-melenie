import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Select } from '@/components/ui/Select';
import { toast } from '@/components/ui/Toast';
import { mockStorage } from '@/services/mock-storage';
import {
  ArrowLeft,
  Upload,
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
} from 'lucide-react';

export const TenantCreatePage: React.FC = () => {
  const navigate = useNavigate();

  // Core Identity
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [logoUrl, setLogoUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [industry, setIndustry] = useState('Software & Cloud Technology');

  // Policy & Operational Parameters
  const [offerLetterExpiryDays, setOfferLetterExpiryDays] = useState<number>(14);
  const [annualLeaveAllowance, setAnnualLeaveAllowance] = useState<number>(24);
  const [currency, setCurrency] = useState('USD ($)');
  const [countryCode, setCountryCode] = useState('US');
  const [timezone, setTimezone] = useState('America/New_York (EST)');
  const [workWeekDays, setWorkWeekDays] = useState<number>(5);
  const [dailyWorkingHours, setDailyWorkingHours] = useState<number>(8);
  const [probationPeriodDays, setProbationPeriodDays] = useState<number>(90);
  const [noticePeriodDays, setNoticePeriodDays] = useState<number>(30);

  const [isLoading, setIsLoading] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto generate clean slug
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setSlug(generatedSlug);
    if (!adminEmail || adminEmail.includes('@')) {
      setAdminEmail(`hr@${generatedSlug || 'company'}.com`);
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
        setLogoUrl(reader.result as string);
        toast.success('Company logo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.error('Company Full Name and Domain Slug are required');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const newTenant = mockStorage.addTenant({
        name,
        slug,
        status,
        logoUrl: logoUrl || undefined,
        defaultRegionId: 'region-acme-us',
        offerLetterExpiryDays: Number(offerLetterExpiryDays) || 14,
        annualLeaveAllowance: Number(annualLeaveAllowance) || 24,
        industry,
        countryCode,
        currency: currency.split(' ')[0],
        workWeekDays: Number(workWeekDays) || 5,
        dailyWorkingHours: Number(dailyWorkingHours) || 8,
        probationPeriodDays: Number(probationPeriodDays) || 90,
        noticePeriodDays: Number(noticePeriodDays) || 30,
        timezone,
        adminEmail: adminEmail || `hr@${slug}.com`,
        websiteUrl: websiteUrl || `https://${slug}.com`,
      });

      toast.success(`🎉 Company "${newTenant.name}" provisioned successfully with all policies configured!`);
      navigate(`/admin/tenants/${newTenant.id}`);
    }, 400);
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200 pb-12">
      <div>
        <Link
          to="/admin/tenants"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Company Directory
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Provision New Company / Tenant
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Configure organization identity, custom domain slug, offer validity rules, leave policies, and working parameters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: IDENTITY & BRANDING */}
        <Card className="shadow-xs border border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span>1. Company Identity & Custom Domain</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="1. Company Full Name" required helperText="Official registered legal entity name">
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Acme Corporation, Global BioTech Ltd"
                  required
                />
              </FormField>

              <FormField
                label="2. Company Slug (System URL)"
                required
                helperText={`Dedicated URL: cyrcalur.hr/${slug || 'company-slug'}`}
              >
                <Input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. acme-corp"
                  required
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Primary Industry / Sector">
                <Select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
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

              <FormField label="Tenant Initial Status" required>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                  options={[
                    { value: 'ACTIVE', label: 'ACTIVE — Portal access live' },
                    { value: 'INACTIVE', label: 'INACTIVE — Suspended / Setup mode' },
                  ]}
                />
              </FormField>

              <FormField label="Official Website URL">
                <Input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://acme-corp.com"
                />
              </FormField>
            </div>

            {/* Mandated Logo Surface: White background logo preview */}
            <FormField
              label="3. Company Logo (Mandated White Surface)"
              helperText="Upload official company insignia (PNG, JPG, SVG up to 3MB). Renders on a clean white badge."
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
                {/* White surface preview */}
                <div className="w-28 h-20 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-2 shadow-xs shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="text-center text-slate-300">
                      <Building2 className="w-7 h-7 mx-auto stroke-1" />
                      <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">White Surface</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs">
                    <Upload className="w-4 h-4 text-slate-500" />
                    Upload Company Logo
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="text-xs text-rose-600 hover:underline block cursor-pointer"
                    >
                      Remove logo
                    </button>
                  )}
                </div>
              </div>
            </FormField>
          </CardContent>
        </Card>

        {/* SECTION 2: HR & ONBOARDING POLICY CONFIGURATION */}
        <Card className="shadow-xs border border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>2. Offer Letter & Leave Policy Parameters</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="4. Offer Letter Expiration Period (Days)"
                required
                helperText="Number of calendar days before an unaccepted candidate offer letter lapses"
              >
                <div className="relative">
                  <Input
                    type="number"
                    min="1"
                    max="90"
                    value={offerLetterExpiryDays}
                    onChange={(e) => setOfferLetterExpiryDays(Number(e.target.value))}
                    placeholder="14"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold pointer-events-none">
                    Days
                  </span>
                </div>
              </FormField>

              <FormField
                label="5. Total Annual Leave Allowance"
                required
                helperText="Total standard Paid Time Off (PTO) credits allocated annually per employee"
              >
                <div className="relative">
                  <Input
                    type="number"
                    min="5"
                    max="60"
                    value={annualLeaveAllowance}
                    onChange={(e) => setAnnualLeaveAllowance(Number(e.target.value))}
                    placeholder="24"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold pointer-events-none">
                    Days / Year
                  </span>
                </div>
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Probation Period Duration"
                helperText="Standard employee onboarding evaluation window"
              >
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="365"
                    value={probationPeriodDays}
                    onChange={(e) => setProbationPeriodDays(Number(e.target.value))}
                    placeholder="90"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold pointer-events-none">
                    Days (3 Months)
                  </span>
                </div>
              </FormField>

              <FormField
                label="Standard Notice Period"
                helperText="Resignation or separation notice duration"
              >
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="180"
                    value={noticePeriodDays}
                    onChange={(e) => setNoticePeriodDays(Number(e.target.value))}
                    placeholder="30"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold pointer-events-none">
                    Days (1 Month)
                  </span>
                </div>
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 3: WORK HOURS, REGION & LOCALIZATION */}
        <Card className="shadow-xs border border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span>3. Working Schedule & Localization Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <FormField label="Work Week Schedule">
                <Select
                  value={String(workWeekDays)}
                  onChange={(e) => setWorkWeekDays(Number(e.target.value))}
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
                  value={String(dailyWorkingHours)}
                  onChange={(e) => setDailyWorkingHours(Number(e.target.value))}
                  options={[
                    { value: '8', label: '8.0 Hours / Day' },
                    { value: '7.5', label: '7.5 Hours / Day' },
                    { value: '8.5', label: '8.5 Hours / Day' },
                    { value: '9', label: '9.0 Hours / Day' },
                  ]}
                />
              </FormField>

              <FormField label="Default Currency">
                <Select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  options={[
                    { value: 'USD ($)', label: 'USD ($) — US Dollar' },
                    { value: 'EUR (€)', label: 'EUR (€) — Euro' },
                    { value: 'GBP (£)', label: 'GBP (£) — British Pound' },
                    { value: 'SGD (S$)', label: 'SGD (S$) — Singapore Dollar' },
                    { value: 'INR (₹)', label: 'INR (₹) — Indian Rupee' },
                    { value: 'CAD (C$)', label: 'CAD (C$) — Canadian Dollar' },
                    { value: 'AUD (A$)', label: 'AUD (A$) — Australian Dollar' },
                  ]}
                />
              </FormField>

              <FormField label="Primary Timezone">
                <Select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  options={[
                    { value: 'America/New_York (EST)', label: 'America/New_York (EST)' },
                    { value: 'America/Los_Angeles (PST)', label: 'America/Los_Angeles (PST)' },
                    { value: 'America/Chicago (CST)', label: 'America/Chicago (CST)' },
                    { value: 'Europe/London (GMT)', label: 'Europe/London (GMT)' },
                    { value: 'Europe/Berlin (CET)', label: 'Europe/Berlin (CET)' },
                    { value: 'Asia/Singapore (SGT)', label: 'Asia/Singapore (SGT)' },
                    { value: 'Asia/Kolkata (IST)', label: 'Asia/Kolkata (IST)' },
                    { value: 'Asia/Tokyo (JST)', label: 'Asia/Tokyo (JST)' },
                    { value: 'Australia/Sydney (AEST)', label: 'Australia/Sydney (AEST)' },
                  ]}
                />
              </FormField>
            </div>

            <FormField label="Admin / HR Operations Contact Email" helperText="Default point of contact for escalations & new hire onboarding notices">
              <Input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="hr@company.com"
              />
            </FormField>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border-t border-slate-200 p-4 rounded-b-xl">
            <p className="text-xs text-slate-500">
              New tenant will be immediately accessible via <strong className="text-indigo-600 font-mono">cyrcalur.hr/{slug || 'slug'}</strong>
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <Button variant="outline" onClick={() => navigate('/admin/tenants')}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading} className="bg-indigo-600 hover:bg-indigo-700 font-bold px-6">
                Provision Company & Initialize
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
