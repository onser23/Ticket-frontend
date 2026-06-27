import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Loader2, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import userApi from '../utils/userApi';
import { validateEmail } from '../utils/validators';

const UserForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const emailErr = validateEmail(email);
    if (emailErr) return setErrorMessage(emailErr);

    setLoading(true);
    try {
      await userApi.post('/auth/forgot-password', { email });
      toast.success('Əgər email mövcuddursa, reset kodu göndərildi');
      navigate('/reset-password', { state: { email } });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Sorğu uğursuz oldu');
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
            <h1 className="text-2xl font-bold text-slate-900">Şifrəni unutdum</h1>
            <p className="text-slate-500 text-sm mt-2 text-center">
              Email ünvanınızı daxil edin, sizə reset kodu göndərək
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
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">E-poçt</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input id="email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" autoComplete="email" disabled={loading} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-60" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2">
              {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /><span>Göndərilir...</span></>) : (<><span>Reset kodu göndər</span><ArrowRight className="w-5 h-5" /></>)}
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

export default UserForgotPassword;
