import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Mail, Phone, Fingerprint, Eye, EyeOff, ArrowLeft, Shield } from 'lucide-react';
import { useAppContext } from './AppContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAppContext();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/home');
  };

  const handleSendOtp = () => setShowOtp(true);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  return (
    <div className="flex justify-center bg-[#F0F0F0] min-h-screen">
      <div className="w-full max-w-[412px] min-h-screen bg-white" style={{ fontFamily: "'Roboto', sans-serif" }}>
        {/* Header */}
        <div className="px-4 pt-12 pb-6" style={{ background: 'linear-gradient(135deg, #362415, #00704A)' }}>
          <button onClick={() => navigate('/splash')} className="text-white mb-4 cursor-pointer">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-white text-[28px]" style={{ fontWeight: 700 }}>Welcome to BJC</h1>
          <p className="text-white/70 text-[14px] mt-1">Sign in to order your favorites</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[rgba(0,0,0,0.12)]">
          {(['login', 'register'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setShowOtp(false); }}
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

        <div className="px-6 pt-6">
          {!showOtp ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              {/* Method Toggle */}
              <div className="flex gap-2 mb-6">
                {(['email', 'phone'] as const).map(method => (
                  <button
                    key={method}
                    onClick={() => setLoginMethod(method)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-[20px] text-[13px] cursor-pointer transition-all ${
                      loginMethod === method
                        ? 'bg-[#00704A] text-white'
                        : 'bg-[#F5F5F5] text-[#757575]'
                    }`}
                    style={{ fontWeight: 500 }}
                  >
                    {method === 'email' ? <Mail size={16} /> : <Phone size={16} />}
                    {method === 'email' ? 'Email' : 'Phone'}
                  </button>
                ))}
              </div>

              {/* Input Fields */}
              {loginMethod === 'email' ? (
                <>
                  <div className="mb-4">
                    <label className="text-[12px] text-[#757575] mb-1 block">Email Address</label>
                    <div className="flex items-center bg-[#F5F5F5] rounded-[12px] px-4 py-3">
                      <Mail size={18} color="#757575" className="mr-3" />
                      <input type="email" placeholder="your@email.com" className="bg-transparent flex-1 outline-none text-[14px]" />
                    </div>
                  </div>
                  {activeTab === 'login' && (
                    <div className="mb-4">
                      <label className="text-[12px] text-[#757575] mb-1 block">Password</label>
                      <div className="flex items-center bg-[#F5F5F5] rounded-[12px] px-4 py-3">
                        <Shield size={18} color="#757575" className="mr-3" />
                        <input type={showPassword ? 'text' : 'password'} placeholder="Enter password" className="bg-transparent flex-1 outline-none text-[14px]" />
                        <button onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                          {showPassword ? <EyeOff size={18} color="#757575" /> : <Eye size={18} color="#757575" />}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="mb-4">
                  <label className="text-[12px] text-[#757575] mb-1 block">Phone Number</label>
                  <div className="flex items-center bg-[#F5F5F5] rounded-[12px] px-4 py-3">
                    <span className="text-[14px] text-[#362415] mr-2" style={{ fontWeight: 500 }}>+63</span>
                    <div className="w-px h-5 bg-[rgba(0,0,0,0.12)] mr-3" />
                    <Phone size={18} color="#757575" className="mr-3" />
                    <input type="tel" placeholder="9XX XXX XXXX" className="bg-transparent flex-1 outline-none text-[14px]" />
                  </div>
                </div>
              )}

              {activeTab === 'register' && (
                <div className="mb-4">
                  <label className="text-[12px] text-[#757575] mb-1 block">Full Name</label>
                  <div className="flex items-center bg-[#F5F5F5] rounded-[12px] px-4 py-3">
                    <input type="text" placeholder="Juan Dela Cruz" className="bg-transparent flex-1 outline-none text-[14px]" />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={loginMethod === 'phone' ? handleSendOtp : handleLogin}
                className="w-full py-3.5 rounded-[12px] text-white text-[15px] mt-2 cursor-pointer"
                style={{ background: '#00704A', fontWeight: 600 }}
              >
                {activeTab === 'login'
                  ? (loginMethod === 'phone' ? 'Send OTP' : 'Sign In')
                  : (loginMethod === 'phone' ? 'Send OTP' : 'Create Account')
                }
              </button>

              {/* Biometric */}
              {activeTab === 'login' && (
                <button
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-[12px] mt-3 border border-[rgba(0,0,0,0.12)] cursor-pointer"
                >
                  <Fingerprint size={22} color="#00704A" />
                  <span className="text-[14px] text-[#362415]" style={{ fontWeight: 500 }}>Login with Biometrics</span>
                </button>
              )}

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-[rgba(0,0,0,0.12)]" />
                <span className="px-4 text-[12px] text-[#757575]">or continue with</span>
                <div className="flex-1 h-px bg-[rgba(0,0,0,0.12)]" />
              </div>

              {/* Social Login */}
              <div className="flex gap-3">
                {['Google', 'Facebook', 'Apple'].map(provider => (
                  <button
                    key={provider}
                    onClick={handleLogin}
                    className="flex-1 py-3 rounded-[12px] bg-[#F5F5F5] text-[13px] text-[#362415] cursor-pointer"
                    style={{ fontWeight: 500 }}
                  >
                    {provider}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto mb-4">
                  <Phone size={28} color="#00704A" />
                </div>
                <h3 className="text-[18px] text-[#362415]" style={{ fontWeight: 600 }}>Verify Your Number</h3>
                <p className="text-[13px] text-[#757575] mt-1">We sent a 6-digit code to +63 9XX XXX XXXX</p>
              </div>

              <div className="flex gap-2 justify-center mb-8">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    className="w-[44px] h-[52px] rounded-[12px] bg-[#F5F5F5] text-center text-[20px] outline-none focus:ring-2 focus:ring-[#00704A]"
                    style={{ fontWeight: 600 }}
                  />
                ))}
              </div>

              <button
                onClick={handleLogin}
                className="w-full py-3.5 rounded-[12px] text-white text-[15px] cursor-pointer"
                style={{ background: '#00704A', fontWeight: 600 }}
              >
                Verify & Continue
              </button>

              <div className="text-center mt-4">
                <button className="text-[#00704A] text-[13px] cursor-pointer" style={{ fontWeight: 500 }}>
                  Resend Code (0:59)
                </button>
              </div>

              <button onClick={() => setShowOtp(false)} className="w-full text-center mt-4 text-[13px] text-[#757575] cursor-pointer">
                Change Number
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}