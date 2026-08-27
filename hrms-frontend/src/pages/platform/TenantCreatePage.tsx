import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import { mockStorage } from "@/services/mock-storage";
import { useFormDraft } from "@/hooks/useFormDraft";
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
  Key,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Plus,
} from "lucide-react";

export const TenantCreatePage: React.FC = () => {
  const navigate = useNavigate();

  // Core Identity
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [logoUrl, setLogoUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [industry, setIndustry] = useState("Software & Cloud Technology");
  const [isCustomIndustry, setIsCustomIndustry] = useState(false);
  const [customIndustryText, setCustomIndustryText] = useState("");
  const [industryOptions, setIndustryOptions] = useState<string[]>([
    "Software & Cloud Technology",
    "Financial Services & Fintech",
    "Healthcare & Biotechnology",
    "Manufacturing & Heavy Industry",
    "Supply Chain & Global Logistics",
    "Consulting & Professional Services",
    "E-Commerce & Retail",
    "Education & EdTech",
    "Real Estate & Construction",
    "Hospitality & Tourism",
    "Media & Entertainment",
    "Energy & Utilities",
  ]);

  // Policy & Operational Parameters
  const [offerLetterExpiryDays, setOfferLetterExpiryDays] =
    useState<number>(14);
  const [annualLeaveAllowance, setAnnualLeaveAllowance] = useState<number>(24);
  const [currency, setCurrency] = useState("USD ($)");
  const [countryCode, setCountryCode] = useState("US");
  const [timezone, setTimezone] = useState("America/New_York (EST)");
  const [workWeekDays, setWorkWeekDays] = useState<number>(5);
  const [dailyWorkingHours, setDailyWorkingHours] = useState<number>(8);
  const [probationPeriodDays, setProbationPeriodDays] = useState<number>(90);
  const [noticePeriodDays, setNoticePeriodDays] = useState<number>(30);

  const [isLoading, setIsLoading] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  useEffect(() => {
    const saved = mockStorage.getFormDraft<any>('create_tenant');
    if (saved?.data && (saved.data.name || saved.data.adminEmail || saved.data.websiteUrl)) {
      const d = saved.data;
      if (d.name) setName(d.name);
      if (d.slug) setSlug(d.slug);
      if (d.status) setStatus(d.status);
      if (d.logoUrl) setLogoUrl(d.logoUrl);
      if (d.websiteUrl) setWebsiteUrl(d.websiteUrl);
      if (d.adminEmail) setAdminEmail(d.adminEmail);
      if (d.adminPassword) setAdminPassword(d.adminPassword);
      if (d.industry) setIndustry(d.industry);
      if (d.isCustomIndustry !== undefined) setIsCustomIndustry(d.isCustomIndustry);
      if (d.customIndustryText) setCustomIndustryText(d.customIndustryText);
      if (d.offerLetterExpiryDays) setOfferLetterExpiryDays(d.offerLetterExpiryDays);
      if (d.annualLeaveAllowance) setAnnualLeaveAllowance(d.annualLeaveAllowance);
      if (d.currency) setCurrency(d.currency);
      if (d.countryCode) setCountryCode(d.countryCode);
      if (d.timezone) setTimezone(d.timezone);
      if (d.workWeekDays) setWorkWeekDays(d.workWeekDays);
      if (d.dailyWorkingHours) setDailyWorkingHours(d.dailyWorkingHours);
      if (d.probationPeriodDays) setProbationPeriodDays(d.probationPeriodDays);
      if (d.noticePeriodDays) setNoticePeriodDays(d.noticePeriodDays);

      setHasRestoredDraft(true);
      toast.info('⚡ Restored unsaved company creation draft!');
    }
  }, []);

  // Success Modal State for Displaying Generated Credentials
  const [createdTenantData, setCreatedTenantData] = useState<{
    tenantName: string;
    slug: string;
    adminEmail: string;
    password: string;
    portalUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const tenantDraftData = {
    name,
    slug,
    status,
    logoUrl,
    websiteUrl,
    adminEmail,
    adminPassword,
    industry,
    isCustomIndustry,
    customIndustryText,
    offerLetterExpiryDays,
    annualLeaveAllowance,
    currency,
    countryCode,
    timezone,
    workWeekDays,
    dailyWorkingHours,
    probationPeriodDays,
    noticePeriodDays,
  };

  const { clearDraft: clearTenantDraft } = useFormDraft({
    draftKey: 'create_tenant',
    data: tenantDraftData,
    enabled: !createdTenantData,
  });

  const handleClearTenantDraft = () => {
    clearTenantDraft();
    setName('');
    setSlug('');
    setStatus('ACTIVE');
    setLogoUrl('');
    setWebsiteUrl('');
    setAdminEmail('');
    setAdminPassword('');
    setIndustry('Software & Cloud Technology');
    setIsCustomIndustry(false);
    setCustomIndustryText('');
    setOfferLetterExpiryDays(14);
    setAnnualLeaveAllowance(24);
    setCurrency('USD ($)');
    setCountryCode('US');
    setTimezone('America/New_York (EST)');
    setWorkWeekDays(5);
    setDailyWorkingHours(8);
    setProbationPeriodDays(90);
    setNoticePeriodDays(30);
    setHasRestoredDraft(false);
    toast.success('Company draft cleared.');
  };

  const generateSecurePassword = (companySlug: string) => {
    const prefix = companySlug
      ? companySlug.charAt(0).toUpperCase() + companySlug.slice(1, 4)
      : "Admin";
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const symbols = ["!", "@", "#", "$"];
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    return `${prefix}${sym}${randNum}`;
  };

  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(generatedSlug);
    if (!adminEmail || adminEmail.includes("@")) {
      setAdminEmail(`admin@${generatedSlug || "company"}.com`);
    }
    if (!adminPassword) {
      setAdminPassword(generateSecurePassword(generatedSlug));
    }
  };

  const handleRegeneratePassword = () => {
    const pwd = generateSecurePassword(slug);
    setAdminPassword(pwd);
    toast.info("New random password generated!");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error("File size exceeds 3MB limit");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
        toast.success("Company logo uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast.error("Company Full Name and Domain Slug are required");
      return;
    }

    const finalAdminEmail = adminEmail.trim() || `admin@${slug}.com`;
    const finalAdminPassword =
      adminPassword.trim() || generateSecurePassword(slug);
    const finalIndustry =
      isCustomIndustry && customIndustryText.trim()
        ? customIndustryText.trim()
        : industry;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const { tenant, generatedPassword } = mockStorage.addTenant(
        {
          name: name.trim(),
          slug: slug.trim(),
          status,
          logoUrl: logoUrl || undefined,
          offerLetterExpiryDays: Number(offerLetterExpiryDays) || 14,
          annualLeaveAllowance: Number(annualLeaveAllowance) || 24,
          industry: finalIndustry,
          countryCode,
          currency: currency.split(" ")[0],
          workWeekDays: Number(workWeekDays) || 5,
          dailyWorkingHours: Number(dailyWorkingHours) || 8,
          probationPeriodDays: Number(probationPeriodDays) || 90,
          noticePeriodDays: Number(noticePeriodDays) || 30,
          timezone,
          adminEmail: finalAdminEmail,
          websiteUrl: websiteUrl || `https://${slug}.com`,
        },
        finalAdminPassword,
      );

      clearTenantDraft();
      setHasRestoredDraft(false);

      // Show credentials modal
      setCreatedTenantData({
        tenantName: tenant.name,
        slug: tenant.slug,
        adminEmail: finalAdminEmail,
        password: generatedPassword,
        portalUrl: `/${tenant.slug}/dashboard`,
      });

      toast.success(
        `🎉 Company "${tenant.name}" created successfully with admin credentials generated!`,
      );
    }, 300);
  };

  const handleCopyCredentials = () => {
    if (!createdTenantData) return;
    const text = `Company: ${createdTenantData.tenantName}\nPortal URL: ${window.location.origin}${createdTenantData.portalUrl}\nCompany Admin Email: ${createdTenantData.adminEmail}\nPassword: ${createdTenantData.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Company Admin credentials copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleLogoutAndLoginAsCompanyAdmin = () => {
    mockStorage.logout();
    navigate("/auth/login");
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
          Configure organization identity, dedicated domain slug, initial
          Company Admin credentials, and working policies.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {hasRestoredDraft && !createdTenantData && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2 text-amber-900 text-xs shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Draft Restored:</strong> Unsaved changes from your previous session were automatically loaded.
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearTenantDraft}
              className="px-2.5 py-1 text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-100/80 hover:bg-amber-200 rounded-lg border border-amber-300 transition-colors shrink-0 cursor-pointer"
            >
              Clear Draft
            </button>
          </div>
        )}

        {/* SECTION 1: IDENTITY & DOMAIN */}
        <Card className="shadow-xs border border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span>1. Company Identity & Custom URL</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Company Full Name"
                required
                helperText="Official registered legal company name"
              >
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Acme Corporation, Global Logistics Ltd"
                  required
                />
              </FormField>

              <FormField
                label="Company Slug (Auto-Generated Dedicated URL)"
                required
                helperText={`Portal link: Peopleworkplaces.hr/${slug || "company-slug"}`}
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
              <FormField
                label="Primary Industry / Sector"
                helperText={
                  isCustomIndustry
                    ? "Type your custom industry"
                    : "Choose from list or click + / Other"
                }
              >
                {isCustomIndustry ? (
                  <div className="flex gap-1.5">
                    <Input
                      type="text"
                      value={customIndustryText}
                      onChange={(e) => {
                        setCustomIndustryText(e.target.value);
                        setIndustry(e.target.value);
                      }}
                      placeholder="e.g. Aerospace, Robotics, Gaming"
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (customIndustryText.trim()) {
                          if (
                            !industryOptions.includes(customIndustryText.trim())
                          ) {
                            setIndustryOptions((prev) => [
                              ...prev,
                              customIndustryText.trim(),
                            ]);
                          }
                          setIndustry(customIndustryText.trim());
                        }
                        setIsCustomIndustry(false);
                      }}
                      className="shrink-0 text-xs"
                      title="Back to predefined list"
                    >
                      List
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-1.5">
                    <div className="flex-1">
                      <Select
                        value={industry}
                        onChange={(e) => {
                          if (e.target.value === "__OTHER__") {
                            setIsCustomIndustry(true);
                            setCustomIndustryText("");
                          } else {
                            setIndustry(e.target.value);
                          }
                        }}
                        options={[
                          ...industryOptions.map((opt) => ({
                            value: opt,
                            label: opt,
                          })),
                          {
                            value: "__OTHER__",
                            label: "➕ Other / Custom Industry (Type)...",
                          },
                        ]}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsCustomIndustry(true);
                        setCustomIndustryText("");
                      }}
                      className="shrink-0 text-xs font-semibold px-2.5"
                      title="Add Custom Industry"
                    >
                      <Plus className="w-4 h-4 text-indigo-600" />
                    </Button>
                  </div>
                )}
              </FormField>

              <FormField label="Tenant Status" required>
                <Select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "ACTIVE" | "INACTIVE")
                  }
                  options={[
                    { value: "ACTIVE", label: "ACTIVE — Portal access live" },
                    {
                      value: "INACTIVE",
                      label: "INACTIVE — Setup / Suspended mode",
                    },
                  ]}
                />
              </FormField>

              <FormField label="Official Website URL">
                <Input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://company.com"
                />
              </FormField>
            </div>

            {/* Logo Upload */}
            <FormField
              label="Company Logo"
              helperText="Upload official company insignia (PNG, JPG, SVG). Renders on a clean white badge."
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="w-28 h-20 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-2 shadow-xs shrink-0">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-300">
                      <Building2 className="w-7 h-7 mx-auto stroke-1" />
                      <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                        Logo Preview
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs">
                    <Upload className="w-4 h-4 text-slate-500" />
                    Upload Company Logo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl("")}
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

        {/* SECTION 2: COMPANY ADMIN CREDENTIALS */}
        <Card className="shadow-xs border border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>2. Company Admin Access & Credentials</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <p className="text-xs text-slate-500">
              The Company Admin will use these credentials to sign in to their
              dedicated company portal, manage employees, configure departments,
              holidays, rooms, and leave policies.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Company Admin Email"
                required
                helperText="Login identifier for the company's designated administrator"
              >
                <Input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@company.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />
              </FormField>

              <FormField
                label="Initial Admin Password (Auto-Generated)"
                required
                helperText="Secure random credential for initial Company Admin login"
              >
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter or generate password"
                    leftIcon={<Key className="w-4 h-4" />}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRegeneratePassword}
                    title="Generate New Random Password"
                    className="shrink-0 text-xs font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                    Regenerate
                  </Button>
                </div>
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 3: POLICIES & WORKING PARAMETERS */}
        <Card className="shadow-xs border border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>3. Working Schedule & Leave Policy Parameters</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <FormField label="Work Week Schedule">
                <Select
                  value={String(workWeekDays)}
                  onChange={(e) => setWorkWeekDays(Number(e.target.value))}
                  options={[
                    { value: "5", label: "5 Days (Mon - Fri)" },
                    { value: "5.5", label: "5.5 Days (Mon - Sat Half)" },
                    { value: "6", label: "6 Days (Mon - Sat)" },
                    { value: "4", label: "4 Days (Mon - Thu)" },
                  ]}
                />
              </FormField>

              <FormField label="Daily Working Hours">
                <Select
                  value={String(dailyWorkingHours)}
                  onChange={(e) => setDailyWorkingHours(Number(e.target.value))}
                  options={[
                    { value: "8", label: "8.0 Hours / Day" },
                    { value: "7.5", label: "7.5 Hours / Day" },
                    { value: "8.5", label: "8.5 Hours / Day" },
                    { value: "9", label: "9.0 Hours / Day" },
                  ]}
                />
              </FormField>

              <FormField label="Annual Leave Allowance (Days)">
                <Input
                  type="number"
                  min="5"
                  max="60"
                  value={annualLeaveAllowance}
                  onChange={(e) =>
                    setAnnualLeaveAllowance(Number(e.target.value))
                  }
                />
              </FormField>

              <FormField label="Offer Letter Expiration (Days)">
                <Input
                  type="number"
                  min="1"
                  max="90"
                  value={offerLetterExpiryDays}
                  onChange={(e) =>
                    setOfferLetterExpiryDays(Number(e.target.value))
                  }
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Default Currency">
                <Select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  options={[
                    { value: "USD ($)", label: "USD ($) — US Dollar" },
                    { value: "EUR (€)", label: "EUR (€) — Euro" },
                    { value: "GBP (£)", label: "GBP (£) — British Pound" },
                    { value: "SGD (S$)", label: "SGD (S$) — Singapore Dollar" },
                    { value: "INR (₹)", label: "INR (₹) — Indian Rupee" },
                    { value: "CAD (C$)", label: "CAD (C$) — Canadian Dollar" },
                    {
                      value: "AUD (A$)",
                      label: "AUD (A$) — Australian Dollar",
                    },
                  ]}
                />
              </FormField>

              <FormField label="Primary Timezone">
                <Select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  options={[
                    {
                      value: "America/New_York (EST)",
                      label: "America/New_York (EST)",
                    },
                    {
                      value: "America/Los_Angeles (PST)",
                      label: "America/Los_Angeles (PST)",
                    },
                    {
                      value: "Europe/London (GMT)",
                      label: "Europe/London (GMT)",
                    },
                    {
                      value: "Europe/Berlin (CET)",
                      label: "Europe/Berlin (CET)",
                    },
                    {
                      value: "Asia/Singapore (SGT)",
                      label: "Asia/Singapore (SGT)",
                    },
                    {
                      value: "Asia/Kolkata (IST)",
                      label: "Asia/Kolkata (IST)",
                    },
                    { value: "Asia/Tokyo (JST)", label: "Asia/Tokyo (JST)" },
                  ]}
                />
              </FormField>

              <FormField label="Probation Window (Days)">
                <Input
                  type="number"
                  min="0"
                  max="365"
                  value={probationPeriodDays}
                  onChange={(e) =>
                    setProbationPeriodDays(Number(e.target.value))
                  }
                />
              </FormField>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border-t border-slate-200 p-4 rounded-b-xl">
            <p className="text-xs text-slate-500">
              New company will be accessible via{" "}
              <strong className="text-indigo-600 font-mono">
                Peopleworkplaces.hr/{slug || "slug"}
              </strong>
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/tenants")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 font-bold px-6"
              >
                Create Company & Generate Credentials
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>

      {/* CREDENTIALS SUCCESS MODAL */}
      {createdTenantData && (
        <Modal
          isOpen={Boolean(createdTenantData)}
          onClose={() => navigate("/admin/tenants")}
          maxWidth="2xl"
          title={`🎉 Company "${createdTenantData.tenantName}" Provisioned!`}
          description="The company portal and administrator account have been created successfully. Review or copy the credentials below."
          footer={
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
              <Button
                variant="outline"
                size="md"
                onClick={handleCopyCredentials}
                leftIcon={
                  copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )
                }
                className="w-full sm:w-auto font-semibold shrink-0"
              >
                {copied ? "Copied to Clipboard!" : "Copy Credentials"}
              </Button>
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate("/admin/tenants")}
                  leftIcon={<Check className="w-4 h-4" />}
                  className="w-full sm:w-auto bg-[#FF6900] hover:bg-[#E05D00] text-white font-bold shadow-xs shrink-0"
                >
                  OK (Go to Companies List)
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleLogoutAndLoginAsCompanyAdmin}
                  className="w-full sm:w-auto font-semibold text-[#C800A1] border-[#C800A1]/40 hover:bg-[#FDF2F9] shrink-0"
                >
                  Sign In as Admin →
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-sm py-1">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Company Admin Access Details</span>
              </div>
              <p className="text-emerald-700 text-xs leading-relaxed">
                To access and manage this company's portal, you must sign in
                with these credentials:
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 font-mono">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 border-b border-slate-200 gap-1">
                <span className="text-slate-500 font-sans font-medium text-xs">
                  Company Portal URL:
                </span>
                <span className="font-bold text-[#FF6900] text-sm">
                  Peopleworkplaces.hr/{createdTenantData.slug}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 border-b border-slate-200 gap-1">
                <span className="text-slate-500 font-sans font-medium text-xs">
                  Admin Email:
                </span>
                <span className="font-bold text-slate-900 text-sm font-mono">
                  {createdTenantData.adminEmail}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 gap-1">
                <span className="text-slate-500 font-sans font-medium text-xs">
                  Generated Password:
                </span>
                <span className="font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200 text-sm tracking-wider inline-block w-fit">
                  {createdTenantData.password}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                As a Super Admin, when visiting the company portal link
                directly, you will be prompted to log in using these Company
                Admin credentials to ensure clean multi-tenant authorization.
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
