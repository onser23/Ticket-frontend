import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  AlertCircle,
  X,
  Ticket,
} from "lucide-react";
import toast from "react-hot-toast";
import { useUserAuth } from "../context/UserAuthContext";
import userApi from "../utils/userApi";
import { validateEmail, validatePassword } from "../utils/validators";

const UserLogin = () => {
  const navigate = useNavigate();
  const { login } = useUserAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const emailErr = validateEmail(formData.email);
    if (emailErr) return setErrorMessage(emailErr);
    const passErr = validatePassword(formData.password);
    if (passErr) return setErrorMessage(passErr);

    setLoading(true);
    try {
      const res = await userApi.post("/auth/login", formData);
      const { token, user } = res.data;
      login(token, user);
      toast.success(`Xoş gəldiniz, ${user.firstName}!`);
      navigate("/");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Giriş uğursuz oldu. Yenidən cəhd edin.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob-slow [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-overlay filter blur-3xl opacity-50 animate-blob-slower [animation-delay:4s]" />

        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full animate-fadeIn">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl mb-8">
            <Ticket className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-6 text-center leading-tight">
            Müraciət
            <br />
            Sistemi
          </h1>
          <p className="text-lg text-indigo-100 text-center max-w-md leading-relaxed">
            Problemlərinizi rəsmi şəkildə bildirin, status izləyin, admin ilə
            əlaqə saxlayın
          </p>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <span className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium">
              📝 Müraciət
            </span>
            <span className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium">
              📊 İzləmə
            </span>
            <span className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium">
              💬 Cavab
            </span>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="lg:hidden flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-2xl mb-3">
            <Ticket className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Müraciət Sistemi
          </h1>
          <p className="text-slate-500 text-sm mt-1">Hesabınıza daxil olun</p>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white/80 lg:backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 lg:p-10 animate-fadeIn">
            <div className="hidden lg:block mb-8">
              <h2 className="text-3xl font-bold text-slate-900">
                Xoş gəldiniz
              </h2>
              <p className="text-slate-500 mt-2">
                Hesabınıza daxil olmaq üçün məlumatları daxil edin
              </p>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="animate-slideDown mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">
                    Giriş uğursuz oldu
                  </p>
                  <p className="text-sm text-red-600 mt-0.5">{errorMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage("")}
                  className="text-red-400 hover:text-red-600"
                  aria-label="Xətanı bağla"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  E-poçt
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    autoComplete="email"
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Şifrə
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Şifrənizi daxil edin"
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-60"
                    aria-label={
                      showPassword ? "Şifrəni gizlət" : "Şifrəni göstər"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link
                  to="/forgot-password"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Şifrəni unutdum?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Giriş edilir...</span>
                  </>
                ) : (
                  <span>Daxil ol</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              Hesabınız yoxdur?{" "}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Qeydiyyatdan keçin
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            © 2026 Ticket Sistemi ·{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
