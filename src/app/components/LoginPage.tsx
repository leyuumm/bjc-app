import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Mail, Eye, EyeOff, ArrowLeft, Shield, User, AlertCircle, Loader2, CheckCircle2, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useAppContext } from './AppContext';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  updateUserProfile,
  getUserProfile,
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  getAuthErrorMessage,
  logout,
} from '../services/auth';
import type { UserRole } from '../types/firestore';

export function LoginPage() {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAppContext();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  // Google profile completion
  const [googleProfileMode, setGoogleProfileMode] = useState(false);
  const [googleUid, setGoogleUid] = useState('');

  const navigateByRole = (role: UserRole) => {
    switch (role) {
      case 'CASHIER': navigate('/cashier/select-branch'); break;
      case 'ADMIN': navigate('/admin'); break;
      default: navigate('/home');
    }
  };

  const clearErrors = () => {
    setErrors({});
    setGeneralError('');
    setSuccessMessage('');
  };

  const validateLoginForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;

    const passErr = validatePassword(password);
    if (passErr) newErrors.password = passErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameErr = validateName(fullName);
    if (nameErr) newErrors.name = nameErr;

    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;

    const phoneErr = validatePhone(phoneNumber);
    if (phoneErr) newErrors.phone = phoneErr;

    const passErr = validatePassword(password);
    if (passErr) newErrors.password = passErr;

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailLogin = async () => {
    clearErrors();
    if (!validateLoginForm()) return;

    setLoading(true);
    try {
      const user = await loginWithEmail(email, password);
      setIsLoggedIn(true);
      const profile = await getUserProfile(user.uid);
      toast.success('Login successful! Welcome back.');
      navigateByRole(profile?.role ?? 'CUSTOMER');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setGeneralError(getAuthErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async () => {
    clearErrors();
    if (!validateRegisterForm()) return;

    setLoading(true);
    try {
      await registerWithEmail(email, password, fullName, phoneNumber);
      // Sign out so user must login with their new credentials
      await logout();
      // Clear form and switch to login tab with success message
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      setPhoneNumber('');
      setActiveTab('login');
      setSuccessMessage('Account created! A verification email has been sent. Please verify your email and sign in.');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setGeneralError(getAuthErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearErrors();
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.needsProfileCompletion) {
        // Need to fill in profile details
        setGoogleUid(result.user.uid);
        setFullName(result.user.displayName ?? '');
        setEmail(result.user.email ?? '');
        setGoogleProfileMode(true);
        setLoading(false);
        return;
      }
      setIsLoggedIn(true);
      const profile = await getUserProfile(result.user.uid);
      toast.success('Login successful! Welcome back.');
      navigateByRole(profile?.role ?? 'CUSTOMER');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setGeneralError(getAuthErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleProfileComplete = async () => {
    clearErrors();
    const newErrors: Record<string, string> = {};

    const nameErr = validateName(fullName);
    if (nameErr) newErrors.name = nameErr;

    const phoneErr = validatePhone(phoneNumber);
    if (phoneErr) newErrors.phone = phoneErr;

    const passErr = validatePassword(password);
    if (passErr) newErrors.password = passErr;

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await updateUserProfile(googleUid, {
        name: fullName.trim(),
        phone: phoneNumber.trim(),
      });
      setGoogleProfileMode(false);
      setIsLoggedIn(true);
      const profile = await getUserProfile(googleUid);
      toast.success('Profile complete! Welcome to BJC.');
      navigateByRole(profile?.role ?? 'CUSTOMER');
    } catch {
      setGeneralError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabSwitch = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    clearErrors();
    setPassword('');
    setConfirmPassword('');
  };

  const FieldError = ({ field }: { field: string }) => {
    if (!errors[field]) return null;
    return (
      <p className="text-[12px] text-[#D32F2F] mt-1 flex items-center gap-1">
        <AlertCircle size={12} />
        {errors[field]}
      </p>
    );
  };

  return (
    <div className="flex justify-center bg-[#F0F0F0] min-h-screen">
      <div className="w-full max-w-[412px] min-h-screen bg-white" style={{ fontFamily: "'Roboto', sans-serif" }}>
        {/* Header */}
        <div className="px-4 pt-12 pb-6" style={{ background: 'linear-gradient(135deg, #362415, #00704A)' }}>
          <button onClick={() => {
            if (googleProfileMode) {
              setGoogleProfileMode(false);
              clearErrors();
            } else {
              navigate('/splash');
            }
          }} className="text-white mb-4 cursor-pointer">
            <ArrowLeft size={24} />
          </button>
          <img src="/beyond-jc-group-opc-logo.svg" alt="Beyond JC Group OPC logo" className="w-[150px] h-auto mb-2" />
          <h1 className="text-white text-[28px]" style={{ fontWeight: 700 }}>
            {googleProfileMode ? 'Almost There' : 'Welcome'}
          </h1>
          <p className="text-white/70 text-[14px] mt-1">
            {googleProfileMode ? 'Complete your profile to continue' : 'Sign in to order your favorites'}
          </p>
        </div>

        {/* Tabs */}
        {!googleProfileMode && (
        <div className="flex border-b border-[rgba(0,0,0,0.12)]">
          {(['login', 'register'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => handleTabSwitch(tab)}
              className={`flex-1 py-3 text-[14px] cursor-pointer transition-colors ${
                activeTab === tab
                  ? 'text-[#00704A] border-b-2 border-[#00704A]'
                  : 'text-[#757575]'
              }`}
              style={{ fontWeight: activeTab === tab ? 600 : 400 }}
            >
              {tab === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>
        )}

        <div className="px-6 pt-6">
          {/* Success Banner */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-[12px] bg-[#E8F5E9] border border-[#81C784] flex items-start gap-2"
            >
              <CheckCircle2 size={18} color="#2E7D32" className="mt-0.5 shrink-0" />
              <p className="text-[13px] text-[#2E7D32]">{successMessage}</p>
            </motion.div>
          )}

          {/* General Error Banner */}
          {generalError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-[12px] bg-[#FFEBEE] border border-[#EF9A9A] flex items-start gap-2"
            >
              <AlertCircle size={18} color="#D32F2F" className="mt-0.5 shrink-0" />
              <p className="text-[13px] text-[#D32F2F]">{generalError}</p>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            {/* ─── Google Profile Completion ─────────────────────────── */}
            {googleProfileMode && (
              <>
                <h2 className="text-[18px] text-[#362415] mb-1" style={{ fontWeight: 700 }}>Complete Your Profile</h2>
                <p className="text-[13px] text-[#757575] mb-4">Fill in the details below to finish setting up your account.</p>

                <div className="mb-4">
                  <label className="text-[12px] text-[#757575] mb-1 block">Full Name</label>
                  <div className={`flex items-center bg-[#F5F5F5] rounded-[12px] px-4 py-3 ${errors.name ? 'ring-2 ring-[#D32F2F]' : ''}`}>
                    <User size={18} color="#757575" className="mr-3" />
                    <input
                      type="text"
                      placeholder="Juan Dela Cruz"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="bg-transparent flex-1 outline-none text-[14px]"
                    />
                  </div>
                  <FieldError field="name" />
                </div>

                <div className="mb-4">
                  <label className="text-[12px] text-[#757575] mb-1 block">Phone Number</label>
                  <div className={`flex items-center bg-[#F5F5F5] rounded-[12px] px-4 py-3 ${errors.phone ? 'ring-2 ring-[#D32F2F]' : ''}`}>
                    <span className="text-[14px] text-[#362415] mr-2" style={{ fontWeight: 500 }}>+63</span>
                    <div className="w-px h-5 bg-[rgba(0,0,0,0.12)] mr-3" />
                    <Phone size={18} color="#757575" className="mr-3" />
                    <input
                      type="tel"
                      placeholder="9XX XXX XXXX"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      className="bg-transparent flex-1 outline-none text-[14px]"
                    />
                  </div>
                  <FieldError field="phone" />
                </div>

                <div className="mb-4">
                  <label className="text-[12px] text-[#757575] mb-1 block">Password</label>
                  <div className={`flex items-center bg-[#F5F5F5] rounded-[12px] px-4 py-3 ${errors.password ? 'ring-2 ring-[#D32F2F]' : ''}`}>
                    <Shield size={18} color="#757575" className="mr-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="bg-transparent flex-1 outline-none text-[14px]"
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                      {showPassword ? <EyeOff size={18} color="#757575" /> : <Eye size={18} color="#757575" />}
                    </button>
                  </div>
                  <FieldError field="password" />
                </div>

                <div className="mb-4">
                  <label className="text-[12px] text-[#757575] mb-1 block">Confirm Password</label>
                  <div className={`flex items-center bg-[#F5F5F5] rounded-[12px] px-4 py-3 ${errors.confirmPassword ? 'ring-2 ring-[#D32F2F]' : ''}`}>
                    <Shield size={18} color="#757575" className="mr-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="bg-transparent flex-1 outline-none text-[14px]"
                    />
                  </div>
                  <FieldError field="confirmPassword" />
                </div>

                <button
                  onClick={handleGoogleProfileComplete}
                  disabled={loading}
                  className="w-full py-3.5 rounded-[12px] text-white text-[15px] mt-2 cursor-pointer flex items-center justify-center gap-2"
                  style={{ background: '#00704A', fontWeight: 600, opacity: loading ? 0.7 : 1 }}
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  Complete Registration
                </button>
              </>
            )}

            {/* ─── Login Tab ─────────────────────────────────────────── */}
            {!googleProfileMode && activeTab === 'login' && (
              <>
                <div className="mb-4">
                  <label className="text-[12px] text-[#757575] mb-1 block">Email Address</label>
                  <div className={`flex items-center bg-[#F5F5F5] rounded-[12px] px-4 py-3 ${errors.email ? 'ring-2 ring-[#D32F2F]' : ''}`}>
                    <Mail size={18} color="#757575" className="mr-3" />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="bg-transparent flex-1 outline-none text-[14px]"
                    />
                  </div>
                  <FieldError field="email" />
                </div>

                <div className="mb-4">
                  <label className="text-[12px] text-[#757575] mb-1 block">Password</label>
                  <div className={`flex items-center bg-[#F5F5F5] rounded-[12px] px-4 py-3 ${errors.password ? 'ring-2 ring-[#D32F2F]' : ''}`}>
                    <Shield size={18} color="#757575" className="mr-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="bg-transparent flex-1 outline-none text-[14px]"
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                      {showPassword ? <EyeOff size={18} color="#757575" /> : <Eye size={18} color="#757575" />}
                    </button>
                  </div>
                  <FieldError field="password" />
                </div>

                <button
                  onClick={handleEmailLogin}
                  disabled={loading}
                  className="w-full py-3.5 rounded-[12px] text-white text-[15px] mt-2 cursor-pointer flex items-center justify-center gap-2"
                  style={{ background: '#00704A', fontWeight: 600, opacity: loading ? 0.7 : 1 }}
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  Sign In
                </button>
              </>
            )}

            {/* ─── Register Tab ──────────────────────────────────────── */}
            {!googleProfileMode && activeTab === 'register' && (
              <>
                <div className="mb-4">
                  <label className="text-[12px] text-[#757575] mb-1 block">Full Name</label>
                  <div className={`flex items-center bg-[#F5F5F5] rounded-[12px] px-4 py-3 ${errors.name ? 'ring-2 ring-[#D32F2F]' : ''}`}>
                    <User size={18} color="#757575" className="mr-3" />
                    <input
                      type="text"
                      placeholder="Juan Dela Cruz"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="bg-transparent flex-1 outline-none text-[14px]"
                    />
                  </div>
                  <FieldError field="name" />
                </div>

                <div className="mb-4">
                  <label className="text-[12px] text-[#757575] mb-1 block">Email Address</label>
                  <div className={`flex items-center bg-[#F5F5F5] rounded-[12px] px-4 py-3 ${errors.email ? 'ring-2 ring-[#D32F2F]' : ''}`}>
                    <Mail size={18} color="#757575" className="mr-3" />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="bg-transparent flex-1 outline-none text-[14px]"
                    />
                  </div>
                  <FieldError field="email" />
                </div>

                <div className="mb-4">
                  <label className="text-[12px] text-[#757575] mb-1 block">Phone Number</label>
                  <div className={`flex items-center bg-[#F5F5F5] rounded-[12px] px-4 py-3 ${errors.phone ? 'ring-2 ring-[#D32F2F]' : ''}`}>
                    <span className="text-[14px] text-[#362415] mr-2" style={{ fontWeight: 500 }}>+63</span>
                    <div className="w-px h-5 bg-[rgba(0,0,0,0.12)] mr-3" />
                    <Phone size={18} color="#757575" className="mr-3" />
                    <input
                      type="tel"
                      placeholder="9XX XXX XXXX"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      className="bg-transparent flex-1 outline-none text-[14px]"
                    />
                  </div>
                  <FieldError field="phone" />
                </div>

                <div className="mb-4">
                  <label className="text-[12px] text-[#757575] mb-1 block">Password</label>
                  <div className={`flex items-center bg-[#F5F5F5] rounded-[12px] px-4 py-3 ${errors.password ? 'ring-2 ring-[#D32F2F]' : ''}`}>
                    <Shield size={18} color="#757575" className="mr-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="bg-transparent flex-1 outline-none text-[14px]"
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                      {showPassword ? <EyeOff size={18} color="#757575" /> : <Eye size={18} color="#757575" />}
                    </button>
                  </div>
                  <FieldError field="password" />
                </div>

                {/* Password strength indicator */}
                {password.length > 0 && (
                  <div className="mb-4">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map(level => {
                        const strength = getPasswordStrength(password);
                        const filled = level <= strength;
                        return (
                          <div
                            key={level}
                            className="flex-1 h-1 rounded-full"
                            style={{
                              background: filled
                                ? strength <= 1 ? '#D32F2F' : strength <= 2 ? '#FF9800' : strength <= 3 ? '#FFD600' : '#2E7D32'
                                : '#E0E0E0',
                            }}
                          />
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-[#757575]">
                      {getPasswordStrengthLabel(password)}
                    </p>
                  </div>
                )}

                <div className="mb-4">
                  <label className="text-[12px] text-[#757575] mb-1 block">Confirm Password</label>
                  <div className={`flex items-center bg-[#F5F5F5] rounded-[12px] px-4 py-3 ${errors.confirmPassword ? 'ring-2 ring-[#D32F2F]' : ''}`}>
                    <Shield size={18} color="#757575" className="mr-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="bg-transparent flex-1 outline-none text-[14px]"
                    />
                  </div>
                  <FieldError field="confirmPassword" />
                </div>

                <button
                  onClick={handleEmailRegister}
                  disabled={loading}
                  className="w-full py-3.5 rounded-[12px] text-white text-[15px] mt-2 cursor-pointer flex items-center justify-center gap-2"
                  style={{ background: '#00704A', fontWeight: 600, opacity: loading ? 0.7 : 1 }}
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  Create Account
                </button>
              </>
            )}

            {/* Divider */}
            {!googleProfileMode && (
            <>
            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-[rgba(0,0,0,0.12)]" />
              <span className="px-4 text-[12px] text-[#757575]">or continue with</span>
              <div className="flex-1 h-px bg-[rgba(0,0,0,0.12)]" />
            </div>

            {/* Social Login */}
            <div className="flex gap-3">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex-1 py-3 rounded-[12px] bg-[#F5F5F5] text-[13px] text-[#362415] cursor-pointer"
                style={{ fontWeight: 500 }}
              >
                Google
              </button>
              {['Facebook', 'Apple'].map(provider => (
                <button
                  key={provider}
                  className="flex-1 py-3 rounded-[12px] bg-[#F5F5F5] text-[13px] text-[#362415] cursor-pointer opacity-50"
                  style={{ fontWeight: 500 }}
                  disabled
                  title="Coming soon"
                >
                  {provider}
                </button>
              ))}
            </div>
            </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  return score;
}

function getPasswordStrengthLabel(password: string): string {
  const strength = getPasswordStrength(password);
  if (strength <= 1) return 'Weak — add uppercase, numbers, and make it 8+ chars';
  if (strength === 2) return 'Fair — keep improving';
  if (strength === 3) return 'Good — almost there';
  return 'Strong password';
}