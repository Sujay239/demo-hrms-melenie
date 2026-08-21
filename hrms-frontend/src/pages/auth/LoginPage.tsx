import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { toast } from "@/components/ui/Toast";
import { mockStorage } from "@/services/mock-storage";
import { Lock, Mail, ShieldCheck, Smartphone, ArrowLeft } from "lucide-react";
import { verifyTotpCode } from "@/utils/totp";
import { User } from "@/demo-data/seedData";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 2FA Challenge Step
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  const completeLoginForUser = (user: User) => {
    mockStorage.setCurrentUser(user);
    toast.success(`Welcome back, ${user.name}!`);

    if (user.role === "SUPER_ADMIN") {
      navigate("/admin");
    } else if (user.role === "NEW_HIRE") {
      const tenant = user.tenantId
        ? mockStorage.getTenants().find((t) => t.id === user.tenantId)
        : mockStorage.getTenants()[0];
      navigate(`/${tenant?.slug || "company"}/onboarding/dashboard`);
    } else if (user.role === "CONSULTANT") {
      const tenant = mockStorage.getAccessibleTenant(user);
      navigate(tenant ? `/${tenant.slug}/dashboard` : "/admin/consultants");
    } else if (user.tenantId) {
      const tenant = mockStorage
        .getTenants()
        .find((t) => t.id === user.tenantId);
      navigate(`/${tenant?.slug || "company"}/dashboard`);
    } else {
      navigate("/admin");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      setIsLoading(false);
      const allUsers = mockStorage.getUsers();
      const matched = allUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
      );

      // Verify email and password
      if (matched) {
        if (matched.password && matched.password !== password) {
          setError("Invalid email address or password credential.");
          return;
        }

        // Check if 2FA is enabled on this account
        if (matched.twoFactorEnabled && matched.twoFactorSecret) {
          setPendingUser(matched);
          setRequires2FA(true);
          toast.info("Two-Factor Authentication required. Enter the 6-digit code from your authenticator app.");
          return;
        }

        completeLoginForUser(matched);
      } else {
        setError("Invalid email address or password credential.");
      }
    }, 350);
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser || !pendingUser.twoFactorSecret) return;

    if (!twoFactorCode || twoFactorCode.trim().length !== 6) {
      setError("Please enter the 6-digit security code.");
      return;
    }

    setIsLoading(true);
    setError("");

    setTimeout(() => {
      setIsLoading(false);
      try {
        const isValid = verifyTotpCode(
          twoFactorCode.trim(),
          pendingUser.twoFactorSecret!
        );

        if (isValid) {
          completeLoginForUser(pendingUser);
        } else {
          setError("Invalid two-factor authentication code. Please check your authenticator app.");
        }
      } catch {
        setError("Error validating authenticator code. Please try again.");
      }
    }, 300);
  };

  if (requires2FA && pendingUser) {
    return (
      <form onSubmit={handleVerify2FA} className="space-y-5 animate-in fade-in duration-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#FF6900]/10 text-[#FF6900] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Two-Factor Authentication
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Enter the 6-digit code from your Authenticator app for <span className="font-semibold text-slate-800">{pendingUser.email}</span>
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <FormField label="6-Digit Security Code" required>
          <Input
            type="text"
            maxLength={6}
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="123456"
            className="font-mono text-center tracking-widest text-lg font-bold"
            autoFocus
            required
          />
        </FormField>

        <Button
          type="submit"
          className="w-full bg-[#FF6900] hover:bg-[#E05D00] text-white font-bold"
          isLoading={isLoading}
        >
          Verify & Sign In
        </Button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setRequires2FA(false);
              setPendingUser(null);
              setTwoFactorCode("");
              setError("");
            }}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to email & password
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-900">
          Sign In to Peopleworkplaces HRMS
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Enter your company email and password credential
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <FormField label="Email Address" required>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. admin@Peopleworkplaces.hr or admin@company.com"
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
          <input
            type="checkbox"
            defaultChecked
            className="rounded border-slate-300 text-indigo-600"
          />
          Remember me
        </label>
        <Link
          to="/auth/forgot-password"
          className="font-semibold text-indigo-600 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full bg-[#FF6900] hover:bg-[#E05D00] text-white font-bold"
        isLoading={isLoading}
      >
        Sign In
      </Button>

      {/* Initial Super Admin Hint */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#FF6900] shrink-0" />
        <div className="text-[11px] leading-tight">
          <span className="font-semibold text-slate-800">
            Master Super Admin:{" "}
          </span>
          <span className="font-mono text-slate-700">
            admin@Peopleworkplaces.hr
          </span>{" "}
          / <span className="font-mono text-slate-700">password123</span>
        </div>
      </div>
    </form>
  );
};
