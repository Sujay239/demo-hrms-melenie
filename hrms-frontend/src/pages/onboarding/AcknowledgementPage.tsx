import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { mockStorage } from '@/services/mock-storage';
import { Download, CheckCircle2 } from 'lucide-react';

export const AcknowledgementPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const currentUser = mockStorage.getCurrentUser();

  const [name, setName] = useState(currentUser.name);
  const [place, setPlace] = useState('New York, NY');
  const [date, setDate] = useState('2026-08-18');
  const [confirmed, setConfirmed] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) {
      toast.error('Please confirm the acknowledgement checkbox');
      return;
    }

    mockStorage.addAuditLog('ONBOARDING_ACKNOWLEDGEMENT_SIGNED', 'ONBOARDING', currentUser.id);
    toast.success('Policy acknowledgement signed and recorded!');
    navigate(`/${slug}/onboarding/dashboard`);
  };

  const handleDownload = () => {
    toast.success('Generated acknowledgement PDF downloaded');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Company Policy Acknowledgement</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Review company rules, sign with Name, Place, Date, and download your copy.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Formal Acknowledgement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-40 overflow-y-auto space-y-2">
              <p className="font-bold text-slate-900">Standard Code of Conduct & Information Security Agreement</p>
              <p>
                I hereby acknowledge that I have received, read, and understood the Cyrcalur HRMS Code of Conduct, Anti-Harassment Guidelines, and Information Security Policy. I agree to comply with all company rules.
              </p>
            </div>

            <FormField label="Full Legal Name" required>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </FormField>

            <FormField label="Signing Location / Place" required>
              <Input value={place} onChange={(e) => setPlace(e.target.value)} required />
            </FormField>

            <FormField label="Signing Date" required>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </FormField>

            <label className="flex items-start gap-2 pt-2 cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600"
              />
              I explicitly confirm and agree to all terms stated above.
            </label>
          </CardContent>

          <CardFooter className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleDownload}
            >
              Download PDF Copy
            </Button>
            <Button type="submit">Submit Acknowledgement</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
