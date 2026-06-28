import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import userApi from '../utils/userApi';
import OtpInput from '../components/OtpInput';
import { validateOtp, validatePassword } from '../utils/validators';

const UserResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email;
  const [email] = useState(emailFromState || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!emailFromState) {
      navigate('/forgot-password', { replace: true });
    }
  }, [emailFromState, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const otpErr = validateOtp(otp);
    if (otpErr) return setErrorMessage(otpErr);
    const passErr = validatePassword(newPassword);
    if (passErr) return setErrorMessage(passErr);

    setLoading(true);
    try {
      await userApi.post('/auth/reset-password', { email, code: otp, newPassword });
      toast.success('Şifrə uğurla dəyişdirildi və email təsdiqləndi. İndi login ola bilərsiniz.');
      navigate('/login');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Şifrə dəyişdirilmədi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 lg:p-10 animate-fadeIn">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-2xl mb-4">
              <KeyRound className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Yeni şifrə təyin et</h1>
            <p className="text-slate-500 text-sm mt-2 text-center">
              <strong>{email}</strong> üçün OTP kodunu və yeni şifrəni daxil edin
            </p>
          </div>

          {errorMessage && (
            <div role="alert" className="animate-slideDown mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 flex-1">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">OTP kod</label>
              <OtpInput value={otp} onChange={setOtp} disabled={loading} />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700 mb-2">Yeni şifrə (min 6 simvol)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input id="newPassword" type={showPassword ? 'text' : 'password'} name="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Yeni şifrə" autoComplete="new-password" disabled={loading} className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-60" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-60" aria-label={showPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2">
              {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /><span>Dəyişdirilir...</span></>) : (<span>Şifrəni dəyişdir</span>)}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">← Login səhifəsinə qayıt</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserResetPassword;
