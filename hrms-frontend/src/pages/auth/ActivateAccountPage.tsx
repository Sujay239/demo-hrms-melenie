import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { toast } from "@/components/ui/Toast";
import { Lock, User } from "lucide-react";

export const ActivateAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("New Team Member");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    toast.success("Account activated successfully!");
    navigate("/acme-corp/onboarding/dashboard");
  };

  return (
    <form onSubmit={handleActivate} className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-slate-900">
          Activate Your Account
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Complete your registration to access Peopleworkplaces HRMS.
        </p>
      </div>

      <FormField label="Full Name" required>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
          required
        />
      </FormField>

      <FormField
        label="Set Initial Password"
        required
        helperText="At least 8 characters"
      >
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />
      </FormField>

      <FormField label="Confirm Password" required>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />
      </FormField>

      <Button type="submit" className="w-full">
        Activate Account
      </Button>
    </form>
  );
};
