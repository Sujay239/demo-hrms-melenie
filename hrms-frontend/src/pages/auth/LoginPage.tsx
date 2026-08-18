import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { mockStorage } from '@/services/mock-storage';
import { Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@cyrcalur.hr');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      setIsLoading(false);
      const allUsers = mockStorage.getUsers();
      const matched = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (matched) {
        mockStorage.setCurrentUser(matched);
        toast.success(`Welcome back, ${matched.name}!`);

        if (matched.role === 'SUPER_ADMIN') {
          navigate('/admin');
        } else if (matched.role === 'NEW_HIRE') {
          navigate('/acme-corp/onboarding/dashboard');
        } else {
          navigate('/acme-corp/dashboard');
        }
      } else {
        // Requirement per docs: generic error wording to prevent account enumeration
        setError('Invalid identifier or password credential.');
      }
    }, 400);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-900">Sign in to your account</h3>
        <p className="text-xs text-slate-500 mt-1">Select demo credentials or enter email</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <FormField label="Email address" required>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />
      </FormField>

      <FormField label="Password" required>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />
      </FormField>

      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 cursor-pointer text-slate-600">
          <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600" />
          Remember me
        </label>
        <Link to="/auth/forgot-password" className="font-semibold text-indigo-600 hover:underline">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Sign In
      </Button>

      {/* Quick Demo Selector buttons */}
      <div className="pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 font-medium mb-2 text-center">Quick Demo Accounts:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setEmail('admin@cyrcalur.hr')}
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 text-left font-medium"
          >
            👑 Super Admin
          </button>
          <button
            type="button"
            onClick={() => setEmail('consultant@cyrcalur.hr')}
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 text-left font-medium"
          >
            💼 Consultant
          </button>
          <button
            type="button"
            onClick={() => setEmail('hr@acme-corp.com')}
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 text-left font-medium"
          >
            🏢 Tenant Admin
          </button>
          <button
            type="button"
            onClick={() => setEmail('asha@acme-corp.com')}
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 text-left font-medium"
          >
            👤 Employee
          </button>
          <button
            type="button"
            onClick={() => setEmail('newhire@acme-corp.com')}
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 text-left font-medium col-span-2"
          >
            🌱 New Hire Onboarding
          </button>
        </div>
      </div>
    </form>
  );
};
