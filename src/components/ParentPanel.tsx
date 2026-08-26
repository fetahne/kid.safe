import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  ShieldCheck, 
  KeyRound, 
  HelpCircle, 
  Camera, 
  Smartphone, 
  Mail, 
  Check, 
  Sliders, 
  Lock, 
  Unlock, 
  Send, 
  AlertTriangle, 
  Tablet, 
  CheckCircle2, 
  Info,
  Sparkles,
  RefreshCw,
  Bell,
  Settings,
  Flame
} from 'lucide-react';
import { ChildProfile, AllowedApp, UnlockMethod, User } from '../types';
import { AGE_PRESETS, DEFAULT_ALLOWED_APPS } from '../data/initialData';

interface ParentPanelProps {
  currentUser: User | null;
  childrenList: ChildProfile[];
  activeChildId: string;
  onSelectChild: (id: string) => void;
  onUpdateChild: (updatedChild: ChildProfile) => void;
  onAddChild: (newChild: Omit<ChildProfile, 'id'>) => void;
  onDeleteChild: (id: string) => void;
  allowedAppsList: AllowedApp[];
  onAddCustomApp: (newApp: Omit<AllowedApp, 'id'>) => void;
  onSendRemoteMessage: (msg: string) => void;
  onExtendChildTime: (minutes: number) => void;
  onToggleLockChild: () => void;
  onLogAction: (actionType: any, details: string, severity: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS') => void;
}

export const ParentPanel: React.FC<ParentPanelProps> = ({
  currentUser,
  childrenList,
  activeChildId,
  onSelectChild,
  onUpdateChild,
  onAddChild,
  onDeleteChild,
  allowedAppsList,
  onAddCustomApp,
  onSendRemoteMessage,
  onExtendChildTime,
  onToggleLockChild,
  onLogAction,
}) => {
  const activeChild = childrenList.find(c => c.id === activeChildId) || childrenList[0];

  // Tab State
  const [activeTab, setActiveTab] = useState<'TIME_LIMITS' | 'ALLOWED_APPS' | 'SECURITY_METHOD' | 'NOTIFICATIONS' | 'REMOTE_CONTROL'>('TIME_LIMITS');

  // Custom App Modal state
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [customAppName, setCustomAppName] = useState('');
  const [customAppUrl, setCustomAppUrl] = useState('');
  const [customAppCategory, setCustomAppCategory] = useState<'EDUCATIONAL' | 'GAMES' | 'VIDEO' | 'READING' | 'CREATIVE'>('EDUCATIONAL');
  const [customAppDesc, setCustomAppDesc] = useState('');

  // Add Child Modal State
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState(6);
  const [newChildDevice, setNewChildDevice] = useState('Tablet');
  const [newChildAvatar, setNewChildAvatar] = useState('🧒');

  // Remote message input
  const [instantMessage, setInstantMessage] = useState('');
  const [messageSentNotice, setMessageSentNotice] = useState(false);

  // Handle Age preset click
  const handleApplyAgePreset = (presetKey: string) => {
    if (!activeChild) return;
    const preset = AGE_PRESETS[presetKey];
    if (!preset) return;

    const updated = {
      ...activeChild,
      dailyTimeLimitMinutes: preset.recommendedMinutes,
      // Merge recommended apps
      allowedApps: Array.from(new Set([...activeChild.allowedApps, ...preset.recommendedApps])),
    };
    onUpdateChild(updated);
    onLogAction('SETTINGS_CHANGED', `${activeChild.name} için "${preset.ageGroup}" yaş paketi uygulandı (${preset.recommendedMinutes} dk).`, 'INFO');
  };

  // Toggle allowed app
  const handleToggleApp = (appId: string) => {
    if (!activeChild) return;
    let nextAllowed: string[];
    if (activeChild.allowedApps.includes(appId)) {
      nextAllowed = activeChild.allowedApps.filter(id => id !== appId);
    } else {
      nextAllowed = [...activeChild.allowedApps, appId];
    }
    const updated = { ...activeChild, allowedApps: nextAllowed };
    onUpdateChild(updated);
    onLogAction('SETTINGS_CHANGED', `${activeChild.name} için uygulama izinleri güncellendi.`, 'INFO');
  };

  // Submit custom app
  const handleAddCustomAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAppName || !activeChild) return;
    onAddCustomApp({
      name: customAppName,
      url: customAppUrl,
      category: customAppCategory,
      description: customAppDesc || 'Ebeveyn tarafından eklenen güvenli bağlantı.',
      iconName: 'Globe',
      isCustom: true,
      minAge: activeChild.age,
    });
    setCustomAppName('');
    setCustomAppUrl('');
    setCustomAppDesc('');
    setShowAddAppModal(false);
  };

  // Submit new child
  const handleAddChildSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName) return;

    onAddChild({
      parentId: currentUser?.id || 'user-admin-fetahne',
      name: newChildName,
      age: newChildAge,
      avatar: newChildAvatar,
      deviceName: newChildDevice || 'Tablet',
      dailyTimeLimitMinutes: newChildAge <= 5 ? 30 : newChildAge <= 9 ? 45 : 60,
      usedTodayMinutes: 0,
      unlockMethod: 'PIN',
      parentPin: '1234',
      securityQuestion: {
        question: 'Türkiye Cumhuriyeti hangi yılda kurulmuştur?',
        answer: '1923',
      },
      allowedApps: ['app-drawing', 'app-tales', 'app-math', 'app-eba'],
      notifyOnSessionStart: true,
      notifyOnSessionEnd: true,
      notificationChannel: 'BOTH',
      parentEmail: currentUser?.email || 'FetahneAykan@gmail.com',
      parentPhone: currentUser?.phone || '+90 555 123 4567',
      isLocked: false,
    });

    setNewChildName('');
    setShowAddChildModal(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instantMessage) return;
    onSendRemoteMessage(instantMessage);
    setInstantMessage('');
    setMessageSentNotice(true);
    setTimeout(() => setMessageSentNotice(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header & Overview Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider">
              Ebeveyn Kontrol Merkezi
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Sistem Aktif
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Genel Bakış & Çocuk Yönetimi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Çocuğunuzun günlük ekran süresini yapılandırın, izinli uygulamaları denetleyin ve giriş/çıkış bildirimlerini anlık takip edin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Yönetici</p>
            <p className="text-xs font-bold text-slate-800">{currentUser?.fullName || 'Fetahne Aykan'}</p>
          </div>
          <button
            onClick={() => setShowAddChildModal(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            Yeni Çocuk Ekle
          </button>
        </div>
      </div>

      {/* Main Content Area: If no children registered for this parent */}
      {childrenList.length === 0 || !activeChild ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center shadow-sm max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100/80">
            <Tablet className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">
            Henüz Kayıtlı Bir Çocuk Profili Yok
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed">
            Kendi çocuğunuzun günlük ekran süresini sınırlamak, güvenli eğitici uygulamaları seçmek ve uzaktan kilit mekanizmalarını yönetmek için ilk çocuk profilinizi oluşturun.
          </p>
          <button
            onClick={() => setShowAddChildModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            İlk Çocuk Profilini Ekle
          </button>
        </div>
      ) : (
        <>
          {/* Children Profile Cards Row (Sleek Interface Style) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Kayıtlı Çocuk Profilleri ({childrenList.length})
          </h3>
          <span className="text-[11px] text-slate-400">Yönetmek için bir profil seçin</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {childrenList.map((child, idx) => {
            const isSelected = child.id === activeChild.id;
            const remainingMins = Math.max(0, child.dailyTimeLimitMinutes - child.usedTodayMinutes);
            const progressPercent = Math.min(100, Math.round((child.usedTodayMinutes / child.dailyTimeLimitMinutes) * 100));
            const isPink = idx % 2 === 1;

            return (
              <div
                key={child.id}
                onClick={() => onSelectChild(child.id)}
                className={`bg-white p-5 rounded-2xl shadow-sm border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                    : 'border-slate-200/80 hover:border-slate-300 hover:shadow'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-bold ${
                    isPink ? 'bg-pink-50 text-pink-600 border border-pink-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                  }`}>
                    {child.avatar || (isPink ? '👧' : '👦')}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    child.isLocked 
                      ? 'bg-rose-100 text-rose-700' 
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {child.isLocked ? 'Kilitli' : 'Çevrimiçi'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {child.name} <span className="text-xs font-medium text-slate-400">({child.age} Yaş)</span>
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Kalan: <strong className="text-slate-800">{remainingMins} dk</strong> / {child.dailyTimeLimitMinutes} dk
                </p>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${isPink ? 'bg-pink-500' : 'bg-indigo-600'}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Control Tabs & Settings Body */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side Navigation Tabs */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-2 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab('TIME_LIMITS')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'TIME_LIMITS'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              1. Ekran Süresi & Yaş Kuralı
            </button>

            <button
              onClick={() => setActiveTab('ALLOWED_APPS')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'ALLOWED_APPS'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              2. İzinli Uygulamalar ({activeChild.allowedApps.length})
            </button>

            <button
              onClick={() => setActiveTab('SECURITY_METHOD')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'SECURITY_METHOD'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Lock className="w-4 h-4" />
              3. Güvenlik & Kilit Açma
            </button>

            <button
              onClick={() => setActiveTab('NOTIFICATIONS')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'NOTIFICATIONS'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Bell className="w-4 h-4" />
              4. SMS & E-Posta Bildirimleri
            </button>

            <button
              onClick={() => setActiveTab('REMOTE_CONTROL')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'REMOTE_CONTROL'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Tablet className="w-4 h-4" />
              5. Canlı Uzaktan Kontrol
            </button>
          </div>

          {/* Active Child Summary Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Aktif Cihaz</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeChild.isLocked 
                  ? 'bg-rose-100 text-rose-700' 
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {activeChild.isLocked ? 'KİLİTLİ' : 'ÇEVRİMİÇİ'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
                {activeChild.avatar || '🧒'}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">{activeChild.name}</h4>
                <p className="text-xs text-slate-500">{activeChild.deviceName}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
              <div className="flex justify-between">
                <span>Tanımlı Süre:</span>
                <span className="font-bold text-slate-900">{activeChild.dailyTimeLimitMinutes} dakika</span>
              </div>
              <div className="flex justify-between">
                <span>Bugün Kullanılan:</span>
                <span className="font-bold text-indigo-600">{activeChild.usedTodayMinutes} dakika</span>
              </div>
              <div className="flex justify-between">
                <span>Kilit Yöntemi:</span>
                <span className="font-bold text-slate-800">
                  {activeChild.unlockMethod === 'PIN' ? 'PIN Kodu' : 
                   activeChild.unlockMethod === 'SECURITY_QUESTION' ? 'Güvenlik Sorusu' : 'Yüz Tanıma'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>İzinli Uygulama:</span>
                <span className="font-bold text-slate-800">{activeChild.allowedApps.length} adet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3">
          
          {/* TAB 1: TIME LIMITS & AGE PRESETS */}
          {activeTab === 'TIME_LIMITS' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Günlük Ekran Süresi Yapılandırması
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Çocuğunuzun yaş grubuna göre pedagog onaylı süreleri tek tıkla seçebilir veya özel bir süre belirleyebilirsiniz.
                </p>
              </div>

              {/* Age Preset Selector Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Pedagog & DSÖ Tavsiyeli Yaş Grupları
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(AGE_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => handleApplyAgePreset(key)}
                      className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                        activeChild.dailyTimeLimitMinutes === preset.recommendedMinutes
                          ? 'bg-indigo-50/70 border-indigo-400 shadow-sm'
                          : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">{preset.ageGroup}</span>
                        <span className="text-xs font-extrabold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-lg">
                          {preset.recommendedMinutes} Dakika
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {preset.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Slider */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Özel Günlük Ekran Süresi:</span>
                  <span className="text-xl font-mono font-black text-indigo-600">
                    {activeChild.dailyTimeLimitMinutes} Dakika
                  </span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="180"
                  step="5"
                  value={activeChild.dailyTimeLimitMinutes}
                  onChange={(e) => {
                    const mins = Number(e.target.value);
                    onUpdateChild({ ...activeChild, dailyTimeLimitMinutes: mins });
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />

                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>10 dk (Minimal)</span>
                  <span>45 dk (Önerilen)</span>
                  <span>90 dk</span>
                  <span>180 dk (Maksimum)</span>
                </div>
              </div>

              {/* Sound warning explanation badge */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-amber-950">Akıllı Sesli Uyarı Mekanizması:</span>
                  Ekran süresinin bitmesine <strong>son 10 dakika</strong> ve <strong>son 5 dakika</strong> kala çocuğun cihazında yumuşak sesli melodi çalacak ve görsel uyarı çıkacaktır.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ALLOWED APPS & WEBSITES */}
          {activeTab === 'ALLOWED_APPS' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    İzin Verilen Uygulamalar ve Siteler (Beyaz Liste)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Çocuğun cihazında yalnızca işaretlediğiniz uygulamalar açılabilir. Diğer tüm siteler engellenir.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddAppModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Özel Site / Uygulama Ekle
                </button>
              </div>

              {/* Apps Checkbox Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {allowedAppsList.map((app) => {
                  const isChecked = activeChild.allowedApps.includes(app.id);
                  return (
                    <div
                      key={app.id}
                      onClick={() => handleToggleApp(app.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isChecked
                          ? 'bg-indigo-50/50 border-indigo-400 shadow-sm'
                          : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 opacity-80'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                          isChecked ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {app.iconName === 'Palette' ? '🎨' :
                           app.iconName === 'Calculator' ? '🔢' :
                           app.iconName === 'Sparkles' ? '✨' :
                           app.iconName === 'Code' ? '💻' :
                           app.iconName === 'GraduationCap' ? '🎓' :
                           app.iconName === 'BookOpen' ? '📖' :
                           app.iconName === 'Languages' ? '🦉' :
                           app.iconName === 'Youtube' ? '▶️' :
                           app.iconName === 'Tv' ? '📺' : '🌐'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{app.name}</span>
                            {app.minAge && (
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                                {app.minAge}+ Yaş
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                            {app.description}
                          </p>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY & UNLOCK METHOD */}
          {activeTab === 'SECURITY_METHOD' && (
            <div className="space-y-6">
              
              {/* Highlighted Sleek Security Gate Card */}
              <div className="bg-indigo-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Güvenlik Kapısı
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white">
                    Çocuk Kilit Açma & Doğrulama Yöntemi
                  </h3>
                  <p className="text-xs text-indigo-200 max-w-xl leading-relaxed">
                    Süre bittiğinde veya ayarlara erişilmek istendiğinde çocuğun ebeveyn onayını aşamayacağı doğrulama protokolü:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => onUpdateChild({ ...activeChild, unlockMethod: 'PIN' })}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        activeChild.unlockMethod === 'PIN'
                          ? 'bg-white/15 border-white text-white font-bold shadow-md'
                          : 'bg-white/5 border-white/10 text-indigo-200 hover:bg-white/10'
                      }`}
                    >
                      <KeyRound className="w-5 h-5 shrink-0 text-amber-300" />
                      <div>
                        <span className="text-xs block">Ebeveyn PIN Şifresi</span>
                        <span className="text-[10px] text-indigo-300">4 Haneli Kod</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateChild({ ...activeChild, unlockMethod: 'SECURITY_QUESTION' })}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        activeChild.unlockMethod === 'SECURITY_QUESTION'
                          ? 'bg-white/15 border-white text-white font-bold shadow-md'
                          : 'bg-white/5 border-white/10 text-indigo-200 hover:bg-white/10'
                      }`}
                    >
                      <HelpCircle className="w-5 h-5 shrink-0 text-cyan-300" />
                      <div>
                        <span className="text-xs block">Mantık / Bilgi Sorusu</span>
                        <span className="text-[10px] text-indigo-300">Yetişkin Sorusu</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateChild({ ...activeChild, unlockMethod: 'FACE_RECOGNITION' })}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        activeChild.unlockMethod === 'FACE_RECOGNITION'
                          ? 'bg-white/15 border-white text-white font-bold shadow-md'
                          : 'bg-white/5 border-white/10 text-indigo-200 hover:bg-white/10'
                      }`}
                    >
                      <Camera className="w-5 h-5 shrink-0 text-emerald-300" />
                      <div>
                        <span className="text-xs block">Yüz Tanıma</span>
                        <span className="text-[10px] text-indigo-300">Biyometrik Kamera</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Subtle visual gradient glow */}
                <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-indigo-500/25 rounded-full blur-3xl" />
              </div>

              {/* Configuration Form Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                {activeChild.unlockMethod === 'PIN' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ebeveyn PIN Kodunu Belirleyin:
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={activeChild.parentPin}
                      onChange={(e) => onUpdateChild({ ...activeChild, parentPin: e.target.value })}
                      placeholder="1234"
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-indigo-600 font-mono font-bold tracking-widest focus:outline-none focus:border-indigo-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Bu PIN kodu çocuk cihazında kilit açılırken sorulacaktır.
                    </p>
                  </div>
                )}

                {activeChild.unlockMethod === 'SECURITY_QUESTION' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ebeveyne Yönelik Güvenlik Sorusu:
                      </label>
                      <input
                        type="text"
                        value={activeChild.securityQuestion?.question || ''}
                        onChange={(e) => onUpdateChild({
                          ...activeChild,
                          securityQuestion: {
                            question: e.target.value,
                            answer: activeChild.securityQuestion?.answer || '',
                          }
                        })}
                        placeholder="Örn: Türkiye Cumhuriyeti hangi yılda kurulmuştur?"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Doğru Cevap:
                      </label>
                      <input
                        type="text"
                        value={activeChild.securityQuestion?.answer || ''}
                        onChange={(e) => onUpdateChild({
                          ...activeChild,
                          securityQuestion: {
                            question: activeChild.securityQuestion?.question || '',
                            answer: e.target.value,
                          }
                        })}
                        placeholder="1923"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {activeChild.unlockMethod === 'FACE_RECOGNITION' && (
                  <div className="flex items-center gap-3 text-xs text-slate-700 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      Yüz tanıma biyometrisi aktiftir. Kilit açılacağı zaman cihaz kamerası otomatik olarak ebeveyn taraması yapacaktır.
                    </span>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: SMS & EMAIL NOTIFICATIONS */}
          {activeTab === 'NOTIFICATIONS' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-600" />
                  Giriş / Çıkış & Ebeveyn Bildirim Ayarları
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Çocuğunuz cihazı açtığında veya süresi dolup kapattığında telefonunuza SMS veya E-Posta ile anlık bilgi gönderilir.
                </p>
              </div>

              {/* Notification Toggles */}
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Cihaz Açılış Bildirimi</span>
                    <span className="text-[11px] text-slate-500">Çocuk ekrana başladığında anlık saat bilgisi gönder</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={activeChild.notifyOnSessionStart}
                    onChange={(e) => onUpdateChild({ ...activeChild, notifyOnSessionStart: e.target.checked })}
                    className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Cihaz Çıkış / Kapanış Bildirimi</span>
                    <span className="text-[11px] text-slate-500">Süre bittiğinde veya oturum sonlandığında bilgi ver</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={activeChild.notifyOnSessionEnd}
                    onChange={(e) => onUpdateChild({ ...activeChild, notifyOnSessionEnd: e.target.checked })}
                    className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Notification Channel & Target Inputs */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Bildirim İletim Kanalı
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['EMAIL', 'SMS', 'BOTH'].map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => onUpdateChild({ ...activeChild, notificationChannel: ch as any })}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          activeChild.notificationChannel === ch
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {ch === 'EMAIL' ? 'E-Posta' : ch === 'SMS' ? 'SMS' : 'Her İkisi (SMS + Mail)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Ebeveyn E-Posta Adresi
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={activeChild.parentEmail || ''}
                        onChange={(e) => onUpdateChild({ ...activeChild, parentEmail: e.target.value })}
                        placeholder="FetahneAykan@gmail.com"
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Ebeveyn Telefon Numarası (SMS)
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={activeChild.parentPhone || ''}
                        onChange={(e) => onUpdateChild({ ...activeChild, parentPhone: e.target.value })}
                        placeholder="+90 555 123 4567"
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: REMOTE CONTROL & LIVE ACTIONS */}
          {activeTab === 'REMOTE_CONTROL' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Tablet className="w-5 h-5 text-amber-500" />
                  Uzaktan Cihaz & Ekran Yönetimi
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Kendi telefonunuzdan veya bilgisayarınızdan çocuğun cihazını anında kilitleyebilir, süre ekleyebilir veya mesaj gönderebilirsiniz.
                </p>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={onToggleLockChild}
                  className={`p-5 rounded-2xl border text-center transition-all font-bold text-xs flex flex-col items-center gap-2 ${
                    activeChild.isLocked
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}
                >
                  {activeChild.isLocked ? (
                    <>
                      <Unlock className="w-7 h-7 text-emerald-600" />
                      <span>Cihaz Kilidini Aç</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-7 h-7 text-rose-600" />
                      <span>Cihazı Şimdi Kilitle</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onExtendChildTime(15)}
                  className="p-5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-2xl text-center transition-all font-bold text-xs text-indigo-900 flex flex-col items-center gap-2"
                >
                  <Clock className="w-7 h-7 text-indigo-600" />
                  <span>+15 Dakika Süre Ekle</span>
                </button>

                <button
                  onClick={() => onExtendChildTime(30)}
                  className="p-5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-2xl text-center transition-all font-bold text-xs text-indigo-900 flex flex-col items-center gap-2"
                >
                  <Clock className="w-7 h-7 text-indigo-600" />
                  <span>+30 Dakika Süre Ekle</span>
                </button>
              </div>

              {/* Send Instant Message */}
              <form onSubmit={handleSendMessage} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Çocuğun Ekranına Anlık Bildirim Gönder:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={instantMessage}
                    onChange={(e) => setInstantMessage(e.target.value)}
                    placeholder="Örn: Can yemek hazır, 5 dakika sonra masaya gel!"
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    Gönder
                  </button>
                </div>
                {messageSentNotice && (
                  <p className="text-xs text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Mesaj çocuğun tabletine başarıyla iletildi.
                  </p>
                )}
              </form>

              {/* Delete Child Profile */}
              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => {
                    if (confirm(`${activeChild.name} profilini silmek istediğinize emin misiniz?`)) {
                      onDeleteChild(activeChild.id);
                    }
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1.5 p-2 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Bu Profili Sil
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
        </>
      )}

      {/* ADD CHILD MODAL */}
      {showAddChildModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-900">
            <h3 className="text-base font-bold text-slate-900">Yeni Çocuk Profili Ekle</h3>
            
            <form onSubmit={handleAddChildSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Çocuğun Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Kerem"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Yaşı ({newChildAge})</label>
                  <input
                    type="number"
                    min="2"
                    max="18"
                    value={newChildAge}
                    onChange={(e) => setNewChildAge(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Avatar</label>
                  <select
                    value={newChildAvatar}
                    onChange={(e) => setNewChildAvatar(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="🧒">🧒 Çocuk 1</option>
                    <option value="👦">👦 Erkek Çocuk</option>
                    <option value="👧">👧 Kız Çocuk</option>
                    <option value="🧑">🧑 Genç</option>
                    <option value="🦊">🦊 Tilki</option>
                    <option value="🐼">🐼 Panda</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Cihaz Adı</label>
                <input
                  type="text"
                  value={newChildDevice}
                  onChange={(e) => setNewChildDevice(e.target.value)}
                  placeholder="Samsung Tablet, iPad vb."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddChildModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-xl text-xs hover:bg-slate-200"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs shadow-sm"
                >
                  Profili Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CUSTOM APP MODAL */}
      {showAddAppModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-900">
            <h3 className="text-base font-bold text-slate-900">Özel İzinli Uygulama / Site Ekle</h3>
            
            <form onSubmit={handleAddCustomAppSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Uygulama veya Site Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Scratch Jr, Bilim Çocuk"
                  value={customAppName}
                  onChange={(e) => setCustomAppName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Web Adresi (URL - Opsiyonel)</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={customAppUrl}
                  onChange={(e) => setCustomAppUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Kategori</label>
                <select
                  value={customAppCategory}
                  onChange={(e) => setCustomAppCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="EDUCATIONAL">Eğitici & Ders</option>
                  <option value="GAMES">Zeka Oyunu</option>
                  <option value="VIDEO">Video & Çizgi Film</option>
                  <option value="READING">Kitap & Masal</option>
                  <option value="CREATIVE">Sanat & Kodlama</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Açıklama</label>
                <textarea
                  rows={2}
                  placeholder="Kısa açıklama..."
                  value={customAppDesc}
                  onChange={(e) => setCustomAppDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAppModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-xl text-xs hover:bg-slate-200"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs shadow-sm"
                >
                  Listeye Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
