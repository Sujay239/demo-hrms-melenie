import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { mockStorage } from '@/services/mock-storage';

export const MyDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const currentUser = mockStorage.getCurrentUser();

  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [address, setAddress] = useState('742 Evergreen Terrace, Springfield');
  const [funFact, setFunFact] = useState('I built my first mechanical keyboard from scratch!');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Personal details and Fun Fact saved successfully!');
    navigate(`/${slug}/onboarding/dashboard`);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Personal Details</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Submit required contact details and an interesting fun fact for team introductions.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Full Name">
              <Input value={currentUser.name} disabled className="bg-slate-50" />
            </FormField>

            <FormField label="Work Email">
              <Input value={currentUser.email} disabled className="bg-slate-50" />
            </FormField>

            <FormField label="Contact Phone Number" required>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </FormField>

            <FormField label="Residential Address" required>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} required />
            </FormField>

            <FormField label="Fun Fact About You 🎉" required helperText="Shared on team welcome announcements">
              <textarea
                value={funFact}
                onChange={(e) => setFunFact(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </FormField>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button type="submit">Save & Continue</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
