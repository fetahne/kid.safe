import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  Search, 
  Filter, 
  Download, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Database, 
  Smartphone, 
  Mail, 
  Calendar,
  Sparkles,
  RefreshCw,
  Edit2
} from 'lucide-react';
import { User, ActivityLog, UserRole } from '../types';

interface AdminPanelProps {
  usersList: User[];
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onToggleUserStatus: (userId: string) => void;
  activityLogs: ActivityLog[];
  onViewSqlSchema: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  usersList,
  onUpdateUserRole,
  onToggleUserStatus,
  activityLogs,
  onViewSqlSchema,
}) => {
  const [activeTab, setActiveTab] = useState<'PARTICIPANTS' | 'LOGS' | 'RBAC'>('PARTICIPANTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [logFilter, setLogFilter] = useState<'ALL' | 'ALERT' | 'WARNING' | 'SUCCESS'>('ALL');

  // Filter users
  const filteredUsers = usersList.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter logs
  const filteredLogs = activityLogs.filter(log => {
    if (logFilter !== 'ALL' && log.severity !== logFilter) return false;
    if (!searchQuery) return true;
    return (
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.childName && log.childName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.actionType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const exportLogsAsCSV = () => {
    const headers = 'ID,Zaman,Cocuk,Islem,Detay,Seviye,IP,Cihaz\n';
    const rows = activityLogs.map(l => 
      `"${l.id}","${l.timestamp}","${l.childName || '-'}","${l.actionType}","${l.details.replace(/"/g, '""')}","${l.severity}","${l.ipAddress}","${l.deviceInfo}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kidsafe-sistem-loglari-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Admin Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider">
              Yönetici (Admin) Denetim Portalı
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Sistem Aktif
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Katılımcı & Erişim Güvenliği Yönetimi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rol tabanlı yetkilendirme (RBAC), katılımcı listesi ve canlı güvenlik denetim logları.
          </p>
        </div>

        <button
          onClick={onViewSqlSchema}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm shadow-indigo-500/20 shrink-0"
        >
          <Database className="w-4 h-4" />
          Supabase SQL Şeması
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('PARTICIPANTS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'PARTICIPANTS'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Kayıtlı Katılımcılar ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('LOGS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'LOGS'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          Sistem Aktivite & Güvenlik Logları ({activityLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('RBAC')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'RBAC'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Rol Tabanlı Yetkilendirme Matrisi (RBAC)
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === 'PARTICIPANTS' ? 'Katılımcı adı veya e-posta ara...' : 'Loglarda ara...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {activeTab === 'LOGS' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              {(['ALL', 'ALERT', 'WARNING', 'SUCCESS'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLogFilter(lvl)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                    logFilter === lvl ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl === 'ALL' ? 'Tümü' : lvl === 'ALERT' ? 'İhlaller' : lvl === 'WARNING' ? 'Uyarılar' : 'Başarılı'}
                </button>
              ))}
            </div>

            <button
              onClick={exportLogsAsCSV}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 border border-slate-200"
              title="CSV Olarak İndir"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dışa Aktar</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: PARTICIPANTS LIST */}
      {activeTab === 'PARTICIPANTS' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200 tracking-wider">
                <tr>
                  <th className="p-4">Katılımcı / İsim</th>
                  <th className="p-4">İletişim (E-Posta / Tel)</th>
                  <th className="p-4">Rolü (RBAC)</th>
                  <th className="p-4">Çocuk Sayısı</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4">Kayıt Tarihi</th>
                  <th className="p-4 text-right">Rol Değiştir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      Aramaya uygun katılımcı bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-xs">
                            {u.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{u.fullName}</span>
                            <span className="text-[11px] text-slate-400 font-mono">@{u.username}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{u.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Smartphone className="w-3 h-3 text-slate-400" />
                          <span>{u.phone}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          <ShieldCheck className="w-3 h-3" />
                          {u.role === 'ADMIN' ? 'SİSTEM YÖNETİCİSİ' : 'EBEVEYN'}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-800">{u.childrenCount} Profil</span>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => onToggleUserStatus(u.id)}
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {u.status === 'ACTIVE' ? 'Aktif' : 'Askıya Alındı'}
                        </button>
                      </td>

                      <td className="p-4 text-slate-500 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                      </td>

                      <td className="p-4 text-right">
                        <select
                          value={u.role}
                          onChange={(e) => onUpdateUserRole(u.id, e.target.value as UserRole)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-800 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="PARENT">Ebeveyn Yap</option>
                          <option value="ADMIN">Yönetici Yap</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVITY LOGS */}
      {activeTab === 'LOGS' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200 tracking-wider">
                <tr>
                  <th className="p-4">Zaman Damgası</th>
                  <th className="p-4">Çocuk / Kullanıcı</th>
                  <th className="p-4">Eylem Türü</th>
                  <th className="p-4">Olay Detayları</th>
                  <th className="p-4">Güvenlik Seviyesi</th>
                  <th className="p-4">Cihaz & IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Kayıtlı log bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        <span className="block text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleDateString('tr-TR')}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-900">{log.childName || 'Sistem'}</span>
                      </td>

                      <td className="p-4">
                        <span className="font-mono text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {log.actionType}
                        </span>
                      </td>

                      <td className="p-4 max-w-md text-slate-700 leading-relaxed">
                        {log.details}
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.severity === 'ALERT'
                            ? 'bg-rose-100 text-rose-800'
                            : log.severity === 'WARNING'
                            ? 'bg-amber-100 text-amber-800'
                            : log.severity === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {log.severity}
                        </span>
                      </td>

                      <td className="p-4 text-[11px] text-slate-600">
                        <span>{log.deviceInfo}</span>
                        <span className="block font-mono text-[10px] text-slate-400">{log.ipAddress}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RBAC MATRIX */}
      {activeTab === 'RBAC' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Rol Tabanlı Yetki Matrisi (Role-Based Access Control)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Farklı kullanıcı tiplerinin erişebileceği modüller ve operasyonel yetkiler:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                Yönetici (ADMIN)
              </div>
              <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                <li>Tüm kullanıcı ve katılımcıları listeleme</li>
                <li>Kullanıcı rollerini değiştirme ve askıya alma</li>
                <li>Tüm çocukların aktivite ve ihlal loglarını denetleme</li>
                <li>Supabase SQL şeması ve veritabanı ayarlarını yönetme</li>
                <li>Global izinli uygulamalar ekleme</li>
              </ul>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <Users className="w-5 h-5" />
                Ebeveyn (PARENT)
              </div>
              <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                <li>Kendi çocuk profillerini oluşturma & düzenleme</li>
                <li>Günlük ekran süresi kuralı ve yaş paketleri belirleme</li>
                <li>İzinli uygulamalar (Beyaz liste) seçme</li>
                <li>Kilit açma yöntemini (PIN, Soru, Yüz Tanıma) yapılandırma</li>
                <li>SMS & E-Posta bildirimlerini alma</li>
                <li>Uzaktan cihazı kilitleme ve anlık süre ekleme</li>
              </ul>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                <Smartphone className="w-5 h-5" />
                Çocuk Sandbox (CHILD)
              </div>
              <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                <li>Yalnızca ebeveyn onaylı uygulamaları kullanma</li>
                <li>Kalan süre sayacını ve 10dk/5dk uyarılarını görme</li>
                <li>Süre bittiğinde ebeveyn onay kilidine yönlendirilme</li>
                <li>İzinsiz sitelere erişimin engellenmesi</li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
