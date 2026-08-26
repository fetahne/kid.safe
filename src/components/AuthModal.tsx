import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  User as UserIcon, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  onRegister: (newUser: Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'childrenCount'>) => void;
  existingUsers: User[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  existingUsers,
}) => {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  
  // Login fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register fields (Only username and password)
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickAdminLogin = () => {
    setLoginUsername('fetahne');
    setLoginPassword('fetahne07');
    setErrorMessage(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Check pre-configured super credentials
    if (loginUsername.toLowerCase() === 'fetahne' && loginPassword === 'fetahne07') {
      const adminUser = existingUsers.find(u => u.username === 'fetahne') || {
        id: 'user-admin-fetahne',
        username: 'fetahne',
        fullName: 'Fetahne Aykan',
        email: 'FetahneAykan@gmail.com',
        phone: '+90 555 123 4567',
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: '2026-08-20T10:00:00Z',
        lastLogin: new Date().toISOString(),
        childrenCount: 2,
      };
      onLogin(adminUser);
      onClose();
      return;
    }

    // Check other registered users
    const matchedUser = existingUsers.find(
      u => u.username.toLowerCase() === loginUsername.toLowerCase()
    );

    if (matchedUser) {
      if (loginPassword.length >= 4) {
        onLogin(matchedUser);
        onClose();
        return;
      } else {
        setErrorMessage('Şifre en az 4 karakter olmalıdır.');
        return;
      }
    }

    setErrorMessage('Kullanıcı adı veya şifre hatalı. Lütfen "fetahne" ve "fetahne07" ile giriş yapın veya yeni kayıt olun.');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = regUsername.trim();
    if (!cleanUsername || !regPassword) {
      setErrorMessage('Lütfen kullanıcı adı ve şifre giriniz.');
      return;
    }

    if (regPassword.length < 4) {
      setErrorMessage('Şifre en az 4 karakter olmalıdır.');
      return;
    }

    if (existingUsers.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      setErrorMessage('Bu kullanıcı adı zaten kullanılmaktadır.');
      return;
    }

    onRegister({
      fullName: cleanUsername,
      username: cleanUsername.toLowerCase(),
      email: `${cleanUsername.toLowerCase()}@kidsafe.local`,
      phone: '',
      role: 'PARENT',
      status: 'ACTIVE',
    });

    setSuccessMessage('Hesabınız başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.');
    setTimeout(() => {
      setTab('LOGIN');
      setLoginUsername(cleanUsername);
      setLoginPassword(regPassword);
      setSuccessMessage(null);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">KidSafe Erişim Portalı</h2>
              <p className="text-xs text-slate-500">Yönetici & Ebeveyn Yetkilendirme</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Admin Demo Login Banner */}
        <div className="p-3.5 bg-indigo-50/70 border-b border-indigo-100/70 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-indigo-900">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="font-semibold text-slate-900">Yönetici Giriş Bilgileri:</span>
              <span className="font-mono text-indigo-700 ml-1.5 font-bold">fetahne</span> / <span className="font-mono text-indigo-700 font-bold">fetahne07</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleQuickAdminLogin}
            className="text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg transition-colors shadow-sm"
          >
            Otomatik Doldur
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => { setTab('LOGIN'); setErrorMessage(null); }}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              tab === 'LOGIN'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Giriş Yap
          </button>
          <button
            onClick={() => { setTab('REGISTER'); setErrorMessage(null); }}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              tab === 'REGISTER'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Dışarıdan Kayıt Ol
          </button>
        </div>

        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {tab === 'LOGIN' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Kullanıcı Adı
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-login-username"
                    type="text"
                    required
                    placeholder="Örn: fetahne"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-login-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <button
                id="btn-submit-login"
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm shadow-indigo-500/20"
              >
                Giriş Yap
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Kullanıcı Adı
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-reg-username"
                    type="text"
                    required
                    placeholder="Örn: ayseyilmaz"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-reg-password"
                    type="password"
                    required
                    placeholder="En az 4 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <button
                id="btn-submit-register"
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all mt-2 shadow-sm shadow-indigo-500/20"
              >
                Kayıt Ol ve Sisteme Katıl
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
