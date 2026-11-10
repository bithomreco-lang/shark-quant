// ══════════════════════════════════════════════════════════════════════════════
// 🦈 SHARK QUANT — ENTERPRISE SUPABASE + STRUCTURED DATABASE & AI LEARNING ENGINE
// ══════════════════════════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
const AVATARS_DIR = path.join(UPLOADS_DIR, 'avatars');
const AUDIO_DIR = path.join(UPLOADS_DIR, 'audio');

for (const dir of [UPLOADS_DIR, AVATARS_DIR, AUDIO_DIR]) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) { }
}

/**
 * Offloads heavy base64 images/audio to clean static files in /public/uploads/
 * so the database remains 100% lightweight, fast, and human-readable.
 */
function offloadBase64Media(dataUri, category = 'avatars') {
  if (!dataUri || typeof dataUri !== 'string' || !dataUri.startsWith('data:')) {
    return dataUri;
  }
  try {
    const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return dataUri;
    const mime = match[1].toLowerCase();
    const b64 = match[2];
    const buf = Buffer.from(b64, 'base64');
    const hash = crypto.createHash('md5').update(buf).digest('hex').substring(0, 16);

    let ext = 'bin';
    if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
    else if (mime.includes('png')) ext = 'png';
    else if (mime.includes('webp')) ext = 'webp';
    else if (mime.includes('webm')) ext = 'webm';
    else if (mime.includes('wav')) ext = 'wav';
    else if (mime.includes('mp3') || mime.includes('mpeg')) ext = 'mp3';
    else if (mime.includes('mp4') || mime.includes('m4a')) ext = 'm4a';

    const subFolder = category === 'audio' ? 'audio' : 'avatars';
    const targetDir = subFolder === 'audio' ? AUDIO_DIR : AVATARS_DIR;
    const fileName = `${subFolder}_${hash}.${ext}`;
    const filePath = path.join(targetDir, fileName);

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, buf);
    }
    const baseHost = process.env.PUBLIC_BACKEND_URL || 'http://localhost:5000';
    return `${baseHost}/uploads/${subFolder}/${fileName}`;
  } catch (err) {
    console.warn('Media offload warning:', err.message);
    return null;
  }
}

function detectDialectFromText(text) {
  if (!text) return null;
  const t = String(text);
  const darijaRegex = /(دابا|خويا|صاحبي|واش|شنو|ديال|بزاف|مزيان|واخا|بصح|غادي|ندخلو|نشريو|نبيعو|بلان|الشارت ديال|عطيني|وريني|شوف|هانية|فين|علاش)/i;
  if (darijaRegex.test(t)) return 'Moroccan Darija (الدارجة المغربية)';
  if (/[\u0600-\u06FF]/.test(t)) return 'Arabic (العربية المؤسسية)';
  if (/\b(bonjour|salut|merci|acheter|vendre|marché)\b/i.test(t)) return 'French (Français)';
  if (/[a-zA-Z]{3,}/.test(t)) return 'English';
  return null;
}

function createEnterpriseDbManager(dbFilePath, defaultSystemInstruction) {
  let supabase = null;

  // Clean 4-Pillar Database Structure
  let db = {
    config: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: 'gemini-3-flash-preview',
      systemInstruction: defaultSystemInstruction,
      isEngineOnline: true,
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseKey: process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
    },
    users: [],
    aiLearningMemory: {},
    userConversations: {},
    communityHub: {
      messages: [],
      posts: [],
      blockedUsers: [],
      marketPulse: {
        latestAdminBroadcast: null,
        latestSmcSignal: null,
        topDiscussedAssets: { XAUUSD: 5, BTCUSDT: 4, SOLUSDT: 2 },
        updatedAt: new Date().toISOString()
      }
    },
    // Backwards-compatible aliases kept in memory for legacy modules (live_ws.js / live_turn.js)
    sessions: {},
    communityMessages: [],
    communityPosts: [],
    blockedUsers: []
  };

  let lastSupabaseSyncReport = {
    ok: false,
    rlsLocked: false,
    errorMessage: null,
    syncedUsers: 0,
    syncedMemories: 0,
    syncedConversations: 0,
    syncedCommunityMessages: 0,
    lastAttemptAt: null
  };

  const VERIFIED_FALLBACK_KEY = 'sb_publishable_MPI-lFS-ZRuopxnWXZGcbg_AwkhTSST';
  const VERIFIED_SUPABASE_URL = 'https://krukhcmndvuklflxprvr.supabase.co';

  function initSupabaseClient() {
    let url = (process.env.SUPABASE_URL || db.config.supabaseUrl || '').trim();
    let key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || db.config.supabaseKey || '').trim();

    // Auto-detect if user swapped URL and KEY or pasted backend URL or secret key into URL variable
    if (!url || !url.includes('.supabase.co') || url.includes('vercel.app') || url.startsWith('sb_') || url.startsWith('ey')) {
      url = VERIFIED_SUPABASE_URL;
    }
    // If key is broken, empty, or contaminated with domain
    if (!key || key.includes('sb_secret__') || key.length < 20 || key.includes('vercel.app')) {
      key = VERIFIED_FALLBACK_KEY;
    }

    db.config.supabaseUrl = url;
    db.config.supabaseKey = key;

    try {
      supabase = createClient(url, key, {
        auth: { persistSession: false }
      });
      console.log('⚡ Connected to Supabase PostgreSQL Cloud:', url);
      return true;
    } catch (err) {
      console.warn('Supabase init error, falling back to verified key:', err.message);
      try {
        supabase = createClient(VERIFIED_SUPABASE_URL, VERIFIED_FALLBACK_KEY, {
          auth: { persistSession: false }
        });
        return true;
      } catch (e2) {
        supabase = null;
        return false;
      }
    }
  }

  // Periodic background check: if RLS was locked earlier, retry automatically so the moment the user runs the SQL or updates the key, all data populates immediately!
  setInterval(() => {
    if (supabase && !lastSupabaseSyncReport.ok) {
      syncAllDataToSupabase().catch(() => { });
    }
  }, 10000);

  function syncAliases() {
    db.communityMessages = db.communityHub.messages;
    db.communityPosts = db.communityHub.posts;
    db.blockedUsers = db.communityHub.blockedUsers;
  }

  const DUMMY_TEST_EMAILS = new Set([
    'client.alpha@gmail.com',
    'test.trader@gmail.com',
    'sara.quant@yahoo.com',
    'omar.fx@outlook.com',
    'hajar.new@gmail.com',
    'guest'
  ]);

  function normalizeUsername(raw, fallbackEmail = '') {
    let base = String(raw || '').trim().toLowerCase().replace(/^@+/, '');
    if (!base && fallbackEmail) {
      base = String(fallbackEmail).split('@')[0].toLowerCase();
    }
    base = base.replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    if (!base || base.length < 2) {
      base = 'trader_' + Math.floor(100 + Math.random() * 900);
    }
    return base.substring(0, 24);
  }

  function isUsernameTaken(candidateUsername, excludeEmail = '') {
    const clean = normalizeUsername(candidateUsername);
    const exEmail = String(excludeEmail || '').trim().toLowerCase();
    return (db.users || []).some(
      u => u.email.toLowerCase() !== exEmail && (u.username || '').toLowerCase() === clean
    );
  }

  function generateUniqueUsername(desiredUsername, email = '', excludeEmail = '') {
    let base = normalizeUsername(desiredUsername, email);
    if (!isUsernameTaken(base, excludeEmail)) return base;
    for (let i = 1; i <= 999; i++) {
      const candidate = `${base}_${i}`;
      if (!isUsernameTaken(candidate, excludeEmail)) return candidate;
    }
    return `${base}_${Date.now().toString().slice(-4)}`;
  }

  function sanitizeAndMigrateExistingDb(raw) {
    if (!raw || typeof raw !== 'object') return;

    // 1. Config
    if (raw.config) {
      db.config = {
        ...db.config,
        ...raw.config,
        supabaseUrl: raw.config.supabaseUrl || db.config.supabaseUrl || '',
        supabaseKey: raw.config.supabaseKey || db.config.supabaseKey || ''
      };
    }

    // 2. Users (clean base64 avatars into files & strip dummy test emails)
    if (Array.isArray(raw.users)) {
      const seenEmails = new Set();
      db.users = [];
      for (const u of raw.users) {
        if (!u || !u.email) continue;
        const emailLower = u.email.trim().toLowerCase();
        if (DUMMY_TEST_EMAILS.has(emailLower)) continue;
        if (seenEmails.has(emailLower)) continue;
        seenEmails.add(emailLower);

        const isAdminEmail = emailLower.includes('hajar') || emailLower.includes('admin');
        const cleanAvatar = u.avatar && u.avatar.startsWith('data:')
          ? offloadBase64Media(u.avatar, 'avatars')
          : (u.avatar || null);

        const defaultHandle = isAdminEmail ? 'hajar_admin' : emailLower.split('@')[0];
        const uniqueUsername = generateUniqueUsername(u.username || defaultHandle, emailLower, emailLower);

        let cleanPlan = String(u.plan || (isAdminEmail ? 'PREMIUM' : 'FREE')).toUpperCase();
        if (cleanPlan.includes('PREMIUM') || cleanPlan.includes('PARTNER')) cleanPlan = 'PREMIUM';
        else if (cleanPlan.includes('VIP') || cleanPlan.includes('PRO')) cleanPlan = 'VIP';
        else cleanPlan = 'FREE';

        db.users.push({
          id: u.id || ('usr_' + Date.now() + '_' + Math.floor(Math.random() * 1000)),
          email: emailLower,
          username: uniqueUsername,
          name: u.name || emailLower.split('@')[0],
          avatar: cleanAvatar,
          plan: cleanPlan,
          role: u.role || (isAdminEmail ? 'ADMIN' : 'USER'),
          status: u.status || 'Active',
          balance: Number(u.balance) === 50000 ? 0 : (Number(u.balance) || 0),
          riskPercent: Number(u.riskPercent) || 1,
          hasAcceptedCommunityRules: Boolean(u.hasAcceptedCommunityRules),
          totalChats: Number(u.totalChats) || 0,
          totalTrades: Number(u.totalTrades) || 0,
          joinedAt: u.joinedAt || new Date().toISOString().split('T')[0],
          lastLoginAt: u.lastLoginAt || new Date().toISOString()
        });
      }
    }

    // 3. AI Learning Memory (strip dummy test emails)
    if (raw.aiLearningMemory && typeof raw.aiLearningMemory === 'object') {
      db.aiLearningMemory = {};
      for (const [k, v] of Object.entries(raw.aiLearningMemory)) {
        const emailLower = k.trim().toLowerCase();
        if (!DUMMY_TEST_EMAILS.has(emailLower)) {
          db.aiLearningMemory[emailLower] = v;
        }
      }
    }

    // 4. User Conversations (migrate from raw.userConversations and raw.sessions & strip dummy test emails)
    if (raw.userConversations && typeof raw.userConversations === 'object') {
      db.userConversations = {};
      for (const [k, v] of Object.entries(raw.userConversations)) {
        const emailLower = k.trim().toLowerCase();
        if (!DUMMY_TEST_EMAILS.has(emailLower)) {
          db.userConversations[emailLower] = v;
        }
      }
    }
    if (raw.sessions && typeof raw.sessions === 'object') {
      for (const [emailKey, val] of Object.entries(raw.sessions)) {
        const emailLower = emailKey.trim().toLowerCase();
        if (DUMMY_TEST_EMAILS.has(emailLower)) continue;
        if (!db.userConversations[emailLower]) {
          db.userConversations[emailLower] = {
            sessionsList: [],
            sessionsMessages: {},
            aiContextBySession: {},
            updatedAt: new Date().toISOString()
          };
        }
        const target = db.userConversations[emailLower];
        if (val && Array.isArray(val.sessionsList)) {
          target.sessionsList = val.sessionsList;
        }
        if (val && val.sessionsMessages && typeof val.sessionsMessages === 'object') {
          target.sessionsMessages = val.sessionsMessages;
        }
        // Also preserve per-session AI context objects (like session_1, live_call)
        for (const [k, sObj] of Object.entries(val || {})) {
          if (k !== 'sessionsList' && k !== 'sessionsMessages' && k !== 'updatedAt' && sObj && Array.isArray(sObj.messages)) {
            target.aiContextBySession[k] = {
              title: sObj.title || 'Trading Session',
              messages: sObj.messages.slice(-30),
              activeChart: sObj.activeChart || null,
              updatedAt: sObj.updatedAt || new Date().toISOString()
            };
          }
        }
        db.sessions[emailLower] = target.aiContextBySession;
      }
    }

    // Clean any base64 inside userConversations.sessionsMessages
    for (const [emailLower, conv] of Object.entries(db.userConversations)) {
      if (conv && conv.sessionsMessages && typeof conv.sessionsMessages === 'object') {
        for (const [sId, msgs] of Object.entries(conv.sessionsMessages)) {
          if (!Array.isArray(msgs)) continue;
          conv.sessionsMessages[sId] = msgs.slice(-40).map(m => {
            const copy = { ...m };
            if (copy.audioUri && copy.audioUri.startsWith('data:')) {
              copy.audioUri = offloadBase64Media(copy.audioUri, 'audio');
            }
            if (copy.imageUri && copy.imageUri.startsWith('data:')) {
              copy.imageUri = offloadBase64Media(copy.imageUri, 'avatars');
            }
            delete copy.rawBase64;
            return copy;
          });
        }
      }
      if (!db.sessions[emailLower]) {
        db.sessions[emailLower] = conv.aiContextBySession || {};
      }
    }

    // 5. Community Hub
    if (raw.communityHub && typeof raw.communityHub === 'object') {
      db.communityHub = {
        ...db.communityHub,
        ...raw.communityHub
      };
    } else {
      if (Array.isArray(raw.communityMessages)) {
        db.communityHub.messages = raw.communityMessages;
      }
      if (Array.isArray(raw.communityPosts)) {
        db.communityHub.posts = raw.communityPosts;
      }
      if (Array.isArray(raw.blockedUsers)) {
        db.communityHub.blockedUsers = raw.blockedUsers;
      }
    }

    if (Array.isArray(db.communityHub.messages)) {
      db.communityHub.messages = db.communityHub.messages.map(m => ({
        ...m,
        audioData: m.audioData && m.audioData.startsWith('data:')
          ? offloadBase64Media(m.audioData, 'audio')
          : m.audioData,
        avatarText: m.avatarText && m.avatarText.startsWith('data:')
          ? offloadBase64Media(m.avatarText, 'avatars')
          : m.avatarText
      }));
    }

    // Ensure every user has an initialized AI Learning Memory profile
    for (const u of db.users) {
      ensureUserMemory(u.email, u.name);
    }

    syncAliases();
  }

  function ensureUserMemory(email, name = 'Trader') {
    const emailLower = (email || 'guest').trim().toLowerCase();
    if (!db.aiLearningMemory[emailLower]) {
      db.aiLearningMemory[emailLower] = {
        userEmail: emailLower,
        traderName: name,
        preferredDialect: 'Moroccan Darija / Arabic',
        tradingStyle: 'Smart Money Concepts (SMC) • Intraday & Scalping',
        favoriteAssets: { XAUUSD: 1, BTCUSDT: 1 },
        preferredTimeframes: { '15': 1, '60': 1 },
        tradeStats: { wins: 0, losses: 0, total: 0, winRate: '0%', lastTradeResult: null },
        recentSetups: [],
        recentTopics: [],
        communityInterests: [],
        summaryDossier: `المتداول ${name} (${emailLower}): يفضل التحليل المؤسسي SMC والدارجة المغربية/العربية.`,
        updatedAt: new Date().toISOString()
      };
    }
    return db.aiLearningMemory[emailLower];
  }

  function rebuildSummaryDossier(mem, userObj) {
    const topAssets = Object.entries(mem.favoriteAssets || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k, count]) => `${k} (${count}x)`)
      .join(', ') || 'XAUUSD, BTCUSDT';

    const topTfs = Object.entries(mem.preferredTimeframes || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([tf]) => `${tf}m`)
      .join(', ') || '15m, 60m';

    const lastSetup = (mem.recentSetups && mem.recentSetups.length > 0)
      ? mem.recentSetups[0]
      : null;

    const lastSetupStr = lastSetup
      ? `آخر صفقة تم تزويده بها: ${lastSetup.direction} على ${lastSetup.asset} من ${lastSetup.entry} (هدف: ${lastSetup.tp1}، وقف: ${lastSetup.sl}).`
      : 'لم يطلب صفقة مؤخراً.';

    const balance = userObj?.balance || 50000;
    const risk = userObj?.riskPercent || 1;

    const statsStr = mem.tradeStats && mem.tradeStats.total > 0
      ? `• سجل نجاح الصفقات: ${mem.tradeStats.total} صفقات مسجلة (${mem.tradeStats.wins} ناجحة جابت الهدف، ${mem.tradeStats.losses} ضربت الوقف) - نسبة الفوز: ${mem.tradeStats.winRate}. آخر صفقة: ${mem.tradeStats.lastTradeResult}.`
      : '• سجل نجاح الصفقات: في مرحلة قيد التوثيق وبناء الأرباح.';

    const handleStr = userObj?.username ? `@${userObj.username}` : '';
    mem.summaryDossier = [
      `• المتداول: ${userObj?.name || mem.traderName || 'شريكنا'} ${handleStr} (${mem.userEmail}) | الباقة: ${userObj?.plan || 'VIP'} | رأس المال: $${balance} (مخاطرة ${risk}%).`,
      `• اللهجة المفضلة: ${mem.preferredDialect || 'Moroccan Darija / Arabic'}.`,
      `• الأصول الأكثر تداولاً وطلباً منه: ${topAssets}.`,
      `• الفريمات الزمنية المفضلة: ${topTfs}.`,
      `• ${lastSetupStr}`,
      `• ${statsStr}`,
      mem.recentTopics?.length > 0 ? `• آخر اهتماماته وأسئلته: ${mem.recentTopics.slice(0, 3).join(' | ')}.` : ''
    ].filter(Boolean).join('\n');

    return mem.summaryDossier;
  }

  // ── Save Clean Structured JSON & Push Async to Supabase if Configured ──
  const actualDbPath = process.env.VERCEL
    ? path.join('/tmp', 'database.json')
    : (dbFilePath || path.join(__dirname, 'database.json'));

  let saveTimer = null;
  function saveDb() {
    syncAliases();
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        const cleanDiskSnapshot = {
          _meta: {
            engine: 'SHARK QUANT ENTERPRISE DB v4.0 (SUPABASE + LOCAL MIRROR)',
            supabaseConnected: Boolean(supabase),
            lastSavedAt: new Date().toISOString(),
            totalUsers: db.users.length,
            totalLearnedProfiles: Object.keys(db.aiLearningMemory).length,
            totalPrivateConversationAccounts: Object.keys(db.userConversations).length,
            totalCommunityMessages: db.communityHub.messages.length
          },
          config: db.config,
          users: db.users,
          aiLearningMemory: db.aiLearningMemory,
          userConversations: db.userConversations,
          communityHub: db.communityHub
        };
        try {
          fs.writeFileSync(actualDbPath, JSON.stringify(cleanDiskSnapshot, null, 2));
        } catch (fErr) {}
        if (supabase) {
          syncAllDataToSupabase().catch(() => { });
        }
      } catch (err) {
        console.error('Error writing structured database:', err.message);
      }
    }, 150);
  }

  // ── Load from Disk on Startup ──
  function loadDb() {
    try {
      if (process.env.VERCEL && !fs.existsSync(actualDbPath)) {
        if (fs.existsSync(dbFilePath)) {
          try { fs.copyFileSync(dbFilePath, actualDbPath); } catch (e) {}
        }
      }
      const fileToRead = fs.existsSync(actualDbPath) ? actualDbPath : dbFilePath;
      if (fs.existsSync(fileToRead)) {
        const rawText = fs.readFileSync(fileToRead, 'utf8');
        const parsed = JSON.parse(rawText);
        sanitizeAndMigrateExistingDb(parsed);
      }
    } catch (err) {
      console.error('Error loading database, starting clean:', err.message);
    }
    initSupabaseClient();
  }

  // ── Direct Supabase Cloud Queries (Rock-solid PostgreSQL persistence) ──
  async function fetchUsersFromSupabase() {
    if (!supabase) initSupabaseClient();
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from('users').select('*').order('joined_at', { ascending: false });
      if (error) {
        console.warn('Supabase fetch users warning:', error.message);
        return null;
      }
      if (data && Array.isArray(data)) {
        return data.map(u => ({
          id: u.id || ('usr_' + Buffer.from(u.email || '').toString('hex').slice(0, 8)),
          email: u.email,
          username: u.username || (u.email ? u.email.split('@')[0] : 'trader'),
          name: u.name || u.username || 'Trader',
          avatar: u.avatar || '',
          plan: u.plan || 'FREE',
          role: u.role || 'USER',
          status: u.status || 'Active',
          balance: Number(u.balance) || 0,
          riskPercent: Number(u.risk_percent) || 1,
          hasAcceptedCommunityRules: Boolean(u.has_accepted_rules),
          totalChats: Number(u.total_chats) || 0,
          totalTrades: Number(u.total_trades) || 0,
          joinedAt: u.joined_at ? u.joined_at.split('T')[0] : '2026-11-10',
          lastLoginAt: u.last_login_at || new Date().toISOString()
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch users exception:', e.message);
    }
    return null;
  }

  async function updateUserPlanInSupabase(email, plan) {
    if (!supabase) initSupabaseClient();
    if (!supabase || !email) return false;
    try {
      const emailLower = email.trim().toLowerCase();
      const { error } = await supabase.from('users').update({
        plan: plan,
        last_login_at: new Date().toISOString()
      }).eq('email', emailLower);

      if (error) {
        console.error('Supabase updateUserPlanInSupabase error:', error.message);
        return false;
      }
      console.log(`✅ Supabase plan saved permanently for ${emailLower} -> ${plan}`);
      return true;
    } catch (e) {
      console.error('Supabase updateUserPlanInSupabase exception:', e.message);
      return false;
    }
  }

  async function updateUserRoleInSupabase(email, role) {
    if (!supabase) initSupabaseClient();
    if (!supabase || !email) return false;
    try {
      const emailLower = email.trim().toLowerCase();
      const { error } = await supabase.from('users').update({ role }).eq('email', emailLower);
      return !error;
    } catch (e) {
      return false;
    }
  }

  async function updateUserStatusInSupabase(email, status) {
    if (!supabase) initSupabaseClient();
    if (!supabase || !email) return false;
    try {
      const emailLower = email.trim().toLowerCase();
      const { error } = await supabase.from('users').update({ status }).eq('email', emailLower);
      return !error;
    } catch (e) {
      return false;
    }
  }

  async function deleteUserFromSupabase(email) {
    if (!supabase) initSupabaseClient();
    if (!supabase || !email) return false;
    try {
      const emailLower = email.trim().toLowerCase();
      const { error } = await supabase.from('users').delete().eq('email', emailLower);
      return !error;
    } catch (e) {
      return false;
    }
  }

  // ── Cloud Sync Helpers (Non-blocking background sync to Supabase PostgreSQL) ──
  async function syncUserToSupabase(user) {
    if (!supabase || !user || !user.email) return;
    try {
      const safeName = (user.name && user.name.trim()) || user.username || user.email.split('@')[0] || 'Trader';
      await supabase.from('users').upsert({
        id: user.id || ('usr_' + Date.now()),
        email: user.email.toLowerCase(),
        name: safeName,
        avatar: user.avatar || '',
        plan: user.plan || 'FREE',
        role: user.role || 'USER',
        status: user.status || 'Active',
        balance: Number(user.balance) || 0,
        risk_percent: Number(user.riskPercent) || 1,
        has_accepted_rules: Boolean(user.hasAcceptedCommunityRules),
        total_chats: Number(user.totalChats) || 0,
        total_trades: Number(user.totalTrades) || 0,
        last_login_at: new Date().toISOString()
      }, { onConflict: 'email' });
    } catch (e) {
      console.warn('Supabase user sync warn:', e.message);
    }
  }

  async function syncMemoryToSupabase(emailLower) {
    if (!supabase || !emailLower) return;
    const mem = db.aiLearningMemory[emailLower];
    if (!mem) return;
    try {
      await supabase.from('ai_learning_memory').upsert({
        user_email: emailLower,
        preferred_dialect: mem.preferredDialect,
        trading_style: mem.tradingStyle,
        favorite_assets: mem.favoriteAssets,
        preferred_timeframes: mem.preferredTimeframes,
        recent_setups: mem.recentSetups,
        recent_topics: mem.recentTopics,
        community_interests: mem.communityInterests,
        summary_dossier: mem.summaryDossier,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_email' });
    } catch (e) {
      console.warn('Supabase memory sync warn:', e.message);
    }
  }

  async function syncConversationsToSupabase(emailLower) {
    if (!supabase || !emailLower) return;
    const conv = db.userConversations[emailLower];
    if (!conv) return;
    try {
      await supabase.from('user_conversations').upsert({
        user_email: emailLower,
        sessions_list: conv.sessionsList || [],
        sessions_messages: conv.sessionsMessages || {},
        ai_context_by_session: conv.aiContextBySession || {},
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_email' });
    } catch (e) {
      console.warn('Supabase conversations sync warn:', e.message);
    }
  }

  async function syncCommunityMessageToSupabase(msg) {
    if (!supabase) initSupabaseClient();
    if (!supabase || !msg) return;
    try {
      await supabase.from('community_messages').upsert({
        id: msg.id,
        sender_email: msg.senderEmail || null,
        sender_name: msg.senderName,
        role: msg.role,
        is_admin: Boolean(msg.isAdmin),
        badge: msg.badge,
        tag: msg.tag,
        theme: msg.theme,
        type: msg.type || 'CHAT',
        category: msg.category || 'NORMAL',
        content: msg.content,
        signal_data: msg.signalData || null,
        audio_data: msg.audioData || null,
        audio_duration: msg.audioDuration || null,
        avatar_text: msg.avatarText || 'TR',
        time_label: msg.time,
        likes: Number(msg.likes) || 0,
        is_pinned: Boolean(msg.isPinned)
      }, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase community msg sync warn:', e.message);
    }
  }

  async function updateMessageReactionsInSupabase(id, reactions, likedBy, likes) {
    if (!supabase) initSupabaseClient();
    if (!supabase || !id) return false;
    try {
      const { data: existing } = await supabase
        .from('community_messages')
        .select('signal_data')
        .eq('id', id)
        .limit(1);

      const existingSignal = (existing && existing[0]?.signal_data) || {};
      const updatedSignal = {
        ...existingSignal,
        reactions: reactions || { fire: [], target: [], rocket: [], blood: [] },
        likedBy: Array.isArray(likedBy) ? likedBy : []
      };

      const { error } = await supabase
        .from('community_messages')
        .update({
          likes: Number(likes) || (Array.isArray(likedBy) ? likedBy.length : 0),
          signal_data: updatedSignal
        })
        .eq('id', id);

      if (error) {
        console.warn('Supabase update reactions error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase update reactions exception:', e.message);
      return false;
    }
  }

  async function fetchCommunityMessagesFromSupabase(limit = 100) {
    if (!supabase) initSupabaseClient();
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('community_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(limit);
      if (error) {
        console.warn('Supabase fetch community messages warn:', error.message);
        return null;
      }
      if (data && Array.isArray(data)) {
        return data.map(m => {
          const sig = m.signal_data || {};
          const defaultReactions = { fire: [], target: [], rocket: [], blood: [] };
          const reactions = (sig && typeof sig.reactions === 'object' && sig.reactions) ? sig.reactions : defaultReactions;
          const likedBy = (sig && Array.isArray(sig.likedBy)) ? sig.likedBy : (reactions.fire || []);

          return {
            id: m.id,
            senderEmail: m.sender_email,
            senderUsername: m.sender_email ? m.sender_email.split('@')[0] : 'trader',
            senderName: m.sender_name || 'Trader',
            role: m.role || 'VIP TRADER',
            isAdmin: Boolean(m.is_admin),
            badge: m.badge || 'VIP',
            tag: m.tag || '#DISCUSSION',
            theme: m.theme || 'platinum',
            type: m.type || 'CHAT',
            category: m.category || 'NORMAL',
            content: m.content || '',
            signalData: m.signal_data || null,
            audioData: m.audio_data || null,
            audioDuration: m.audio_duration || null,
            avatarText: m.avatar_text || 'TR',
            time: m.time_label || '00:00',
            likes: Number(m.likes) || likedBy.length || 0,
            likedBy: likedBy,
            reactions: reactions,
            isPinned: Boolean(m.is_pinned),
            createdAt: m.created_at
          };
        });
      }
    } catch (e) {
      console.warn('Supabase fetch community messages exception:', e.message);
    }
    return null;
  }

  async function deleteCommunityMessageFromSupabase(id) {
    if (!supabase) initSupabaseClient();
    if (!supabase || !id) return false;
    try {
      const { error } = await supabase.from('community_messages').delete().eq('id', id);
      return !error;
    } catch (e) {
      return false;
    }
  }

  async function syncAllDataToSupabase() {
    if (!supabase) {
      lastSupabaseSyncReport = {
        ok: false,
        rlsLocked: false,
        errorMessage: 'Supabase غير متصل بعد',
        syncedUsers: 0,
        syncedMemories: 0,
        syncedConversations: 0,
        syncedCommunityMessages: 0,
        lastAttemptAt: new Date().toISOString()
      };
      return lastSupabaseSyncReport;
    }

    lastSupabaseSyncReport.lastAttemptAt = new Date().toISOString();

    try {
      // 1. Sync Users: Protect Supabase as Single Source of Truth
      // Fetch latest users from Supabase so we never overwrite upgraded plans with stale local defaults!
      const existingSupaUsers = await fetchUsersFromSupabase();
      const supaUserMap = new Map();
      if (existingSupaUsers && Array.isArray(existingSupaUsers)) {
        for (const su of existingSupaUsers) {
          if (su.email) supaUserMap.set(su.email.toLowerCase(), su);
        }
      }

      const userRows = (db.users || []).map(user => {
        const emailLower = (user.email || '').toLowerCase();
        const fromSupa = supaUserMap.get(emailLower);
        return {
          id: user.id || fromSupa?.id,
          email: emailLower,
          username: fromSupa?.username || user.username || (emailLower ? emailLower.split('@')[0] : 'trader'),
          name: fromSupa?.name || user.name || 'Trader',
          avatar: fromSupa?.avatar || user.avatar || null,
          plan: fromSupa?.plan || user.plan || 'FREE', // ALWAYS prioritize Supabase's upgraded plan!
          role: fromSupa?.role || user.role || 'USER', // ALWAYS prioritize Supabase's role!
          status: fromSupa?.status || user.status || 'Active',
          balance: fromSupa?.balance !== undefined ? fromSupa.balance : (Number(user.balance) || 0),
          risk_percent: fromSupa?.riskPercent !== undefined ? fromSupa.riskPercent : (Number(user.riskPercent) || 1),
          has_accepted_rules: fromSupa?.hasAcceptedCommunityRules !== undefined ? fromSupa.hasAcceptedCommunityRules : Boolean(user.hasAcceptedCommunityRules),
          total_chats: Math.max(fromSupa?.totalChats || 0, Number(user.totalChats) || 0),
          total_trades: Math.max(fromSupa?.totalTrades || 0, Number(user.totalTrades) || 0),
          last_login_at: fromSupa?.lastLoginAt || user.lastLoginAt || new Date().toISOString()
        };
      });

      // Update in-memory db.users so it reflects Supabase's latest plans
      if (existingSupaUsers && existingSupaUsers.length > 0) {
        db.users = existingSupaUsers;
      }

      lastSupabaseSyncReport.syncedUsers = userRows.length;
      if (userRows.length > 0) {
        const { error: uErr } = await supabase.from('users').upsert(userRows, { onConflict: 'email' });
        if (uErr) {
          const isRls = uErr.code === '42501' || (uErr.message || '').includes('row-level security');
          lastSupabaseSyncReport = {
            ...lastSupabaseSyncReport,
            ok: false,
            rlsLocked: isRls,
            errorMessage: uErr.message
          };
          return lastSupabaseSyncReport;
        }
      }

      // 2. Sync AI Learning Memory
      const validEmails = new Set(userRows.map(u => u.email));
      const memRows = [];
      for (const [emailLower, mem] of Object.entries(db.aiLearningMemory || {})) {
        if (!validEmails.has(emailLower)) continue;
        memRows.push({
          user_email: emailLower,
          preferred_dialect: mem.preferredDialect || 'Moroccan Darija / Arabic',
          trading_style: mem.tradingStyle || 'SMC Institutional Intraday',
          favorite_assets: mem.favoriteAssets || {},
          preferred_timeframes: mem.preferredTimeframes || {},
          recent_setups: mem.recentSetups || [],
          recent_topics: mem.recentTopics || [],
          community_interests: mem.communityInterests || [],
          summary_dossier: mem.summaryDossier || '',
          updated_at: new Date().toISOString()
        });
      }
      if (memRows.length > 0) {
        await supabase.from('ai_learning_memory').upsert(memRows, { onConflict: 'user_email' });
        lastSupabaseSyncReport.syncedMemories = memRows.length;
      }

      // 3. Sync User Private Conversations
      const convRows = [];
      for (const [emailLower, conv] of Object.entries(db.userConversations || {})) {
        if (!validEmails.has(emailLower)) continue;
        convRows.push({
          user_email: emailLower,
          sessions_list: conv.sessionsList || [],
          sessions_messages: conv.sessionsMessages || {},
          ai_context_by_session: conv.aiContextBySession || {},
          updated_at: new Date().toISOString()
        });
      }
      if (convRows.length > 0) {
        await supabase.from('user_conversations').upsert(convRows, { onConflict: 'user_email' });
        lastSupabaseSyncReport.syncedConversations = convRows.length;
      }

      // 4. Sync Community Messages
      const msgRows = (db.communityHub?.messages || []).map(msg => ({
        id: String(msg.id),
        sender_email: msg.senderEmail || null,
        sender_name: msg.senderName || 'Trader',
        role: msg.role || 'VIP TRADER',
        is_admin: Boolean(msg.isAdmin),
        badge: msg.badge || null,
        tag: msg.tag || null,
        theme: msg.theme || 'platinum',
        type: msg.type || 'CHAT',
        category: msg.category || 'NORMAL',
        content: msg.content || '',
        signal_data: msg.signalData || null,
        audio_data: msg.audioData || null,
        audio_duration: msg.audioDuration || null,
        avatar_text: msg.avatarText || 'TR',
        time_label: msg.time || 'NOW',
        likes: Number(msg.likes) || 0,
        is_pinned: Boolean(msg.isPinned)
      }));
      if (msgRows.length > 0) {
        await supabase.from('community_messages').upsert(msgRows, { onConflict: 'id' });
        lastSupabaseSyncReport.syncedCommunityMessages = msgRows.length;
      }

      // 5. Sync Community Posts
      const postRows = (db.communityHub?.posts || []).map(p => ({
        id: String(p.id),
        author: p.author || 'HAJAR ADMIN',
        role: p.role || 'FOUNDER',
        badge: p.badge || '👑 ADMIN',
        is_pinned: Boolean(p.isPinned),
        tag: p.tag || '#ALPHA',
        time_label: p.time || 'TODAY',
        title: p.title || 'Market Note',
        content: p.content || '',
        likes: Number(p.likes) || 0,
        comments: Number(p.comments) || 0,
        shares: Number(p.shares) || 0
      }));
      if (postRows.length > 0) {
        await supabase.from('community_posts').upsert(postRows, { onConflict: 'id' });
      }

      // 6. Sync System Settings, Usernames Registry & Market Pulse
      const usernamesMap = {};
      for (const u of db.users || []) {
        if (u.email && u.username) {
          usernamesMap[u.email.toLowerCase()] = u.username;
        }
      }
      await supabase.from('system_settings').upsert([
        {
          key: 'blocked_users',
          value: { users: db.communityHub?.blockedUsers || [] },
          updated_at: new Date().toISOString()
        },
        {
          key: 'market_pulse',
          value: db.communityHub?.marketPulse || {},
          updated_at: new Date().toISOString()
        },
        {
          key: 'usernames_registry',
          value: usernamesMap,
          updated_at: new Date().toISOString()
        }
      ], { onConflict: 'key' });

      lastSupabaseSyncReport.ok = true;
      lastSupabaseSyncReport.rlsLocked = false;
      lastSupabaseSyncReport.errorMessage = null;
      console.log(`☁️ Full Supabase Sync Complete: ${userRows.length} users, ${memRows.length} memories, ${convRows.length} convs, ${msgRows.length} community msgs`);
      return lastSupabaseSyncReport;
    } catch (err) {
      lastSupabaseSyncReport.ok = false;
      lastSupabaseSyncReport.errorMessage = err.message;
      return lastSupabaseSyncReport;
    }
  }

  async function deleteUserById(userId) {
    const idx = db.users.findIndex(u => u.id === userId);
    if (idx === -1) return null;
    const removed = db.users[idx];
    const emailLower = (removed.email || '').toLowerCase();
    db.users.splice(idx, 1);
    delete db.aiLearningMemory[emailLower];
    delete db.userConversations[emailLower];
    delete db.sessions[emailLower];
    saveDb();
    if (supabase && emailLower) {
      try {
        await supabase.from('users').delete().eq('email', emailLower);
        await supabase.from('ai_learning_memory').delete().eq('user_email', emailLower);
        await supabase.from('user_conversations').delete().eq('user_email', emailLower);
      } catch (e) { }
    }
    return removed;
  }

  async function wipeAllData() {
    db.users = [];
    db.aiLearningMemory = {};
    db.userConversations = {};
    db.sessions = {};
    db.communityHub = {
      messages: [],
      posts: [],
      blockedUsers: [],
      marketPulse: {
        latestAdminBroadcast: null,
        latestSmcSignal: null,
        topDiscussedAssets: {},
        updatedAt: new Date().toISOString()
      }
    };
    syncAliases();
    saveDb();
    if (supabase) {
      try {
        await supabase.from('ai_learning_memory').delete().neq('user_email', '__none__');
        await supabase.from('user_conversations').delete().neq('user_email', '__none__');
        await supabase.from('community_messages').delete().neq('id', '__none__');
        await supabase.from('community_posts').delete().neq('id', '__none__');
        await supabase.from('users').delete().neq('email', '__none__');
      } catch (e) {
        console.warn('Supabase wipe warn:', e.message);
      }
    }
    return true;
  }

  function isGmailAddress(email) {
    const clean = String(email || '').trim().toLowerCase();
    return /^[a-z0-9._%+-]+@(gmail\.com|googlemail\.com)$/.test(clean);
  }

  async function verifySupabaseOAuthToken(accessToken, desiredUsername = '') {
    if (!supabase) initSupabaseClient();
    if (!supabase) throw new Error('Supabase غير متصل حالياً');

    let { data, error } = await supabase.auth.getUser(accessToken);
    if (error && (error.message.includes('API key') || error.message.includes('apiKey') || !data?.user)) {
      console.warn('Supabase token verification retry with verified publishable key...');
      try {
        const fallbackClient = createClient(VERIFIED_SUPABASE_URL, VERIFIED_FALLBACK_KEY, { auth: { persistSession: false } });
        const retry = await fallbackClient.auth.getUser(accessToken);
        if (retry.data?.user) {
          data = retry.data;
          error = null;
        }
      } catch (fErr) {}
    }

    if (error || !data || !data.user || !data.user.email) {
      throw new Error(error?.message || 'فشل التحقق من جلسة جوجل عبر Supabase');
    }
    const supaUser = data.user;
    const emailLower = supaUser.email.trim().toLowerCase();
    const isGoogleAuth = isGmailAddress(emailLower) || supaUser.app_metadata?.provider === 'google' || (Array.isArray(supaUser.identities) && supaUser.identities.some(i => i.provider === 'google'));
    if (!isGoogleAuth && !emailLower.endsWith('@gmail.com') && !emailLower.endsWith('@googlemail.com')) {
      throw new Error('يُسمح فقط بتسجيل الدخول بحساب جوجل الحقيقي (@gmail.com)');
    }
    const meta = supaUser.user_metadata || {};
    const fullName = meta.full_name || meta.name || emailLower.split('@')[0];
    const avatarUrl = meta.avatar_url || meta.picture || null;
    return await googleLoginOrRegister({
      email: emailLower,
      name: fullName,
      username: desiredUsername || undefined,
      avatarUrl
    });
  }

  // ── 1. GOOGLE LOGIN & FULL ACCOUNT RESTORATION (STRICT @GMAIL.COM + SUPABASE) ──
  async function googleLoginOrRegister({ email, name, username, avatarUrl, balance, riskPercent }) {
    const emailLower = (email || '').trim().toLowerCase();
    if (!emailLower) throw new Error('يرجى إدخال بريد Gmail');
    if (!isGmailAddress(emailLower)) {
      throw new Error('ممنوع أي بريد غير جوجل! يُسمح فقط بحسابات @gmail.com الحقيقية');
    }

    const isAdminEmail = emailLower.includes('hajar') || emailLower.includes('admin');
    const cleanAvatar = avatarUrl ? offloadBase64Media(avatarUrl, 'avatars') : null;

    let user = db.users.find(u => u.email.toLowerCase() === emailLower);

    // If Supabase is connected, try pulling latest user record from cloud first
    if (supabase && !user) {
      try {
        const { data: cloudUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', emailLower)
          .maybeSingle();
        if (cloudUser) {
          user = {
            id: cloudUser.id,
            email: cloudUser.email,
            username: generateUniqueUsername(username || cloudUser.username || emailLower.split('@')[0], emailLower, emailLower),
            name: cloudUser.name,
            avatar: cloudUser.avatar,
            plan: cloudUser.plan,
            role: cloudUser.role,
            status: cloudUser.status,
            balance: Number(cloudUser.balance) === 50000 ? 0 : (Number(cloudUser.balance) || 0),
            riskPercent: Number(cloudUser.risk_percent) || 1,
            hasAcceptedCommunityRules: Boolean(cloudUser.has_accepted_rules),
            totalChats: Number(cloudUser.total_chats) || 0,
            totalTrades: Number(cloudUser.total_trades) || 0,
            joinedAt: cloudUser.joined_at ? cloudUser.joined_at.split('T')[0] : new Date().toISOString().split('T')[0],
            lastLoginAt: new Date().toISOString()
          };
          db.users.push(user);
        }
      } catch (e) { }
    }

    if (username && username.trim()) {
      const candidate = normalizeUsername(username);
      if (isUsernameTaken(candidate, emailLower)) {
        throw new Error(`اليوزرنيم @${candidate} مستخدم بالفعل من طرف متداول آخر، اختر يوزرنيم مختلف`);
      }
    }

    if (!user) {
      const desiredHandle = username ? normalizeUsername(username) : emailLower.split('@')[0];
      user = {
        id: 'usr_' + Date.now(),
        email: emailLower,
        username: generateUniqueUsername(desiredHandle, emailLower, emailLower),
        name: (name || emailLower.split('@')[0]).trim(),
        avatar: cleanAvatar,
        plan: isAdminEmail ? 'PREMIUM' : 'FREE',
        role: isAdminEmail ? 'ADMIN' : 'USER',
        status: 'Active',
        balance: Number(balance) || 0,
        riskPercent: Number(riskPercent) || 1,
        hasAcceptedCommunityRules: false,
        totalChats: 0,
        totalTrades: 0,
        joinedAt: new Date().toISOString().split('T')[0],
        lastLoginAt: new Date().toISOString()
      };
      db.users.push(user);
    } else {
      if (name && name.trim()) user.name = name.trim();
      if (username && username.trim()) {
        user.username = normalizeUsername(username);
      } else if (!user.username) {
        user.username = generateUniqueUsername(emailLower.split('@')[0], emailLower, emailLower);
      }
      if (cleanAvatar) user.avatar = cleanAvatar;
      if (isAdminEmail) {
        user.role = 'ADMIN';
      }
      user.lastLoginAt = new Date().toISOString();
    }

    const memory = ensureUserMemory(emailLower, user.name);
    rebuildSummaryDossier(memory, user);

    if (!db.userConversations[emailLower]) {
      db.userConversations[emailLower] = {
        sessionsList: [
          { id: 'session_1', title: 'XAUUSD LIQUIDITY SWEEP [SMC]', updatedAt: 'TODAY' }
        ],
        sessionsMessages: {},
        aiContextBySession: {},
        updatedAt: new Date().toISOString()
      };
    }

    saveDb();
    await syncUserToSupabase(user);
    await syncMemoryToSupabase(emailLower);
    await syncConversationsToSupabase(emailLower);

    return {
      user: {
        ...user,
        aiMemory: memory,
        sessionsList: db.userConversations[emailLower].sessionsList,
        sessionsMessages: db.userConversations[emailLower].sessionsMessages
      },
      memory,
      conversations: db.userConversations[emailLower]
    };
  }

  // ── 2. AI ADAPTIVE LEARNING ENGINE (Learns from every user chat & voice turn) ──
  function learnFromUserInteraction({ email, userQuery, aiReply, chartMeta, signalData, isVoice }) {
    const emailLower = (email || 'guest').trim().toLowerCase();
    const userObj = db.users.find(u => u.email.toLowerCase() === emailLower);
    const mem = ensureUserMemory(emailLower, userObj?.name || emailLower.split('@')[0]);

    // 1. Update Dialect
    const detectedDialect = detectDialectFromText(userQuery);
    if (detectedDialect) {
      mem.preferredDialect = detectedDialect;
    }

    // 2. Update Favorite Assets
    const rawSym = chartMeta?.rawSymbol;
    if (rawSym) {
      mem.favoriteAssets[rawSym] = (mem.favoriteAssets[rawSym] || 0) + 1;
    }

    // 3. Update Preferred Timeframes
    const iv = chartMeta?.interval;
    if (iv) {
      mem.preferredTimeframes[String(iv)] = (mem.preferredTimeframes[String(iv)] || 0) + 1;
    }

    // 4. Record Trade Setup if given
    if (signalData && signalData.asset && signalData.entry) {
      const setupEntry = {
        asset: signalData.asset,
        direction: signalData.direction || 'BUY',
        entry: signalData.entry,
        sl: signalData.sl,
        tp1: signalData.tp1,
        tp2: signalData.tp2,
        rr: signalData.rr || '1:3',
        timestamp: new Date().toISOString()
      };
      mem.recentSetups = [setupEntry, ...(mem.recentSetups || [])].slice(0, 10);
      if (userObj) {
        userObj.totalTrades = (userObj.totalTrades || 0) + 1;
      }
    }

    // 5. Record Recent Topic / Question
    const cleanQ = String(userQuery || '')
      .replace(/\[.*?\]/g, '')
      .trim()
      .substring(0, 90);
    if (cleanQ && cleanQ.length > 3) {
      mem.recentTopics = [cleanQ, ...(mem.recentTopics || []).filter(t => t !== cleanQ)].slice(0, 8);
    }

    // 6. Record Trade Success or Failure Outcome (ربح / خسارة / TP / SL)
    if (!mem.tradeStats) {
      mem.tradeStats = { wins: 0, losses: 0, total: 0, winRate: '0%', lastTradeResult: null };
    }
    const isWin = /جابت الهدف|ضربت الهدف|وصلات الهدف|ربحت|ربحنا|نجحات الصفقة|صفقة ناجحة|ضربت TP|HIT TP|TP HIT|TAKE PROFIT HIT|PROFITABLE|ربح مزيان/i.test(userQuery);
    const isLoss = /ضربت الوقف|ضربات الوقف|ستوب لوز|ضربت ستوب|خسرت|صفقة خاسرة|STOP LOSS HIT|HIT SL|SL HIT|STOPPED OUT/i.test(userQuery);

    if (isWin) {
      mem.tradeStats.wins = (mem.tradeStats.wins || 0) + 1;
      mem.tradeStats.total = (mem.tradeStats.total || 0) + 1;
      mem.tradeStats.lastTradeResult = 'WIN (حققت الهدف بنجاح 🎯)';
      mem.tradeStats.winRate = Math.round((mem.tradeStats.wins / mem.tradeStats.total) * 100) + '%';
      if (mem.recentSetups && mem.recentSetups.length > 0) {
        mem.recentSetups[0].outcome = 'WIN';
      }
    } else if (isLoss) {
      mem.tradeStats.losses = (mem.tradeStats.losses || 0) + 1;
      mem.tradeStats.total = (mem.tradeStats.total || 0) + 1;
      mem.tradeStats.lastTradeResult = 'LOSS (ضربت وقف الخسارة 🛑)';
      mem.tradeStats.winRate = Math.round((mem.tradeStats.wins / mem.tradeStats.total) * 100) + '%';
      if (mem.recentSetups && mem.recentSetups.length > 0) {
        mem.recentSetups[0].outcome = 'LOSS';
      }
    }

    if (userObj) {
      userObj.totalChats = (userObj.totalChats || 0) + 1;
      userObj.lastLoginAt = new Date().toISOString();
    }

    mem.updatedAt = new Date().toISOString();
    rebuildSummaryDossier(mem, userObj);

    saveDb();
    if (userObj) syncUserToSupabase(userObj);
    syncMemoryToSupabase(emailLower);

    return mem;
  }

  // ── 3. LEARN FROM COMMUNITY FLOOR MESSAGES & SIGNALS ──
  function learnFromCommunityMessage(newMessage, senderEmail = null) {
    const pulse = db.communityHub.marketPulse || {
      latestAdminBroadcast: null,
      latestSmcSignal: null,
      topDiscussedAssets: {},
      updatedAt: new Date().toISOString()
    };

    const txtUpper = ((newMessage.content || '') + ' ' + (newMessage.tag || '')).toUpperCase();
    if (txtUpper.includes('XAU') || txtUpper.includes('GOLD') || txtUpper.includes('ذهب')) {
      pulse.topDiscussedAssets.XAUUSD = (pulse.topDiscussedAssets.XAUUSD || 0) + 1;
    }
    if (txtUpper.includes('BTC') || txtUpper.includes('بيتكوين')) {
      pulse.topDiscussedAssets.BTCUSDT = (pulse.topDiscussedAssets.BTCUSDT || 0) + 1;
    }
    if (txtUpper.includes('SOL') || txtUpper.includes('سولانا')) {
      pulse.topDiscussedAssets.SOLUSDT = (pulse.topDiscussedAssets.SOLUSDT || 0) + 1;
    }
    if (txtUpper.includes('ETH') || txtUpper.includes('إيثيريوم')) {
      pulse.topDiscussedAssets.ETHUSDT = (pulse.topDiscussedAssets.ETHUSDT || 0) + 1;
    }

    if (newMessage.type === 'SIGNAL' && newMessage.signalData) {
      pulse.latestSmcSignal = {
        symbol: newMessage.signalData.symbol || newMessage.signalData.asset,
        direction: newMessage.signalData.direction,
        entry: newMessage.signalData.entry,
        sl: newMessage.signalData.sl,
        tp1: newMessage.signalData.tp1,
        time: newMessage.time
      };
    } else if (newMessage.isAdmin) {
      pulse.latestAdminBroadcast = {
        content: (newMessage.content || '').substring(0, 160),
        tag: newMessage.tag,
        time: newMessage.time
      };
    }

    pulse.updatedAt = new Date().toISOString();
    db.communityHub.marketPulse = pulse;

    if (senderEmail) {
      const emailLower = senderEmail.trim().toLowerCase();
      const mem = ensureUserMemory(emailLower, newMessage.senderName);
      if (newMessage.tag && !mem.communityInterests.includes(newMessage.tag)) {
        mem.communityInterests = [newMessage.tag, ...(mem.communityInterests || [])].slice(0, 8);
      }
      syncMemoryToSupabase(emailLower);
    }

    syncCommunityMessageToSupabase(newMessage);
    saveDb();
  }

  // ── 4. BUILD PERSONALIZED AI MEMORY PROMPT FOR SHARK AI ──
  function buildTraderIntelligenceContext(email) {
    const emailLower = (email || 'guest').trim().toLowerCase();
    const userObj = db.users.find(u => u.email.toLowerCase() === emailLower);
    const mem = ensureUserMemory(emailLower, userObj?.name || 'Trader');
    const dossier = rebuildSummaryDossier(mem, userObj);

    const pulse = db.communityHub.marketPulse;
    let communityBrief = '';
    if (pulse?.latestSmcSignal) {
      const s = pulse.latestSmcSignal;
      communityBrief += `\n• آخر صفقة مؤسسية منشورة في مجتمع الحيتان: ${s.direction} على ${s.symbol} عند ${s.entry} (هدف ${s.tp1}، وقف ${s.sl}).`;
    }
    if (pulse?.latestAdminBroadcast) {
      communityBrief += `\n• آخر إعلان آدمن في المجتمع: "${pulse.latestAdminBroadcast.content}"`;
    }

    return `\n\n━━━━ 🧠 ذاكرة الذكاء المتعلمة عن هذا المتداول (PERSONAL TRADER MEMORY) ━━━━\n${dossier}${communityBrief}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }

  // ── 5. SYNC USER PRIVATE CHAT SESSIONS ──
  function syncUserConversations(email, sessionsList, sessionsMessages) {
    const emailLower = (email || '').trim().toLowerCase();
    if (!emailLower) return null;

    if (!db.userConversations[emailLower]) {
      db.userConversations[emailLower] = {
        sessionsList: [],
        sessionsMessages: {},
        aiContextBySession: {},
        updatedAt: new Date().toISOString()
      };
    }

    const conv = db.userConversations[emailLower];
    if (Array.isArray(sessionsList)) {
      conv.sessionsList = sessionsList;
    }
    if (sessionsMessages && typeof sessionsMessages === 'object') {
      const cleanedMsgs = {};
      for (const [sId, arr] of Object.entries(sessionsMessages)) {
        if (!Array.isArray(arr)) continue;
        cleanedMsgs[sId] = arr.slice(-40).map(m => {
          const copy = { ...m };
          if (copy.audioUri && copy.audioUri.startsWith('data:')) {
            copy.audioUri = offloadBase64Media(copy.audioUri, 'audio');
          }
          if (copy.imageUri && copy.imageUri.startsWith('data:')) {
            copy.imageUri = offloadBase64Media(copy.imageUri, 'avatars');
          }
          delete copy.rawBase64;
          return copy;
        });
      }
      conv.sessionsMessages = cleanedMsgs;
    }

    conv.updatedAt = new Date().toISOString();
    saveDb();
    syncConversationsToSupabase(emailLower);
    return conv;
  }

  function getOrCreateAiSessionContext(email, sessionId) {
    const emailLower = (email || 'guest').trim().toLowerCase();
    if (!db.userConversations[emailLower]) {
      db.userConversations[emailLower] = {
        sessionsList: [],
        sessionsMessages: {},
        aiContextBySession: {},
        updatedAt: new Date().toISOString()
      };
    }
    const conv = db.userConversations[emailLower];
    if (!conv.aiContextBySession) conv.aiContextBySession = {};
    if (!conv.aiContextBySession[sessionId]) {
      conv.aiContextBySession[sessionId] = {
        title: 'Trading Session',
        messages: [],
        activeChart: null,
        updatedAt: new Date().toISOString()
      };
    }
    db.sessions[emailLower] = conv.aiContextBySession;
    return conv.aiContextBySession[sessionId];
  }

  return {
    db,
    loadDb,
    saveDb,
    initSupabaseClient,
    isSupabaseConnected: () => {
      if (!supabase) initSupabaseClient();
      return Boolean(supabase);
    },
    getSupabaseSyncReport: () => lastSupabaseSyncReport,
    syncAllDataToSupabase,
    deleteUserById,
    wipeAllData,
    verifySupabaseOAuthToken,
    isGmailAddress,
    normalizeUsername,
    isUsernameTaken,
    generateUniqueUsername,
    offloadBase64Media,
    googleLoginOrRegister,
    ensureUserMemory,
    learnFromUserInteraction,
    learnFromCommunityMessage,
    buildTraderIntelligenceContext,
    syncUserConversations,
    getOrCreateAiSessionContext,
    syncUserToSupabase,
    fetchUsersFromSupabase,
    updateUserPlanInSupabase,
    updateUserRoleInSupabase,
    updateUserStatusInSupabase,
    deleteUserFromSupabase,
    syncCommunityMessageToSupabase,
    fetchCommunityMessagesFromSupabase,
    updateMessageReactionsInSupabase,
    deleteCommunityMessageFromSupabase
  };
}

module.exports = {
  createEnterpriseDbManager,
  offloadBase64Media
};
