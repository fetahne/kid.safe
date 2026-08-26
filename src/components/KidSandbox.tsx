import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Unlock, 
  Palette, 
  Calculator, 
  Sparkles, 
  Code, 
  GraduationCap, 
  BookOpen, 
  Languages, 
  Youtube, 
  Tv, 
  ArrowLeft, 
  Volume2, 
  Clock, 
  ShieldAlert, 
  Play, 
  RotateCcw, 
  Check, 
  Trophy, 
  Smile,
  Globe,
  Search,
  ExternalLink,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { ChildProfile, AllowedApp } from '../types';
import { soundEffects } from '../lib/audio';
import confetti from 'canvas-confetti';

interface KidSandboxProps {
  activeChild: ChildProfile;
  allowedAppsList: AllowedApp[];
  onOpenParentUnlock: () => void;
  onSessionEnd: () => void;
  onLogAction: (actionType: any, details: string, severity: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS') => void;
  remoteMessage: string | null;
  onClearRemoteMessage: () => void;
}

export const KidSandbox: React.FC<KidSandboxProps> = ({
  activeChild,
  allowedAppsList,
  onOpenParentUnlock,
  onSessionEnd,
  onLogAction,
  remoteMessage,
  onClearRemoteMessage,
}) => {
  // Timer state (seconds)
  const [totalSeconds, setTotalSeconds] = useState(activeChild.dailyTimeLimitMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(
    Math.max(0, (activeChild.dailyTimeLimitMinutes - activeChild.usedTodayMinutes) * 60)
  );
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [activeApp, setActiveApp] = useState<AllowedApp | null>(null);

  // Warning flags so sound plays once per threshold
  const [played10MinWarning, setPlayed10MinWarning] = useState(false);
  const [played5MinWarning, setPlayed5MinWarning] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Sync if daily limit changes
  useEffect(() => {
    setTotalSeconds(activeChild.dailyTimeLimitMinutes * 60);
  }, [activeChild.dailyTimeLimitMinutes]);

  // Main countdown timer loop
  useEffect(() => {
    if (!isTimerRunning || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        const nextVal = prev - 1;

        // 10 minutes warning (600 seconds)
        if (nextVal === 600 && !played10MinWarning) {
          soundEffects.play10MinWarning();
          setPlayed10MinWarning(true);
          setBannerNotice('⏰ Sürenizin bitmesine son 10 dakika kaldı! Etkinliğinizi tamamlayın.');
          setTimeout(() => setBannerNotice(null), 8000);
          onLogAction('SESSION_START', `${activeChild.name} için 10 dakika uyarısı verildi.`, 'WARNING');
        }

        // 5 minutes warning (300 seconds)
        if (nextVal === 300 && !played5MinWarning) {
          soundEffects.play5MinWarning();
          setPlayed5MinWarning(true);
          setBannerNotice('⏳ Son 5 dakika! Lütfen çalışmanızı kaydedin.');
          setTimeout(() => setBannerNotice(null), 8000);
          onLogAction('SESSION_START', `${activeChild.name} için 5 dakika uyarısı verildi.`, 'WARNING');
        }

        // Time Expired (0 seconds)
        if (nextVal <= 0) {
          soundEffects.playTimeExpired();
          onLogAction('SESSION_END', `${activeChild.name} için tanımlanan günlük ekran süresi doldu. Cihaz kilitlendi.`, 'ALERT');
          return 0;
        }

        return nextVal;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning, remainingSeconds, played10MinWarning, played5MinWarning, activeChild, onLogAction]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isTimeExpired = remainingSeconds <= 0 || activeChild.isLocked;

  // Filter apps permitted for this child
  const permittedApps = allowedAppsList.filter(app => 
    activeChild.allowedApps.includes(app.id)
  );

  const handleLaunchApp = (app: AllowedApp) => {
    setActiveApp(app);
    onLogAction('APP_LAUNCH', `${activeChild.name}, "${app.name}" uygulamasını başlattı.`, 'INFO');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] text-slate-800 flex flex-col relative overflow-hidden">
      
      {/* Top Floating Bar for Child */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between z-30 shadow-sm">
        
        {/* Child Profile Info */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl shadow-sm">
            {activeChild.avatar || '🧒'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-slate-900 tracking-wide">{activeChild.name}</h1>
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                {activeChild.age} Yaş
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Cihaz: {activeChild.deviceName}
            </p>
          </div>
        </div>

        {/* Big Friendly Timer Badge */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${
            remainingSeconds <= 300
              ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
              : remainingSeconds <= 600
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <Clock className="w-5 h-5 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Kalan Süre</span>
              <span className="text-lg sm:text-xl font-mono font-black tracking-tight leading-none">
                {formatTime(remainingSeconds)}
              </span>
            </div>
          </div>

          {/* Parent Lock / Exit trigger */}
          <button
            id="btn-kid-exit-parent-unlock"
            onClick={onOpenParentUnlock}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 active:bg-indigo-600 active:text-white text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200 shadow-sm"
            title="Ebeveyn Kilidi Aç / Ayarlar"
          >
            <Lock className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Ebeveyn Girişi</span>
          </button>
        </div>
      </div>

      {/* Notice Banner (10 min / 5 min warnings) */}
      {bannerNotice && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm animate-bounce z-40">
          <Volume2 className="w-4 h-4" />
          <span>{bannerNotice}</span>
        </div>
      )}

      {/* Remote Message from Parent Banner */}
      {remoteMessage && (
        <div className="bg-teal-600 text-white px-4 py-3 flex items-center justify-between shadow-sm z-40">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
            <MessageSquare className="w-5 h-5 shrink-0" />
            <span>Ebeveyninizden Mesaj: "{remoteMessage}"</span>
          </div>
          <button
            onClick={onClearRemoteMessage}
            className="bg-white/20 hover:bg-white/30 text-white font-bold px-2.5 py-1 rounded-lg text-xs"
          >
            Tamam
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full flex flex-col justify-center">
        
        {/* TIME EXPIRED / LOCKED SCREEN */}
        {isTimeExpired ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-rose-200 shadow-sm my-auto">
            <div className="w-24 h-24 rounded-full bg-rose-50 border-4 border-rose-200 flex items-center justify-center mb-6 animate-pulse">
              <Lock className="w-12 h-12 text-rose-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              Ekran Süreniz Doldu!
            </h2>
            <p className="text-slate-600 text-sm max-w-md mb-6 leading-relaxed">
              Bugün için ayrılan güvenli ekran süresini tamamladınız. Devam etmek için lütfen anne veya babanızdan izin isteyiniz.
            </p>
            <button
              onClick={onOpenParentUnlock}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-8 py-3.5 rounded-xl text-sm shadow-sm shadow-indigo-500/20 flex items-center gap-2 transition-transform hover:scale-105"
            >
              <Unlock className="w-5 h-5" />
              Ebeveyn Doğrulaması ile Süre Ekle
            </button>
          </div>
        ) : activeApp ? (
          /* ACTIVE CHILD APP VIEW */
          <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            {/* App Subheader */}
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setActiveApp(null)}
                className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Uygulamalara Dön
              </button>
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                {activeApp.name}
              </span>
              <div className="text-xs text-slate-500 font-mono">
                {formatTime(remainingSeconds)}
              </div>
            </div>

            {/* Inner App Content */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              {activeApp.id === 'app-drawing' && <InteractiveDrawingCanvas />}
              {activeApp.id === 'app-math' && <InteractiveMathGame childAge={activeChild.age} />}
              {activeApp.id === 'app-tales' && <InteractiveStoryBook />}
              {activeApp.id === 'app-scratch' && <InteractiveScratchLab />}
              {activeApp.id !== 'app-drawing' && 
               activeApp.id !== 'app-math' && 
               activeApp.id !== 'app-tales' && 
               activeApp.id !== 'app-scratch' && (
                <SafeWebSandbox 
                  app={activeApp} 
                  childName={activeChild.name}
                  onLogAction={onLogAction}
                />
              )}
            </div>
          </div>
        ) : (
          /* LAUNCHER GRID (ALLOWED APPS ONLY) */
          <div>
            <div className="text-center mb-8">
              <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                Güvenli Çocuk Bölgesi
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                Neler Yapmak İstersin?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Ebeveyninizin sizin için seçtiği güvenli uygulamalar aşağıdadır.
              </p>
            </div>

            {permittedApps.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center shadow-sm">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <p className="text-sm text-slate-700 font-medium">
                  Henüz izin verilen uygulama seçilmemiş.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Ebeveyn panelinden çocuğunuz için izinli uygulamaları seçebilirsiniz.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
                {permittedApps.map((app) => (
                  <button
                    key={app.id}
                    id={`btn-launch-app-${app.id}`}
                    onClick={() => handleLaunchApp(app)}
                    className="group bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 sm:p-6 text-left transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                        {renderAppIcon(app.iconName)}
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {app.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {app.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold">
                      <span>Başlat</span>
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Safety Footer info */}
            <div className="mt-10 p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-center gap-2 text-xs text-slate-500 text-center shadow-sm">
              <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                KidSafe Güvenlik Kalkanı devrede: İzin verilmeyen sitelere ve reklamlara erişim engellenmiştir.
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Helper to render icon by name
function renderAppIcon(name: string) {
  switch (name) {
    case 'Palette': return <Palette className="w-7 h-7" />;
    case 'Calculator': return <Calculator className="w-7 h-7" />;
    case 'Sparkles': return <Sparkles className="w-7 h-7" />;
    case 'Code': return <Code className="w-7 h-7" />;
    case 'GraduationCap': return <GraduationCap className="w-7 h-7" />;
    case 'BookOpen': return <BookOpen className="w-7 h-7" />;
    case 'Languages': return <Languages className="w-7 h-7" />;
    case 'Youtube': return <Youtube className="w-7 h-7" />;
    case 'Tv': return <Tv className="w-7 h-7" />;
    default: return <Globe className="w-7 h-7" />;
  }
}

// 1. INTERACTIVE DRAWING CANVAS APP
const InteractiveDrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#4f46e5');
  const [brushSize, setBrushSize] = useState(6);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const colors = ['#4f46e5', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#1e293b', '#f59e0b'];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Tool Controls */}
      <div className="flex flex-wrap items-center justify-between w-full bg-slate-50 p-3 rounded-2xl border border-slate-200 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-bold">Renkler:</span>
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${
                color === c ? 'scale-125 border-slate-900 shadow-md' : 'border-transparent hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-bold">Boyut:</span>
          <input
            type="range"
            min="2"
            max="30"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24 accent-indigo-600"
          />
        </div>

        <button
          onClick={clearCanvas}
          className="text-xs bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl font-bold transition-colors"
        >
          Temizle
        </button>
      </div>

      {/* Canvas */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm overflow-hidden touch-none border-2 border-slate-200">
        <canvas
          ref={canvasRef}
          width={650}
          height={380}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          className="w-full h-auto cursor-crosshair"
        />
      </div>
    </div>
  );
};

// 2. INTERACTIVE MATH & LOGIC GAME
const InteractiveMathGame: React.FC<{ childAge: number }> = ({ childAge }) => {
  const [score, setScore] = useState(0);
  const [num1, setNum1] = useState(4);
  const [num2, setNum2] = useState(3);
  const [operator, setOperator] = useState<'+' | '-' | 'x'>('+');
  const [options, setOptions] = useState<number[]>([7, 6, 9, 8]);
  const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);

  const generateQuestion = () => {
    setFeedback(null);
    let max = childAge <= 6 ? 10 : 25;
    const n1 = Math.floor(Math.random() * max) + 1;
    const n2 = Math.floor(Math.random() * max) + 1;
    const ops: ('+' | '-' | 'x')[] = childAge <= 6 ? ['+'] : ['+', '-', 'x'];
    const op = ops[Math.floor(Math.random() * ops.length)];

    let correct = op === '+' ? n1 + n2 : op === '-' ? Math.max(n1, n2) - Math.min(n1, n2) : (n1 % 10) * (n2 % 10);
    const finalN1 = op === '-' ? Math.max(n1, n2) : n1;
    const finalN2 = op === '-' ? Math.min(n1, n2) : (op === 'x' ? (n2 % 10) : n2);

    setNum1(finalN1);
    setNum2(finalN2);
    setOperator(op);

    // Generate 3 wrong answers
    const opts = new Set<number>([correct]);
    while (opts.size < 4) {
      const offset = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
      const wrong = Math.max(0, correct + offset);
      opts.add(wrong);
    }
    setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
  };

  const handleAnswer = (ans: number) => {
    const correct = operator === '+' ? num1 + num2 : operator === '-' ? num1 - num2 : num1 * num2;
    if (ans === correct) {
      setFeedback('CORRECT');
      setScore(s => s + 10);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      setTimeout(generateQuestion, 1200);
    } else {
      setFeedback('WRONG');
    }
  };

  return (
    <div className="max-w-md mx-auto text-center space-y-6">
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 text-indigo-600 font-bold">
          <Trophy className="w-5 h-5" />
          <span>Puan: {score}</span>
        </div>
        <button
          onClick={generateQuestion}
          className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Yeni Soru
        </button>
      </div>

      <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">İşlemin Sonucu Nedir?</span>
        <div className="text-4xl sm:text-5xl font-black text-slate-900 my-4 tracking-wider">
          {num1} {operator} {num2} = ?
        </div>

        {feedback === 'CORRECT' && (
          <p className="text-emerald-600 font-bold text-sm animate-bounce">
            🎉 Harika! Doğru Cevap (+10 Puan)
          </p>
        )}
        {feedback === 'WRONG' && (
          <p className="text-rose-600 font-bold text-sm">
            Tekrar Dene! Yanlış cevap.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(opt)}
            className="h-16 rounded-2xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-900 hover:text-indigo-600 font-extrabold text-2xl transition-all shadow-sm active:scale-95"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// 3. INTERACTIVE STORYBOOK APP
const InteractiveStoryBook: React.FC = () => {
  const [storyIndex, setStoryIndex] = useState(0);

  const stories = [
    {
      title: 'Cesur Küçük Tavşan ve Sihirli Havuç',
      text: 'Güneşli bir ormanda Boncuk adında meraklı bir tavşan yaşarmış. Bir gün ormanın derinliklerinde parıldayan bir altın havuç görmüş. Havuç ona şöyle fısıldamış: "Bu ormanı koruyan ve herkese sevgi dağıtan bir kalbin olduğu için tebrikler!" Boncuk öğrendiği bu sırrı tüm arkadaşlarıyla paylaşmış.',
      image: '🐰🥕🌳',
    },
    {
      title: 'Yıldızlara Uçan Kağıt Uçak',
      text: 'Mert odasında masmavi bir kağıttan uçak katlamış. Uçağını gökyüzüne fırlattığında rüzgar onu bulutların üstüne taşımış. Gece parlayan dost canlısı bir yıldızla arkadaş olmuşlar. Yıldız ona "Ne kadar hayal kurarsan, o kadar uzağa uçabilirsin" demiş.',
      image: '🚀⭐✈️',
    },
  ];

  const current = stories[storyIndex];

  return (
    <div className="max-w-xl mx-auto space-y-6 text-center">
      <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="text-6xl mb-4">{current.image}</div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{current.title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed font-serif">
          {current.text}
        </p>
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={() => setStoryIndex((prev) => (prev > 0 ? prev - 1 : stories.length - 1))}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200"
        >
          Önceki Masal
        </button>
        <button
          onClick={() => setStoryIndex((prev) => (prev < stories.length - 1 ? prev + 1 : 0))}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm"
        >
          Sonraki Masal
        </button>
      </div>
    </div>
  );
};

// 4. INTERACTIVE SCRATCH JR CODING LAB
const InteractiveScratchLab: React.FC = () => {
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [characterEmoji, setCharacterEmoji] = useState('🐱');

  const move = (dx: number, dy: number) => {
    setPosX(x => Math.max(-120, Math.min(120, x + dx)));
    setPosY(y => Math.max(-80, Math.min(80, y + dy)));
  };

  const spin = () => setRotation(r => r + 90);
  const jump = () => {
    setPosY(-60);
    setTimeout(() => setPosY(0), 300);
  };
  const reset = () => {
    setPosX(0);
    setPosY(0);
    setRotation(0);
    setScale(1);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Code Play Stage */}
      <div className="w-full h-64 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center relative overflow-hidden shadow-inner">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div
          className="text-6xl transition-all duration-300 select-none cursor-pointer"
          style={{
            transform: `translate(${posX}px, ${posY}px) rotate(${rotation}deg) scale(${scale})`,
          }}
          onClick={jump}
        >
          {characterEmoji}
        </div>
      </div>

      {/* Visual Code Blocks */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <span className="text-xs text-slate-700 font-bold">Hareket ve Komut Blokları:</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => move(0, -30)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm"
          >
            ⬆️ Yukarı Git (30px)
          </button>
          <button
            onClick={() => move(0, 30)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm"
          >
            ⬇️ Aşağı Git (30px)
          </button>
          <button
            onClick={() => move(-30, 0)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm"
          >
            ⬅️ Sola Git (30px)
          </button>
          <button
            onClick={() => move(30, 0)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm"
          >
            ➡️ Sağa Git (30px)
          </button>
          <button
            onClick={jump}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm"
          >
            🦘 Zıpla!
          </button>
          <button
            onClick={spin}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm"
          >
            🔄 Döndür (90°)
          </button>
          <button
            onClick={() => setCharacterEmoji(c => c === '🐱' ? '🚀' : c === '🚀' ? '🤖' : '🐱')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm"
          >
            🎭 Karakteri Değiştir
          </button>
          <button
            onClick={reset}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-200"
          >
            Sıfırla
          </button>
        </div>
      </div>
    </div>
  );
};

// 5. SAFE WEB & SIMULATED BROWSER (Checks Whitelist & Logs Unauthorized Access)
const SafeWebSandbox: React.FC<{
  app: AllowedApp;
  childName: string;
  onLogAction: (actionType: any, details: string, severity: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS') => void;
}> = ({ app, childName, onLogAction }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [blockedAlert, setBlockedAlert] = useState<string | null>(null);

  const handleSimulatedSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase();
    const banned = ['tiktok', 'instagram', 'facebook', 'twitter', 'adult', 'kumar', 'bet', 'violence'];

    if (banned.some(b => query.includes(b))) {
      setBlockedAlert(`"${searchQuery}" araması ebeveyn güvenlik filtreleri tarafından engellendi.`);
      onLogAction('UNAUTHORIZED_ATTEMPT', `${childName}, engellenen içerik araması yaptı ("${searchQuery}").`, 'ALERT');
    } else {
      setBlockedAlert(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mock Browser Header */}
      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center gap-3">
        <Globe className="w-5 h-5 text-emerald-600 shrink-0" />
        <form onSubmit={handleSimulatedSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Güvenli çocuk araması..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs hover:bg-indigo-700"
          >
            Ara
          </button>
        </form>
      </div>

      {blockedAlert && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-700">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{blockedAlert}</span>
        </div>
      )}

      {/* Safe Portal Card */}
      <div className="p-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mx-auto flex items-center justify-center">
          {renderAppIcon(app.iconName)}
        </div>
        <h3 className="text-xl font-bold text-slate-900">{app.name} Güvenli Portalı</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {app.description}
        </p>

        <div className="pt-2">
          <a
            href={app.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm shadow-indigo-500/20 transition-transform hover:scale-105"
          >
            {app.name} Aç
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        
        <p className="text-[11px] text-slate-400">
          Bu web uygulaması ebeveyn onaylıdır ve filtrelenmiş ağ üzerinden güvenle sunulmaktadır.
        </p>
      </div>
    </div>
  );
};
