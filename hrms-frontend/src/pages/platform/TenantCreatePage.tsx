import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Select } from '@/components/ui/Select';
import { toast } from '@/components/ui/Toast';
import { mockStorage } from '@/services/mock-storage';
import { ArrowLeft, Upload, Building2 } from 'lucide-react';

export const TenantCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [logoUrl, setLogoUrl] = useState('');
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
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size exceeds 2MB limit');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
        toast.success('Logo asset uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.error('Company Name and Domain Slug are required');
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
      });

      toast.success(`Tenant "${newTenant.name}" created successfully!`);
      navigate(`/admin/tenants/${newTenant.id}`);
    }, 300);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
      <div>
        <Link
          to="/admin/tenants"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Tenants
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Create Customer Tenant / Company
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Provision a new isolated organization space on Cyrcalur HRMS.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Company Identity & Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <FormField label="Legal / Display Company Name" required helperText="e.g. Acme Corporation">
              <Input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter company name"
                required
              />
            </FormField>

            <FormField
              label="Company Domain Slug"
              required
              helperText={`URL will be: cyrcalur.hr/${slug || 'company-slug'}`}
            >
              <Input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="company-slug"
                required
              />
            </FormField>

            <FormField label="Tenant Initial Status" required>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                options={[
                  { value: 'ACTIVE', label: 'ACTIVE — Portal access enabled' },
                  { value: 'INACTIVE', label: 'INACTIVE — Suspended / Setup phase' },
                ]}
              />
            </FormField>

            {/* Mandated Logo Surface: White background logo preview */}
            <FormField
              label="Company Logo (Mandated White Surface)"
              helperText="PNG, JPG, or SVG up to 2MB. Logo will render strictly on a white surface."
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                {/* White surface for logo per design spec */}
                <div className="w-24 h-24 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-2 shadow-xs shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="text-center text-slate-300">
                      <Building2 className="w-8 h-8 mx-auto stroke-1" />
                      <span className="text-[10px] text-slate-400 font-medium mt-1 block">White Surface</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs">
                    <Upload className="w-4 h-4 text-slate-500" />
                    Choose Logo Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="text-xs text-rose-600 hover:underline block"
                    >
                      Remove logo
                    </button>
                  )}
                </div>
              </div>
            </FormField>
          </CardContent>

          <CardFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/admin/tenants')}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Provision Tenant
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
