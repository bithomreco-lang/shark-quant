-- ══════════════════════════════════════════════════════════════════════════════
-- 🦈 SHARK TRADERS AI — ENTERPRISE SUPABASE POSTGRESQL SCHEMA + RLS UNLOCK
-- انسخ هذا الكود بالكامل والصقه في (SQL Editor) داخل لوحة تحكم Supabase الخاصة بك ثم اضغط RUN
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. جدول المستخدمين وحسابات جوجل (USERS & GOOGLE ACCOUNTS)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  plan TEXT NOT NULL DEFAULT 'FREE',          -- 'FREE' | 'VIP' | 'PREMIUM'
  role TEXT NOT NULL DEFAULT 'USER',          -- 'USER' | 'ADMIN'
  status TEXT NOT NULL DEFAULT 'Active',      -- 'Active' | 'Suspended'
  balance NUMERIC NOT NULL DEFAULT 50000,
  risk_percent NUMERIC NOT NULL DEFAULT 1,
  has_accepted_rules BOOLEAN NOT NULL DEFAULT FALSE,
  total_chats INTEGER NOT NULL DEFAULT 0,
  total_trades INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (LOWER(email));

-- 2. جدول ذاكرة وتعلّم الذكاء الاصطناعي لكل متداول (AI ADAPTIVE LEARNING MEMORY)
CREATE TABLE IF NOT EXISTS public.ai_learning_memory (
  user_email TEXT PRIMARY KEY REFERENCES public.users(email) ON DELETE CASCADE,
  preferred_dialect TEXT DEFAULT 'Moroccan Darija / Arabic',
  trading_style TEXT DEFAULT 'SMC Institutional Intraday',
  favorite_assets JSONB NOT NULL DEFAULT '{}'::jsonb,
  preferred_timeframes JSONB NOT NULL DEFAULT '{}'::jsonb,
  recent_setups JSONB NOT NULL DEFAULT '[]'::jsonb,
  recent_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  community_interests JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary_dossier TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. جدول جلسات ومحادثات المستخدمين الخاصة مع الذكاء (USER PRIVATE CHAT SESSIONS)
CREATE TABLE IF NOT EXISTS public.user_conversations (
  user_email TEXT PRIMARY KEY REFERENCES public.users(email) ON DELETE CASCADE,
  sessions_list JSONB NOT NULL DEFAULT '[]'::jsonb,
  sessions_messages JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_context_by_session JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. جدول رسائل وصفقات مجتمع الحيتان (COMMUNITY FLOOR MESSAGES & SIGNALS)
CREATE TABLE IF NOT EXISTS public.community_messages (
  id TEXT PRIMARY KEY,
  sender_email TEXT,
  sender_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'VIP TRADER',
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  badge TEXT,
  tag TEXT,
  theme TEXT DEFAULT 'platinum',
  type TEXT NOT NULL DEFAULT 'CHAT',          -- 'CHAT' | 'ALPHA' | 'SIGNAL' | 'AUDIO'
  category TEXT NOT NULL DEFAULT 'NORMAL',    -- 'NORMAL' | 'ALPHA' | 'SIGNAL'
  content TEXT,
  signal_data JSONB,
  audio_data TEXT,
  audio_duration TEXT,
  avatar_text TEXT,
  time_label TEXT,
  likes INTEGER NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_created_at ON public.community_messages (created_at ASC);

-- 5. جدول منشورات الآدمن والمقالات التحليلية (COMMUNITY ALPHA POSTS)
CREATE TABLE IF NOT EXISTS public.community_posts (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  role TEXT NOT NULL,
  badge TEXT,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  tag TEXT,
  time_label TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. جدول إعدادات النظام وقائمة الحظر (SYSTEM CONFIG & BLOCKED USERS)
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- 🔓 7. فتح صلاحيات الجداول وإيقاف قفل (Row-Level Security) لكي تدخل الداتا فوراً
-- (مهم جداً إذا كنت تستخدم مفتاح sb_publishable بدلاً من sb_secret)
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learning_memory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.ai_learning_memory TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_conversations TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.community_messages TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.community_posts TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.system_settings TO anon, authenticated, service_role;
