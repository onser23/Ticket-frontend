import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2, Mail, AlertCircle, RefreshCw, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';
import userApi from '../utils/userApi';
import OtpInput from '../components/OtpInput';
import { validateOtp } from '../utils/validators';

const UserVerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email;
  const [email] = useState(emailFromState || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!emailFromState) {
      navigate('/register', { replace: true });
    }
  }, [emailFromState, navigate]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async () => {
    setErrorMessage('');

    const otpErr = validateOtp(otp);
    if (otpErr) return setErrorMessage(otpErr);

    setLoading(true);
    try {
      await userApi.post('/auth/verify-otp', { email, code: otp });
      toast.success('Email uğurla təsdiqləndi! İndi login ola bilərsiniz.');
      navigate('/login');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'OTP təsdiqi uğursuz oldu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleResend = async () => {
    setErrorMessage('');
    setResending(true);
    try {
      await userApi.post('/auth/resend-otp', { email });
      toast.success('Yeni OTP email ünvanınıza göndərildi');
      setCooldown(60);
    } catch (error) {
      const msg = error.response?.data?.message || 'Yenidən göndərmə uğursuz oldu';
      setErrorMessage(msg);
      const match = msg.match(/(\d+)\s*saniyə/);
      if (match) setCooldown(parseInt(match[1], 10));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 lg:p-10 animate-fadeIn">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-2xl mb-4">
              <Ticket className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Email Təsdiqi</h1>
            <p className="text-slate-500 text-sm mt-2 text-center">
              <Mail className="inline w-4 h-4 mr-1" />
              <strong>{email}</strong> ünvanına göndərilmiş 6 rəqəmli kodu daxil edin
            </p>
          </div>

          {errorMessage && (
            <div role="alert" className="animate-slideDown mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 flex-1">{errorMessage}</p>
            </div>
          )}

          <OtpInput value={otp} onChange={setOtp} disabled={loading} />

          <button type="button" onClick={handleVerify} disabled={loading || otp.length !== 6} className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /><span>Yoxlanılır...</span></>) : (<span>Təsdiqlə</span>)}
          </button>

          <div className="mt-6 text-center">
            <button type="button" onClick={handleResend} disabled={resending || cooldown > 0} className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:text-slate-400 disabled:cursor-not-allowed inline-flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
              {cooldown > 0 ? `Yenidən göndər (${cooldown}s)` : 'Kodu yenidən göndər'}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-slate-600">
            <Link to="/register" className="text-primary-600 hover:text-primary-700">← Qeydiyyata qayıt</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserVerifyOtp;
