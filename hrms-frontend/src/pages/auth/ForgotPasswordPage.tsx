import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Mail, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-slate-900">Reset Password</h3>
        <p className="text-xs text-slate-500 mt-1">
          Enter your account email to receive a password reset capability.
        </p>
      </div>

      {submitted ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-2">
          <p className="font-semibold">Reset Capability Requested</p>
          <p>
            If an account matching <span className="font-mono font-bold">{email}</span> exists in our system, a secure one-time reset link has been dispatched.
          </p>
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:underline pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Button type="submit" className="w-full">
            Request Reset Capability
          </Button>

          <div className="text-center">
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
