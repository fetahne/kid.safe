import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles,
  Server,
  Layers,
  FileCode
} from 'lucide-react';
import { SUPABASE_SQL_SCRIPT } from '../lib/sqlSchema';
import { SUPABASE_CONFIG, testSupabaseConnection } from '../lib/supabase';

export const SqlSchemaViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ connected: boolean; message: string } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsChecking(true);
    const res = await testSupabaseConnection();
    setConnectionStatus(res);
    setIsChecking(false);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([SUPABASE_SQL_SCRIPT], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kidsafe_supabase_schema.sql';
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider">
              Supabase Veritabanı & SQL Şeması
            </span>
            <span className="text-xs text-slate-500">
              Proje ID: <strong className="text-slate-800 font-mono">{SUPABASE_CONFIG.projectId}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            PostgreSQL / Supabase Veritabanı Şeması
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Aşağıdaki hazır SQL betiğini Supabase SQL Editor panelinize yapıştırarak tüm tabloları, RLS güvenlik kurallarını ve başlangıç verilerini oluşturabilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySql}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm shadow-indigo-500/20"
          >
            {copied ? <Check className="w-4 h-4 text-white stroke-[3]" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Kopyalandı!' : 'SQL Kodunu Kopyala'}
          </button>

          <button
            onClick={handleDownloadSql}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold p-2.5 rounded-xl text-xs flex items-center justify-center transition-colors border border-slate-200"
            title="SQL Dosyasını İndir (.sql)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Supabase Connection Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Supabase URL</span>
            <span className="text-xs font-mono font-bold text-slate-900 break-all">
              {SUPABASE_CONFIG.url}
            </span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">REST API Durumu</span>
            <span className="text-xs font-bold text-emerald-600">
              {connectionStatus?.connected ? 'Aktif & Erişilebilir' : 'Kontrol Ediliyor...'}
            </span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tablo Sayısı</span>
            <span className="text-xs font-bold text-slate-900">
              8 Ana Tablo + RLS Politikaları
            </span>
          </div>
        </div>
      </div>

      {/* How to Apply Instructions */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
          <Terminal className="w-4 h-4" />
          Supabase Üzerinde Nasıl Çalıştırılır?
        </h3>
        <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside">
          <li>Yukarıdaki <strong>"SQL Kodunu Kopyala"</strong> butonuna tıklayın.</li>
          <li>
            Supabase projenizde (<a href={`https://supabase.com/dashboard/project/${SUPABASE_CONFIG.projectId}/sql`} target="_blank" rel="noreferrer" className="text-indigo-600 underline inline-flex items-center gap-1 font-semibold">SQL Editor <ExternalLink className="w-3 h-3" /></a>) sayfasına gidin.
          </li>
          <li><strong>"New query"</strong> butonuna tıklayıp kopyaladığınız SQL kodunu yapıştırın.</li>
          <li>Sağ alttaki yeşil <strong>"RUN"</strong> butonuna basın. Tüm tablolar ve kurallar otomatik kurulacaktır.</li>
        </ol>
      </div>

      {/* Code Display Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <FileCode className="w-4 h-4 text-indigo-400" />
            <span>schema_migration.sql</span>
          </div>
          <button
            onClick={handleCopySql}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
          >
            {copied ? 'Kopyalandı!' : 'Kopyala'}
          </button>
        </div>

        <pre className="p-6 text-xs font-mono text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed select-all">
          {SUPABASE_SQL_SCRIPT}
        </pre>
      </div>

    </div>
  );
};
