import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  Bell, 
  Sliders, 
  Tablet, 
  Lock, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  Smartphone,
  Mail,
  X
} from 'lucide-react';
import { User, ParentNotification } from '../types';

interface NavbarProps {
  currentUser: User | null;
  activeView: 'PARENT' | 'KID' | 'ADMIN' | 'SQL';
  setActiveView: (view: 'PARENT' | 'KID' | 'ADMIN' | 'SQL') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  notifications: ParentNotification[];
  onMarkNotificationRead: (id: string) => void;
  onOpenPrivacy: () => void;
  onTriggerKidLock: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeView,
  setActiveView,
  onOpenAuth,
  onLogout,
  notifications,
  onMarkNotificationRead,
  onOpenPrivacy,
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-extrabold text-white text-base shadow-md shadow-indigo-500/30">
            F
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">
                Fetahne Safe
              </span>
              <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Sistem Aktif
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Ekran Süresi & Güvenli Çocuk Portalı</p>
          </div>
        </div>

        {/* Center Nav Views */}
        <div className="hidden md:flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            id="nav-btn-parent"
            onClick={() => setActiveView('PARENT')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'PARENT'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Ebeveyn Paneli
          </button>

          <button
            id="nav-btn-kid"
            onClick={() => setActiveView('KID')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'KID'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            Çocuk Cihaz Modu
          </button>

          {currentUser?.role === 'ADMIN' && (
            <button
              id="nav-btn-admin"
              onClick={() => setActiveView('ADMIN')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'ADMIN'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Yönetici Portalı
            </button>
          )}

          <button
            id="nav-btn-sql"
            onClick={() => setActiveView('SQL')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'SQL'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Supabase SQL
          </button>
        </div>

        {/* Right Actions: Project ID, Privacy, Notifications, User */}
        <div className="flex items-center gap-3">
          
          {/* Project ID indicator */}
          <div className="hidden lg:flex flex-col items-end mr-1">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Proje ID</span>
            <span className="text-[11px] font-mono text-cyan-300 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md">
              frexkrmwkpyhruoryjvj
            </span>
          </div>

          {/* Privacy Button */}
          <button
            id="btn-privacy-settings"
            onClick={onOpenPrivacy}
            title="KVKK & Veri Gizliliği"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-xs flex items-center gap-1.5 border border-slate-800/60"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline text-xs font-medium">Gizlilik</span>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              id="btn-notifications-toggle"
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors border border-slate-800/60"
              title="Ebeveyn Bildirimleri (SMS & E-Posta)"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">Ebeveyn Canlı Bildirimleri</span>
                  </div>
                  <button 
                    onClick={() => setShowNotifMenu(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Henüz bildirim kaydı yok.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => onMarkNotificationRead(notif.id)}
                        className={`p-3.5 text-xs transition-colors cursor-pointer hover:bg-slate-800/50 ${
                          notif.isRead ? 'opacity-70 bg-slate-900' : 'bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-200">{notif.title}</span>
                          <span className="text-[10px] text-slate-500 whitespace-nowrap">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">{notif.message}</p>
                        <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                          {notif.channel === 'SMS' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              <Smartphone className="w-3 h-3" /> SMS ({notif.recipient})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                              <Mail className="w-3 h-3" /> E-Posta ({notif.recipient})
                            </span>
                          )}
                          {!notif.isRead && (
                            <span className="text-amber-400 font-bold ml-auto">Yeni</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 border-t border-slate-800 bg-slate-950 text-center">
                  <span className="text-[11px] text-slate-400">
                    Giriş & Çıkış bildirimleri ebeveyn telefon/mailine anlık iletilir.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* User Account / Login State */}
          {currentUser ? (
            <div className="flex items-center gap-2.5 pl-2.5 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs">
                {currentUser.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-xs font-bold text-white">{currentUser.username}</span>
                <span className="text-[10px] text-indigo-400 font-medium">
                  {currentUser.role === 'ADMIN' ? 'Admin / Ebeveyn' : 'Ebeveyn'}
                </span>
              </div>
              <button
                id="btn-user-logout"
                onClick={onLogout}
                title="Çıkış Yap"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-open-auth-modal"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              Giriş & Kayıt
            </button>
          )}

        </div>
      </div>

      {/* Mobile Submenu */}
      <div className="md:hidden flex items-center justify-around bg-slate-950 border-t border-slate-800 px-2 py-2">
        <button
          onClick={() => setActiveView('PARENT')}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${
            activeView === 'PARENT' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'
          }`}
        >
          <Sliders className="w-3 h-3" /> Ebeveyn
        </button>
        <button
          onClick={() => setActiveView('KID')}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${
            activeView === 'KID' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          <Tablet className="w-3 h-3" /> Çocuk Modu
        </button>
        {currentUser?.role === 'ADMIN' && (
          <button
            onClick={() => setActiveView('ADMIN')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${
              activeView === 'ADMIN' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            <ShieldCheck className="w-3 h-3" /> Yönetici
          </button>
        )}
        <button
          onClick={() => setActiveView('SQL')}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${
            activeView === 'SQL' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          <Database className="w-3 h-3" /> SQL
        </button>
      </div>
    </header>
  );
};
