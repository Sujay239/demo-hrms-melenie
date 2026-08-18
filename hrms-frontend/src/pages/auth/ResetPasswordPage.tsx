import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { Lock } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    toast.success('Password updated successfully!');
    navigate('/auth/login');
  };

  return (
    <form onSubmit={handleReset} className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-slate-900">Set New Password</h3>
        <p className="text-xs text-slate-500 mt-1">Enter your new secure password below.</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <FormField label="New Password" required helperText="At least 8 characters">
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />
      </FormField>

      <FormField label="Confirm New Password" required>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />
      </FormField>

      <Button type="submit" className="w-full">
        Complete Password Reset
      </Button>
    </form>
  );
};
