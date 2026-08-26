import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  HardDrive, 
  Download, 
  Trash2, 
  CheckCircle2, 
  FileText,
  Key
} from 'lucide-react';

interface PrivacyDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportAllData: () => void;
}

export const PrivacyDataModal: React.FC<PrivacyDataModalProps> = ({
  isOpen,
  onClose,
  onExportAllData,
}) => {
  const [dataEncryption, setDataEncryption] = useState(true);
  const [localBiometricsOnly, setLocalBiometricsOnly] = useState(true);
  const [anonymizeLogs, setAnonymizeLogs] = useState(false);
  const [retentionDays, setRetentionDays] = useState('30');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">KVKK & Veri Gizliliği Güvencesi</h2>
              <p className="text-xs text-slate-500">Çocuk ve Aile Verilerinin Korunması</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Statement box */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-100/80 rounded-2xl text-xs text-indigo-900 leading-relaxed">
            <span className="font-bold block text-slate-900 mb-1">🔒 Sıfır Reklam, Sıfır Veri Satışı Politikası:</span>
            KidSafe, çocukların dijital ayak izlerini korumayı taahhüt eder. Hiçbir tarama verisi veya çocuk profil bilgisi üçüncü şahıslarla, reklam ağlarıyla veya veri simsarlarıyla paylaşılmaz.
          </div>

          {/* Privacy Toggles */}
          <div className="space-y-3">
            
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-bold text-slate-900 block">Uçtan Uca Veri Şifreleme (AES-256)</span>
                <span className="text-[11px] text-slate-500 block">Tüm çocuk profilleri ve ekran kayıtları veritabanında şifreli saklanır.</span>
              </div>
              <input
                type="checkbox"
                checked={dataEncryption}
                onChange={(e) => setDataEncryption(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-bold text-slate-900 block">Yerel Yüz & Biyometri İzolasyonu</span>
                <span className="text-[11px] text-slate-500 block">Kamera yüz tanıma verisi asla sunucuya yüklenmez, sadece cihazda işlenir.</span>
              </div>
              <input
                type="checkbox"
                checked={localBiometricsOnly}
                onChange={(e) => setLocalBiometricsOnly(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-bold text-slate-900 block">Aktivite Loglarını Anonimleştir</span>
                <span className="text-[11px] text-slate-500 block">Raporlarda ve sistem loglarında IP adreslerini gizle.</span>
              </div>
              <input
                type="checkbox"
                checked={anonymizeLogs}
                onChange={(e) => setAnonymizeLogs(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Log Saklama Süresi</span>
                <span className="text-[11px] text-slate-500">Belirtilen süreden eski veriler otomatik temizlenir.</span>
              </div>
              <select
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="7">7 Gün</option>
                <option value="30">30 Gün (Önerilen)</option>
                <option value="90">90 Gün</option>
              </select>
            </div>

          </div>

          {/* Export / Erase Data */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">Kullanıcı Veri Hakları:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onExportAllData}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Tüm Verilerimi İndir (JSON)
              </button>

              <button
                type="button"
                onClick={() => alert('Hesap ve tüm verileriniz KVKK kapsamında silinmek üzere işaretlenmiştir.')}
                className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Verilerimi Sil
              </button>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Gizlilik tercihleri başarıyla kaydedildi.
            </div>
          )}

          <button
            onClick={handleSave}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm shadow-indigo-500/20"
          >
            Gizlilik Ayarlarını Güncelle
          </button>

        </div>
      </div>
    </div>
  );
};
