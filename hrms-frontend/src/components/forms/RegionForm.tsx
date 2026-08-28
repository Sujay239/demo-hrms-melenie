import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Region } from '@/demo-data/seedData';

interface RegionFormProps {
  initialValues?: Partial<Region>;
  tenantId: string;
  onSubmit: (data: {
    name: string;
    countryCode: string;
    timeZone: string;
    locale: string;
    status: 'ACTIVE' | 'INACTIVE';
  }) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export const RegionForm: React.FC<RegionFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Create Region',
}) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [countryCode, setCountryCode] = useState(initialValues?.countryCode || 'US');
  const [timeZone, setTimeZone] = useState(initialValues?.timeZone || 'America/New_York');
  const [locale, setLocale] = useState(initialValues?.locale || 'en-US');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      countryCode: countryCode.trim().toUpperCase(),
      timeZone: timeZone.trim(),
      locale: locale.trim(),
      status: initialValues?.status || 'ACTIVE',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Region Display Name"
        required
        helperText="e.g. North America (US East)"
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Region Name"
          required
        />
      </FormField>

      <FormField label="Country Code (ISO 2-letter)" required>
        <Input
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
          placeholder="US"
          maxLength={2}
          required
        />
      </FormField>

      <FormField
        label="IANA Time Zone"
        required
        helperText="e.g. America/New_York, Asia/Kolkata"
      >
        <Input
          value={timeZone}
          onChange={(e) => setTimeZone(e.target.value)}
          placeholder="America/New_York"
          required
        />
      </FormField>

      <FormField label="Locale String" required>
        <Input
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          placeholder="en-US"
          required
        />
      </FormField>

      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
