export const SUPABASE_SQL_SCRIPT = `-- ==============================================================================
-- KIDSAFE & EBEVEYN KONTROL PORTALI - SUPABASE VERİ TABANI ŞEMASI (SQL)
-- Proje ID: frexkrmwkpyhruoryjvj
-- ==============================================================================

-- 1. GEREKLİ EKLENTİLER (UUID & KRİPTOGRAFİ)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TİPLER VE ENUMLAR
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('ADMIN', 'PARENT', 'CHILD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE unlock_method_type AS ENUM ('PIN', 'SECURITY_QUESTION', 'FACE_RECOGNITION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE log_severity_type AS ENUM ('INFO', 'WARNING', 'ALERT', 'SUCCESS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. KULLANICILAR TABLOSU (users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- sha256 or bcrypt hash
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(25),
    role user_role_type NOT NULL DEFAULT 'PARENT',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ÇOCUK PROFİLLERİ (child_profiles)
CREATE TABLE IF NOT EXISTS public.child_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL CHECK (age >= 1 AND age <= 18),
    avatar VARCHAR(255) DEFAULT 'default_avatar',
    device_name VARCHAR(100) NOT NULL DEFAULT 'Tablet',
    daily_time_limit_minutes INT NOT NULL DEFAULT 60,
    used_today_minutes INT NOT NULL DEFAULT 0,
    unlock_method unlock_method_type NOT NULL DEFAULT 'PIN',
    parent_pin VARCHAR(10) NOT NULL DEFAULT '1234',
    security_question_text TEXT DEFAULT 'Türkiye''nin başkenti neresidir?',
    security_question_answer TEXT DEFAULT 'Ankara',
    notify_on_session_start BOOLEAN DEFAULT TRUE,
    notify_on_session_end BOOLEAN DEFAULT TRUE,
    notification_channel VARCHAR(20) DEFAULT 'BOTH', -- 'EMAIL', 'SMS', 'BOTH'
    parent_email VARCHAR(100),
    parent_phone VARCHAR(25),
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. İZİN VERİLEN UYGULAMALAR VE SİTELER (allowed_apps)
CREATE TABLE IF NOT EXISTS public.allowed_apps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    description TEXT,
    url TEXT,
    min_age INT DEFAULT 3,
    is_global BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ÇOCUK - UYGULAMA İLİŞKİSİ (child_app_permissions)
CREATE TABLE IF NOT EXISTS public.child_app_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID REFERENCES public.child_profiles(id) ON DELETE CASCADE,
    app_id UUID REFERENCES public.allowed_apps(id) ON DELETE CASCADE,
    custom_time_limit_minutes INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(child_id, app_id)
);

-- 7. EKRAN KULLANIM SEANSLARI (screen_sessions)
CREATE TABLE IF NOT EXISTS public.screen_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID REFERENCES public.child_profiles(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    duration_minutes INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'COMPLETED', 'LOCKED'
    active_app_name VARCHAR(100),
    unlock_verified_method VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. KULLANICI & GÜVENLİK AKTİVİTE LOGLARI (activity_logs)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    child_id UUID REFERENCES public.child_profiles(id) ON DELETE SET NULL,
    child_name VARCHAR(100),
    action_type VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    severity log_severity_type NOT NULL DEFAULT 'INFO',
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    device_info TEXT DEFAULT 'Web Client',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. EBEVEYN BİLDİRİMLERİ (notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES public.child_profiles(id) ON DELETE CASCADE,
    child_name VARCHAR(100),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    channel VARCHAR(20) DEFAULT 'EMAIL',
    recipient VARCHAR(100) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. VERİ GİZLİLİĞİ VE GÜVENLİK AYARLARI (security_settings)
CREATE TABLE IF NOT EXISTS public.security_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    biometric_enabled BOOLEAN DEFAULT TRUE,
    data_encryption_enabled BOOLEAN DEFAULT TRUE,
    auto_lock_on_background BOOLEAN DEFAULT TRUE,
    log_retention_days INT DEFAULT 30,
    anonymize_logs BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allowed_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_app_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screen_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;

-- Anon/Public Okuma ve Yazma Politikaları (Demo & İstemci Entegrasyonu İçin)
CREATE POLICY "Public Users Access" ON public.users FOR ALL USING (true);
CREATE POLICY "Public Child Profiles Access" ON public.child_profiles FOR ALL USING (true);
CREATE POLICY "Public Allowed Apps Access" ON public.allowed_apps FOR ALL USING (true);
CREATE POLICY "Public Child App Permissions Access" ON public.child_app_permissions FOR ALL USING (true);
CREATE POLICY "Public Screen Sessions Access" ON public.screen_sessions FOR ALL USING (true);
CREATE POLICY "Public Activity Logs Access" ON public.activity_logs FOR ALL USING (true);
CREATE POLICY "Public Notifications Access" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Public Security Settings Access" ON public.security_settings FOR ALL USING (true);

-- ==============================================================================
-- 12. BAŞLANGIÇ VERİLERİ (SEED DATA)
-- ==============================================================================

-- 1. Varsayılan Yönetici: fetahne (Şifre: fetahne07)
INSERT INTO public.users (username, password_hash, full_name, email, phone, role, status)
VALUES 
    ('fetahne', 'fetahne07', 'Fetahne Aykan', 'FetahneAykan@gmail.com', '+90 555 123 4567', 'ADMIN', 'ACTIVE'),
    ('ahmet_veli', 'veli123', 'Ahmet Veli', 'ahmet.veli@example.com', '+90 542 987 6543', 'PARENT', 'ACTIVE'),
    ('selin_kaya', 'selin123', 'Selin Kaya', 'selin.kaya@example.com', '+90 532 456 7890', 'PARENT', 'ACTIVE')
ON CONFLICT (username) DO NOTHING;

-- 2. Örnek İzin Verilen Güvenli Çocuk Uygulamaları
INSERT INTO public.allowed_apps (name, category, icon_name, description, min_age, is_global)
VALUES 
    ('YouTube Kids', 'VIDEO', 'Youtube', 'Çocuklara özel filtrelenmiş eğitici video platformu', 3, TRUE),
    ('TRT Çocuk', 'VIDEO', 'Tv', 'TRT Çocuk çizgi filmleri ve eğitici yayınları', 3, TRUE),
    ('EBA (Eğitim Bilişim Ağı)', 'EDUCATIONAL', 'GraduationCap', 'Milli Eğitim Bakanlığı resmi ders ve içerik portalı', 6, TRUE),
    ('Khan Academy Kids', 'EDUCATIONAL', 'BookOpen', 'Okul öncesi ve ilkokul matematik, mantık ve okuma', 4, TRUE),
    ('Scratch Junior & Kodlama', 'CREATIVE', 'Code', 'Çocuklar için blok tabanlı eğlenceli kodlama ve animasyon', 6, TRUE),
    ('Duolingo Kids', 'EDUCATIONAL', 'Languages', 'Eğlenceli yabancı dil öğrenme platformu', 5, TRUE),
    ('KidSafe Çizim & Boyama', 'CREATIVE', 'Palette', 'Gelişmiş interaktif dijital boyama ve tuval uygulaması', 3, TRUE),
    ('Matematik Maceraları', 'GAMES', 'Calculator', 'Temel matematik ve zeka geliştirici bulmaca oyunu', 5, TRUE),
    ('Masal & Sesli Kitaplık', 'READING', 'Sparkles', 'Pedagog onaylı Türkçe sesli hikayeler ve masallar', 3, TRUE)
ON CONFLICT DO NOTHING;

-- Log Bilgisi
INSERT INTO public.activity_logs (child_name, action_type, details, severity, device_info)
VALUES 
    ('Sistem', 'SETTINGS_CHANGED', 'Veri tabanı şeması ve başlangıç konfigürasyonu başarıyla kuruldu.', 'SUCCESS', 'Supabase Server');
`;
