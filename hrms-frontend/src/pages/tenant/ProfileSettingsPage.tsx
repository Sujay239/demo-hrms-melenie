import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { FormField } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { Employee, Department, Designation, Region, User } from '@/demo-data/seedData';
import { generateTotpSecret, generateTotpUri, generateQRCodeDataUrl, verifyTotpCode } from '@/utils/totp';
import {
  User as UserIcon,
  Phone,
  ShieldCheck,
  Lock,
  Upload,
  Save,
  Building2,
  Briefcase,
  KeyRound,
  ShieldAlert,
  Smartphone,
  Copy,
  QrCode as QrIcon,
} from 'lucide-react';

export const ProfileSettingsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [currentUser, setCurrentUser] = useState<User>(() => mockStorage.getCurrentUser());
  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];

  const employees = mockStorage.getTenantItems<Employee>(KEYS.EMPLOYEES, currentTenant?.id);
  const departments = mockStorage.getTenantItems<Department>(KEYS.DEPARTMENTS, currentTenant?.id);
  const designations = mockStorage.getTenantItems<Designation>(KEYS.DESIGNATIONS, currentTenant?.id);
  const regions = mockStorage.getTenantItems<Region>(KEYS.REGIONS, currentTenant?.id);

  // Check if active user has an associated Employee HR record
  const myEmployee =
    employees.find(
      (e) =>
        e.email.toLowerCase() === currentUser.email.toLowerCase() ||
        e.id === currentUser.id ||
        (currentUser.name && e.name.toLowerCase() === currentUser.name.toLowerCase())
    ) || null;

  // Profile fields state
  const [name, setName] = useState(currentUser.name || '');
  const [email] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || myEmployee?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || myEmployee?.avatarUrl || '');

  // Employee-only fields state
  const [currentAddress, setCurrentAddress] = useState(myEmployee?.currentAddress || '');
  const [emergencyContactName, setEmergencyContactName] = useState(myEmployee?.emergencyContactName || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(myEmployee?.emergencyContactPhone || '');

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(currentUser.twoFactorEnabled || false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [show2FADisable, setShow2FADisable] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [disable2FACode, setDisable2FACode] = useState('');
  const [totpSecret, setTotpSecret] = useState(currentUser.twoFactorSecret || '');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'Profile' | 'Security' | 'Employment'>('Profile');

  // Generate real TOTP Secret & QR Code when setting up 2FA
  const init2FASetup = async () => {
    setIsGeneratingQR(true);
    try {
      const secret = generateTotpSecret();
      setTotpSecret(secret);
      const appName = currentTenant ? `Peopleworkplaces (${currentTenant.name})` : 'Peopleworkplaces';
      const otpauth = generateTotpUri(currentUser.email, appName, secret);
      const qrUrl = await generateQRCodeDataUrl(otpauth);
      setQrCodeDataUrl(qrUrl);
      setShow2FASetup(true);
      setShow2FADisable(false);
    } catch (err) {
      toast.error('Failed to generate 2FA QR code');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Avatar file size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file (PNG, JPG, WEBP)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarUrl(result);
        toast.success(`Photo "${file.name}" selected! Click "Save Changes" to apply.`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    const updatedUser: User = {
      ...currentUser,
      name: name.trim(),
      phone: phone.trim() || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
    };

    mockStorage.updateUser(currentUser.id, updatedUser);
    mockStorage.setCurrentUser(updatedUser);
    setCurrentUser(updatedUser);

    if (myEmployee) {
      mockStorage.updateTenantItem<Employee>(KEYS.EMPLOYEES, myEmployee.id, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        currentAddress: currentAddress.trim() || undefined,
        emergencyContactName: emergencyContactName.trim() || undefined,
        emergencyContactPhone: emergencyContactPhone.trim() || undefined,
      });
    }

    mockStorage.addAuditLog('USER_PROFILE_UPDATED', 'USER', currentUser.id);
    toast.success('🎉 Profile information successfully saved!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and Confirm password do not match');
      return;
    }

    if (currentUser.password && currentPassword && currentUser.password !== currentPassword) {
      toast.error('Current password is incorrect');
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      mockStorage.updateUser(currentUser.id, { password: newPassword });
      const updated = { ...currentUser, password: newPassword };
      mockStorage.setCurrentUser(updated);
      setCurrentUser(updated);
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      mockStorage.addAuditLog('USER_PASSWORD_CHANGED', 'USER', currentUser.id);
      toast.success('🔒 Password has been updated successfully!');
    }, 400);
  };

  const handleToggle2FA = () => {
    if (!twoFactorEnabled) {
      init2FASetup();
    } else {
      setShow2FADisable(!show2FADisable);
      setShow2FASetup(false);
      setDisable2FACode('');
    }
  };

  const handleDisable2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disable2FACode || disable2FACode.trim().length !== 6) {
      toast.error('Please enter the current 6-digit code from your Authenticator app');
      return;
    }

    const secret = currentUser.twoFactorSecret || totpSecret;
    if (!secret) {
      toast.error('Authenticator secret not found.');
      return;
    }

    const isValid = verifyTotpCode(disable2FACode.trim(), secret);
    if (!isValid) {
      toast.error('Invalid 6-digit verification code. Please check your Authenticator app.');
      return;
    }

    const updated = { ...currentUser, twoFactorEnabled: false, twoFactorSecret: undefined };
    mockStorage.updateUser(currentUser.id, { twoFactorEnabled: false, twoFactorSecret: undefined });
    mockStorage.setCurrentUser(updated);
    setCurrentUser(updated);
    setTwoFactorEnabled(false);
    setShow2FADisable(false);
    setDisable2FACode('');
    setQrCodeDataUrl('');
    mockStorage.addAuditLog('2FA_DISABLED', 'USER', currentUser.id);
    toast.success('Two-Factor Authentication (2FA) has been safely deactivated.');
  };

  const handleConfirm2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode || twoFactorCode.trim().length !== 6) {
      toast.error('Please enter the 6-digit code from your Authenticator app');
      return;
    }

    try {
      const isValid = verifyTotpCode(twoFactorCode.trim(), totpSecret);
      if (!isValid) {
        toast.error('Invalid 6-digit verification code. Please check your authenticator clock/app.');
        return;
      }

      const updated = { ...currentUser, twoFactorEnabled: true, twoFactorSecret: totpSecret };
      mockStorage.updateUser(currentUser.id, { twoFactorEnabled: true, twoFactorSecret: totpSecret });
      mockStorage.setCurrentUser(updated);
      setCurrentUser(updated);
      setTwoFactorEnabled(true);
      setShow2FASetup(false);
      setTwoFactorCode('');
      mockStorage.addAuditLog('2FA_ENABLED', 'USER', currentUser.id);
      toast.success('🛡️ Two-Factor Authentication (2FA) is now active on your account!');
    } catch {
      toast.error('Error verifying 2FA code. Please try again.');
    }
  };

  const deptObj = departments.find((d) => d.id === myEmployee?.departmentId);
  const desigObj = designations.find((d) => d.id === myEmployee?.designationId);
  const regionObj = regions.find((r) => r.id === myEmployee?.regionId);

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar
                src={avatarUrl}
                name={currentUser.name}
                size="lg"
                className="w-18 h-18 ring-4 ring-[#FF6900]/10 shadow-md text-xl"
              />
              <label
                htmlFor="profile-avatar-upload"
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Upload Photo"
              >
                <Upload className="w-5 h-5" />
              </label>
              <input
                id="profile-avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarFileUpload}
                className="hidden"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-900">{currentUser.name}</h2>
                <Badge variant={currentUser.status === 'ACTIVE' ? 'emerald' : 'neutral'} size="sm">
                  {currentUser.status}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 font-mono mt-0.5">{currentUser.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="indigo" size="sm">
                  {mockStorage.getRoleLabel(currentUser.role)}
                </Badge>
                {currentTenant && (
                  <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#FF6900]" />
                    {currentTenant.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const text = `Name: ${currentUser.name}\nEmail: ${currentUser.email}\nRole: ${currentUser.role}`;
                navigator.clipboard.writeText(text);
                toast.success('Account info copied to clipboard');
              }}
              leftIcon={<Copy className="w-3.5 h-3.5" />}
            >
              Copy Info
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-slate-100 mt-6 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('Profile')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'Profile'
                ? 'bg-[#FF6900] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Profile & Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('Security')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'Security'
                ? 'bg-[#FF6900] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Password & 2FA</span>
            {twoFactorEnabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="2FA Active" />
            )}
          </button>
          {myEmployee && (
            <button
              type="button"
              onClick={() => setActiveTab('Employment')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'Employment'
                  ? 'bg-[#FF6900] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Employment Record
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: PROFILE & DETAILS                                     */}
      {/* ============================================================ */}
      {activeTab === 'Profile' && (
        <Card className="shadow-xs border border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-[#FF6900]" />
              <span>Personal Profile Information</span>
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSaveProfile}>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Full Name" required>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </FormField>

                <FormField label="Email Address (Read-Only)">
                  <Input value={email} disabled className="bg-slate-100 text-slate-500 cursor-not-allowed" />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Contact Phone Number">
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                  />
                </FormField>

                <FormField label="Avatar Image URL (Optional)">
                  <Input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </FormField>
              </div>

              {myEmployee && (
                <>
                  <FormField label="Current Residential Address">
                    <Input
                      value={currentAddress}
                      onChange={(e) => setCurrentAddress(e.target.value)}
                      placeholder="742 Evergreen Terrace, San Francisco, CA 94102, USA"
                    />
                  </FormField>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <FormField label="Emergency Contact Person">
                      <Input
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        placeholder="Sarah Miller (Spouse)"
                      />
                    </FormField>
                    <FormField label="Emergency Contact Phone">
                      <Input
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        placeholder="+1 (555) 019-2834"
                      />
                    </FormField>
                  </div>
                </>
              )}
            </CardContent>

            <CardFooter className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Save className="w-4 h-4" />}
                className="bg-[#FF6900] hover:bg-[#E05D00] text-white font-bold"
              >
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* ============================================================ */}
      {/* TAB 2: SECURITY, PASSWORD & 2FA                             */}
      {/* ============================================================ */}
      {activeTab === 'Security' && (
        <div className="space-y-6">
          {/* Change Password Card */}
          <Card className="shadow-xs border border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#FF6900]" />
                <span>Change Account Password</span>
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleChangePassword}>
              <CardContent className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="Current Password">
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </FormField>

                  <FormField label="New Password" required helperText="Minimum 6 characters">
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                  </FormField>

                  <FormField label="Confirm New Password" required>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                    />
                  </FormField>
                </div>
              </CardContent>

              <CardFooter className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isChangingPassword}
                  leftIcon={<KeyRound className="w-4 h-4" />}
                  className="bg-[#FF6900] hover:bg-[#E05D00] text-white font-bold"
                >
                  Update Password
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Two-Factor Authentication (2FA) Card */}
          <Card className="shadow-xs border border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C800A1]" />
                  <span>Two-Factor Authentication (2FA)</span>
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Protect your account with standard TOTP Two-Factor Authentication (Google Authenticator, Microsoft Authenticator, Authy, 1Password).
                </p>
              </div>

              <Badge variant={twoFactorEnabled ? 'emerald' : 'neutral'} size="md">
                {twoFactorEnabled ? '2FA Enabled' : '2FA Disabled'}
              </Badge>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${twoFactorEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Authenticator App (TOTP)</h4>
                    <p className="text-xs text-slate-500">
                      Generate dynamic 6-digit security codes from your mobile phone.
                    </p>
                  </div>
                </div>

                <Button
                  variant={twoFactorEnabled ? 'outline' : 'primary'}
                  size="sm"
                  onClick={handleToggle2FA}
                  isLoading={isGeneratingQR}
                  className={twoFactorEnabled ? 'border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold' : 'bg-[#C800A1] hover:bg-[#A80088] text-white font-bold'}
                >
                  {twoFactorEnabled ? 'Disable 2FA' : 'Set Up 2FA'}
                </Button>
              </div>

              {/* 2FA Setup Flow with Big QR Code */}
              {show2FASetup && !twoFactorEnabled && (
                <div className="p-6 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-purple-900 font-bold text-base border-b border-purple-200/60 pb-3">
                    <ShieldAlert className="w-5 h-5 text-[#C800A1]" />
                    <span>Scan QR Code with Authenticator App</span>
                  </div>

                  <p className="text-purple-900 text-xs leading-relaxed">
                    1. Open your authenticator app (Google Authenticator, Microsoft Authenticator, 1Password, or Authy) and scan the QR code below:
                  </p>

                  <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-5 rounded-2xl border border-purple-100 shadow-xs">
                    {/* Big High-Res QR Code */}
                    <div className="bg-white p-3 rounded-2xl border-2 border-purple-200 shadow-md flex items-center justify-center shrink-0">
                      {qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt="2FA QR Code"
                          className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-lg"
                        />
                      ) : (
                        <div className="w-56 h-56 flex flex-col items-center justify-center text-slate-400 gap-2">
                          <QrIcon className="w-10 h-10 animate-pulse text-purple-400" />
                          <span>Generating QR...</span>
                        </div>
                      )}
                    </div>

                    {/* Manual Secret Key */}
                    <div className="space-y-3 text-xs flex-1">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <span className="text-slate-500 font-medium block">Can't scan the QR code? Use Secret Key:</span>
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-indigo-700 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm tracking-wider select-all">
                            {totpSecret}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(totpSecret);
                              toast.success('Secret key copied to clipboard');
                            }}
                            className="shrink-0 p-1.5"
                            title="Copy Key"
                          >
                            <Copy className="w-4 h-4 text-slate-600" />
                          </Button>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] leading-relaxed">
                        <strong>Security Tip:</strong> Save your secret key in a safe password manager so you can recover access if you change mobile devices.
                      </div>
                    </div>
                  </div>

                  {/* 6-Digit Code Verification */}
                  <form onSubmit={handleConfirm2FA} className="space-y-3 pt-2">
                    <FormField label="2. Enter the 6-digit code displayed in your Authenticator app:" required>
                      <div className="flex flex-col sm:flex-row gap-2.5 max-w-md">
                        <Input
                          type="text"
                          maxLength={6}
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="123456"
                          className="font-mono text-center tracking-widest text-xl font-bold h-11"
                          autoFocus
                          required
                        />
                        <Button
                          type="submit"
                          className="bg-[#C800A1] hover:bg-[#A80088] text-white font-bold h-11 px-6 shrink-0 shadow-xs"
                        >
                          Verify & Activate 2FA
                        </Button>
                      </div>
                    </FormField>
                  </form>
                </div>
              )}

              {/* 2FA Deactivation Security Challenge */}
              {show2FADisable && twoFactorEnabled && (
                <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-base border-b border-rose-200/60 pb-3">
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                    <span>Confirm 2FA Deactivation</span>
                  </div>

                  <p className="text-rose-800 text-xs leading-relaxed">
                    To deactivate Two-Factor Authentication, you must confirm your identity by entering the current 6-digit code from your Authenticator app.
                  </p>

                  <form onSubmit={handleDisable2FA} className="space-y-3">
                    <FormField label="Enter current 6-digit code to confirm deactivation:" required>
                      <div className="flex flex-col sm:flex-row gap-2.5 max-w-md">
                        <Input
                          type="text"
                          maxLength={6}
                          value={disable2FACode}
                          onChange={(e) => setDisable2FACode(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="123456"
                          className="font-mono text-center tracking-widest text-xl font-bold h-11 border-rose-300 focus:border-rose-500"
                          autoFocus
                          required
                        />
                        <Button
                          type="submit"
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-11 px-6 shrink-0 shadow-xs cursor-pointer"
                        >
                          Confirm & Deactivate
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShow2FADisable(false)}
                          className="h-11 px-4 text-slate-600 hover:bg-slate-100"
                        >
                          Cancel
                        </Button>
                      </div>
                    </FormField>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: EMPLOYMENT RECORD (If Linked Employee Exists)          */}
      {/* ============================================================ */}
      {activeTab === 'Employment' && myEmployee && (
        <Card className="shadow-xs border border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#FF6900]" />
              <span>Employment & Organizational Placement</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-medium">Employee ID:</span>
                <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">{myEmployee.employeeId}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-medium">Department:</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{deptObj?.name || 'Operations'}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-medium">Designation / Role:</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{desigObj?.name || 'Administrator'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-medium">Work Region:</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{regionObj?.name || 'Global HQ'}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-medium">Date of Joining:</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{myEmployee.joiningDate || '2026-01-01'}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-medium">Employment Type:</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{myEmployee.employmentType || 'Full Time'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
