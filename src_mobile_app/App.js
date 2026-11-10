import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Image,
  Animated,
  TouchableWithoutFeedback,
  Linking,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const BACKEND_URL = (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
  ? (window.__SHARK_BACKEND_URL__ || (window.location.protocol + '//' + window.location.host))
  : 'http://localhost:5000';
const SHARK_LOGO = require('./assets/shark_aggressive_logo.png');

// إزالة أي إطار أو وهج أبيض وتثبيت نافذة الويب لتجنب اختفاء الرسائل في الأسفل نهائياً
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const styleId = 'shark-no-focus-outline';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      html, body, #root {
        height: 100% !important;
        max-height: 100% !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
      }
      textarea:focus, input:focus, [contenteditable]:focus, select:focus {
        outline: none !important;
        outline-style: none !important;
        outline-width: 0 !important;
        box-shadow: none !important;
      }
      * {
        -webkit-tap-highlight-color: transparent;
        box-sizing: border-box;
      }
    `;
    document.head.appendChild(style);
  }
}

function LiveTradingViewChart({ symbol = 'BINANCE:BTCUSDT', interval = '60' }) {
  const chartUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${encodeURIComponent(
    symbol
  )}&interval=${interval}&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=0A0D14&studies=[]&theme=dark&style=1&timezone=exchange&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=ar_AE`;

  return (
    <View style={styles.chartWideBox}>
      <View style={styles.chartWideHeader}>
        <View style={styles.chartDotLive} />
        <Text style={styles.chartWideTitle}>
          شارت حي مباشر (TradingView): {symbol} ({interval === '60' ? '1H' : interval + 'M'})
        </Text>
      </View>
      {Platform.OS === 'web' ? (
        <iframe
          src={chartUrl}
          style={{ width: '100%', height: 440, border: 'none', backgroundColor: '#0A0D14' }}
          title="TradingView Live"
        />
      ) : (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: '#00FF66' }}>TradingView Loaded: {symbol}</Text>
        </View>
      )}
    </View>
  );
}

// ══════════════════════════════════════════════
// 🦈 مؤشر تفكير ناعم ومصغر كالكتابة (Minimalist Text-Style Thinking Indicator)
// ══════════════════════════════════════════════
function SharkThinkingIndicator() {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ])
    );
    const rotateLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();
    rotateLoop.start();

    return () => {
      pulseLoop.stop();
      rotateLoop.stop();
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '10deg'],
  });

  return (
    <View style={styles.inlineThinkingBubble}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <MaterialCommunityIcons name="shark" size={17} color="#00FF66" />
      </Animated.View>
      <Text style={styles.inlineThinkingLabel}>Thinking...</Text>
      <Animated.View style={[styles.inlineThinkingDot, { opacity: pulseAnim }]} />
    </View>
  );
}

// ══════════════════════════════════════════════
// 🧠 تفكير القرش مثل Antigravity تماماً (Minimal Subtle Reasoning Accordion)
// ══════════════════════════════════════════════
function SharkReasoningAccordion({ thinking }) {
  const [open, setOpen] = useState(false);
  if (!thinking || thinking.trim().length === 0) return null;

  return (
    <View style={styles.antigravityThoughtWrapper}>
      <TouchableOpacity
        style={styles.antigravityThoughtHeader}
        onPress={() => setOpen(!open)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={open ? 'chevron-down' : 'chevron-forward'}
          size={13}
          color="#8A9BB0"
        />
        <Text style={styles.antigravityThoughtHeaderText}>
          {open ? '🧠 مسار التفكير المؤسسي (Reasoning Process)' : '🧠 عقل وتحليل القرش المؤسسي (اضغط لعرض التفكير)'}
        </Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.antigravityThoughtBody}>
          <Text style={styles.antigravityThoughtText}>{thinking}</Text>
        </View>
      )}
    </View>
  );
}

// ══════════════════════════════════════════════
// ══════════════════════════════════════════════
// بطاقة الصفقة المؤسسية بتصميم SHARK QUANT الحصري
// - إطار أصفر نيون ذهبي (#FFE600)
// - حاسبة لوت متكاملة تحفظ رصيد العميل دائماً في النظام
// - دعم ثنائي اللغة (عربي / إنجليزي) بانتظام ودقة تامة
// ══════════════════════════════════════════════
function InstitutionalTradeCard({
  signal,
  lang,
  parentText = '',
  globalBalance = '5000',
  onUpdateBalance,
  globalRiskPercent = 1,
  onUpdateRisk
}) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [calcOpen, setCalcOpen] = useState(true); // مفتوحة افتراضياً لسهولة وصول العميل

  // حالة محلية تفاعلية وفورية تتجاوب مع كل حرف وضغطة زر
  const [localBalance, setLocalBalance] = useState(String(globalBalance || '5000'));
  const [localRisk, setLocalRisk] = useState(Number(globalRiskPercent) || 1);

  // التزامن التلقائي مع الحالة العامة المحفوظة
  useEffect(() => {
    if (globalBalance && String(globalBalance) !== localBalance) {
      setLocalBalance(String(globalBalance));
    }
  }, [globalBalance]);

  useEffect(() => {
    if (globalRiskPercent && Number(globalRiskPercent) !== localRisk) {
      setLocalRisk(Number(globalRiskPercent));
    }
  }, [globalRiskPercent]);

  const handleBalanceChange = (val) => {
    setLocalBalance(val);
    if (onUpdateBalance) onUpdateBalance(val);
  };

  const handleRiskChange = (pct) => {
    setLocalRisk(pct);
    if (onUpdateRisk) onUpdateRisk(pct);
  };

  // دالة تنظيف واستخراج الأرقام العشرية بدقة فائقة من أي نص مهما كان تنسيقه
  const extractPrice = (val, fallback = 0) => {
    if (typeof val === 'number' && !isNaN(val)) return val;
    if (!val) return fallback;
    const str = String(val).replace(/,/g, '');
    const m = str.match(/\d+(\.\d+)?/);
    if (!m) return fallback;
    const parsed = parseFloat(m[0]);
    return isNaN(parsed) ? fallback : parsed;
  };

  // كشف اللغة تلقائياً
  const isAr = lang === 'ar' || /[\u0600-\u06FF]/.test((signal.reason || '') + ' ' + (parentText || ''));

  const t = {
    deskTag: isAr ? 'غرفة صفقات الحيتان // SHARK EXECUTION' : 'INSTITUTIONAL QUANT DESK // SHARK AI',
    statusBadge: isAr ? 'إشارة مؤكدة' : 'VERIFIED SIGNAL',
    directionLabel: signal.direction?.toUpperCase().includes('BUY')
      ? (isAr ? 'شراء (LONG)' : 'BUY (LONG)')
      : (isAr ? 'بيع (SHORT)' : 'SELL (SHORT)'),
    entry: isAr ? 'منطقة الدخول المؤسسي' : 'INSTITUTIONAL ENTRY',
    sl: isAr ? 'وقف الخسارة الحاسم' : 'STOP LOSS (INVALIDATION)',
    tp1: isAr ? 'الهدف الأول (تأمين)' : 'TAKE PROFIT 1',
    tp2: isAr ? 'الهدف الثاني (امتداد)' : 'TAKE PROFIT 2',
    copy: isAr ? 'نسخ' : 'COPY',
    copied: isAr ? 'تم النسخ!' : 'COPIED!',
    thesis: isAr ? '💡 منطق الصفقة وتدفق السيولة (SMC Thesis):' : '💡 INSTITUTIONAL SMC LIQUIDITY THESIS:',
    calcOpen: isAr ? 'إخفاء حاسبة اللوت' : 'Hide Risk Calculator',
    calcClosed: isAr ? '🧮 حاسبة اللوت وإدارة رأس المال (SAVED)' : '🧮 SMART LOT & RISK CALCULATOR (SAVED)',
    balanceLabel: isAr ? 'رصيد الحساب المحفوظ ($):' : 'Saved Account Balance ($):',
    riskLabel: isAr ? 'نسبة المخاطرة:' : 'Risk Percentage:',
    recommendedLots: isAr ? 'حجم اللوت الموصى به' : 'RECOMMENDED LOTS',
    maxLoss: isAr ? 'أقصى مخاطرة (SL)' : 'MAX RISK (SL)',
    expectedProfit: isAr ? 'الربح عند TP1' : 'EST. PROFIT (TP1)',
    whatsapp: isAr ? 'واتساب' : 'WhatsApp',
    telegram: isAr ? 'تليجرام' : 'Telegram',
    copyAll: isAr ? 'نسخ الصفقة كاملة' : 'COPY SIGNAL',
    copyAllDone: isAr ? 'تم النسخ!' : 'COPIED!',
    savedNotice: isAr ? '✓ المبلغ محفوظ دائماً في نظامك' : '✓ Balance permanently saved in your system',
  };

  // أسعار المستويات بدقة مع صمامات أمان ضد أي خطأ
  const entryNum = extractPrice(signal.entry, 4070);
  const slNum = extractPrice(signal.sl, entryNum - 20);
  const tp1Num = extractPrice(signal.tp1, entryNum + 25);
  const tp2Num = signal.tp2 ? extractPrice(signal.tp2, entryNum + 50) : null;

  // رصيد الحساب ونسبة المخاطرة المتفاعلة فورياً
  const balNum = Math.max(1, extractPrice(localBalance, 5000));
  const currentRisk = typeof localRisk === 'number' && localRisk > 0 ? localRisk : 1;
  const riskAmount = balNum * (currentRisk / 100);

  // الفارق السعري
  const priceDistance = Math.max(0.1, Math.abs(entryNum - slNum));

  // تحديد نوع الأصل
  const assetUpper = (signal.asset || '').toUpperCase();
  const isGold = assetUpper.includes('XAU') || assetUpper.includes('GOLD') || assetUpper.includes('ذهب');
  const isCrypto = assetUpper.includes('BTC') || assetUpper.includes('ETH') || assetUpper.includes('SOL');

  let lotSizeDisplay = '0.01 Lots';
  let profitTp1Display = '+$0.00';
  let profitTp2Display = '+$0.00';
  let maxLossDisplay = `-$${riskAmount.toFixed(0)}`;

  if (isGold) {
    // لوت الذهب القياسي = 100 أونصة. كل $1 حركة = $100 في اللوت
    const rawLots = riskAmount / (priceDistance * 100);
    const lots = Math.max(0.01, rawLots);
    lotSizeDisplay = `${lots.toFixed(2)} Lots`;
    const p1 = Math.abs(tp1Num - entryNum) * lots * 100;
    profitTp1Display = `+$${p1.toFixed(0)}`;
    if (tp2Num) {
      const p2 = Math.abs(tp2Num - entryNum) * lots * 100;
      profitTp2Display = `+$${p2.toFixed(0)}`;
    }
  } else if (isCrypto) {
    const rawCoins = riskAmount / priceDistance;
    const coins = Math.max(0.001, rawCoins);
    lotSizeDisplay = `${coins.toFixed(3)} Units`;
    const p1 = Math.abs(tp1Num - entryNum) * coins;
    profitTp1Display = `+$${p1.toFixed(0)}`;
    if (tp2Num) {
      const p2 = Math.abs(tp2Num - entryNum) * coins;
      profitTp2Display = `+$${p2.toFixed(0)}`;
    }
  } else {
    const rawLots = riskAmount / (priceDistance * 100);
    const lots = Math.max(0.01, rawLots);
    lotSizeDisplay = `${lots.toFixed(2)} Lots`;
    const p1 = Math.abs(tp1Num - entryNum) * lots * 100;
    profitTp1Display = `+$${p1.toFixed(0)}`;
  }

  const copyVal = (val, key) => {
    if (Platform.OS === 'web' && navigator.clipboard) {
      navigator.clipboard.writeText(String(val));
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const copyFullSignal = () => {
    const text = isAr
      ? `🦈 SHARK TRADERS AI // صفقة حوت مؤسسية\n\n🎯 الأصل: ${signal.asset}\n📊 الاتجاه: ${signal.direction}\n📍 منطقة الدخول: ${signal.entry}\n🛑 وقف الخسارة: ${signal.sl}\n🏁 الهدف الأول: ${signal.tp1}${signal.tp2 ? `\n🏁 الهدف الثاني: ${signal.tp2}` : ''}\n⚖️ نسبة العائد للمخاطرة: ${signal.rr || '1:3.0'}\n💡 منطق الصفقة: ${signal.reason || 'اقتناص سيولة واختبار FVG'}\n\n⚡ مدعوم من Shark Traders AI Quant Desk`
      : `🦈 SHARK TRADERS AI // INSTITUTIONAL SIGNAL\n\n🎯 ASSET: ${signal.asset}\n📊 DIRECTION: ${signal.direction}\n📍 ENTRY: ${signal.entry}\n🛑 STOP LOSS: ${signal.sl}\n🏁 TP 1: ${signal.tp1}${signal.tp2 ? `\n🏁 TP 2: ${signal.tp2}` : ''}\n⚖️ R:R RATIO: ${signal.rr || '1:3.0'}\n💡 LOGIC: ${signal.reason || 'SMC Liquidity Grab'}\n\n⚡ Powered by Shark Traders AI Quant Desk`;
    if (Platform.OS === 'web' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKey('all');
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const shareSignal = (platform) => {
    const text = isAr
      ? `🦈 SHARK TRADERS AI // صفقة حوت مؤسسية\n\n🎯 الأصل: ${signal.asset}\n📊 الاتجاه: ${signal.direction}\n📍 الدخول: ${signal.entry}\n🛑 الستوب: ${signal.sl}\n🏁 الهدف 1: ${signal.tp1}${signal.tp2 ? `\n🏁 الهدف 2: ${signal.tp2}` : ''}\n⚖️ R:R: ${signal.rr || '1:3.0'}\n💡 المنطق: ${signal.reason || 'SMC Liquidity Grab'}\n\n⚡ Shark Traders AI`
      : `🦈 SHARK TRADERS AI // INSTITUTIONAL SIGNAL\n\n🎯 ASSET: ${signal.asset}\n📊 DIRECTION: ${signal.direction}\n📍 ENTRY: ${signal.entry}\n🛑 STOP LOSS: ${signal.sl}\n🏁 TP 1: ${signal.tp1}${signal.tp2 ? `\n🏁 TP 2: ${signal.tp2}` : ''}\n⚖️ R:R: ${signal.rr || '1:3.0'}\n💡 LOGIC: ${signal.reason || 'SMC Liquidity Grab'}\n\n⚡ Shark Traders AI`;
    const enc = encodeURIComponent(text);
    if (platform === 'whatsapp') {
      if (Platform.OS === 'web') {
        window.open(`https://api.whatsapp.com/send?text=${enc}`, '_blank');
      } else {
        Linking.openURL(`https://api.whatsapp.com/send?text=${enc}`).catch(() => {});
      }
    } else if (platform === 'telegram') {
      if (Platform.OS === 'web') {
        window.open(`https://t.me/share/url?url=https://sharktraders.ai&text=${enc}`, '_blank');
      } else {
        Linking.openURL(`https://t.me/share/url?url=https://sharktraders.ai&text=${enc}`).catch(() => {});
      }
    }
  };

  const isBuy = signal.direction?.toUpperCase().includes('BUY');
  const dirColor = isBuy ? '#00FF66' : '#FF0055';

  return (
    <View style={[styles.tradeCardContainer, { borderColor: '#FFE600', borderWidth: 2 }]}>
      {/* 1. Brand Top Bar with Pulsing Status */}
      <View style={styles.tradeCardTopBar}>
        <View style={styles.tradeDeskBrandRow}>
          <Image source={SHARK_LOGO} style={{ width: 20, height: 20, marginRight: 6 }} resizeMode="contain" />
          <Text style={styles.tradeDeskBrandText}>{t.deskTag}</Text>
        </View>
        <View style={[styles.tradeStatusPill, { backgroundColor: 'rgba(255,230,0,0.12)', borderColor: '#FFE600' }]}>
          <View style={[styles.tradeStatusDot, { backgroundColor: '#FFE600' }]} />
          <Text style={[styles.tradeStatusText, { color: '#FFE600' }]}>{t.statusBadge}</Text>
        </View>
      </View>

      {/* 2. Main Hero: Asset + Direction Pill + R:R Tag */}
      <View style={styles.tradeMainHero}>
        <View>
          <Text style={styles.tradeAssetSymbol}>{signal.asset}</Text>
          <Text style={styles.tradeAssetSub}>SMART MONEY CONCEPTS • SMC</Text>
        </View>
        <View style={styles.tradeHeroRight}>
          <View style={[styles.tradeDirectionPill, { backgroundColor: dirColor }]}>
            <Ionicons name={isBuy ? 'trending-up' : 'trending-down'} size={14} color="#000" />
            <Text style={styles.tradeDirectionPillText}>{t.directionLabel}</Text>
          </View>
          <View style={styles.tradeRrTag}>
            <Text style={styles.tradeRrTagText}>R:R {signal.rr || '1:3.0'}</Text>
          </View>
        </View>
      </View>

      {/* 3. Execution Levels: Entry, Stop Loss, TP1, TP2 */}
      <View style={styles.tradeLevelsGrid}>
        {/* Entry Level */}
        <View style={[styles.tradeLevelCard, { borderLeftColor: '#00F0FF' }]}>
          <View style={styles.tradeLevelTop}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="locate" size={13} color="#00F0FF" />
              <Text style={[styles.tradeLevelTitle, { color: '#00F0FF' }]}>{t.entry}</Text>
            </View>
            <TouchableOpacity style={styles.tradeCopyMiniBtn} onPress={() => copyVal(signal.entry, 'entry')}>
              <Ionicons name={copiedKey === 'entry' ? 'checkmark' : 'copy-outline'} size={11} color={copiedKey === 'entry' ? '#00FF66' : '#8A9DB4'} />
              <Text style={[styles.tradeCopyMiniText, copiedKey === 'entry' && { color: '#00FF66' }]}>
                {copiedKey === 'entry' ? t.copied : t.copy}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.tradeLevelValueLarge}>{signal.entry}</Text>
        </View>

        {/* Stop Loss Level */}
        <View style={[styles.tradeLevelCard, { borderLeftColor: '#FF2D55' }]}>
          <View style={styles.tradeLevelTop}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="shield-outline" size={13} color="#FF2D55" />
              <Text style={[styles.tradeLevelTitle, { color: '#FF2D55' }]}>{t.sl}</Text>
            </View>
            <TouchableOpacity style={styles.tradeCopyMiniBtn} onPress={() => copyVal(signal.sl, 'sl')}>
              <Ionicons name={copiedKey === 'sl' ? 'checkmark' : 'copy-outline'} size={11} color={copiedKey === 'sl' ? '#00FF66' : '#8A9DB4'} />
              <Text style={[styles.tradeCopyMiniText, copiedKey === 'sl' && { color: '#00FF66' }]}>
                {copiedKey === 'sl' ? t.copied : t.copy}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.tradeLevelValueLarge, { color: '#FF2D55' }]}>{signal.sl}</Text>
        </View>

        {/* Take Profit 1 */}
        <View style={[styles.tradeLevelCard, { borderLeftColor: '#00FF66' }]}>
          <View style={styles.tradeLevelTop}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="flag-outline" size={13} color="#00FF66" />
              <Text style={[styles.tradeLevelTitle, { color: '#00FF66' }]}>{t.tp1}</Text>
            </View>
            <TouchableOpacity style={styles.tradeCopyMiniBtn} onPress={() => copyVal(signal.tp1, 'tp1')}>
              <Ionicons name={copiedKey === 'tp1' ? 'checkmark' : 'copy-outline'} size={11} color={copiedKey === 'tp1' ? '#00FF66' : '#8A9DB4'} />
              <Text style={[styles.tradeCopyMiniText, copiedKey === 'tp1' && { color: '#00FF66' }]}>
                {copiedKey === 'tp1' ? t.copied : t.copy}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.tradeLevelValueLarge, { color: '#00FF66' }]}>{signal.tp1}</Text>
        </View>

        {/* Take Profit 2 (Optional) */}
        {signal.tp2 && (
          <View style={[styles.tradeLevelCard, { borderLeftColor: '#FFE600' }]}>
            <View style={styles.tradeLevelTop}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="trophy-outline" size={13} color="#FFE600" />
                <Text style={[styles.tradeLevelTitle, { color: '#FFE600' }]}>{t.tp2}</Text>
              </View>
              <TouchableOpacity style={styles.tradeCopyMiniBtn} onPress={() => copyVal(signal.tp2, 'tp2')}>
                <Ionicons name={copiedKey === 'tp2' ? 'checkmark' : 'copy-outline'} size={11} color={copiedKey === 'tp2' ? '#00FF66' : '#8A9DB4'} />
                <Text style={[styles.tradeCopyMiniText, copiedKey === 'tp2' && { color: '#00FF66' }]}>
                  {copiedKey === 'tp2' ? t.copied : t.copy}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.tradeLevelValueLarge, { color: '#FFE600' }]}>{signal.tp2}</Text>
          </View>
        )}
      </View>

      {/* 4. Reason / Thesis Box */}
      {signal.reason && (
        <View style={styles.tradeReasonBox}>
          <Text style={styles.tradeReasonHeader}>{t.thesis}</Text>
          <Text style={styles.tradeReasonText}>{signal.reason}</Text>
        </View>
      )}

      {/* 5. Interactive Lot Size & Risk Calculator Drawer (With Saved Persistence) */}
      <TouchableOpacity style={styles.calcToggleBtn} onPress={() => setCalcOpen(!calcOpen)}>
        <Ionicons name={calcOpen ? 'chevron-up-circle' : 'calculator-outline'} size={15} color="#FFE600" />
        <Text style={styles.calcToggleBtnText}>
          {calcOpen ? t.calcOpen : t.calcClosed}
        </Text>
      </TouchableOpacity>

      {calcOpen && (
        <View style={styles.calcBoxContainer}>
          <View style={styles.calcRowInputs}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.calcInputLabel}>{t.balanceLabel}</Text>
              <TextInput
                style={styles.calcInput}
                value={localBalance}
                onChangeText={handleBalanceChange}
                keyboardType="numeric"
                placeholder="5000"
                placeholderTextColor="#667"
              />
              <Text style={styles.calcSavedNotice}>{t.savedNotice}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.calcInputLabel}>{t.riskLabel}</Text>
              <View style={styles.riskChipsRow}>
                {[1, 2, 3, 5].map((pct) => (
                  <TouchableOpacity
                    key={pct}
                    style={[styles.riskChip, localRisk === pct && styles.riskChipActive]}
                    onPress={() => handleRiskChange(pct)}
                  >
                    <Text style={[styles.riskChipText, localRisk === pct && styles.riskChipTextActive]}>
                      {pct}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Calculator Results */}
          <View style={styles.calcResultsGrid}>
            <View style={styles.calcResultCard}>
              <Text style={styles.calcResultTitle}>{t.recommendedLots}</Text>
              <Text style={styles.calcResultValLots}>{lotSizeDisplay}</Text>
            </View>
            <View style={styles.calcResultCard}>
              <Text style={styles.calcResultTitle}>{t.maxLoss}</Text>
              <Text style={styles.calcResultValSl}>{maxLossDisplay}</Text>
            </View>
            <View style={styles.calcResultCard}>
              <Text style={styles.calcResultTitle}>{t.expectedProfit}</Text>
              <Text style={styles.calcResultValTp}>{profitTp1Display}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 6. Action Footer: WhatsApp, Telegram, Copy Full */}
      <View style={styles.tradeShareRow}>
        <TouchableOpacity style={[styles.tradeShareBtn, { backgroundColor: '#25D366' }]} onPress={() => shareSignal('whatsapp')}>
          <Ionicons name="logo-whatsapp" size={14} color="#000" />
          <Text style={styles.tradeShareBtnTextDark}>{t.whatsapp}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.tradeShareBtn, { backgroundColor: '#2AABEE' }]} onPress={() => shareSignal('telegram')}>
          <Ionicons name="paper-plane" size={13} color="#000" />
          <Text style={styles.tradeShareBtnTextDark}>{t.telegram}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tradeShareBtnCopyAll} onPress={copyFullSignal}>
          <Ionicons name={copiedKey === 'all' ? 'checkmark' : 'copy-outline'} size={13} color="#FFE600" />
          <Text style={styles.tradeShareBtnCopyAllText}>
            {copiedKey === 'all' ? t.copyAllDone : t.copyAll}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('shark_saved_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (
            parsed &&
            parsed.email &&
            (parsed.email.endsWith('@gmail.com') ||
              parsed.email.endsWith('@googlemail.com') ||
              parsed.email.includes('@'))
          ) {
            return parsed;
          }
        } catch (e) {}
      }
    }
    return null;
  });
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [googleInputEmail, setGoogleInputEmail] = useState('');
  const [googleInputUsername, setGoogleInputUsername] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [planUpgradeModalVisible, setPlanUpgradeModalVisible] = useState(false);
  const [communityRulesModalVisible, setCommunityRulesModalVisible] = useState(false);
  const [selectedAvatarOption, setSelectedAvatarOption] = useState('🦈');
  const [rulesAgreedCheckbox, setRulesAgreedCheckbox] = useState(false);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [editNameInput, setEditNameInput] = useState('');
  const [editUsernameInput, setEditUsernameInput] = useState('');
  const [editAvatarInput, setEditAvatarInput] = useState('');
  const [googleInputName, setGoogleInputName] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [usersDirectory, setUsersDirectory] = useState([]);
  const [communitySearchQuery, setCommunitySearchQuery] = useState('');
  const [communitySearchOpen, setCommunitySearchOpen] = useState(false);

  // رصيد الحساب ونسبة المخاطرة الدائمة المحفوظة محلياً وفي Supabase (تبدأ فارغة / صفر حتى يدخلها المستخدم بنفسه)
  const [globalBalance, setGlobalBalance] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem('shark_custom_balance') || '';
    }
    return '';
  });

  const [globalRiskPercent, setGlobalRiskPercent] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('shark_saved_risk');
      return saved ? parseFloat(saved) : 1;
    }
    return 1;
  });

  const updateGlobalBalance = (newBal) => {
    const clean = String(newBal || '').replace(/[^0-9.]/g, '');
    setGlobalBalance(clean);
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('shark_custom_balance', clean);
    }
    if (currentUser?.email) {
      fetch(`${BACKEND_URL}/api/users/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          balance: Number(clean) || 0
        })
      }).catch(() => {});
    }
  };

  const updateGlobalRisk = (newRisk) => {
    setGlobalRiskPercent(newRisk);
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('shark_saved_risk', String(newRisk));
    }
    if (currentUser?.email) {
      fetch(`${BACKEND_URL}/api/users/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          riskPercent: Number(newRisk) || 1
        })
      }).catch(() => {});
    }
  };

  // Multi-Sessions, Drawer & Dual Floors (AI Desk vs Community Floor)
  const [activeFloor, setActiveFloor] = useState('AI_DESK'); // 'AI_DESK' | 'COMMUNITY'
  const [currentSessionId, setCurrentSessionId] = useState('session_1');
  const [sessionsDrawerOpen, setSessionsDrawerOpen] = useState(false);
  const [communityMessages, setCommunityMessages] = useState([]);
  const [communityChatInput, setCommunityChatInput] = useState('');
  const [communityFilter, setCommunityFilter] = useState('ALL'); // 'ALL' | 'ADMIN' | 'SIGNALS'
  const [isAdminBroadcastMode, setIsAdminBroadcastMode] = useState(false);
  const [adminComposerMode, setAdminComposerMode] = useState('NORMAL'); // 'NORMAL' | 'ALPHA' | 'SIGNAL'
  const [adminTypeMenuOpen, setAdminTypeMenuOpen] = useState(false);
  const [signalModalOpen, setSignalModalOpen] = useState(false);
  const [adminActionSheetOpen, setAdminActionSheetOpen] = useState(false);
  const [selectedMsgForAdminAction, setSelectedMsgForAdminAction] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [activeReactionPickerMsgId, setActiveReactionPickerMsgId] = useState(null);
  const [communityTypingUsers, setCommunityTypingUsers] = useState([]);
  const typingDot1 = useRef(new Animated.Value(0.3)).current;
  const typingDot2 = useRef(new Animated.Value(0.3)).current;
  const typingDot3 = useRef(new Animated.Value(0.3)).current;
  const lastEmittedTypingRef = useRef(false);
  const myCommunityClientId = useRef('client_' + Math.random().toString(36).substring(2, 10)).current;

  // Signal Form State
  const [signalSymbol, setSignalSymbol] = useState('XAUUSD');
  const [signalDirection, setSignalDirection] = useState('BUY'); // 'BUY' | 'SELL'
  const [signalEntry, setSignalEntry] = useState('4,068.50');
  const [signalSL, setSignalSL] = useState('4,058.00');
  const [signalTP1, setSignalTP1] = useState('4,095.00');
  const [signalTP2, setSignalTP2] = useState('4,115.00');
  const [signalTimeframe, setSignalTimeframe] = useState('15M');
  const [signalNotes, setSignalNotes] = useState('SMC Liquidity Sweep + 15M FVG Rebalance');
  const [appSplashVisible, setAppSplashVisible] = useState(true);
  const splashFadeAnim = useRef(new Animated.Value(1)).current;
  const splashScaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(splashScaleAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(splashFadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setAppSplashVisible(false));
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // ✍️ Multi-Trader Pulsing Dots Wave Animation
  useEffect(() => {
    const makeDotAnim = (dot, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(dot, { toValue: 1, duration: 420, delay, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.25, duration: 420, useNativeDriver: true }),
        ])
      );
    };
    const a1 = makeDotAnim(typingDot1, 0);
    const a2 = makeDotAnim(typingDot2, 180);
    const a3 = makeDotAnim(typingDot3, 360);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, []);

  // Format typing indicator text for 1, 2, 3, or 100+ traders
  const formatTypingText = (typers) => {
    if (!typers || typers.length === 0) return '';
    const names = typers.map(t => t.name || t.username || 'Trader');
    if (names.length === 1) {
      return `${names[0]} is typing...`;
    }
    if (names.length === 2) {
      return `${names[0]} and ${names[1]} are typing...`;
    }
    if (names.length === 3) {
      return `${names[0]}, ${names[1]} and ${names[2]} are typing...`;
    }
    const othersCount = names.length - 2;
    return `${names[0]}, ${names[1]} and ${othersCount} others are typing...`;
  };

  const emitCommunityTyping = (isTyping) => {
    if (lastEmittedTypingRef.current === isTyping) return;
    lastEmittedTypingRef.current = isTyping;
    fetch(`${BACKEND_URL}/api/community/typing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: myCommunityClientId,
        email: currentUser?.email || 'guest@shark.com',
        name: currentUser?.name || currentUser?.username || 'Trader',
        username: currentUser?.username || '',
        isTyping,
      }),
    }).catch(() => {});
  };

  const handleCommunityChatInputChange = (text) => {
    setCommunityChatInput(text);
    const hasText = text.trim().length > 0;
    emitCommunityTyping(hasText);
  };
  const [myMessageIds, setMyMessageIds] = useState(() => new Set());
  const communityFlatListRef = useRef(null);
  const lastAdminMsgIdRef = useRef(null);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [latestAdminAlert, setLatestAdminAlert] = useState(null);
  const [showAdminBanner, setShowAdminBanner] = useState(false);
  const [sessionSearchQuery, setSessionSearchQuery] = useState('');
  const [sessionsList, setSessionsList] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('shark_saved_sessions_list');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return [
      { id: 'session_1', title: 'XAUUSD LIQUIDITY SWEEP [SMC]', updatedAt: 'TODAY' },
      { id: 'session_2', title: 'BTC ORDER BLOCK // 4H BREAK', updatedAt: 'YESTERDAY' }
    ];
  });

  const [sessionsMessages, setSessionsMessages] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('shark_saved_sessions_messages');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return {
      session_1: [
        {
          id: '1',
          sender: 'ai',
          text: 'Yo Hajar! I am locked into live institutional feeds. Ready to analyze any pair, drop sniper trades, or talk live on-air.',
          chart: { symbol: 'BINANCE:BTCUSDT', interval: '60' },
          timestamp: 'Just now'
        }
      ],
      session_2: [
        {
          id: '1',
          sender: 'ai',
          text: 'Fresh session created, bro. What asset or setup are we breaking down here?',
          chart: null,
          timestamp: 'Just now'
        }
      ]
    };
  });

  // ── حفظ شامل ودائم لكافة البيانات محلياً وعبر الباك إند (FULL PERSISTENCE) ──
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        if (currentUser && currentUser.email) {
          window.localStorage.setItem('shark_saved_user', JSON.stringify(currentUser));
        } else {
          window.localStorage.removeItem('shark_saved_user');
        }
      } catch (e) {}
    }
  }, [currentUser]);

  // ── SUPABASE GOOGLE OAUTH REDIRECT HANDLER (#access_token=... OR ?access_token=...) ──
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const hash = window.location.hash ? window.location.hash.substring(1) : '';
      const search = window.location.search ? window.location.search.substring(1) : '';
      const params = new URLSearchParams(hash || search);
      const accessToken = params.get('access_token');
      const err = params.get('error_description') || params.get('error');

      if (err) {
        showAppToast(`Google Auth Error: ${decodeURIComponent(err)}`);
        try { window.history.replaceState(null, '', window.location.pathname); } catch (e) {}
        return;
      }

      if (accessToken) {
        const pendingUsername = window.localStorage?.getItem('shark_pending_username') || '';
        setGoogleLoading(true);
        fetch(`${BACKEND_URL}/api/auth/supabase-oauth-callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken, username: pendingUsername })
        })
          .then(r => r.json())
          .then(d => {
            if (d && d.success && d.user) {
              setCurrentUser(d.user);
              if (d.user.balance && Number(d.user.balance) > 0 && Number(d.user.balance) !== 50000) {
                setGlobalBalance(String(d.user.balance));
                window.localStorage?.setItem('shark_custom_balance', String(d.user.balance));
              } else {
                setGlobalBalance('');
                window.localStorage?.setItem('shark_custom_balance', '');
              }
              window.localStorage?.setItem('shark_saved_user', JSON.stringify(d.user));
              window.localStorage?.removeItem('shark_pending_username');

              const userSessions = Array.isArray(d.user.sessionsList) && d.user.sessionsList.length > 0
                ? d.user.sessionsList
                : [{ id: 'session_1', title: 'تحليل السيولة الرئيسي', updatedAt: 'الآن' }];
              setSessionsList(userSessions);
              const firstSessionId = userSessions[0]?.id || 'session_1';
              setCurrentSessionId(firstSessionId);

              const userMsgs = d.user.sessionsMessages && typeof d.user.sessionsMessages === 'object' && Object.keys(d.user.sessionsMessages).length > 0
                ? d.user.sessionsMessages
                : {
                    [firstSessionId]: [
                      {
                        id: 'welcome_' + Date.now(),
                        sender: 'ai',
                        type: 'ai_msg',
                        text: `مرحباً بك يا **${d.user.name || d.user.username}** في مكتب **SHARK QUANT** المؤسسي! 🦈\n\nتم توثيق حسابك بنجاح عبر Google: **${d.user.email}**\n\nأنا مستشارك المالي والكمي المباشر لتحليل شارتات الذهب والعملات والأسواق.\nما هو الأصل الذي تريد تحليله الآن؟ (مثلاً: الذهب XAUUSD، البيتكوين BTC، أو الناسداك)`,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      }
                    ]
                  };
              setSessionsMessages(userMsgs);

              setAuthModalVisible(false);
              showAppToast(`SHARK CONNECTED 🦈 ✅`);
            } else if (d && d.error) {
              showAppToast(d.error);
            }
          })
          .catch(() => {})
          .finally(() => {
            setGoogleLoading(false);
            try {
              window.history.replaceState(null, '', window.location.pathname);
            } catch (e) {}
          });
      }
    }
  }, []);

  // ── REAL-TIME 1.5s SYNC FROM ADMIN PANEL & SUPABASE (تحديث فوري في نفس الثانية للخطة والبلوك واليوزرنيم أو الحذف) ──
  useEffect(() => {
    const syncLiveAccount = async () => {
      if (!currentUser?.email) return;
      try {
        const res = await fetch(`${BACKEND_URL}/api/users/me?email=${encodeURIComponent(currentUser.email)}`);
        const d = await res.json();
        if (d && d.notFound) {
          // If the database was emptied or user was deleted in Admin Panel, log out immediately!
          setCurrentUser(null);
          if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem('shark_saved_user');
          }
          return;
        }
        if (d && d.success && d.user) {
          setCurrentUser(prev => {
            if (!prev) return d.user;
            const planChanged = prev.plan !== d.user.plan;
            const roleChanged = prev.role !== d.user.role;
            const statusChanged = prev.status !== d.user.status;
            const usernameChanged = prev.username !== d.user.username;
            const nameChanged = prev.name !== d.user.name;
            if (!planChanged && !roleChanged && !statusChanged && !usernameChanged && !nameChanged && prev.isBlocked === d.user.isBlocked) {
              return prev;
            }
            if (planChanged) {
              showAppToast(`Plan updated to: ${d.user.plan}`);
            }
            if (roleChanged) {
              showAppToast(d.user.role === 'ADMIN' ? 'Admin privileges enabled on your account' : 'Account role updated');
            }
            if (statusChanged && d.user.status === 'Suspended') {
              showAppToast('Account temporarily restricted by Desk Admin');
            } else if (statusChanged && d.user.status === 'Active') {
              showAppToast('Account reactivated by Desk Admin');
            }
            const nextUser = {
              ...prev,
              ...d.user,
              avatar: d.user.avatar || prev.avatar
            };
            if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
              try {
                window.localStorage.setItem('shark_saved_user', JSON.stringify(nextUser));
              } catch (e) {}
            }
            return nextUser;
          });
        }
      } catch (e) {}
    };

    const syncUsersDir = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/users/directory`);
        const d = await res.json();
        if (d && d.success && Array.isArray(d.users)) {
          setUsersDirectory(d.users);
        }
      } catch (e) {}
    };

    syncLiveAccount();
    syncUsersDir();
    const timer = setInterval(() => {
      syncLiveAccount();
      syncUsersDir();
    }, 1500);
    return () => clearInterval(timer);
  }, [currentUser?.email]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('shark_saved_sessions_list', JSON.stringify(sessionsList));
      } catch (e) {}
    }
  }, [sessionsList]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        // Strip heavy base64 and blob URIs so localStorage NEVER exceeds quota or crashes React
        const safeMessages = {};
        for (const sId in sessionsMessages) {
          safeMessages[sId] = (sessionsMessages[sId] || []).slice(-30).map(m => {
            const copy = { ...m };
            if (copy.audioUri && (copy.audioUri.startsWith('data:') || copy.audioUri.startsWith('blob:'))) {
              copy.audioUri = '';
            }
            if (copy.rawBase64) {
              delete copy.rawBase64;
            }
            if (copy.imageUri && copy.imageUri.startsWith('data:')) {
              copy.imageUri = '';
            }
            return copy;
          });
        }
        window.localStorage.setItem('shark_saved_sessions_messages', JSON.stringify(safeMessages));
      } catch (err) {
        console.warn('localStorage save warning (quota):', err);
      }
    }
  }, [sessionsMessages]);

  useEffect(() => {
    if (currentUser?.email) {
      fetch(`${BACKEND_URL}/api/sessions/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          sessionsList,
          sessionsMessages
        })
      }).catch(() => {});
    }
  }, [sessionsList, sessionsMessages, currentUser?.email]);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  // ── UNIVERSAL AUDIO ENGINE (AI DESK + COMMUNITY FLOOR) ──
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const activeAudioElRef = useRef(null);

  // AI Desk Audio Recording State
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const aiAudioStreamRef = useRef(null);
  const aiMediaRecorderRef = useRef(null);
  const aiAudioChunksRef = useRef([]);
  const speechRecognitionRef = useRef(null);
  const aiSpeechTextRef = useRef('');

  // Community Floor Audio, Image, Reply & Trader Profile Card State
  const [communityAudioAttachment, setCommunityAudioAttachment] = useState(null);
  const [communityImageAttachment, setCommunityImageAttachment] = useState(null);
  const [communityReplyTo, setCommunityReplyTo] = useState(null);
  const [selectedTraderProfile, setSelectedTraderProfile] = useState(null);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState(null);
  const [highlightedMsgId, setHighlightedMsgId] = useState(null);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const highlightTimeoutRef = useRef(null);
  const [isCommunityRecording, setIsCommunityRecording] = useState(false);

  const getActiveKillzoneInfo = () => {
    const utcHour = new Date().getUTCHours();
    if (utcHour >= 12 && utcHour < 20) {
      return { label: 'NEW YORK KILLZONE • ACTIVE', color: '#00FF66', bg: 'rgba(0, 255, 102, 0.12)' };
    }
    if (utcHour >= 7 && utcHour < 12) {
      return { label: 'LONDON KILLZONE • ACTIVE', color: '#00E5FF', bg: 'rgba(0, 229, 255, 0.12)' };
    }
    return { label: 'ASIAN LIQUIDITY RANGE • LIVE', color: '#00E5FF', bg: 'rgba(0, 229, 255, 0.10)' };
  };
  const [communityRecordSeconds, setCommunityRecordSeconds] = useState(0);
  const communityAudioStreamRef = useRef(null);
  const communityMediaRecorderRef = useRef(null);
  const communityAudioChunksRef = useRef([]);

  const openTraderProfileCard = (item, isMe, handleStr) => {
    const dirMatch = usersDirectory.find(
      u =>
        (item.senderEmail && u.email && u.email.toLowerCase() === item.senderEmail.toLowerCase()) ||
        (handleStr && u.username && u.username.toLowerCase() === handleStr.toLowerCase()) ||
        (item.senderName && u.name && u.name.toLowerCase() === item.senderName.toLowerCase())
    );
    const displayName = isMe && !item.isAdmin
      ? (currentUser?.name || item.senderName || 'Trader')
      : (dirMatch?.name || item.senderName || 'Trader');
    const username = isMe && !item.isAdmin
      ? (currentUser?.username || handleStr)
      : (dirMatch?.username || handleStr || 'trader');
    const rawRole = isMe
      ? (currentUser?.role || 'USER')
      : (dirMatch?.role || (item.isAdmin || String(item.badge || '').includes('ADMIN') ? 'ADMIN' : 'USER'));
    const isAdminRole = String(rawRole).toUpperCase() === 'ADMIN' || Boolean(item.isAdmin);
    const rawPlan = isMe
      ? (currentUser?.plan || 'FREE')
      : (dirMatch?.plan || (String(item.badge || '').includes('PREMIUM') ? 'PREMIUM' : String(item.badge || '').includes('VIP') ? 'VIP' : 'VIP'));
    const avatar = isMe
      ? currentUser?.avatar
      : (dirMatch?.avatar || item.avatarText || null);

    setSelectedTraderProfile({
      name: displayName,
      username,
      role: isAdminRole ? 'ADMIN' : 'USER',
      roleTitle: isAdminRole ? 'ADMIN & FLOOR MODERATOR' : 'VERIFIED FLOOR TRADER',
      plan: String(rawPlan).toUpperCase(),
      avatar,
      isAdmin: isAdminRole,
    });
  };

  // Resolves any @username tag in chat text to the trader's Display Name (e.g. @smartmoneymor -> @Smart Money)
  // and makes the mention clickable to open their Trader Identity Card.
  const renderMessageWithMentions = (rawText) => {
    if (!rawText) return null;
    const parts = String(rawText).split(/(@[a-zA-Z0-9_]+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('@') && part.length > 1) {
        const handleLower = part.slice(1).toLowerCase();
        const isMatchedMe =
          currentUser?.username && currentUser.username.toLowerCase() === handleLower;
        const dirUser = usersDirectory.find(
          u => u.username && u.username.toLowerCase() === handleLower
        );
        const msgUser = !dirUser
          ? communityMessages.find(
              m => m.senderUsername && m.senderUsername.toLowerCase() === handleLower
            )
          : null;

        const resolvedDisplayName = isMatchedMe
          ? (currentUser?.name || part.slice(1))
          : (dirUser?.name || msgUser?.senderName || part.slice(1));

        return (
          <Text
            key={`mention-${idx}`}
            onPress={() =>
              openTraderProfileCard(
                {
                  senderEmail: isMatchedMe ? currentUser?.email : dirUser?.email || msgUser?.senderEmail,
                  senderName: resolvedDisplayName,
                  senderUsername: part.slice(1),
                  avatarText: isMatchedMe ? currentUser?.avatar : dirUser?.avatar || msgUser?.avatarText,
                  isAdmin: dirUser?.role === 'ADMIN' || msgUser?.isAdmin,
                },
                Boolean(isMatchedMe),
                part.slice(1)
              )
            }
            style={{
              color: '#00E5FF',
              fontWeight: '900',
              backgroundColor: 'rgba(0, 229, 255, 0.14)',
              borderRadius: 4,
              paddingHorizontal: 4,
            }}
          >
            @{resolvedDisplayName}
          </Text>
        );
      }
      return <Text key={`txt-${idx}`}>{part}</Text>;
    });
  };

  const pickCommunityImage = async () => {
    setAdminTypeMenuOpen(false);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setCommunityImageAttachment({ uri });
        showAppToast('Chart image attached');
      }
    } catch (e) {
      console.log('Error selecting community chart image:', e);
    }
  };

  // ── High-Tech Instant Sound Effects (Zero Latency Web Audio API) ──
  const playSendChime = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';

      const now = ctx.currentTime;
      // High-tech swift send swoop (560Hz -> 1080Hz)
      osc.frequency.setValueAtTime(560, now);
      osc.frequency.exponentialRampToValueAtTime(1080, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
      setTimeout(() => { try { ctx.close(); } catch(e){} }, 300);
    } catch(e) {
      console.warn('Send chime error:', e);
    }
  };

  const playReceiveChime = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      // Note 1: 784 Hz (G5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(784, now);
      gain1.gain.setValueAtTime(0.14, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      // Note 2: 1046.5 Hz (C6) with gentle +60ms offset for an executive dual bell chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.5, now + 0.06);
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(0.16, now + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.25);
      osc2.start(now + 0.06);
      osc2.stop(now + 0.35);
      setTimeout(() => { try { ctx.close(); } catch(e){} }, 600);
    } catch(e) {
      console.warn('Receive chime error:', e);
    }
  };

  // Universal Audio Player (Always using real Gemini Charon Neural Audio — Zero robotic fallback)
  const togglePlayAudio = (uri, id) => {
    if (!uri) return;
    if (
      playingAudioId === id &&
      activeAudioElRef.current &&
      !activeAudioElRef.current.paused &&
      !activeAudioElRef.current.ended
    ) {
      try { activeAudioElRef.current.pause(); } catch(e){}
      setPlayingAudioId(null);
      return;
    }

    if (activeAudioElRef.current) {
      try { activeAudioElRef.current.pause(); } catch(e){}
      activeAudioElRef.current = null;
    }

    if (typeof Audio !== 'undefined') {
      try {
        const fullUri = (uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('data:') || uri.startsWith('blob:'))
          ? uri
          : `${BACKEND_URL}${uri}`;
        const audio = new Audio(fullUri);
        audio.preload = 'auto';
        audio.playbackRate = 1.0; // Natural pace
        activeAudioElRef.current = audio;
        audio.onplaying = () => {
          setPlayingAudioId(id);
        };
        audio.onpause = () => {
          if (playingAudioId === id) setPlayingAudioId(null);
        };
        audio.onended = () => {
          setPlayingAudioId(null);
          activeAudioElRef.current = null;
        };
        audio.onerror = (e) => {
          console.warn('Audio tag playback error:', e);
          setPlayingAudioId(null);
          activeAudioElRef.current = null;
        };
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setPlayingAudioId(id);
            })
            .catch(e => {
              console.warn('Audio play() awaits user click:', e);
              setPlayingAudioId(null);
            });
        }
        return;
      } catch (err) {
        console.warn('Audio instantiation error:', err);
        setPlayingAudioId(null);
      }
    }
  };

  // Live Phone Call with Real-Time Two-Way Audio & In-Call TradingView
  const [liveCallActive, setLiveCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [callTranscript, setCallTranscript] = useState('أهلاً خويا هاجر! معك على الخط المباشر، سامعك دابا...');
  const [callUserLiveText, setCallUserLiveText] = useState('');
  const [callStatusMessage, setCallStatusMessage] = useState('متصل على المباشر • سامعك دابا');
  const [callActiveChart, setCallActiveChart] = useState(null);
  const [callMicMuted, setCallMicMuted] = useState(false);
  const [callSpeakerActive, setCallSpeakerActive] = useState(true);
  const [callScreenSharing, setCallScreenSharing] = useState(false);
  const callScreenStreamRef = useRef(null);
  const callScreenTimerRef = useRef(null);

  const liveCallActiveRef = useRef(false);
  const liveCallRecogRef = useRef(null);
  const liveCallAudioRef = useRef(null);
  const liveCallSilenceTimerRef = useRef(null);
  const isAiSpeakingRef = useRef(false);
  const callMicMutedRef = useRef(false);

  const waveAnim1 = useRef(new Animated.Value(20)).current;
  const waveAnim2 = useRef(new Animated.Value(45)).current;
  const waveAnim3 = useRef(new Animated.Value(25)).current;
  const waveAnim4 = useRef(new Animated.Value(60)).current;

  // إشعار عائم Toast
  const [toastText, setToastText] = useState(null);
  const showAppToast = (msg) => {
    setToastText(msg);
    setTimeout(() => setToastText(null), 2200);
  };

  const copyAnalysis = (text) => {
    const branded = `🦈 SHARK TRADERS AI // تقرير الحوت المؤسسي\n\n${text}\n\n📊 انضم لنخبة صناع السوق: Shark Traders AI`;
    if (Platform.OS === 'web' && navigator.clipboard) {
      navigator.clipboard.writeText(branded);
    }
    showAppToast('تم نسخ التحليل بختم SHARK AI! 📋');
  };

  const shareAnalysisToSocial = (text, platform) => {
    const branded = `🦈 SHARK TRADERS AI // تقرير الحوت المؤسسي\n\n${text}\n\n📊 انضم لنخبة صناع السوق: Shark Traders AI`;
    const enc = encodeURIComponent(branded);
    if (platform === 'whatsapp') {
      if (Platform.OS === 'web') {
        window.open(`https://api.whatsapp.com/send?text=${enc}`, '_blank');
      } else {
        Linking.openURL(`https://api.whatsapp.com/send?text=${enc}`).catch(() => {});
      }
    } else if (platform === 'telegram') {
      if (Platform.OS === 'web') {
        window.open(`https://t.me/share/url?url=https://sharktraders.ai&text=${enc}`, '_blank');
      } else {
        Linking.openURL(`https://t.me/share/url?url=https://sharktraders.ai&text=${enc}`).catch(() => {});
      }
    }
  };

  const toggleMenu = () => {
    if (menuOpen) {
      Animated.timing(menuAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => setMenuOpen(false));
    } else {
      setMenuOpen(true);
      Animated.spring(menuAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();
    }
  };

  useEffect(() => {
    let recTimer;
    if (isRecordingAudio) {
      recTimer = setInterval(() => setRecordSeconds((prev) => prev + 1), 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(recTimer);
  }, [isRecordingAudio]);

  useEffect(() => {
    let commTimer;
    if (isCommunityRecording) {
      commTimer = setInterval(() => setCommunityRecordSeconds((prev) => prev + 1), 1000);
    } else {
      setCommunityRecordSeconds(0);
    }
    return () => clearInterval(commTimer);
  }, [isCommunityRecording]);

  useEffect(() => {
    liveCallActiveRef.current = liveCallActive;
    if (!liveCallActive) {
      stopLiveCallAudio();
      if (liveCallRecogRef.current) {
        try { liveCallRecogRef.current.abort(); } catch (e) {}
        liveCallRecogRef.current = null;
      }
      if (liveCallSilenceTimerRef.current) {
        clearTimeout(liveCallSilenceTimerRef.current);
      }
    }
  }, [liveCallActive]);

  useEffect(() => {
    isAiSpeakingRef.current = isAiSpeaking;
  }, [isAiSpeaking]);

  useEffect(() => {
    callMicMutedRef.current = callMicMuted;
    if (callMicMuted) {
      if (liveCallRecogRef.current) {
        try { liveCallRecogRef.current.abort(); } catch (e) {}
      }
    } else if (liveCallActiveRef.current && !isAiSpeakingRef.current) {
      startLiveCallListening();
    }
  }, [callMicMuted]);

  useEffect(() => {
    let timer;
    if (liveCallActive) {
      timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);

      const loopAnim = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(waveAnim1, { toValue: 75, duration: 380, useNativeDriver: false }),
            Animated.timing(waveAnim1, { toValue: 20, duration: 380, useNativeDriver: false }),
          ])
        ).start();
        Animated.loop(
          Animated.sequence([
            Animated.timing(waveAnim2, { toValue: 95, duration: 480, useNativeDriver: false }),
            Animated.timing(waveAnim2, { toValue: 30, duration: 480, useNativeDriver: false }),
          ])
        ).start();
        Animated.loop(
          Animated.sequence([
            Animated.timing(waveAnim3, { toValue: 65, duration: 340, useNativeDriver: false }),
            Animated.timing(waveAnim3, { toValue: 15, duration: 340, useNativeDriver: false }),
          ])
        ).start();
        Animated.loop(
          Animated.sequence([
            Animated.timing(waveAnim4, { toValue: 85, duration: 420, useNativeDriver: false }),
            Animated.timing(waveAnim4, { toValue: 25, duration: 420, useNativeDriver: false }),
          ])
        ).start();
      };
      loopAnim();
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [liveCallActive]);

  const stopLiveCallAudio = () => {
    if (liveCallAudioRef.current) {
      try {
        liveCallAudioRef.current.pause();
        liveCallAudioRef.current.currentTime = 0;
      } catch (e) {}
      liveCallAudioRef.current = null;
    }
    if (Platform.OS === 'web' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const speakLiveCallReply = (voiceUrl, fallbackText, onDone) => {
    stopLiveCallAudio();
    setIsAiSpeaking(true);
    setCallStatusMessage('🦈 الحوت يتحدث معك مباشرة...');

    if (liveCallRecogRef.current) {
      try { liveCallRecogRef.current.stop(); } catch (e) {}
    }

    const handleSpeechFinished = () => {
      setIsAiSpeaking(false);
      setCallStatusMessage('🎙️ سامعك دابا... تفضل');
      if (onDone) onDone();
    };

    if (Platform.OS === 'web' && voiceUrl) {
      try {
        const fullUrl = voiceUrl.startsWith('http') ? voiceUrl : `${BACKEND_URL}${voiceUrl}`;
        const audio = new window.Audio(fullUrl);
        liveCallAudioRef.current = audio;
        audio.playbackRate = 1.1;
        audio.onended = () => {
          liveCallAudioRef.current = null;
          handleSpeechFinished();
        };
        audio.onerror = () => {
          speakLiveCallFallback(fallbackText, handleSpeechFinished);
        };
        audio.play().catch((err) => {
          console.warn('Live call audio play blocked or error:', err);
          speakLiveCallFallback(fallbackText, handleSpeechFinished);
        });
        return;
      } catch (e) {
        speakLiveCallFallback(fallbackText, handleSpeechFinished);
      }
    } else {
      speakLiveCallFallback(fallbackText, handleSpeechFinished);
    }
  };

  const speakLiveCallFallback = (text, onDone) => {
    // Zero robotic speech synthesis fallback — Charon neural voice only
    if (onDone) setTimeout(onDone, 1200);
  };

  // ─────────────────────────────────────────────
  // LIVE CALL ENGINE (Gemini Live native audio, streamed full-duplex).
  // Mic -> PCM16 16k -> server relay -> Gemini; Gemini voice (PCM 24k) streams back and plays instantly.
  // Gemini does its own voice-activity detection and handles interruptions (barge-in).
  // ─────────────────────────────────────────────
  const callWsRef = useRef(null);
  const serverlessRecRef = useRef(null);
  const callStreamRef = useRef(null);
  const callAudioCtxRef = useRef(null);
  const callProcRef = useRef(null);
  const callPlayCtxRef = useRef(null);
  const callPlayGainRef = useRef(null);
  const callNextPlayRef = useRef(0);
  const callSourcesRef = useRef([]);
  const callSpeakerRef = useRef(true);
  const callHangupRef = useRef(false);
  const callTurnFreshRef = useRef(true);
  const callInFreshRef = useRef(true);

  useEffect(() => {
    callSpeakerRef.current = callSpeakerActive;
    if (callPlayGainRef.current) callPlayGainRef.current.gain.value = callSpeakerActive ? 1 : 0;
  }, [callSpeakerActive]);

  const flushCallPlayback = () => {
    callSourcesRef.current.forEach((s) => { try { s.onended = null; s.stop(); } catch (e) {} });
    callSourcesRef.current = [];
    callNextPlayRef.current = 0;
    setIsAiSpeaking(false);
    isAiSpeakingRef.current = false;
  };

  const playCallAudioChunk = (b64) => {
    const ctx = callPlayCtxRef.current;
    if (!ctx) return;
    const bin = window.atob(b64);
    const len = bin.length >> 1;
    const f32 = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      let v = bin.charCodeAt(i * 2) | (bin.charCodeAt(i * 2 + 1) << 8);
      if (v >= 0x8000) v -= 0x10000;
      f32[i] = v / 32768;
    }
    const buf = ctx.createBuffer(1, len, 24000);
    buf.copyToChannel(f32, 0);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(callPlayGainRef.current);
    const startAt = Math.max(ctx.currentTime + 0.03, callNextPlayRef.current);
    src.start(startAt);
    callNextPlayRef.current = startAt + buf.duration;
    callSourcesRef.current.push(src);
    if (!isAiSpeakingRef.current) {
      isAiSpeakingRef.current = true;
      setIsAiSpeaking(true);
      setCallStatusMessage('🦈 الحوت كيهضر معاك...');
    }
    src.onended = () => {
      callSourcesRef.current = callSourcesRef.current.filter((s) => s !== src);
      if (callSourcesRef.current.length === 0) {
        isAiSpeakingRef.current = false;
        setIsAiSpeaking(false);
        setCallStatusMessage('🎙️ سامعك... تكلم عادي');
        if (callHangupRef.current) setTimeout(() => endLiveCall(), 250);
      }
    };
  };

  const handleCallSocketMessage = (ev) => {
    let m;
    try { m = JSON.parse(ev.data); } catch (e) { return; }

    // 1. Setup complete from Google Gemini Live Edge (Sub-300ms direct connection)
    if (m.setupComplete) {
      setCallStatusMessage('🦈 متصل مباشرة بمحرك Gemini Live الفائق (أقل من نصف ثانية)');
      const ws = callWsRef.current;
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({
          clientContent: {
            turns: [{
              role: 'user',
              parts: [{ text: `(المكالمة بدأت الآن. رحب بـ ${currentUser?.name || 'صديقي'} بجملة واحدة بالدارجة المغربية بلهجة صديق وأخ يرفع سماعة الهاتف.)` }]
            }],
            turnComplete: true
          }
        }));
      }
      return;
    }

    // 2. Server Content (Audio stream, transcriptions, turn completion, barge-in)
    if (m.serverContent) {
      const sc = m.serverContent;

      // Barge-in: If user interrupts AI while speaking
      if (sc.interrupted) {
        flushCallPlayback();
        callTurnFreshRef.current = true;
      }

      // Live transcript of what user spoke
      if (sc.inputTranscription && sc.inputTranscription.text) {
        if (callInFreshRef.current) { callInFreshRef.current = false; setCallUserLiveText(''); }
        setCallUserLiveText((p) => (p + sc.inputTranscription.text).trimStart());
      }

      // Live transcript of what Charon AI speaks
      if (sc.outputTranscription && sc.outputTranscription.text) {
        callInFreshRef.current = true;
        if (callTurnFreshRef.current) { callTurnFreshRef.current = false; setCallTranscript(''); }
        setCallTranscript((p) => p + sc.outputTranscription.text);
      }

      // 24kHz Native PCM Audio Chunks
      if (sc.modelTurn && sc.modelTurn.parts) {
        for (const p of sc.modelTurn.parts) {
          if (p.inlineData && p.inlineData.data) {
            playCallAudioChunk(p.inlineData.data);
          }
        }
      }

      // Turn Complete
      if (sc.turnComplete) {
        callTurnFreshRef.current = true;
      }
      return;
    }

    // 3. Multimodal Tool Calls (show_chart, get_market_data, get_live_macro_news, end_call)
    if (m.toolCall && m.toolCall.functionCalls) {
      const ws = callWsRef.current;
      for (const fc of m.toolCall.functionCalls) {
        const fname = fc.name;
        const fargs = fc.args || {};

        if (fname === 'show_chart') {
          const asset = String(fargs.asset || 'GOLD').toUpperCase();
          const chartsMap = {
            GOLD: { symbol: 'OANDA:XAUUSD', rawSymbol: 'XAUUSD', interval: fargs.interval || '60' },
            BTC: { symbol: 'BINANCE:BTCUSDT', rawSymbol: 'BTCUSDT', interval: fargs.interval || '60' },
            ETH: { symbol: 'BINANCE:ETHUSDT', rawSymbol: 'ETHUSDT', interval: fargs.interval || '60' },
            SOL: { symbol: 'BINANCE:SOLUSDT', rawSymbol: 'SOLUSDT', interval: fargs.interval || '60' },
            NASDAQ: { symbol: 'NASDAQ:QQQ', rawSymbol: 'QQQ', interval: fargs.interval || '60' }
          };
          const targetChart = chartsMap[asset] || chartsMap.GOLD;
          setCallActiveChart(targetChart);
          if (ws && ws.readyState === 1) {
            ws.send(JSON.stringify({
              toolResponse: {
                functionResponses: [{
                  id: fc.id,
                  response: { output: { ok: true, message: `Opened live ${asset} TradingView chart on user screen` } }
                }]
              }
            }));
          }
        } else if (fname === 'end_call') {
          callHangupRef.current = true;
          if (callSourcesRef.current.length === 0) setTimeout(() => endLiveCall(), 400);
        } else {
          fetch(`${BACKEND_URL}/api/live-tool`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ toolName: fname, args: fargs })
          }).then(r => r.json()).then(res => {
            if (ws && ws.readyState === 1) {
              ws.send(JSON.stringify({
                toolResponse: {
                  functionResponses: [{
                    id: fc.id,
                    response: { output: res.result || { ok: true } }
                  }]
                }
              }));
            }
          }).catch(() => {
            if (ws && ws.readyState === 1) {
              ws.send(JSON.stringify({
                toolResponse: {
                  functionResponses: [{
                    id: fc.id,
                    response: { output: { ok: true } }
                  }]
                }
              }));
            }
          });
        }
      }
      return;
    }

    // Legacy relay fallback message handlers
    switch (m.type) {
      case 'ready':
        setCallStatusMessage('📞 متصل');
        break;
      case 'audio':
        playCallAudioChunk(m.data);
        break;
      case 'interrupted':
        flushCallPlayback();
        callTurnFreshRef.current = true;
        break;
      case 'in_text':
        if (callInFreshRef.current) { callInFreshRef.current = false; setCallUserLiveText(''); }
        setCallUserLiveText((p) => (p + m.text).trimStart());
        break;
      case 'out_text':
        callInFreshRef.current = true;
        if (callTurnFreshRef.current) { callTurnFreshRef.current = false; setCallTranscript(''); }
        setCallTranscript((p) => p + m.text);
        break;
      case 'turn_complete':
        callTurnFreshRef.current = true;
        break;
      case 'chart':
        setCallActiveChart(m.chart);
        break;
      case 'hangup':
        callHangupRef.current = true;
        if (callSourcesRef.current.length === 0) setTimeout(() => endLiveCall(), 400);
        break;
      case 'closed':
      case 'error':
        if (liveCallActiveRef.current) setCallStatusMessage('⚠️ الاتصال تقطع، عاود الاتصال');
        break;
      default:
        break;
    }
  };

  const stopCallScreenShare = (notify = true) => {
    if (callScreenTimerRef.current) { clearInterval(callScreenTimerRef.current); callScreenTimerRef.current = null; }
    if (callScreenStreamRef.current) {
      try { callScreenStreamRef.current.getTracks().forEach((t) => { t.onended = null; t.stop(); }); } catch (e) {}
      callScreenStreamRef.current = null;
    }
    setCallScreenSharing(false);
  };

  const startCallScreenShare = async () => {
    if (Platform.OS !== 'web' || !navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      setCallStatusMessage('⚠️ مشاركة الشاشة غير مدعومة فهاد المتصفح');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 5, width: { ideal: 1920 } },
        audio: false,
        preferCurrentTab: true,
        selfBrowserSurface: 'include',
      });
      callScreenStreamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      track.onended = () => stopCallScreenShare(true);

      const video = document.createElement('video');
      video.srcObject = stream;
      video.muted = true;
      await video.play();
      const canvas = document.createElement('canvas');

      const grab = () => {
        const ws = callWsRef.current;
        if (!ws || ws.readyState !== 1 || !video.videoWidth) return;
        const scale = Math.min(1, 1280 / video.videoWidth);
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
        ws.send(JSON.stringify({
          realtimeInput: {
            mediaChunks: [{ mimeType: 'image/jpeg', data }]
          }
        }));
      };

      setCallScreenSharing(true);
      setCallStatusMessage('👁️ الحوت كيشوف الشاشة دابا');
      grab();
      callScreenTimerRef.current = setInterval(grab, 1000);
    } catch (err) {
      console.warn('Screen share cancelled/failed:', err);
      stopCallScreenShare(false);
    }
  };

  const toggleCallScreenShare = () => {
    if (callScreenSharing) stopCallScreenShare(true);
    else startCallScreenShare();
  };

  const startLiveCallListening = () => {};

  const openCallMic = async (ws) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    if (!liveCallActiveRef.current) { stream.getTracks().forEach((t) => t.stop()); return; }
    callStreamRef.current = stream;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    callAudioCtxRef.current = ctx;
    const src = ctx.createMediaStreamSource(stream);
    const proc = ctx.createScriptProcessor(2048, 1, 1);
    callProcRef.current = proc;
    const mute = ctx.createGain();
    mute.gain.value = 0;
    src.connect(proc);
    proc.connect(mute);
    mute.connect(ctx.destination);
    const ratio = ctx.sampleRate / 16000;
    proc.onaudioprocess = (e) => {
      if (!liveCallActiveRef.current || callMicMutedRef.current || ws.readyState !== 1) return;
      const input = e.inputBuffer.getChannelData(0);
      const outLen = Math.floor(input.length / ratio);
      const pcm = new Int16Array(outLen);
      for (let i = 0; i < outLen; i++) {
        const s = Math.max(-1, Math.min(1, input[Math.floor(i * ratio)]));
        pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      const bytes = new Uint8Array(pcm.buffer);
      let bin = '';
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      const b64 = window.btoa(bin);

      // Stream audio directly into Gemini Live!
      ws.send(JSON.stringify({
        realtimeInput: {
          mediaChunks: [{ mimeType: 'audio/pcm;rate=16000', data: b64 }]
        }
      }));
    };
  };

  const teardownCall = () => {
    stopCallScreenShare(false);
    try { if (callProcRef.current) { callProcRef.current.onaudioprocess = null; callProcRef.current.disconnect(); } } catch (e) {}
    callProcRef.current = null;
    try { if (callStreamRef.current) callStreamRef.current.getTracks().forEach((t) => t.stop()); } catch (e) {}
    callStreamRef.current = null;
    try { if (callAudioCtxRef.current) callAudioCtxRef.current.close(); } catch (e) {}
    callAudioCtxRef.current = null;
    callSourcesRef.current.forEach((s) => { try { s.onended = null; s.stop(); } catch (e) {} });
    callSourcesRef.current = [];
    try { if (callPlayCtxRef.current) callPlayCtxRef.current.close(); } catch (e) {}
    callPlayCtxRef.current = null;
    callPlayGainRef.current = null;
    callNextPlayRef.current = 0;
    try { if (callWsRef.current) { callWsRef.current.onmessage = null; callWsRef.current.close(); } } catch (e) {}
    callWsRef.current = null;
  };

  const triggerLiveVoiceTurn = async (spokenText) => {
    if (!spokenText || !liveCallActiveRef.current) return;

    setCallUserLiveText(spokenText);
    setCallStatusMessage('🧠 الحوت كيفكر وكيحلل...');
    setIsAiSpeaking(true);
    isAiSpeakingRef.current = true;

    try {
      const res = await fetch(`${BACKEND_URL}/api/live-turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUser?.email || 'trader@shark.ai',
          userName: currentUser?.name || 'صديقي',
          userPlan: currentUser?.plan || 'VIP',
          userBalance: globalBalance || 50000,
          text: spokenText,
          activeChart: callActiveChart
        })
      });
      const data = await res.json();
      if (data && data.reply) {
        setCallTranscript(data.reply);
        if (data.chart) setCallActiveChart(data.chart);
        setCallStatusMessage('🗣️ الحوت كيتكلم معاك...');

        const onFinishedSpeaking = () => {
          setIsAiSpeaking(false);
          isAiSpeakingRef.current = false;
          setCallStatusMessage('🎙️ الحوت كيسمعك دابا... تكلم');
        };

        // 🎙️ Primary: Play Genuine Gemini Live "Charon" Audio Stream out loud!
        const voiceUrl = data.aiVoiceUrl || `/api/tts?text=${encodeURIComponent(data.reply.replace(/[*#_`>~]/g, '').substring(0, 300))}&lang=ar`;
        const fullAudioUrl = voiceUrl.startsWith('http') ? voiceUrl : `${BACKEND_URL}${voiceUrl}`;
        const audio = new Audio(fullAudioUrl);
        audio.volume = 1.0;
        audio.onended = onFinishedSpeaking;
        audio.onerror = () => {
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            try {
              const utter = new SpeechSynthesisUtterance(data.reply.replace(/[*#_`>~]/g, ''));
              utter.lang = 'ar-SA';
              utter.onend = onFinishedSpeaking;
              utter.onerror = onFinishedSpeaking;
              window.speechSynthesis.speak(utter);
              return;
            } catch (e) {}
          }
          onFinishedSpeaking();
        };
        audio.play().catch((playErr) => {
          console.warn('Audio play catch:', playErr);
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            try {
              const utter = new SpeechSynthesisUtterance(data.reply.replace(/[*#_`>~]/g, ''));
              utter.lang = 'ar-SA';
              utter.onend = onFinishedSpeaking;
              utter.onerror = onFinishedSpeaking;
              window.speechSynthesis.speak(utter);
              return;
            } catch (e) {}
          }
          onFinishedSpeaking();
        });
      } else {
        setIsAiSpeaking(false);
        isAiSpeakingRef.current = false;
        setCallStatusMessage('🎙️ الحوت كيسمعك دابا... تكلم');
      }
    } catch (err) {
      setIsAiSpeaking(false);
      isAiSpeakingRef.current = false;
      setCallStatusMessage('🎙️ الحوت كيسمعك دابا... تكلم');
    }
  };

  const sendLiveCallMessage = (text) => {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();
    const ws = callWsRef.current;
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({
        clientContent: {
          turns: [{ role: 'user', parts: [{ text: cleanText }] }],
          turnComplete: true
        }
      }));
    } else {
      triggerLiveVoiceTurn(cleanText);
    }
  };

  const startServerlessVoiceTurn = () => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    setCallStatusMessage('🎙️ المكالمة متصلة بالسحاب.. تكلم دابا');

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setCallStatusMessage('🎙️ المتصفح لا يدعم التعرف الصوتي — اضغط على أزرار الأوامر السريعة بالأسفل');
      return;
    }

    try {
      if (serverlessRecRef.current) {
        try { serverlessRecRef.current.stop(); } catch (e) {}
      }
      const rec = new SpeechRec();
      rec.lang = 'ar-SA';
      rec.continuous = true;
      rec.interimResults = false;

      rec.onstart = () => {
        setCallStatusMessage('🎙️ الحوت كيسمعك دابا... تكلم');
      };

      rec.onresult = async (event) => {
        if (!liveCallActiveRef.current) return;
        const lastResult = event.results[event.results.length - 1];
        const spokenText = lastResult[0]?.transcript?.trim();
        if (!spokenText) return;

        await triggerLiveVoiceTurn(spokenText);
      };

      rec.onerror = (e) => {
        if (e.error !== 'no-speech' && liveCallActiveRef.current) {
          try { rec.start(); } catch (err) {}
        }
      };

      rec.onend = () => {
        if (liveCallActiveRef.current) {
          try { rec.start(); } catch (err) {}
        }
      };

      serverlessRecRef.current = rec;
      try { rec.start(); } catch (err) {}
    } catch (err) {
      console.warn('SpeechRec start error:', err);
    }
  };

  const startLiveCall = async () => {
    if (Platform.OS !== 'web') return;
    liveCallActiveRef.current = true;
    callHangupRef.current = false;
    callTurnFreshRef.current = true;
    callInFreshRef.current = true;
    setLiveCallActive(true);
    setCallDuration(0);
    setCallActiveChart(null);
    setCallUserLiveText('');
    setCallTranscript('أهلاً خويا! معك الحوت على الخط المباشر.. شنو باغي نحللو دابا؟');
    setCallMicMuted(false);
    setCallStatusMessage('📞 متصل بالمباشر...');

    // 🔊 Playback context MUST be created inside user click event to satisfy browser autoplay policies
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) {
        if (!callPlayCtxRef.current) {
          const pctx = new Ctx();
          pctx.resume && pctx.resume();
          const gain = pctx.createGain();
          gain.gain.value = callSpeakerRef.current ? 1 : 0;
          gain.connect(pctx.destination);
          callPlayCtxRef.current = pctx;
          callPlayGainRef.current = gain;
        } else if (callPlayCtxRef.current.state === 'suspended') {
          callPlayCtxRef.current.resume();
        }
      }
      // Prime audio playback
      const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
      silentAudio.play().catch(() => {});
    } catch (audioInitErr) {
      console.warn('Audio context prime warning:', audioInitErr);
    }

    // Direct Ultra-Fast Gemini Live WebSocket (Sub-300ms Native Voice & Vision)
    let wsSetupDone = false;
    try {
      const q = new URLSearchParams({
        email: currentUser?.email || 'trader@shark.ai',
        name: currentUser?.name || 'صديقي',
        plan: currentUser?.plan || 'VIP',
        balance: String(globalBalance || 50000),
      });

      setCallStatusMessage('⚡ جاري جلب مفتاح البث الحي الفائق...');
      const cfgRes = await fetch(`${BACKEND_URL}/api/live-config?${q.toString()}`);
      const cfg = await cfgRes.json();

      if (!cfg || !cfg.success || !cfg.apiKey) {
        throw new Error('Could not fetch Gemini Live config');
      }

      const googleLiveWsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${cfg.apiKey}`;
      const ws = new WebSocket(googleLiveWsUrl);
      callWsRef.current = ws;

      ws.onopen = () => {
        setCallStatusMessage('⚡ متصل بالسحاب.. جاري ضبط محرك Charon Live...');
        ws.send(JSON.stringify({
          setup: {
            model: cfg.model || 'models/gemini-2.5-flash-native-audio-preview-12-2025',
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: cfg.voiceName || 'Charon'
                  }
                }
              }
            },
            systemInstruction: {
              parts: [{ text: cfg.systemInstruction }]
            },
            tools: cfg.tools || [],
            inputAudioTranscription: {},
            outputAudioTranscription: {}
          }
        }));
      };

      ws.onmessage = (ev) => {
        wsSetupDone = true;
        handleCallSocketMessage(ev);
        if (!callStreamRef.current) {
          openCallMic(ws).catch(() => setCallStatusMessage('⚠️ عطي الإذن للميكروفون من المتصفح'));
        }
      };

      ws.onerror = (err) => {
        console.warn('Gemini Live WS error, using serverless fallback:', err);
        if (!wsSetupDone && liveCallActiveRef.current) {
          startServerlessVoiceTurn();
          triggerLiveVoiceTurn('سلام خويا الحوت');
        }
      };

      ws.onclose = () => {
        if (!wsSetupDone && liveCallActiveRef.current) {
          startServerlessVoiceTurn();
          triggerLiveVoiceTurn('سلام خويا الحوت');
        }
      };
    } catch (err) {
      console.warn('Failed to start direct Gemini Live WS, using serverless fallback:', err);
      if (liveCallActiveRef.current) {
        startServerlessVoiceTurn();
        triggerLiveVoiceTurn('سلام خويا الحوت');
      }
    }
  };

  const endLiveCall = () => {
    liveCallActiveRef.current = false;
    callHangupRef.current = false;
    if (serverlessRecRef.current) {
      try { serverlessRecRef.current.stop(); } catch (e) {}
      serverlessRecRef.current = null;
    }
    teardownCall();
    setLiveCallActive(false);
    setIsAiSpeaking(false);
    isAiSpeakingRef.current = false;
    setCallActiveChart(null);
    setCallDuration(0);
  };

  const toggleCallMic = () => {
    setCallMicMuted((prev) => !prev);
  };

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Open external links safely on web and native
  const openExternalLink = (url) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url).catch(() => {});
    }
  };

  // Start New Chat Session
  const startNewChat = () => {
    const newId = 'session_' + Date.now();
    const newSession = {
      id: newId,
      title: 'NEW HUNT PROTOCOL',
      updatedAt: 'JUST NOW'
    };

    setSessionsList((prev) => [newSession, ...prev]);
    setSessionsMessages((prev) => ({
      ...prev,
      [newId]: [
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: 'Yo Hajar! New chart protocol initiated. Drop your target asset or timeframe, let us hunt liquidity.',
          chart: null,
          timestamp: 'JUST NOW'
        }
      ]
    }));
    setCurrentSessionId(newId);
    setActiveFloor('AI_DESK');
    setSessionsDrawerOpen(false);
  };

  // Switch Chat Session
  const switchSession = (sId) => {
    setCurrentSessionId(sId);
    setActiveFloor('AI_DESK');
    setSessionsDrawerOpen(false);
  };

  // Delete a Chat Session
  const deleteSession = (sId) => {
    if (sessionsList.length <= 1) return;
    const remaining = sessionsList.filter((s) => s.id !== sId);
    setSessionsList(remaining);
    if (currentSessionId === sId) {
      setCurrentSessionId(remaining[0].id);
    }
  };

  // ── AI DESK REAL AUDIO RECORDING ──
  const startAiAudioRecording = async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        showAppToast('Microphone not supported on this browser');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      aiAudioStreamRef.current = stream;
      aiAudioChunksRef.current = [];
      aiSpeechTextRef.current = '';

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined' && !MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '';
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      aiMediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          aiAudioChunksRef.current.push(e.data);
        }
      };

      recorder.start(100);
      setIsRecordingAudio(true);
      setRecordSeconds(0);

      // Speech Recognition with Moroccan Darija + Arabic Support
      if (typeof window !== 'undefined') {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRec) {
          try {
            const recog = new SpeechRec();
            recog.continuous = true;
            recog.interimResults = true;
            recog.lang = 'ar-MA'; // Native Moroccan Darija & Arabic recognition
            recog.onresult = (evt) => {
              let text = '';
              for (let i = evt.resultIndex; i < evt.results.length; ++i) {
                text += evt.results[i][0].transcript;
              }
              if (text && text.trim()) {
                aiSpeechTextRef.current = text.trim();
              }
            };
            recog.onerror = (err) => {
              console.warn('SpeechRec status:', err.error);
            };
            recog.start();
            speechRecognitionRef.current = recog;
          } catch (e) {
            console.warn('SpeechRec start:', e);
          }
        }
      }
    } catch (err) {
      console.warn('Error starting AI audio recording:', err);
      showAppToast('Microphone access denied: ' + (err.message || ''));
    }
  };

  const finishAiAudioRecording = () => {
    if (!aiMediaRecorderRef.current || aiMediaRecorderRef.current.state === 'inactive') {
      setIsRecordingAudio(false);
      return;
    }

    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch(e){}
    }

    const recorder = aiMediaRecorderRef.current;
    recorder.onstop = () => {
      const mime = recorder.mimeType || 'audio/webm';
      const blob = new Blob(aiAudioChunksRef.current, { type: mime });
      let objectUrl = null;
      if (typeof window !== 'undefined' && window.URL && window.URL.createObjectURL) {
        try { objectUrl = window.URL.createObjectURL(blob); } catch(e){}
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Uri = reader.result;
        const durStr = formatDuration(recordSeconds || 3);
        const transcript = aiSpeechTextRef.current ? aiSpeechTextRef.current.trim() : null;

        const voiceMsg = {
          id: Date.now().toString(),
          sender: 'user',
          type: 'audio_note',
          audioUri: objectUrl || base64Uri,
          duration: durStr,
          transcribedText: transcript,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setSessionsMessages((prev) => ({
          ...prev,
          [currentSessionId]: [...(prev[currentSessionId] || []), voiceMsg]
        }));
        playSendChime();
        scrollChatToBottom(true);

        setIsRecordingAudio(false);
        if (aiAudioStreamRef.current) {
          aiAudioStreamRef.current.getTracks().forEach(t => t.stop());
        }

        // Send voice note / transcript to AI Quant Engine
        const promptForAi = transcript && transcript.trim()
          ? transcript.trim()
          : 'خويا حلل ليا وضع السوق دابا وفين كاينين مناطق السيولة.';

        setIsTyping(true);
        fetch(`${BACKEND_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: currentUser?.email || 'hajar.trader@gmail.com',
            sessionId: currentSessionId,
            message: promptForAi,
            audioBase64: base64Uri,
            isVoiceQuery: true,
          })
        })
          .then(r => r.json())
          .then(data => {
            if (!data || data.isApiError || !data.reply) {
              setIsTyping(false);
              showAppToast('تعذر استلام الرد الصوتي، جاري إعادة المحاولة...');
              return;
            }
            const aiVoiceFullUrl = data.aiVoiceUrl ? `${BACKEND_URL}${data.aiVoiceUrl}` : null;
            const aiReply = {
              id: (Date.now() + 1).toString(),
              sender: 'ai',
              text: data.reply,
              chart: data.chart || null,
        chartScreenshot: data.chartScreenshot || null,
              chartScreenshot: data.chartScreenshot || null,
              signal: data.signal || null,
              thinking: data.thinking || null,
              isVoiceReply: !data.isDailyPlanLimit,
              isDailyPlanLimit: Boolean(data.isDailyPlanLimit),
              lang: data.lang || (/[\u0600-\u06FF]/.test(promptForAi || '') ? 'ar' : 'en'),
              aiVoiceUrl: aiVoiceFullUrl,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setSessionsMessages((prev) => ({
              ...prev,
              [currentSessionId]: [...(prev[currentSessionId] || []), aiReply]
            }));
            playReceiveChime();
            scrollChatToBottom(true);
            setIsTyping(false);

            // Auto-play AI voice note in response to user voice note with instant fallback
            if (aiVoiceFullUrl) {
              setTimeout(() => {
                togglePlayAudio(aiVoiceFullUrl, `ai_voice_${aiReply.id}`);
              }, 300);
            }
          })
          .catch((err) => {
            console.error('AI Audio Chat Error:', err);
            setIsTyping(false);
          });
      };
      reader.readAsDataURL(blob);
    };

    recorder.stop();
  };

  const cancelAiAudioRecording = () => {
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch(e){}
    }
    if (aiMediaRecorderRef.current && aiMediaRecorderRef.current.state !== 'inactive') {
      try { aiMediaRecorderRef.current.stop(); } catch(e){}
    }
    if (aiAudioStreamRef.current) {
      aiAudioStreamRef.current.getTracks().forEach(t => t.stop());
    }
    setIsRecordingAudio(false);
    setRecordSeconds(0);
  };

  const finishVoiceNote = finishAiAudioRecording;

  // ── COMMUNITY FLOOR REAL AUDIO RECORDING ──
  const startCommunityAudioRecording = async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        showAppToast('Microphone not supported on this browser');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      communityAudioStreamRef.current = stream;
      communityAudioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined' && !MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '';
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      communityMediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          communityAudioChunksRef.current.push(e.data);
        }
      };

      recorder.start(100);
      setIsCommunityRecording(true);
      setCommunityRecordSeconds(0);
    } catch (err) {
      console.warn('Error starting community recording:', err);
      showAppToast('Microphone access denied: ' + (err.message || ''));
    }
  };

  const finishCommunityAudioRecording = () => {
    if (!communityMediaRecorderRef.current || communityMediaRecorderRef.current.state === 'inactive') {
      setIsCommunityRecording(false);
      return;
    }

    const recorder = communityMediaRecorderRef.current;
    recorder.onstop = () => {
      const mime = recorder.mimeType || 'audio/webm';
      const blob = new Blob(communityAudioChunksRef.current, { type: mime });
      let objectUrl = null;
      if (typeof window !== 'undefined' && window.URL && window.URL.createObjectURL) {
        try { objectUrl = window.URL.createObjectURL(blob); } catch(e){}
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Uri = reader.result;
        const durStr = formatDuration(communityRecordSeconds || 3);
        setCommunityAudioAttachment({
          uri: objectUrl || base64Uri,
          rawBase64: base64Uri,
          duration: durStr
        });
        setIsCommunityRecording(false);
        if (communityAudioStreamRef.current) {
          communityAudioStreamRef.current.getTracks().forEach(t => t.stop());
        }
        showAppToast('Voice Note Attached! 🎙️ (Tap Send or add text)');
      };
      reader.readAsDataURL(blob);
    };

    recorder.stop();
  };

  const cancelCommunityAudioRecording = () => {
    if (communityMediaRecorderRef.current && communityMediaRecorderRef.current.state !== 'inactive') {
      try { communityMediaRecorderRef.current.stop(); } catch(e){}
    }
    if (communityAudioStreamRef.current) {
      communityAudioStreamRef.current.getTracks().forEach(t => t.stop());
    }
    setIsCommunityRecording(false);
    setCommunityRecordSeconds(0);
  };

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // شريط الأسعار الحية الحقيقية (تحديث كل 10 ثواني تلقائياً)
  const [liveTicker, setLiveTicker] = useState([
    { s: 'GOLD', p: '$4,074.90', c: '+1.4%', up: true, raw: 'XAUUSD' },
    { s: 'BTC', p: '$75,850.00', c: '+2.1%', up: true, raw: 'BTCUSDT' },
    { s: 'SOL', p: '$89.70', c: '+6.2%', up: true, raw: 'SOLUSDT' },
    { s: 'ETH', p: '$2,238.00', c: '-0.5%', up: false, raw: 'ETHUSDT' },
    { s: 'NASDAQ', p: '$656.10', c: '+0.8%', up: true, raw: 'QQQ' },
    { s: 'OIL', p: '$71.50', c: '-1.1%', up: false, raw: 'USOIL' }
  ]);

  // مودال التقويم الاقتصادي والأخبار المباشرة
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [calendarTab, setCalendarTab] = useState('calendar'); // 'calendar' | 'news'
  const [liveNewsData, setLiveNewsData] = useState([]);
  const [liveCalendarData, setLiveCalendarData] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

  // تحديث دوري للأسعار الحية كل 10 ثواني
  useEffect(() => {
    const fetchLiveTickers = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/market/tickers`);
        const d = await res.json();
        if (d.tickers && Array.isArray(d.tickers)) {
          setLiveTicker(d.tickers);
        }
      } catch (e) {}
    };

    fetchLiveTickers();
    const intervalId = setInterval(fetchLiveTickers, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const openCalendarModal = async () => {
    setCalendarModalVisible(true);
    setCalendarLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/market/news`);
      const d = await res.json();
      if (d.news) setLiveNewsData(d.news);
      if (d.calendar) setLiveCalendarData(d.calendar);
    } catch (e) {
      console.log('Error fetching news/calendar:', e);
    } finally {
      setCalendarLoading(false);
    }
  };

  // ── COMMUNITY LIVE CHAT & ADMIN BROADCASTS ──
  const selectFilter = (filterId) => {
    setCommunityFilter(filterId);
    if (filterId === 'ADMIN') {
      setAdminUnreadCount(0);
      setShowAdminBanner(false);
    }
  };

  const fetchCommunityMessages = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/community/messages`);
      const d = await res.json();
      if (d && Array.isArray(d.messages)) {
        setCommunityMessages(prev => {
          if (!prev || prev.length === 0) return d.messages;
          const serverIds = new Set(d.messages.map(m => m.id));
          // Keep recent optimistic messages so they never flicker or disappear
          const pending = prev.filter(m => m.isMe && !serverIds.has(m.id));
          return pending.length > 0 ? [...d.messages, ...pending] : d.messages;
        });
        if (Array.isArray(d.blockedUsers)) {
          setBlockedUsers(d.blockedUsers);
        }

        if (Array.isArray(d.typingUsers)) {
          const othersTyping = d.typingUsers.filter(u => {
            if (u.clientId && u.clientId === myCommunityClientId) return false;
            return true;
          });
          setCommunityTypingUsers(othersTyping);
        }

        // اكتشاف رسائل الآدمن والصفقات الجديدة فورياً لإطلاق إشعار حي
        const adminMsgs = d.messages.filter(m => m.isAdmin || m.type === 'SIGNAL');
        if (adminMsgs.length > 0) {
          const newestAdmin = adminMsgs[adminMsgs.length - 1];
          if (lastAdminMsgIdRef.current && lastAdminMsgIdRef.current !== newestAdmin.id) {
            setAdminUnreadCount(prev => prev + 1);
            setLatestAdminAlert(newestAdmin);
            setShowAdminBanner(true);
            playReceiveChime();
          }
          lastAdminMsgIdRef.current = newestAdmin.id;
        }
      }
    } catch (e) {
      console.log('Error fetching community messages:', e);
    }
  };

  useEffect(() => {
    fetchCommunityMessages();
    const interval = setInterval(fetchCommunityMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSendCommunityMessage = async (customText = null, audioPayload = null) => {
    const textToSend = customText !== null ? customText : communityChatInput;
    const audioToAttach = audioPayload || communityAudioAttachment;
    const imageToAttach = communityImageAttachment;
    const replyToObj = communityReplyTo;

    // Gatekeeping: require text, audio, or chart image
    if ((!textToSend || !textToSend.trim()) && !audioToAttach && !imageToAttach) return;

    const myName = currentUser?.name || 'Trader';
    const myHandle = currentUser?.username || (currentUser?.email || '').split('@')[0] || 'trader';
    const isCurrentUserAdmin = String(currentUser?.role || '').toUpperCase() === 'ADMIN';

    // Check if user is chat-blocked or suspended by Admin
    if (
      currentUser?.status === 'Suspended' ||
      currentUser?.isBlocked ||
      blockedUsers.includes(myName) ||
      blockedUsers.includes('@' + myHandle)
    ) {
      showAppToast('Account restricted from posting by Desk Admin.');
      return;
    }

    // Check if user is on Free Tier (Free users can view, but cannot send unless they are ADMIN)
    const userPlanRaw = (currentUser?.plan || 'free').toLowerCase();
    const isVipUser = userPlanRaw.includes('vip') || userPlanRaw.includes('lifetime');
    const isPremiumUser = userPlanRaw.includes('premium') || userPlanRaw.includes('pro') || userPlanRaw.includes('shark partner');
    const isFree = !isVipUser && !isPremiumUser && !isCurrentUserAdmin;

    if (isFree) {
      showAppToast('Upgrade to VIP or PREMIUM to unlock Community Floor chat.');
      setPlanUpgradeModalVisible(true);
      return;
    }

    const isAlphaMode = isCurrentUserAdmin && (adminComposerMode === 'ALPHA' || isAdminBroadcastMode);
    const userPlan = (currentUser?.plan || 'VIP').toUpperCase();
    const planBadge = isCurrentUserAdmin
      ? 'ADMIN'
      : userPlan === 'PREMIUM'
        ? 'PREMIUM'
        : userPlan === 'VIP'
          ? 'VIP'
          : 'MEMBER';
    const planRole = isCurrentUserAdmin
      ? 'SYNDICATE ADMIN'
      : userPlan === 'PREMIUM'
        ? 'SHARK PARTNER'
        : userPlan === 'VIP'
          ? 'VIP TRADER'
          : 'MEMBER';
    const cleanUserAvatar =
      currentUser?.avatar && currentUser.avatar !== '🦈' && currentUser.avatar !== '👑'
        ? currentUser.avatar
        : getTraderInitials(currentUser?.name, currentUser?.email);
    const msgId = 'cmsg_' + Date.now();
    setMyMessageIds(prev => new Set(prev).add(msgId));

    const optimisticMsg = {
      id: msgId,
      isMe: true,
      senderEmail: currentUser?.email || null,
      senderUsername: myHandle,
      senderName: isAlphaMode ? `${myName} • SHARK HQ` : myName,
      role: isAlphaMode ? 'CHIEF QUANT & FOUNDER' : planRole,
      isAdmin: isAlphaMode,
      badge: isAlphaMode ? 'ADMIN BROADCAST' : planBadge,
      tag: audioToAttach
        ? '#VOICE_NOTE'
        : imageToAttach
          ? '#CHART_SETUP'
          : isAlphaMode
            ? '#ALPHA_ALERT'
            : '#DISCUSSION',
      theme: isAlphaMode ? 'green' : (userPlan === 'PREMIUM' ? 'green' : userPlan === 'VIP' ? 'gold' : 'platinum'),
      type: audioToAttach ? 'AUDIO' : (isAlphaMode ? 'ALPHA' : 'CHAT'),
      category: isAlphaMode ? 'ALPHA' : 'NORMAL',
      avatarText: isAlphaMode ? 'HQ' : cleanUserAvatar,
      content: (textToSend || '').trim(),
      audioData: audioToAttach?.uri || null,
      audioDuration: audioToAttach?.duration || null,
      imageData: imageToAttach?.uri || null,
      replyTo: replyToObj || null,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      likes: 0,
      isPinned: false
    };

    setCommunityMessages(prev => [...prev, optimisticMsg]);
    playSendChime();
    emitCommunityTyping(false);
    setCommunityChatInput('');
    setCommunityAudioAttachment(null);
    setCommunityImageAttachment(null);
    setCommunityReplyTo(null);

    if (isAlphaMode) {
      setLatestAdminAlert(optimisticMsg);
      setAdminUnreadCount(prev => prev + 1);
      setShowAdminBanner(true);
    }

    setTimeout(() => {
      communityFlatListRef.current?.scrollToEnd({ animated: true });
    }, 120);

    try {
      const res = await fetch(`${BACKEND_URL}/api/community/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: currentUser?.email || null,
          senderUsername: optimisticMsg.senderUsername,
          senderName: optimisticMsg.senderName,
          role: optimisticMsg.role,
          content: optimisticMsg.content,
          audioData: optimisticMsg.audioData,
          audioDuration: optimisticMsg.audioDuration,
          imageData: optimisticMsg.imageData,
          replyTo: optimisticMsg.replyTo,
          isAdmin: optimisticMsg.isAdmin,
          badge: optimisticMsg.badge,
          avatarText: optimisticMsg.avatarText,
          tag: optimisticMsg.tag,
          theme: optimisticMsg.theme,
          type: optimisticMsg.type,
          category: optimisticMsg.category
        })
      });
      const d = await res.json();
      if (d && d.success && d.message) {
        setMyMessageIds(prev => new Set(prev).add(d.message.id));
        setCommunityMessages(prev =>
          prev.map(m => (m.id === optimisticMsg.id ? { ...d.message, isMe: true } : m))
        );
      }
    } catch (e) {
      console.log('Error sending community message:', e);
    }
  };

  // ── SMC TRADE SIGNAL EXECUTION (ADMIN ONLY) ──
  const handleSendSignal = async () => {
    const isCurrentUserAdmin = String(currentUser?.role || '').toUpperCase() === 'ADMIN';
    if (!isCurrentUserAdmin) {
      showAppToast('Only Desk Admins can broadcast official SMC Signals.');
      return;
    }
    if (!signalSymbol.trim() || !signalEntry.trim() || !signalSL.trim() || !signalTP1.trim()) {
      showAppToast('Please enter Symbol, Entry, Stop Loss, and Target 1');
      return;
    }

    const entryNum = parseFloat(signalEntry.replace(/,/g, ''));
    const slNum = parseFloat(signalSL.replace(/,/g, ''));
    const tpNum = parseFloat(signalTP1.replace(/,/g, ''));
    let calculatedRR = '1:3.2';
    if (!isNaN(entryNum) && !isNaN(slNum) && !isNaN(tpNum) && Math.abs(entryNum - slNum) > 0) {
      const risk = Math.abs(entryNum - slNum);
      const reward = Math.abs(tpNum - entryNum);
      calculatedRR = `1:${(reward / risk).toFixed(1)}`;
    }

    const signalData = {
      symbol: signalSymbol.trim().toUpperCase(),
      direction: signalDirection,
      entry: signalEntry.trim(),
      sl: signalSL.trim(),
      tp1: signalTP1.trim(),
      tp2: signalTP2.trim(),
      rr: calculatedRR,
      timeframe: signalTimeframe || '15M',
      notes: signalNotes.trim() || 'Institutional SMC Order Block & Liquidity Sweep'
    };

    const msgId = 'cmsg_sig_' + Date.now();
    setMyMessageIds(prev => new Set(prev).add(msgId));
    const myHandle = currentUser?.username || (currentUser?.email || '').split('@')[0] || 'shark_admin';

    const optimisticSignalMsg = {
      id: msgId,
      isMe: true,
      senderEmail: currentUser?.email || null,
      senderUsername: myHandle,
      senderName: currentUser?.name ? `${currentUser.name} • SMC DESK` : 'SHARK QUANT HQ',
      role: 'CHIEF QUANT & FOUNDER',
      isAdmin: true,
      badge: 'SMC DESK',
      tag: '#SMC_SIGNAL',
      theme: signalDirection === 'SELL' ? 'crimson' : 'green',
      type: 'SIGNAL',
      category: 'SIGNAL',
      signalData: signalData,
      avatarText: 'HQ',
      content: `${signalDirection} ${signalSymbol.toUpperCase()} @ ${signalEntry} • SL: ${signalSL} • TP: ${signalTP1}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      likes: 0,
      isPinned: false
    };

    setCommunityMessages(prev => [...prev, optimisticSignalMsg]);
    setSignalModalOpen(false);
    setLatestAdminAlert(optimisticSignalMsg);
    setAdminUnreadCount(prev => prev + 1);
    setShowAdminBanner(true);

    setTimeout(() => {
      communityFlatListRef.current?.scrollToEnd({ animated: true });
    }, 120);

    try {
      const res = await fetch(`${BACKEND_URL}/api/community/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: currentUser?.email || null,
          senderUsername: myHandle,
          senderName: optimisticSignalMsg.senderName,
          role: 'CHIEF QUANT & FOUNDER',
          content: optimisticSignalMsg.content,
          isAdmin: true,
          badge: 'SMC DESK',
          tag: '#SMC_SIGNAL',
          type: 'SIGNAL',
          category: 'SIGNAL',
          signalData: signalData
        })
      });
      const d = await res.json();
      if (d && d.success && d.message) {
        setMyMessageIds(prev => new Set(prev).add(d.message.id));
        setCommunityMessages(prev =>
          prev.map(m => (m.id === optimisticSignalMsg.id ? { ...d.message, isMe: true } : m))
        );
      }
    } catch (e) {
      console.log('Error sending signal:', e);
    }
  };

  // ── صلاحيات الإدارة والتحكم الكامل (PIN, DELETE, BLOCK) ──
  const handlePinMessage = async (msg) => {
    if (!msg) return;
    setLatestAdminAlert(msg);
    setAdminActionSheetOpen(false);
    fetch(`${BACKEND_URL}/api/community/messages/${msg.id}/pin`, { method: 'POST' }).catch(() => {});
  };

  const handleDeleteMessage = async (msgId) => {
    if (!msgId) return;
    setCommunityMessages(prev => prev.filter(m => m.id !== msgId));
    setAdminActionSheetOpen(false);
    fetch(`${BACKEND_URL}/api/community/messages/${msgId}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleBlockUser = async (username) => {
    if (!username) return;
    setBlockedUsers(prev => [...prev, username]);
    setCommunityMessages(prev => prev.filter(m => m.senderName !== username));
    setAdminActionSheetOpen(false);
    fetch(`${BACKEND_URL}/api/community/block-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    }).catch(() => {});
  };

  const handleLikeCommunityMessage = async (msgId) => {
    const myEmail = (currentUser?.email || '').trim().toLowerCase();
    setCommunityMessages(prev =>
      prev.map(m => {
        if (m.id !== msgId) return m;
        const currLikedBy = Array.isArray(m.likedBy) ? [...m.likedBy] : [];
        let nextLikedBy = currLikedBy;
        let nextIsLiked = false;
        let nextLikes = Number(m.likes) || 0;
        if (myEmail) {
          const idx = currLikedBy.indexOf(myEmail);
          if (idx !== -1) {
            nextLikedBy.splice(idx, 1);
            nextIsLiked = false;
          } else {
            nextLikedBy.push(myEmail);
            nextIsLiked = true;
          }
          nextLikes = nextLikedBy.length;
        } else {
          nextLikes += 1;
          nextIsLiked = true;
        }
        return { ...m, likes: nextLikes, likedBy: nextLikedBy, isLiked: nextIsLiked };
      })
    );
    try {
      const res = await fetch(`${BACKEND_URL}/api/community/messages/${msgId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: myEmail })
      });
      const d = await res.json();
      if (d && d.success) {
        setCommunityMessages(prev =>
          prev.map(m =>
            m.id === msgId
              ? {
                  ...m,
                  likes: d.likes,
                  likedBy: d.likedBy || m.likedBy,
                  reactions: d.reactions || m.reactions,
                  isLiked: d.isLiked
                }
              : m
          )
        );
      }
    } catch (e) {}
  };

  const handleReactCommunityMessage = async (msgId, reactionKey = 'fire') => {
    setActiveReactionPickerMsgId(null);
    const isUserAdmin = String(currentUser?.role || '').toUpperCase() === 'ADMIN';
    const userPlanRaw = String(currentUser?.plan || 'FREE').toUpperCase();
    const isVipOrPremium = userPlanRaw.includes('VIP') || userPlanRaw.includes('PREMIUM') || userPlanRaw.includes('PRO') || userPlanRaw.includes('PARTNER');
    const isFreeUser = !isUserAdmin && !isVipOrPremium;
    if (isFreeUser) {
      setPlanUpgradeModalVisible(true);
      showAppToast('Upgrade to VIP to react and chat in the Community!');
      return;
    }

    const myEmail = (currentUser?.email || '').trim().toLowerCase();
    if (!myEmail) return;
    setCommunityMessages(prev =>
      prev.map(m => {
        if (m.id !== msgId) return m;
        const baseReactions = m.reactions && typeof m.reactions === 'object'
          ? { ...m.reactions }
          : { fire: Array.isArray(m.likedBy) ? [...m.likedBy] : [], target: [], rocket: [], blood: [] };
        const currArr = Array.isArray(baseReactions[reactionKey]) ? [...baseReactions[reactionKey]] : [];
        const idx = currArr.indexOf(myEmail);
        if (idx !== -1) currArr.splice(idx, 1);
        else currArr.push(myEmail);
        baseReactions[reactionKey] = currArr;
        return {
          ...m,
          reactions: baseReactions,
          likedBy: reactionKey === 'fire' ? currArr : m.likedBy,
          likes: reactionKey === 'fire' ? currArr.length : m.likes,
        };
      })
    );
    try {
      const res = await fetch(`${BACKEND_URL}/api/community/messages/${msgId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: myEmail, reactionKey })
      });
      const d = await res.json();
      if (d && d.success) {
        setCommunityMessages(prev =>
          prev.map(m =>
            m.id === msgId
              ? { ...m, reactions: d.reactions, likes: d.likes, likedBy: d.likedBy }
              : m
          )
        );
      }
    } catch (e) {}
  };

  const handleUpdateSignalStatus = async (msgId, newStatus) => {
    setCommunityMessages(prev =>
      prev.map(m =>
        m.id === msgId && m.signalData
          ? { ...m, signalData: { ...m.signalData, status: newStatus } }
          : m
      )
    );
    try {
      await fetch(`${BACKEND_URL}/api/community/messages/${msgId}/signal-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminEmail: currentUser?.email })
      });
      showAppToast(`Signal status updated to ${newStatus.replace('_', ' ')}`);
    } catch (e) {}
  };

  const handleAskAiAboutSignal = (sigData) => {
    if (!sigData) return;
    const cap = currentUser?.balance || 0;
    const risk = currentUser?.riskPercent || 1;
    const prompt = `Break down this official SMC Desk Signal: ${sigData.direction} ${sigData.symbol} (${sigData.timeframe || '15M'}) | Entry: ${sigData.entry} | Stop Loss: ${sigData.sl} | Target TP1: ${sigData.tp1}${sigData.tp2 ? ' | TP2: ' + sigData.tp2 : ''}. Calculate my exact lot size for $${cap} capital at ${risk}% risk and explain the institutional liquidity rationale.`;
    setActiveFloor('AI');
    setInputMessage(prompt);
    showAppToast('Signal loaded into Shark AI Desk — tap Send!');
  };

  const filteredCommunityMessages = (communityMessages || []).filter(msg => {
    if (blockedUsers.includes(msg.senderName)) return false;
    if (communitySearchQuery.trim()) {
      const q = communitySearchQuery.trim().toLowerCase().replace(/^@+/, '');
      const matchesUser = (msg.senderName || '').toLowerCase().includes(q) || (msg.senderUsername || '').toLowerCase().includes(q);
      const matchesContent = (msg.content || '').toLowerCase().includes(q);
      if (!matchesUser && !matchesContent) return false;
    }
    if (communityFilter === 'ALL') return true;
    if (communityFilter === 'ADMIN') {
      return (msg.isAdmin || msg.category === 'ALPHA' || msg.tag === '#ALPHA_ALERT') && msg.type !== 'SIGNAL';
    }
    if (communityFilter === 'SIGNALS') {
      return msg.type === 'SIGNAL' || msg.category === 'SIGNAL' || !!msg.signalData;
    }
    return true;
  });

  // Jump directly to a quoted older message and highlight it
  const jumpToCommunityMessage = (targetMsgId) => {
    if (!targetMsgId) return;
    // If current filter or search hides the message, switch to ALL so it's visible
    const inFiltered = filteredCommunityMessages.some(m => m.id === targetMsgId);
    if (!inFiltered) {
      setCommunityFilter('ALL');
      setCommunitySearchQuery('');
    }
    setHighlightedMsgId(targetMsgId);
    setShowJumpToBottom(true);

    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedMsgId(null);
    }, 4000);

    setTimeout(() => {
      try {
        if (typeof document !== 'undefined') {
          const domEl = document.getElementById(`cmsg-row-${targetMsgId}`);
          if (domEl && domEl.scrollIntoView) {
            domEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
          }
        }
        const listToSearch = inFiltered ? filteredCommunityMessages : communityMessages;
        const targetIdx = listToSearch.findIndex(m => m.id === targetMsgId);
        if (targetIdx !== -1 && communityFlatListRef.current) {
          communityFlatListRef.current.scrollToIndex({
            index: targetIdx,
            animated: true,
            viewPosition: 0.4,
          });
        }
      } catch (e) {}
    }, 80);
  };

  const returnToLatestMessages = () => {
    setShowJumpToBottom(false);
    setHighlightedMsgId(null);
    try {
      communityFlatListRef.current?.scrollToEnd({ animated: true });
      const node =
        communityFlatListRef.current?.getScrollableNode?.() ||
        communityFlatListRef.current?._listRef?._scrollRef;
      if (node && node.scrollHeight) {
        node.scrollTo
          ? node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' })
          : (node.scrollTop = node.scrollHeight);
      }
    } catch (e) {}
  };

  const activeMessages = sessionsMessages[currentSessionId] || [];
  const flatListRef = useRef(null);

  // دالة تمرير تلقائي فائقة الدقة تضمن ظهور آخر رسالة كاملة فوق شريط الإدخال دون أي اختفاء
  const scrollChatToBottom = (animated = true) => {
    const doScroll = () => {
      try {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated });
          const node = flatListRef.current?.getScrollableNode?.() ||
                       flatListRef.current?._listRef?._scrollRef;
          if (node && node.scrollHeight) {
            node.scrollTop = node.scrollHeight;
          }
        }
      } catch (e) {}
    };

    doScroll();
    setTimeout(doScroll, 40);
    setTimeout(doScroll, 120);
    setTimeout(doScroll, 280);
    setTimeout(doScroll, 500);
    setTimeout(doScroll, 800);
  };

  useEffect(() => {
    if (activeMessages.length > 0 || isTyping) {
      scrollChatToBottom(true);
    }
  }, [activeMessages.length, isTyping]);

  const pickMedia = async () => {
    toggleMenu();
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage({
          uri: result.assets[0].uri,
          base64: result.assets[0].base64,
        });
      }
    } catch (e) {
      console.log('Error selecting media:', e);
    }
  };

  const handleOpenCommunity = () => {
    if (!currentUser?.hasAcceptedCommunityRules) {
      setSelectedAvatarOption(currentUser?.avatar || '🦈');
      setRulesAgreedCheckbox(false);
      setCommunityRulesModalVisible(true);
    } else {
      setActiveFloor('COMMUNITY');
    }
  };

  const handleAcceptCommunityRules = async () => {
    if (!rulesAgreedCheckbox) return;
    const updated = {
      ...currentUser,
      avatar: selectedAvatarOption,
      hasAcceptedCommunityRules: true
    };
    setCurrentUser(updated);
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('shark_saved_user', JSON.stringify(updated));
    }
    setCommunityRulesModalVisible(false);
    setActiveFloor('COMMUNITY');

    try {
      await fetch(`${BACKEND_URL}/api/users/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          name: currentUser.name,
          avatar: selectedAvatarOption,
          hasAcceptedCommunityRules: true,
          plan: currentUser.plan || 'PREMIUM'
        })
      });
    } catch (e) {
      console.log('Update profile error:', e);
    }
  };

  const handleUpgradePlan = (newPlan) => {
    setPlanUpgradeModalVisible(false);
    showAppToast(`🔒 تفعيل باقة (${newPlan}) يتطلب موافقة الآدمن. تواصل مع الإدارة لتأكيد اشتراكك.`);
    if (typeof window !== 'undefined') {
      try {
        window.open('https://t.me/sharkquant', '_blank');
      } catch (e) {}
    }
  };

  const getTraderInitials = (nameStr, emailStr) => {
    const src = (nameStr || emailStr || 'TR').trim();
    const parts = src.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return src.substring(0, 2).toUpperCase();
  };

  const handleOpenEditProfile = () => {
    setEditNameInput(currentUser?.name || '');
    setEditUsernameInput(currentUser?.username || '');
    setEditAvatarInput(currentUser?.avatar || '');
    setEditProfileModalVisible(true);
  };

  const handlePickCustomAvatar = async (target = 'rules') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imageUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        if (target === 'rules') {
          setSelectedAvatarOption(imageUri);
        } else {
          setEditAvatarInput(imageUri);
        }
      }
    } catch (e) {
      console.log('Error selecting custom avatar image:', e);
    }
  };

  const handleSaveProfile = async () => {
    const cleanName = editNameInput.trim() || currentUser?.name || 'Trader';
    const cleanUsername = (editUsernameInput || currentUser?.username || '').trim().toLowerCase().replace(/^@+/, '').replace(/[^a-z0-9_]/g, '_');
    const cleanAvatar = editAvatarInput && (editAvatarInput.startsWith('data:') || editAvatarInput.startsWith('http') || editAvatarInput.startsWith('file:'))
      ? editAvatarInput
      : null;

    try {
      const res = await fetch(`${BACKEND_URL}/api/users/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser?.email,
          name: cleanName,
          username: cleanUsername || undefined,
          avatar: cleanAvatar,
          hasAcceptedCommunityRules: currentUser?.hasAcceptedCommunityRules,
          plan: currentUser?.plan || 'FREE',
          balance: Number(globalBalance) || 0,
          riskPercent: Number(globalRiskPercent) || 1
        })
      });
      const d = await res.json();
      if (d && d.success === false && d.error) {
        showAppToast(d.error);
        return;
      }
      const updated = {
        ...currentUser,
        ...(d?.user || {}),
        name: cleanName,
        username: d?.user?.username || cleanUsername || currentUser?.username,
        avatar: d?.user?.avatar !== undefined ? d.user.avatar : cleanAvatar,
      };
      setCurrentUser(updated);
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('shark_saved_user', JSON.stringify(updated));
      }
      setEditProfileModalVisible(false);
      showAppToast(`PROFILE SAVED • @${updated.username}`);
    } catch (e) {
      console.log('Update profile error:', e);
      setEditProfileModalVisible(false);
    }
  };

  const handleQuickAvatarPickFromDrawer = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imageUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        const updated = {
          ...currentUser,
          avatar: imageUri,
        };
        setCurrentUser(updated);
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('shark_saved_user', JSON.stringify(updated));
        }
        fetch(`${BACKEND_URL}/api/users/update-profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: currentUser.email,
            name: currentUser.name,
            username: currentUser.username,
            avatar: imageUri,
            hasAcceptedCommunityRules: currentUser.hasAcceptedCommunityRules,
            plan: currentUser.plan || 'PREMIUM'
          })
        }).catch(() => {});
      }
    } catch (e) {
      console.log('Error selecting custom avatar:', e);
    }
  };

  const handleLogout = () => {
    setSessionsDrawerOpen(false);
    setAuthModalVisible(false);
    setEditProfileModalVisible(false);
    setCurrentUser(null);
    setGlobalBalance('');
    setGoogleInputEmail('');
    setGoogleInputName('');
    setGoogleInputUsername('');
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('shark_saved_user');
      window.localStorage.removeItem('shark_custom_balance');
      window.localStorage.removeItem('shark_saved_balance');
      window.localStorage.removeItem('shark_saved_sessions_list');
      window.localStorage.removeItem('shark_saved_sessions_messages');
    }
    showAppToast('LOGGED OUT SUCCESSFULLY 🚪');
  };

  const handleSupabaseGoogleOAuth = async () => {
    try {
      setGoogleLoading(true);

      const isDesktopApp = typeof window !== 'undefined' && Boolean(window.chrome && window.chrome.webview);
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://shark-quant-backend-auw2-blue.vercel.app';

      // ── CASE A: WINDOWS DESKTOP APP (WebView2) ──
      // Use the persistent Supabase Cloud bridge and open Google in the user's Chrome session!
      if (isDesktopApp) {
        let bridgeId = '';
        try {
          const bRes = await fetch(`${BACKEND_URL}/api/auth/bridge-init`, { method: 'POST' });
          const bData = await bRes.json();
          if (bData && bData.bridgeId) bridgeId = bData.bridgeId;
        } catch (err) {}

        const redirectTo = `${origin}/api/auth/bridge-callback?bridgeId=${bridgeId}`;
        const res = await fetch(`${BACKEND_URL}/api/auth/supabase-config?redirectTo=${encodeURIComponent(redirectTo)}`);
        const cfg = await res.json();

        if (cfg && cfg.oauthUrl) {
          let attempts = 0;
          const pollInterval = setInterval(async () => {
            attempts++;
            if (attempts > 180) { // 3 minutes timeout
              clearInterval(pollInterval);
              setGoogleLoading(false);
              return;
            }
            try {
              const pRes = await fetch(`${BACKEND_URL}/api/auth/bridge-poll?bridgeId=${bridgeId}`);
              const pData = await pRes.json();
              if (pData && pData.completed && pData.user) {
                clearInterval(pollInterval);
                setGoogleLoading(false);
                setAuthModalVisible(false);

                try {
                  localStorage.setItem('shark_user', JSON.stringify(pData.user));
                  if (pData.token) localStorage.setItem('shark_sb_token', pData.token);
                } catch (e) {}

                setCurrentUser(pData.user);
                showAppToast(`تم ربط حسابك بنجاح! 🦈✅ مرحباً ${pData.user.name || pData.user.username}`);
                fetchUsersDirectory();
              }
            } catch (pErr) {}
          }, 1200);

          try {
            window.chrome.webview.postMessage(JSON.stringify({ action: 'open_chrome', url: cfg.oauthUrl }));
            showAppToast('🌐 جاري فتح Chrome لتسجيل الدخول.. اختر حسابك وسيتم فتح البرنامج تلقائياً!');
          } catch (err) {
            window.open(cfg.oauthUrl, '_blank');
          }
          return;
        }
      }

      // ── CASE B: WEB BROWSER (NO POPUP, IN SAME WINDOW AS REQUESTED) ──
      // Redirect directly in the SAME window, then return to /app#access_token and login instantly!
      const redirectTo = `${origin}/app`;
      const res = await fetch(`${BACKEND_URL}/api/auth/supabase-config?redirectTo=${encodeURIComponent(redirectTo)}`);
      const cfg = await res.json();

      if (cfg && cfg.oauthUrl && typeof window !== 'undefined') {
        window.location.href = cfg.oauthUrl;
        return;
      }
    } catch (e) {
      showAppToast('Error connecting to Supabase Google OAuth');
      setGoogleLoading(false);
    }
  };

  const handleGoogleSignIn = async (overrideEmail, overrideName) => {
    const rawEmail = typeof overrideEmail === 'string' ? overrideEmail.trim() : googleInputEmail.trim();
    const email = rawEmail.toLowerCase();
    if (!email || (!email.endsWith('@gmail.com') && !email.endsWith('@googlemail.com'))) {
      showAppToast('ممنوع أي بريد غير جوجل! يرجى إدخال بريد @gmail.com حقيقي فقط ⚠️');
      return;
    }
    const rawName = (typeof overrideName === 'string' ? overrideName.trim() : googleInputName.trim()) || email.split('@')[0];
    const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const desiredUsername = googleInputUsername.trim().toLowerCase().replace(/^@+/, '').replace(/[^a-z0-9_]/g, '_');

    setGoogleLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          username: desiredUsername || undefined,
          balance: Number(globalBalance) || 0,
          riskPercent: Number(globalRiskPercent) || 1
        })
      });
      const d = await res.json();
      if (d && d.success === false && d.error) {
        showAppToast(d.error);
        setGoogleLoading(false);
        return;
      }
      if (d && d.success && d.user) {
        setCurrentUser(d.user);
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('shark_saved_user', JSON.stringify(d.user));
        }
        const userSessions = Array.isArray(d.user.sessionsList) && d.user.sessionsList.length > 0
          ? d.user.sessionsList
          : [{ id: 'session_1', title: 'تحليل السيولة الرئيسي', updatedAt: 'الآن' }];
        setSessionsList(userSessions);
        const firstSessionId = userSessions[0]?.id || 'session_1';
        setCurrentSessionId(firstSessionId);

        const userMsgs = d.user.sessionsMessages && typeof d.user.sessionsMessages === 'object' && Object.keys(d.user.sessionsMessages).length > 0
          ? d.user.sessionsMessages
          : {
              [firstSessionId]: [
                {
                  id: 'welcome_' + Date.now(),
                  sender: 'ai',
                  type: 'ai_msg',
                  text: `مرحباً بك يا **${d.user.name || name}** في مكتب **SHARK QUANT** المؤسسي! 🦈\n\nتم توثيق حسابك بنجاح عبر Google: **${email}**\n\nأنا مستشارك المالي والكمي المباشر لتحليل شارتات الذهب والعملات والأسواق.\nما هو الأصل الذي تريد تحليله الآن؟ (مثلاً: الذهب XAUUSD، البيتكوين BTC، أو الناسداك)`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
              ]
            };
        setSessionsMessages(userMsgs);

        if (d.user.balance) {
          updateGlobalBalance(String(d.user.balance));
        }
        if (d.user.riskPercent) {
          updateGlobalRisk(Number(d.user.riskPercent));
        }
        showAppToast(`تم تسجيل الدخول بمصادقة Gmail عبر Supabase: @${d.user.username || name} ✅`);
        setAuthModalVisible(false);
      }
    } catch (e) {
      showAppToast('تعذر الاتصال بخادم المصادقة Supabase');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSend = async (presetText) => {
    if (currentUser?.status === 'Suspended' || currentUser?.isBlocked) {
      showAppToast('🚫 تم إيقاف حسابك مؤقتاً من طرف الإدارة.');
      return;
    }
    const text = presetText || inputMessage;
    const imgToSend = selectedImage;

    if (!text.trim() && !imgToSend) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      type: 'user_msg',
      text: text.trim() || 'Check this chart setup.',
      imageUri: imgToSend ? imgToSend.uri : null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSessionsMessages((prev) => ({
      ...prev,
      [currentSessionId]: [...(prev[currentSessionId] || []), userMsg]
    }));
    playSendChime();
    scrollChatToBottom(true);

    // تحديث عنوان المحادثة والوقت تلقائياً في قائمة الدردشات
    setSessionsList((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          const isDefault = s.title === 'New Trading Chat' || s.title === 'جلسة تداول جديدة' || s.title.startsWith('New ');
          const updatedTitle = isDefault ? (text.trim().substring(0, 24) || 'تحليل السوق') : s.title;
          return { ...s, title: updatedTitle, updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        }
        return s;
      })
    );

    setInputMessage('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUser.email,
          sessionId: currentSessionId,
          message: text.trim(),
          imageBase64: imgToSend ? `data:image/jpeg;base64,${imgToSend.base64}` : null,
        }),
      });

      const data = await response.json();

      // ✅ حالة تجاوز الحد أو خطأ API — اعرض بانر صيانة وسط الشات
      if (data.isApiError || data.reply === null) {
        const maintenanceMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'system',
          type: data.isQuotaError ? 'quota_error' : 'api_error',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setSessionsMessages((prev) => ({
          ...prev,
          [currentSessionId]: [...(prev[currentSessionId] || []), maintenanceMsg]
        }));
        return;
      }

      // إذا قال له المستخدم اقطع الخط / Hang up
      if (data.shouldHangup && liveCallActive) {
        setLiveCallActive(false);
      }

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply,
        thinking: data.thinking || null,
        chart: data.chart || null,
        chartScreenshot: data.chartScreenshot || null,
        signal: data.signal || null,
        aiVoiceUrl: data.aiVoiceUrl || null,
        isDailyPlanLimit: Boolean(data.isDailyPlanLimit),
        lang: data.lang || (/[\u0600-\u06FF]/.test(text || data.reply || '') ? 'ar' : 'en'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSessionsMessages((prev) => ({
        ...prev,
        [currentSessionId]: [...(prev[currentSessionId] || []), aiMsg]
      }));
      playReceiveChime();
      scrollChatToBottom(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const filteredSessions = sessionsList.filter((s) =>
    (s.title || '').toLowerCase().includes(sessionSearchQuery.toLowerCase())
  );

  const renderFormattedText = (rawText) => {
    if (!rawText) return null;
    const lines = String(rawText).split('\n');
    return (
      <View style={{ width: '100%' }}>
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <View key={idx} style={{ height: 6 }} />;
          }

          // Check if header line (###, ##, #, or starts with emoji title like 📊 1. ...: or **Title:**)
          const isHeader = trimmed.startsWith('#') || 
            Boolean(trimmed.match(/^[📊🎯⚠️💎🔥💡📌🚀⚡📈📉][^:]+:/)) || 
            (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 50);

          const cleanHeader = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '');

          if (isHeader) {
            return (
              <View key={idx} style={{ marginTop: idx === 0 ? 0 : 8, marginBottom: 4, paddingBottom: 2 }}>
                <Text
                  style={{
                    color: '#00E5FF',
                    fontSize: 15,
                    fontWeight: '900',
                    textAlign: 'right',
                    writingDirection: 'rtl',
                    lineHeight: 22
                  }}
                >
                  {cleanHeader}
                </Text>
              </View>
            );
          }

          // Check if list item (- or • or * )
          const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ');
          const contentLine = isBullet ? trimmed.replace(/^[-•*]\s*/, '') : trimmed;

          // Parse inline bold: **bold text**
          const parts = contentLine.split(/(\*\*[^*]+\*\*)/g);

          return (
            <View key={idx} style={{ flexDirection: 'row-reverse', alignItems: 'flex-start', marginBottom: 3 }}>
              {isBullet && (
                <Text style={{ color: '#00E5FF', fontSize: 14, marginLeft: 6, marginRight: 2, lineHeight: 23 }}>•</Text>
              )}
              <Text
                style={{
                  flex: 1,
                  color: '#E1E9F5',
                  fontSize: 14,
                  lineHeight: 23,
                  textAlign: 'right',
                  writingDirection: 'rtl'
                }}
              >
                {parts.map((part, pIdx) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    const boldContent = part.slice(2, -2);
                    return (
                      <Text key={pIdx} style={{ fontWeight: '800', color: '#FFE600' }}>
                        {boldContent}
                      </Text>
                    );
                  }
                  return <Text key={pIdx}>{part}</Text>;
                })}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const userPlanRaw = (currentUser?.plan || 'free').toLowerCase();
    const isVipUser = userPlanRaw.includes('vip') || userPlanRaw.includes('lifetime');
    const isPremiumUser = userPlanRaw.includes('premium') || userPlanRaw.includes('pro') || userPlanRaw.includes('shark partner');
    const isFreeUser = !isVipUser && !isPremiumUser;

    // ✅ بانر الصيانة — Street Sign / NYC Caution Style
    if (item.sender === 'system') {
      const isQuota = item.type === 'quota_error';
      return (
        <View style={styles.maintenanceWrapper}>
          {/* شريط caution tape أصفر */}
          <View style={styles.maintenanceCautionStrip}>
            <Text style={styles.maintenanceCautionText} numberOfLines={1}>
              {'/// CAUTION ///  CAUTION ///  CAUTION ///  CAUTION ///'}
            </Text>
          </View>
          {/* البطاقة */}
          <View style={styles.maintenanceBanner}>
            <View style={styles.maintenanceTopRow}>
              <View style={styles.maintenanceRedDot} />
              <Text style={styles.maintenanceLabel}>SYSTEM NOTICE</Text>
            </View>
            <Text style={styles.maintenanceCode}>
              {isQuota ? 'QUOTA LIMIT REACHED' : 'ENGINE OFFLINE'}
            </Text>
            <Text style={styles.maintenanceDesc}>
              {isQuota
                ? 'API key daily cap hit — awaiting key reset'
                : 'Server under maintenance — back online shortly'}
            </Text>
            <Text style={styles.maintenanceTime}>{item.timestamp}</Text>
          </View>
        </View>
      );
    }

    if (item.sender === 'user') {
      if (item.type === 'audio_note') {
        return (
          <View style={styles.userContainer}>
            <View style={styles.userAudioBubble}>
              <TouchableOpacity
                style={[
                  styles.audioPlayCircle,
                  playingAudioId === item.id && { backgroundColor: '#00FF66' }
                ]}
                onPress={() => togglePlayAudio(item.audioUri || (item.transcribedText ? `/api/tts?text=${encodeURIComponent(item.transcribedText)}` : null), item.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={playingAudioId === item.id ? "pause" : "play"}
                  size={16}
                  color="#000"
                />
              </TouchableOpacity>
              <View style={styles.audioWaveformStatic}>
                {[12, 22, 16, 26, 18, 24, 14, 20].map((h, i) => (
                  <View
                    key={i}
                    style={[
                      styles.staticBar,
                      { height: h },
                      playingAudioId === item.id && { backgroundColor: '#00FF66' }
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.audioDurationText}>
                {playingAudioId === item.id ? 'PLAYING...' : item.duration}
              </Text>
            </View>
          </View>
        );
      }

      return (
        <View style={styles.userContainer}>
          {/* Badge: الاسم + الخطة */}
          {(() => {
            const plan = (currentUser?.plan || 'free').toLowerCase();
            const isVip = plan.includes('vip') || plan.includes('lifetime');
            const isPremium = plan.includes('premium') || plan.includes('pro') || plan.includes('shark partner');
            const badgeColor = isVip ? '#FFE600' : isPremium ? '#00F0FF' : '#778899';
            const planLabel = isVip ? 'VIP' : isPremium ? 'PRO' : 'FREE';
            return (
              <View style={styles.userNameRow}>
                <Text style={[styles.userNameText, { color: badgeColor }]}>
                  {(currentUser?.name || 'YOU').toUpperCase()}
                </Text>
                <View style={[styles.userPlanBadge, { backgroundColor: badgeColor }]}>
                  <Text style={styles.userPlanBadgeText}>{planLabel}</Text>
                </View>
              </View>
            );
          })()}
          <View style={styles.userBubble}>
            {item.imageUri && (
              <Image source={{ uri: item.imageUri }} style={styles.userUploadedImage} resizeMode="cover" />
            )}
            <Text style={styles.userBubbleText}>{item.text}</Text>
            <Text style={styles.userBubbleTime}>{item.timestamp}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.aiDropWrapper}>
        <View style={styles.streetSignBadgeGreen}>
          <MaterialCommunityIcons name="shark" size={16} color="#00FF66" />
          <Text style={styles.streetSignTextDark}>SHARK PARTNER</Text>
        </View>

        <View style={styles.streetArticleCard}>
          {item.thinking && (
            <SharkReasoningAccordion thinking={item.thinking} />
          )}

          {item.isDailyPlanLimit ? (
            /* ── DAILY FREE PLAN TRIAL LIMIT REACHED (DYNAMIC ARABIC / ENGLISH) ── */
            <View
              style={{
                backgroundColor: '#0E121B',
                borderWidth: 1.5,
                borderColor: 'rgba(255, 230, 0, 0.45)',
                borderRadius: 14,
                padding: 18,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'rgba(255, 230, 0, 0.14)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 230, 0, 0.4)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginBottom: 10,
                }}
              >
                <Ionicons name="lock-closed" size={15} color="#FFE600" />
                <Text style={{ color: '#FFE600', fontSize: 12, fontWeight: '900', letterSpacing: 0.5 }}>
                  {item.lang === 'ar'
                    ? 'انتهت خطتك اليومية المجانية'
                    : 'DAILY FREE PLAN LIMIT REACHED'}
                </Text>
              </View>

              <Text
                style={{
                  color: '#CBD5E1',
                  fontSize: 12.5,
                  lineHeight: 20,
                  textAlign: 'center',
                  marginBottom: 14,
                  fontWeight: '600',
                }}
              >
                {item.lang === 'ar'
                  ? 'لقد استنفدت الحد التجريبي اليومي المسموح به في الباقة المجانية (3 استشارات يومياً). قم بترقية خطتك الآن إلى VIP أو PREMIUM للمتابعة والحصول على تحليلات وصفقات الحيتان بلا حدود.'
                  : 'You have reached your daily Free Tier trial limit (3 daily consultations). Upgrade to VIP Trader or Shark Premium to continue chatting and unlock unlimited institutional analysis & SMC setups.'}
              </Text>

              <TouchableOpacity
                style={styles.vipUnlockBtn}
                onPress={() => setPlanUpgradeModalVisible(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="flash" size={15} color="#000" />
                <Text style={styles.vipUnlockBtnText}>
                  {item.lang === 'ar' ? 'ترقية الباقة الآن' : 'UPGRADE PLAN NOW'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* AI Audio Voice Briefing Player (Audio-to-Audio Mode) */}
              {item.aiVoiceUrl ? (
                <View style={styles.aiVoiceBriefCard}>
                  <TouchableOpacity
                    style={[
                      styles.aiVoiceBriefPlayCircle,
                      playingAudioId === `ai_voice_${item.id}` && styles.aiVoiceBriefPlayCircleActive
                    ]}
                    onPress={() => togglePlayAudio(item.aiVoiceUrl || `/api/tts?text=${encodeURIComponent((item.text || '').substring(0, 400))}`, `ai_voice_${item.id}`)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={playingAudioId === `ai_voice_${item.id}` ? "pause" : "play"}
                      size={16}
                      color={playingAudioId === `ai_voice_${item.id}` ? "#000000" : "#00FF66"}
                    />
                  </TouchableOpacity>
                  <View style={styles.aiVoiceBriefWaveCol}>
                    <View style={styles.aiVoiceBriefHeaderRow}>
                      <View style={[styles.aiVoiceLivePulse, playingAudioId === `ai_voice_${item.id}` && { backgroundColor: '#00FF66' }]} />
                      <Text style={styles.aiVoiceBriefTitle}>SHARK QUANT • AUDIO BRIEFING 🎙️</Text>
                    </View>
                    <View style={styles.voiceWaveBarsRow}>
                      {[8, 18, 12, 24, 16, 28, 20, 26, 14, 22, 16, 30, 18, 12, 20, 14, 24, 10].map((h, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.voiceWaveSingleBar,
                            { height: h, width: 3 },
                            playingAudioId === `ai_voice_${item.id}` && { backgroundColor: idx % 2 === 0 ? '#00FF66' : '#FFE600' }
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={styles.aiVoiceBriefSub}>
                      {playingAudioId === `ai_voice_${item.id}` ? 'Speaking Live...' : 'Tap to hear Shark Trader Audio'}
                    </Text>
                  </View>
                </View>
              ) : null}

              {renderFormattedText(item.text)}

              {item.chart && (
                <LiveTradingViewChart symbol={item.chart.symbol} interval={item.chart.interval} />
              )}

              {item.signal && (
                <InstitutionalTradeCard
                  signal={item.signal}
                  lang={item.lang}
                  parentText={item.text}
                  globalBalance={globalBalance}
                  onUpdateBalance={updateGlobalBalance}
                  globalRiskPercent={globalRiskPercent}
                  onUpdateRisk={updateGlobalRisk}
                />
              )}
            </>
          )}

          {/* تذييل الرسالة: التوقيت وأزرار المشاركة والنسخ */}
          <View style={styles.msgActionFooter}>
            <Text style={styles.cardTimeClean}>{item.timestamp}</Text>
            <View style={styles.msgShareIconsRow}>
              <TouchableOpacity onPress={() => copyAnalysis(item.text)} style={styles.iconMiniBtn} title="نسخ التحليل">
                <Text style={{ fontSize: 13, lineHeight: 16 }}>📋</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => shareAnalysisToSocial(item.text, 'whatsapp')} style={styles.iconMiniBtn} title="مشاركة واتساب">
                <Text style={{ fontSize: 13, lineHeight: 16 }}>💬</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => shareAnalysisToSocial(item.text, 'telegram')} style={styles.iconMiniBtn} title="مشاركة تليجرام">
                <Text style={{ fontSize: 13, lineHeight: 16 }}>✈️</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // ── 100% INSTITUTIONAL EMBED & SMC SIGNAL RENDERING ──
  const renderCommunityMessage = ({ item }) => {
    const isMe =
      item.isMe === true ||
      myMessageIds.has(item.id) ||
      (currentUser?.email && item.senderEmail && item.senderEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      item.senderName === (currentUser?.name || 'Hajar') ||
      item.senderName === 'Hajar' ||
      item.senderName === 'Hajar (You)' ||
      item.senderName === 'You' ||
      item.avatarText === 'ME';

    const isCurrentUserAdmin = String(currentUser?.role || '').toUpperCase() === 'ADMIN';
    const userPlanRaw = String(currentUser?.plan || 'FREE').toUpperCase();
    const isVipOrPremium = userPlanRaw.includes('VIP') || userPlanRaw.includes('PREMIUM') || userPlanRaw.includes('PRO') || userPlanRaw.includes('PARTNER');
    const isFreeUser = !isCurrentUserAdmin && !isVipOrPremium;

    // Natural Text Shadow / Blur that conceals only the writing while keeping the authentic chat look
    const blurTextStyle = isFreeUser
      ? (Platform.OS === 'web'
          ? { filter: 'blur(5.5px)', WebkitFilter: 'blur(5.5px)', userSelect: 'none' }
          : { opacity: 0.28 })
      : null;

    const isSignal = item.type === 'SIGNAL' || !!item.signalData;
    const isBuySignal = isSignal && item.signalData?.direction !== 'SELL';

    const handleStr = isMe && !item.isAdmin
      ? (currentUser?.username || (currentUser?.email || '').split('@')[0] || 'trader')
      : (item.senderUsername || (item.isAdmin ? 'shark_admin' : (item.senderName || 'trader').toLowerCase().replace(/[^a-z0-9_]/g, '_')));

    // Theme, role, and embed colors
    let nameColor = isMe ? '#FFE600' : item.isAdmin ? '#00FF66' : '#F2F3F5';
    const myPlan = (currentUser?.plan || 'PREMIUM').toUpperCase();
    let roleBadgeText = item.isAdmin
      ? 'ADMIN'
      : isMe
        ? (isCurrentUserAdmin ? 'ADMIN' : myPlan === 'PREMIUM' ? 'PREMIUM' : myPlan === 'VIP' ? 'VIP' : 'FREE')
        : (item.badge || 'VIP').replace(/[👑⚡🦈]/g, '').trim();
    let roleBadgeBg = item.isAdmin ? '#00FF66' : (isMe ? (isCurrentUserAdmin || myPlan === 'PREMIUM' ? '#00FF66' : myPlan === 'VIP' ? '#FFE600' : '#4E5058') : '#5865F2');
    let roleBadgeColor = item.isAdmin ? '#000000' : (isMe ? (myPlan === 'FREE' && !isCurrentUserAdmin ? '#FFFFFF' : '#000000') : '#FFFFFF');
    let embedBorderColor = item.isAdmin ? '#00FF66' : (isMe ? '#FFE600' : '#00E5FF');
    let iconName = item.isAdmin ? 'shield-checkmark' : (isMe ? 'flash' : 'chatbubble-ellipses');
    let tagTitle = item.tag || (item.isAdmin ? '#ALPHA_ALERT' : (isMe ? '#TRADER_ALPHA' : '#COMMUNITY_NOTE'));
    let footerText = item.isAdmin
      ? 'SHARK QUANT • INSTITUTIONAL FLOOR'
      : (isMe ? `SHARK QUANT • ${isCurrentUserAdmin ? 'ADMIN' : myPlan} TRADER` : 'SHARK QUANT • COMMUNITY FLOOR');

    if (isSignal) {
      nameColor = isBuySignal ? '#00FF66' : '#FF3355';
      embedBorderColor = isBuySignal ? '#00FF66' : '#FF3355';
      iconName = isBuySignal ? 'trending-up' : 'trending-down';
      tagTitle = '#SMC_SIGNAL';
      roleBadgeText = 'SMC DESK';
      roleBadgeBg = isBuySignal ? '#00FF66' : '#FF3355';
      roleBadgeColor = '#000000';
      footerText = 'SHARK QUANT • SMC INSTITUTIONAL DESK';
    } else if (item.isAdmin || item.theme === 'green') {
      nameColor = '#00FF66';
      embedBorderColor = '#00FF66';
      iconName = 'shield-checkmark';
      tagTitle = item.tag || '#ALPHA_ALERT';
      footerText = 'SHARK QUANT • INSTITUTIONAL FLOOR';
    } else if (item.theme === 'gold' || (item.content && (item.content.includes('XAU') || item.content.includes('ذهب')))) {
      if (!isMe && !item.isAdmin) nameColor = '#FFE600';
      embedBorderColor = '#FFE600';
      iconName = 'trending-up';
      tagTitle = item.tag || '#GOLD_ALPHA';
      footerText = 'SHARK QUANT • GOLD DESK';
    } else if (item.theme === 'cyan' || (item.content && (item.content.includes('BTC') || item.content.includes('SOL')))) {
      if (!isMe && !item.isAdmin) nameColor = '#00E5FF';
      embedBorderColor = '#00E5FF';
      iconName = 'stats-chart';
      tagTitle = item.tag || '#CRYPTO_ALPHA';
      footerText = 'SHARK QUANT • CRYPTO DESK';
    }

    const isHighlightedJump = highlightedMsgId === item.id;
    const myEmailLower = (currentUser?.email || '').trim().toLowerCase();
    const isLikedByMe = Boolean(
      item.isLiked ||
      (Array.isArray(item.likedBy) && myEmailLower && item.likedBy.includes(myEmailLower))
    );

    const isPickerOpen = activeReactionPickerMsgId === item.id;

    return (
      <View
        key={item.id}
        nativeID={`cmsg-row-${item.id}`}
        style={[
          styles.discordMessageRow,
          isMe && !isSignal && styles.discordMessageRowMe,
          isPickerOpen && { zIndex: 99999, elevation: 35 },
          isHighlightedJump && {
            backgroundColor: 'rgba(0, 229, 255, 0.14)',
            borderColor: '#00E5FF',
            borderWidth: 1.5,
            borderRadius: 14,
            paddingVertical: 10,
            paddingHorizontal: 10,
            marginVertical: 4,
          }
        ]}
      >
        {/* Discord Avatar (38x38 circle - Tap to open Trader Identity Card) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => openTraderProfileCard(item, isMe, handleStr)}
          style={[
            styles.discordAvatarBox,
            item.isAdmin && styles.discordAdminAvatar,
          ]}
        >
          {item.isAdmin ? (
            <Image source={SHARK_LOGO} style={styles.discordAvatarSharkLogo} resizeMode="contain" />
          ) : (
            (() => {
              const rawAv = isMe ? (currentUser?.avatar || item.avatarText) : item.avatarText;
              if (rawAv && (rawAv.startsWith('data:') || rawAv.startsWith('http') || rawAv.startsWith('file:') || rawAv.startsWith('/'))) {
                const fullImg = rawAv.startsWith('/') ? `${BACKEND_URL}${rawAv}` : rawAv;
                return <Image source={{ uri: fullImg }} style={styles.discordAvatarCustomImg} resizeMode="cover" />;
              }
              const cleanInitials =
                rawAv && rawAv !== '🦈' && rawAv !== '👑' && /^[A-Za-z0-9]{1,3}$/.test(rawAv)
                  ? rawAv.toUpperCase()
                  : getTraderInitials(isMe ? currentUser?.name : item.senderName, isMe ? currentUser?.email : item.senderEmail);
              return (
                <Text style={[styles.discordAvatarLetters, { color: isMe ? '#00FF66' : nameColor }]}>
                  {cleanInitials}
                </Text>
              );
            })()
          )}
        </TouchableOpacity>

        {/* Discord Message Content Column */}
        <View style={[styles.discordContentCol, isMe && !isSignal && styles.discordContentColMe, isPickerOpen && { zIndex: 99999 }]}>
          {/* Header Line: Clickable Display Name + Role/Plan Badge + Timestamp + 3-Dots (No @username clutter here!) */}
          <View style={[styles.discordHeaderRow, isMe && !isSignal && styles.discordHeaderRowMe]}>
            <TouchableOpacity
              onPress={() => openTraderProfileCard(item, isMe, handleStr)}
              activeOpacity={0.75}
            >
              <Text style={[styles.discordAuthorName, { color: isMe && !item.isAdmin ? '#FFE600' : nameColor }]}>
                {isMe && !item.isAdmin ? `${currentUser?.name || 'You'}` : item.senderName}
              </Text>
            </TouchableOpacity>

            <View style={[styles.discordTagBadge, { backgroundColor: roleBadgeBg }]}>
              <Text style={[styles.discordTagBadgeText, { color: roleBadgeColor }]}>
                {roleBadgeText}
              </Text>
            </View>

            <Text style={styles.discordTimeText}>
              Today at {item.time || '12:30 PM'}
            </Text>

            {/* 3-Dots Button: Visible ONLY to Verified Admins OR to the author of their own message */}
            {(isCurrentUserAdmin || isMe) && (
              <TouchableOpacity
                style={styles.discordAdminDotBtn}
                onPress={() => {
                  setSelectedMsgForAdminAction(item);
                  setAdminActionSheetOpen(true);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="ellipsis-horizontal" size={14} color="#8A9BB0" />
              </TouchableOpacity>
            )}
          </View>

          {/* ── CARD CONTENT: SMC SIGNAL vs EMBED MESSAGE ── */}
          {isSignal && item.signalData ? (
            (() => {
              const sigStatus = item.signalData.status || 'EXECUTION';
              const statusMeta =
                sigStatus === 'TP1_HIT'
                  ? { label: 'TP1 SMASHED', color: '#00FF66', bg: 'rgba(0, 255, 102, 0.16)' }
                  : sigStatus === 'BREAKEVEN'
                    ? { label: 'RISK FREE (BE)', color: '#00E5FF', bg: 'rgba(0, 229, 255, 0.16)' }
                    : sigStatus === 'TP2_HIT'
                      ? { label: 'FULL TARGET TP2', color: '#FFE600', bg: 'rgba(255, 230, 0, 0.18)' }
                      : sigStatus === 'STOPPED'
                        ? { label: 'CLOSED / SL', color: '#FF3355', bg: 'rgba(255, 51, 85, 0.16)' }
                        : { label: 'EXECUTION', color: isBuySignal ? '#00FF66' : '#FF3355', bg: 'rgba(255,255,255,0.06)' };

              return (
                <View
                  style={[
                    styles.signalCardBox,
                    {
                      borderLeftColor:
                        sigStatus === 'TP2_HIT'
                          ? '#FFE600'
                          : sigStatus === 'BREAKEVEN'
                            ? '#00E5FF'
                            : isBuySignal
                              ? '#00FF66'
                              : '#FF3355'
                    }
                  ]}
                >
                  {/* Top Row: BUY/SELL Badge + Symbol + Timeframe + Dynamic Live Status */}
                  <View style={styles.signalTopRow}>
                    <View style={styles.signalSymbolWrap}>
                      <View
                        style={[
                          styles.signalDirBadge,
                          { backgroundColor: isBuySignal ? '#00FF66' : '#FF3355' }
                        ]}
                      >
                        <Text style={styles.signalDirBadgeText}>
                          {isBuySignal ? 'BUY / LONG' : 'SELL / SHORT'}
                        </Text>
                      </View>
                      <Text style={styles.signalSymbolHeader}>{item.signalData.symbol}</Text>
                      <View style={styles.signalTfChip}>
                        <Text style={styles.signalTfChipText}>{item.signalData.timeframe || '15M'}</Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.signalLiveTag,
                        { backgroundColor: statusMeta.bg, borderColor: statusMeta.color, borderWidth: 1 }
                      ]}
                    >
                      <View style={[styles.signalLiveDot, { backgroundColor: statusMeta.color }]} />
                      <Text style={[styles.signalLiveTagText, { color: statusMeta.color }]}>
                        {statusMeta.label}
                      </Text>
                    </View>
                  </View>

                  {/* 4-Box Matrix Grid: Entry / SL / TP / R:R (Numbers concealed by soft text blur for Free users) */}
                  <View style={styles.signalMatrixGrid}>
                    <View style={styles.signalMatrixBlock}>
                      <Text style={styles.signalMatrixLabel}>ENTRY PRICE</Text>
                      <Text style={[styles.signalMatrixVal, isFreeUser && blurTextStyle]}>{item.signalData.entry}</Text>
                    </View>
                    <View style={[styles.signalMatrixBlock, styles.signalMatrixBlockSL]}>
                      <Text style={[styles.signalMatrixLabel, { color: '#FF6680' }]}>STOP LOSS</Text>
                      <Text style={[styles.signalMatrixVal, { color: '#FF4D6D' }, isFreeUser && blurTextStyle]}>{item.signalData.sl}</Text>
                    </View>
                    <View style={[styles.signalMatrixBlock, styles.signalMatrixBlockTP]}>
                      <Text style={[styles.signalMatrixLabel, { color: '#66FFA3' }]}>TARGET 1</Text>
                      <Text style={[styles.signalMatrixVal, { color: '#00FF66' }, isFreeUser && blurTextStyle]}>{item.signalData.tp1}</Text>
                    </View>
                    <View style={styles.signalMatrixBlock}>
                      <Text style={[styles.signalMatrixLabel, { color: '#FFE600' }]}>R:R RATIO</Text>
                      <Text style={[styles.signalMatrixVal, { color: '#FFE600' }, isFreeUser && blurTextStyle]}>{item.signalData.rr || '1:3.2'}</Text>
                    </View>
                  </View>

                  {/* Runner TP2 (if present) */}
                  {item.signalData.tp2 ? (
                    <View style={styles.signalRunnerRow}>
                      <Ionicons name="flag-outline" size={13} color="#00E5FF" />
                      <Text style={styles.signalRunnerText}>
                        RUNNER TP2: <Text style={[{ color: '#00E5FF', fontWeight: '800' }, isFreeUser && blurTextStyle]}>{item.signalData.tp2}</Text>
                      </Text>
                    </View>
                  ) : null}

                  {/* SMC Technical Rationale (Concealed by soft blur for Free users) */}
                  {item.signalData.notes ? (
                    <View style={styles.signalNotesBox}>
                      <Ionicons name="analytics" size={13} color="#8A9BB4" />
                      <Text style={[styles.signalNotesText, isFreeUser && blurTextStyle]}>{item.signalData.notes}</Text>
                    </View>
                  ) : null}

                  {/* Admin Only: 1-Click Live Signal Status Switcher */}
                  {isCurrentUserAdmin && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 6,
                        marginTop: 10,
                        paddingTop: 8,
                        borderTopWidth: 1,
                        borderTopColor: 'rgba(255,255,255,0.06)',
                      }}
                    >
                      <Text style={{ color: '#64748B', fontSize: 9.5, fontWeight: '900', letterSpacing: 0.6 }}>
                        DESK STATUS:
                      </Text>
                      {[
                        { key: 'EXECUTION', label: 'LIVE', color: '#00FF66' },
                        { key: 'TP1_HIT', label: 'TP1 HIT', color: '#00FF66' },
                        { key: 'BREAKEVEN', label: 'MOVE BE', color: '#00E5FF' },
                        { key: 'TP2_HIT', label: 'TP2 FULL', color: '#FFE600' },
                        { key: 'STOPPED', label: 'CLOSED', color: '#FF3355' },
                      ].map(st => {
                        const activeSt = sigStatus === st.key;
                        return (
                          <TouchableOpacity
                            key={st.key}
                            onPress={() => handleUpdateSignalStatus(item.id, st.key)}
                            style={{
                              backgroundColor: activeSt ? st.color : '#141B29',
                              borderWidth: 1,
                              borderColor: activeSt ? st.color : '#263248',
                              borderRadius: 6,
                              paddingHorizontal: 7,
                              paddingVertical: 3,
                            }}
                          >
                            <Text
                              style={{
                                color: activeSt ? '#000' : '#94A3B8',
                                fontSize: 9.5,
                                fontWeight: '900',
                              }}
                            >
                              {st.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  {/* Signal Action Bar: 1-Click COPY SETUP + ASK SHARK AI */}
                  <View
                    style={[
                      styles.signalFooterRow,
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        marginTop: 10,
                      }
                    ]}
                  >
                    <Text style={styles.signalFooterText}>SHARK QUANT • SMC DESK</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => {
                          if (isFreeUser) {
                            setPlanUpgradeModalVisible(true);
                            showAppToast('Upgrade to VIP to copy institutional setups!');
                            return;
                          }
                          const clipTxt = `${item.signalData.direction} ${item.signalData.symbol} | Entry: ${item.signalData.entry} | SL: ${item.signalData.sl} | TP1: ${item.signalData.tp1}${item.signalData.tp2 ? ' | TP2: ' + item.signalData.tp2 : ''}`;
                          if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                            navigator.clipboard.writeText(clipTxt).catch(() => {});
                          }
                          showAppToast('Signal levels copied to clipboard!');
                        }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          backgroundColor: '#161F30',
                          borderWidth: 1,
                          borderColor: '#2B3A55',
                          borderRadius: 7,
                          paddingHorizontal: 9,
                          paddingVertical: 4,
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="copy-outline" size={12} color="#E2E8F0" />
                        <Text style={{ color: '#E2E8F0', fontSize: 10, fontWeight: '800' }}>COPY SETUP</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          if (isFreeUser) {
                            setPlanUpgradeModalVisible(true);
                            showAppToast('Upgrade to VIP to consult Shark AI on setups!');
                            return;
                          }
                          handleAskAiAboutSignal(item.signalData);
                        }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          backgroundColor: 'rgba(0, 229, 255, 0.14)',
                          borderWidth: 1,
                          borderColor: '#00E5FF',
                          borderRadius: 7,
                          paddingHorizontal: 9,
                          paddingVertical: 4,
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="sparkles" size={12} color="#00E5FF" />
                        <Text style={{ color: '#00E5FF', fontSize: 10, fontWeight: '900' }}>ASK SHARK AI</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })()
          ) : (
            /* Institutional Embed Card (Every message matches the luxury Admin design!) */
            <View
              style={[
                styles.discordEmbedBox,
                isMe
                  ? {
                      borderLeftWidth: 0,
                      borderRightWidth: 4,
                      borderRightColor: embedBorderColor,
                      borderTopColor: '#252F44',
                      borderBottomColor: '#252F44',
                      borderLeftColor: 'transparent',
                      alignSelf: 'flex-end',
                      backgroundColor: '#151926',
                    }
                  : {
                      borderLeftWidth: 4,
                      borderRightWidth: 0,
                      borderLeftColor: embedBorderColor,
                      borderTopColor: '#252F44',
                      borderBottomColor: '#252F44',
                      borderRightColor: '#252F44',
                      alignSelf: 'flex-start',
                      backgroundColor: '#131622',
                    }
              ]}
            >
              {/* Quoted Reply Header Box (Tap to jump back to the original older message!) */}
              {item.replyTo ? (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => {
                    if (item.replyTo.id) {
                      jumpToCommunityMessage(item.replyTo.id);
                    }
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: 'rgba(0, 229, 255, 0.08)',
                    borderLeftWidth: 2.5,
                    borderLeftColor: '#00E5FF',
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 5,
                    marginBottom: 8,
                  }}
                >
                  <Ionicons name="return-down-forward" size={13} color="#00E5FF" />
                  <Text style={{ color: '#00E5FF', fontSize: 11, fontWeight: '900' }}>
                    @{item.replyTo.senderName ||
                      usersDirectory.find(
                        u =>
                          u.username &&
                          item.replyTo.senderUsername &&
                          u.username.toLowerCase() === item.replyTo.senderUsername.toLowerCase()
                      )?.name ||
                      item.replyTo.senderUsername ||
                      'Trader'}:
                  </Text>
                  <Text
                    style={[{ flex: 1, color: '#94A3B8', fontSize: 11, fontWeight: '600' }, isFreeUser && blurTextStyle]}
                    numberOfLines={1}
                  >
                    {item.replyTo.content || 'Attachment'}
                  </Text>
                  <Ionicons name="arrow-up-circle-outline" size={13} color="#00E5FF" />
                </TouchableOpacity>
              ) : null}

              <View style={[styles.discordEmbedTopRow, isMe && { flexDirection: 'row-reverse' }]}>
                <Ionicons
                  name={iconName}
                  size={13}
                  color={embedBorderColor}
                />
                <Text style={[styles.discordEmbedTagTitle, { color: embedBorderColor }]}>
                  {tagTitle}
                </Text>
              </View>

              {/* Attached Chart Image if present (Tap to open Full-Screen Chart Lightbox) */}
              {item.imageData ? (
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => {
                    if (isFreeUser) {
                      setPlanUpgradeModalVisible(true);
                      showAppToast('Upgrade to VIP to view high-resolution charts!');
                      return;
                    }
                    setSelectedLightboxImage({
                      uri: item.imageData.startsWith('/') ? `${BACKEND_URL}${item.imageData}` : item.imageData,
                      author: item.senderName,
                      tag: tagTitle,
                      time: item.time,
                    });
                  }}
                  style={{
                    marginVertical: 6,
                    borderRadius: 10,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: '#263248',
                    backgroundColor: '#090C12',
                    position: 'relative',
                  }}
                >
                  <Image
                    source={{ uri: item.imageData.startsWith('/') ? `${BACKEND_URL}${item.imageData}` : item.imageData }}
                    style={[{ width: 280, height: 175 }, isFreeUser && { filter: 'blur(6px)', WebkitFilter: 'blur(6px)' }]}
                    resizeMode="cover"
                  />
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: 'rgba(9, 12, 18, 0.85)',
                      borderWidth: 1,
                      borderColor: 'rgba(0, 229, 255, 0.45)',
                      borderRadius: 6,
                      paddingHorizontal: 7,
                      paddingVertical: 3,
                    }}
                  >
                    <Ionicons name="expand-outline" size={11} color="#00E5FF" />
                    <Text style={{ color: '#00E5FF', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 }}>
                      EXPAND CHART
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : null}

              {/* Playable Voice Note Card if message contains audio */}
              {item.audioData ? (
                <View style={[styles.voiceNotePlayerCard, isMe && { alignSelf: 'flex-end', borderColor: '#FFE600' }]}>
                  <TouchableOpacity
                    style={[
                      styles.voiceNotePlayCircle,
                      playingAudioId === item.id && styles.voiceNotePlayCircleActive
                    ]}
                    onPress={() => {
                      if (isFreeUser) {
                        setPlanUpgradeModalVisible(true);
                        showAppToast('Upgrade to VIP to listen to trader voice notes!');
                        return;
                      }
                      togglePlayAudio(item.audioData, item.id);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={playingAudioId === item.id ? "pause" : "play"}
                      size={16}
                      color={playingAudioId === item.id ? "#000000" : "#FFE600"}
                    />
                  </TouchableOpacity>
                  <View style={styles.voiceWaveCol}>
                    <View style={[styles.voiceWaveBarsRow, isFreeUser && { filter: 'blur(4px)', WebkitFilter: 'blur(4px)' }]}>
                      {[4, 12, 8, 18, 14, 22, 16, 26, 12, 20, 15, 24, 10, 18, 14, 8, 16, 10, 6].map((h, i) => (
                        <View
                          key={i}
                          style={[
                            styles.voiceWaveSingleBar,
                            { height: h },
                            playingAudioId === item.id && { backgroundColor: i % 2 === 0 ? '#00FF66' : '#FFE600' }
                          ]}
                        />
                      ))}
                    </View>
                    <View style={styles.voiceMetaRow}>
                      <Text style={styles.voiceDurationLabel}>
                        {playingAudioId === item.id ? 'PLAYING...' : (item.audioDuration || '0:10')}
                      </Text>
                      <Text style={styles.voiceLabelSmall}>VOICE NOTE</Text>
                    </View>
                  </View>
                </View>
              ) : null}

              {/* Text message content (with @username resolved to @Display Name, soft text blur for Free users) */}
              {item.content ? (
                <Text
                  style={[
                    styles.discordEmbedBodyText,
                    isMe && { textAlign: 'right' },
                    (item.audioData || item.imageData) && { marginTop: 6 },
                    isFreeUser && blurTextStyle,
                  ]}
                >
                  {renderMessageWithMentions(item.content)}
                </Text>
              ) : null}

              <Text style={[styles.discordEmbedFooterText, isMe && { textAlign: 'right' }]}>
                {footerText}
              </Text>
            </View>
          )}

        {/* Institutional Dynamic Reactions (Cut static 4 empty buttons, only show active + high-end floating palette) + Quoted Reply Button */}
        {(() => {
          const allReactionDefs = [
            { key: 'fire', emoji: '🔥', activeColor: '#FFE600', activeBg: 'rgba(255, 230, 0, 0.16)' },
            { key: 'target', emoji: '🎯', activeColor: '#00E5FF', activeBg: 'rgba(0, 229, 255, 0.16)' },
            { key: 'rocket', emoji: '🚀', activeColor: '#00FF66', activeBg: 'rgba(0, 255, 102, 0.16)' },
            { key: 'blood', emoji: '🩸', activeColor: '#FF3355', activeBg: 'rgba(255, 51, 85, 0.16)' },
          ];

          const activeReactions = allReactionDefs.map(rx => {
            const rxList =
              item.reactions && Array.isArray(item.reactions[rx.key])
                ? item.reactions[rx.key]
                : rx.key === 'fire' && Array.isArray(item.likedBy)
                  ? item.likedBy
                  : [];
            const rxCount = rx.key === 'fire' && rxList.length === 0 ? (item.likes || 0) : rxList.length;
            const isRxActive = Boolean(
              (myEmailLower && rxList.includes(myEmailLower)) ||
              (rx.key === 'fire' && isLikedByMe)
            );
            return { ...rx, rxCount, isRxActive };
          }).filter(rx => rx.rxCount > 0);

          return (
            <View
              style={[
                styles.discordReactionsWrap,
                isMe && !isSignal && { justifyContent: 'flex-end' },
                { position: 'relative', zIndex: isPickerOpen ? 99999 : 10 }
              ]}
            >
              {/* Active Reactions (Rendered ONLY if at least 1 person reacted) */}
              {activeReactions.map(rx => (
                <TouchableOpacity
                  key={rx.key}
                  style={[
                    styles.discordReactionBtn,
                    rx.isRxActive && {
                      backgroundColor: rx.activeBg,
                      borderColor: rx.activeColor,
                    }
                  ]}
                  onPress={() => handleReactCommunityMessage(item.id, rx.key)}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 12 }}>{rx.emoji}</Text>
                  <Text
                    style={[
                      styles.discordReactionNumber,
                      rx.isRxActive && { color: rx.activeColor, fontWeight: '900' }
                    ]}
                  >
                    {rx.rxCount}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Minimalist Quick React Icon Button + High-End Floating Tooltip Anchor */}
              <View style={{ position: 'relative', zIndex: isPickerOpen ? 99999 : 10 }}>
                <TouchableOpacity
                  style={[
                    styles.discordReactionBtn,
                    { paddingHorizontal: 7, paddingVertical: 4.5 },
                    isPickerOpen && { backgroundColor: 'rgba(0, 229, 255, 0.22)', borderColor: '#00E5FF' }
                  ]}
                  onPress={() => {
                    if (isFreeUser) {
                      setPlanUpgradeModalVisible(true);
                      showAppToast('Upgrade to VIP to react and chat in the Community!');
                      return;
                    }
                    setActiveReactionPickerMsgId(isPickerOpen ? null : item.id);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isPickerOpen ? 'close' : 'happy-outline'}
                    size={13}
                    color={isPickerOpen ? '#00E5FF' : '#8A9BB0'}
                  />
                </TouchableOpacity>

                {/* High-End Floating Reaction Tooltip Pill (Telegram / Discord Pro Glassmorphic Capsule) */}
                {isPickerOpen && (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 34,
                      left: isMe && !isSignal ? undefined : -10,
                      right: isMe && !isSignal ? -10 : undefined,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: '#090C14',
                      borderWidth: 1.5,
                      borderColor: '#00E5FF',
                      borderRadius: 24,
                      paddingHorizontal: 8,
                      paddingVertical: 5,
                      shadowColor: '#00E5FF',
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.45,
                      shadowRadius: 14,
                      elevation: 35,
                      zIndex: 99999,
                    }}
                  >
                    {allReactionDefs.map(rx => (
                      <TouchableOpacity
                        key={rx.key}
                        onPress={() => handleReactCommunityMessage(item.id, rx.key)}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 17,
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.08)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        activeOpacity={0.6}
                      >
                        <Text style={{ fontSize: 18 }}>{rx.emoji}</Text>
                      </TouchableOpacity>
                    ))}

                    {/* Downward Pointer Triangle */}
                    <View
                      style={{
                        position: 'absolute',
                        bottom: -5,
                        left: isMe && !isSignal ? undefined : 20,
                        right: isMe && !isSignal ? 20 : undefined,
                        width: 8,
                        height: 8,
                        backgroundColor: '#090C14',
                        borderRightWidth: 1.5,
                        borderBottomWidth: 1.5,
                        borderColor: '#00E5FF',
                        transform: [{ rotate: '45deg' }],
                      }}
                    />
                  </View>
                )}
              </View>

              {/* Quoted Reply Button */}
              <TouchableOpacity
                style={[
                  styles.discordReactionBtn,
                  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4.5 }
                ]}
                onPress={() => {
                  if (isFreeUser) {
                    setPlanUpgradeModalVisible(true);
                    showAppToast('Upgrade to VIP to quote and reply in Community!');
                    return;
                  }
                  setCommunityReplyTo({
                    id: item.id,
                    senderUsername: handleStr,
                    senderName: item.senderName,
                    content: item.content || (item.imageData ? 'Chart Setup Image' : item.audioData ? 'Voice Note' : 'SMC Signal')
                  });
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-undo-outline" size={12} color="#00E5FF" />
                <Text style={{ color: '#00E5FF', fontSize: 10.5, fontWeight: '800' }}>Reply</Text>
              </TouchableOpacity>
            </View>
          );
        })()}
        </View>
      </View>
    );
  };

  if (!currentUser) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: '#06080B', justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="light-content" backgroundColor="#06080B" />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
            width: '100%',
            maxWidth: 460
          }}
        >
          {/* 1. BIG FIERCE SHARK LOGO AT THE TOP */}
          <Image
            source={SHARK_LOGO}
            style={{ width: 190, height: 170, marginBottom: 14 }}
            resizeMode="contain"
          />

          {/* 2. STREET-ART / GRAFFITI ENGLISH TYPOGRAPHY */}
          <View style={{
            backgroundColor: '#FFE600',
            paddingHorizontal: 16,
            paddingVertical: 5,
            borderRadius: 6,
            borderWidth: 2.5,
            borderColor: '#000',
            transform: [{ rotate: '-2.5deg' }],
            marginBottom: 14
          }}>
            <Text style={{
              color: '#000',
              fontFamily: Platform.OS === 'ios' ? 'Impact' : 'monospace',
              fontSize: 12,
              fontWeight: '900',
              letterSpacing: 2
            }}>
              ⚡ STREET LIQUIDITY SYNDICATE // SMC
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <Text style={{
              fontFamily: Platform.OS === 'ios' ? 'Impact' : 'monospace',
              fontSize: 46,
              fontWeight: '900',
              color: '#FFFFFF',
              letterSpacing: 3.5,
              textShadowColor: '#00FF66',
              textShadowOffset: { width: -3, height: 3 },
              textShadowRadius: 1
            }}>
              SHARK
            </Text>
            <Text style={{
              fontFamily: Platform.OS === 'ios' ? 'Impact' : 'monospace',
              fontSize: 46,
              fontWeight: '900',
              color: '#FFE600',
              letterSpacing: 3.5,
              textShadowColor: '#FF0055',
              textShadowOffset: { width: 3, height: 3 },
              textShadowRadius: 1
            }}>
              QUANT
            </Text>
          </View>

          <Text style={{
            fontFamily: Platform.OS === 'ios' ? 'Impact' : 'monospace',
            fontSize: 15,
            fontWeight: '900',
            color: '#00FF66',
            letterSpacing: 2.8,
            textAlign: 'center',
            marginBottom: 6
          }}>
            EAT THE LIQUIDITY • CRUSH THE MARKET
          </Text>
          <Text style={{
            fontSize: 11,
            fontWeight: '800',
            color: '#8E9CB0',
            letterSpacing: 1.8,
            textAlign: 'center',
            marginBottom: 36
          }}>
            WALL STREET QUANT AI • SMART MONEY EXECUTION
          </Text>

          {/* 3. SINGLE STREET GOOGLE SIGN-IN BUTTON (NO INPUT FIELDS ON MAIN SCREEN) */}
          <TouchableOpacity
            style={{
              width: '100%',
              maxWidth: 360,
              backgroundColor: '#00FF66',
              borderWidth: 3,
              borderColor: '#FFE600',
              borderRadius: 16,
              paddingVertical: 16,
              paddingHorizontal: 22,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              shadowColor: '#00FF66',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.45,
              shadowRadius: 18,
              opacity: googleLoading ? 0.7 : 1
            }}
            onPress={handleSupabaseGoogleOAuth}
            disabled={googleLoading}
            activeOpacity={0.85}
          >
            <View style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: '#000',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Ionicons name="logo-google" size={18} color="#FFE600" />
            </View>
            <Text style={{
              color: '#000',
              fontFamily: Platform.OS === 'ios' ? 'Impact' : 'monospace',
              fontSize: 16,
              fontWeight: '900',
              letterSpacing: 1.5
            }}>
              {googleLoading ? 'CONNECTING TO GOOGLE...' : 'CONTINUE WITH GOOGLE'}
            </Text>
          </TouchableOpacity>
        </View>

        {toastText && (
          <View style={styles.floatingToastBox}>
            <Ionicons name="checkmark-circle" size={16} color="#00FF66" />
            <Text style={styles.floatingToastText}>{toastText}</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0C" />

      {/* Header: AI Desk Header vs Discord Channel Header */}
      {activeFloor === 'AI_DESK' ? (
        <View style={styles.header}>
          {/* Left: Brand Logo & Title */}
          <View style={styles.brandContainer}>
            <Image
              source={SHARK_LOGO}
              style={styles.sharkLogoMain}
              resizeMode="contain"
            />
            <View>
              <View style={styles.logoTextRow}>
                <Text style={styles.logoWordWhite}>SHARK</Text>
                <Text style={styles.logoWordYellow}>QUANT</Text>
              </View>
              <Text style={styles.logoTagline}>INSTITUTIONAL QUANT DESK</Text>
            </View>
          </View>

          {/* Right: COMMUNITY Button + Menu Button (3 Bars) */}
          <View style={styles.headerRightControls}>
            <TouchableOpacity
              style={styles.headerCommunityBtn}
              onPress={handleOpenCommunity}
              activeOpacity={0.8}
            >
              <Ionicons name="people" size={15} color="#FFE600" />
              <Text style={styles.headerCommunityText}>COMMUNITY</Text>
              <View style={styles.commFloorBadgePill}>
                <Text style={styles.commFloorBadgePillText}>
                  {`+1,${String(usersDirectory.length || 4).padStart(3, '0')}`}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerMenuBtn}
              onPress={() => setSessionsDrawerOpen(true)}
              accessibilityLabel="Open Sessions Menu"
            >
              <Ionicons name="menu" size={22} color="#00FF66" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* ── COMMUNITY HEADER (Same Unified Navigation Bar with Shark Logo) ── */
        <View style={styles.header}>
          {/* Left: Brand Logo & Title with Real Stacked Members Avatar Row under Logo */}
          <TouchableOpacity
            style={styles.brandContainer}
            onPress={() => setActiveFloor('AI_DESK')}
            activeOpacity={0.8}
          >
            <Image
              source={SHARK_LOGO}
              style={styles.sharkLogoMain}
              resizeMode="contain"
            />
            <View>
              <View style={styles.logoTextRow}>
                <Text style={styles.logoWordWhite}>SHARK</Text>
                <Text style={styles.logoWordYellow}>COMMUNITY</Text>
              </View>

              {/* Sub-Header Stacked Real Avatars Row (Under Logo: Real Photos + +1K Baseline Count) */}
              {(() => {
                const seenKeys = new Set();
                const realTraders = [];
                const addTraderToStack = (t) => {
                  if (!t) return;
                  const key = (t.email || t.username || t.name || '').toLowerCase();
                  if (!key || seenKeys.has(key)) return;
                  seenKeys.add(key);
                  realTraders.push(t);
                };

                if (currentUser) {
                  const dirMe = (usersDirectory || []).find(
                    u => u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase()
                  );
                  addTraderToStack({
                    email: currentUser.email,
                    username: currentUser.username,
                    name: currentUser.name,
                    avatar: dirMe?.avatar || currentUser.avatar,
                    role: currentUser.role,
                    plan: currentUser.plan,
                  });
                }
                (usersDirectory || []).forEach(u => addTraderToStack(u));
                (communityMessages || []).forEach(m => {
                  const matchU = (usersDirectory || []).find(
                    u => (m.senderEmail && u.email && u.email.toLowerCase() === m.senderEmail.toLowerCase())
                  );
                  addTraderToStack({
                    email: m.senderEmail,
                    username: m.senderUsername,
                    name: m.senderName,
                    avatar: matchU?.avatar || m.avatarText,
                    role: m.isAdmin ? 'ADMIN' : 'USER',
                  });
                });

                const realUsersCount = realTraders.length;
                const fallbackProAvatars = [
                  { name: 'Alex Vance', initials: 'AV', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
                  { name: 'David Miller', initials: 'DM', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
                  { name: 'Elena Rostova', initials: 'ER', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80' },
                ];
                let stackedTraders = [...realTraders];
                if (stackedTraders.length < 5) {
                  for (const fb of fallbackProAvatars) {
                    if (stackedTraders.length >= 5) break;
                    stackedTraders.push(fb);
                  }
                }
                const visibleAvatars = stackedTraders.slice(0, 5);
                const displayFormattedTotal = `+1,${String(realUsersCount).padStart(3, '0')}`;

                return (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 8 }}>
                    {/* Stacked Real Profile Images (5 Avatars Crisp & Prominent) */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {visibleAvatars.map((tr, idx) => {
                        const rawAv = tr.avatar;
                        const isImg =
                          rawAv &&
                          typeof rawAv === 'string' &&
                          (rawAv.startsWith('data:') || rawAv.startsWith('http') || rawAv.startsWith('file:') || rawAv.startsWith('/'));
                        const fullImgUri = isImg
                          ? (rawAv.startsWith('/') ? `${BACKEND_URL}${rawAv}` : rawAv)
                          : null;
                        const initials = getTraderInitials(tr.name, tr.email || tr.username);

                        return (
                          <View
                            key={tr.email || tr.username || idx}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 15,
                              marginLeft: idx === 0 ? 0 : -9,
                              backgroundColor: '#0F131C',
                              borderWidth: 2,
                              borderColor: '#06080B',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: idx + 1,
                              overflow: 'hidden',
                            }}
                          >
                            {fullImgUri ? (
                              <Image
                                source={{ uri: fullImgUri }}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="cover"
                              />
                            ) : (
                              <Text style={{ color: '#00FF66', fontSize: 10.5, fontWeight: '900' }}>
                                {initials}
                              </Text>
                            )}
                          </View>
                        );
                      })}

                      {/* Prominent "+1,00X" Capsule (Bigger & Cleaner) */}
                      <View
                        style={{
                          height: 28,
                          paddingHorizontal: 10,
                          borderRadius: 14,
                          marginLeft: visibleAvatars.length > 0 ? -8 : 0,
                          backgroundColor: 'rgba(0, 229, 255, 0.16)',
                          borderWidth: 1.6,
                          borderColor: '#00E5FF',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10,
                        }}
                      >
                        <Text
                          style={{
                            color: '#00E5FF',
                            fontSize: 12,
                            fontWeight: '900',
                            letterSpacing: -0.2,
                          }}
                        >
                          {displayFormattedTotal}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })()}
            </View>
          </TouchableOpacity>

          {/* Right: SHARK DESK Return Button + Sessions Menu (3 Bars) */}
          <View style={styles.headerRightControls}>
            <TouchableOpacity
              style={[
                styles.headerCommunityBtn,
                { borderColor: '#00FF66', backgroundColor: 'rgba(0, 255, 102, 0.08)' }
              ]}
              onPress={() => setActiveFloor('AI_DESK')}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={14} color="#00FF66" />
              <Text style={[styles.headerCommunityText, { color: '#00FF66' }]}>SHARK DESK</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerMenuBtn}
              onPress={() => setSessionsDrawerOpen(true)}
              accessibilityLabel="Open Sessions Menu"
            >
              <Ionicons name="menu" size={22} color="#00FF66" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── DUAL FLOORS: AI QUANT DESK vs COMMUNITY FLOOR ── */}
      {activeFloor === 'AI_DESK' ? (
        <>
          {/* Live Financial Ticker */}
          <View style={styles.tickerStrip}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tickerScroll}>
              {liveTicker.map((t, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.tickerPill}
                  onPress={() => handleSend(`أظهر لي شارت ${t.s} فريم 15 دقيقة`)}
                >
                  <View style={[styles.tickerDot, { backgroundColor: t.up ? '#00FF66' : '#FF0055' }]} />
                  <Text style={styles.tickerSymbol}>{t.s}</Text>
                  <Text style={styles.tickerPrice}>{t.p}</Text>
                  <Text style={t.up ? styles.tickerUp : styles.tickerDown}>{t.c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Chat Messages Viewport */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.chatArea}
          >
            <FlatList
              ref={flatListRef}
              data={activeMessages}
              keyExtractor={(item, idx) => item.id ? String(item.id) : String(idx)}
              renderItem={renderItem}
              style={{ flex: 1, width: '100%' }}
              contentContainerStyle={[styles.listContent, { paddingBottom: 24 }]}
              ListFooterComponent={
                isTyping ? (
                  <View style={{ paddingVertical: 10, paddingHorizontal: 16 }}>
                    <SharkThinkingIndicator />
                  </View>
                ) : (
                  <View style={{ height: 20 }} />
                )
              }
              onContentSizeChange={() => {
                scrollChatToBottom(true);
              }}
              onLayout={() => {
                scrollChatToBottom(false);
              }}
            />

            {selectedImage && (
              <View style={styles.previewBox}>
                <Image source={{ uri: selectedImage.uri }} style={styles.previewImg} />
                <View style={styles.previewInfo}>
                  <Text style={styles.previewText}>Chart screenshot attached</Text>
                  <TouchableOpacity onPress={() => setSelectedImage(null)}>
                    <Text style={styles.previewRemove}>Remove ✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {isRecordingAudio && (
              <View style={styles.recordBar}>
                <View style={styles.recDotGlow} />
                <Text style={styles.recText}>RECORDING AUDIO NOTE... {formatDuration(recordSeconds)}</Text>
                <View style={styles.recActions}>
                  <TouchableOpacity style={styles.recCancelBtn} onPress={cancelAiAudioRecording}>
                    <Text style={styles.recCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.recSendBtn} onPress={finishAiAudioRecording}>
                    <Ionicons name="arrow-up" size={18} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Clean Dropdown (+) Tools Menu */}
            {menuOpen && (
              <TouchableWithoutFeedback onPress={toggleMenu}>
                <View style={styles.menuBackdrop}>
                  <Animated.View
                    style={[
                      styles.popoverMenu,
                      {
                        opacity: menuAnim,
                        transform: [
                          { scale: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
                          { translateY: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
                        ],
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        toggleMenu();
                        startLiveCall();
                      }}
                    >
                      <View style={[styles.menuIconCircle, { backgroundColor: '#00FF66', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ fontSize: 16 }}>📞</Text>
                      </View>
                      <View style={styles.menuItemTextGroup}>
                        <Text style={styles.menuItemTitle}>Live Phone Call (On-Air) 📞</Text>
                        <Text style={styles.menuItemDesc}>Two-way real-time market discussion</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        toggleMenu();
                        setIsRecordingAudio(true);
                      }}
                    >
                      <View style={[styles.menuIconCircle, { backgroundColor: '#00F0FF', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ fontSize: 16 }}>🎙️</Text>
                      </View>
                      <View style={styles.menuItemTextGroup}>
                        <Text style={styles.menuItemTitle}>Record Voice Note 🎙️</Text>
                        <Text style={styles.menuItemDesc}>Leave a quick voice question</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={pickMedia}>
                      <View style={[styles.menuIconCircle, { backgroundColor: '#FFE600', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ fontSize: 16 }}>📸</Text>
                      </View>
                      <View style={styles.menuItemTextGroup}>
                        <Text style={styles.menuItemTitle}>Upload Chart / Screenshot 📸</Text>
                        <Text style={styles.menuItemDesc}>Scan support, resistance & SMC</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        toggleMenu();
                        handleSend("Show me live Gold chart on 1H");
                      }}
                    >
                      <View style={[styles.menuIconCircle, { backgroundColor: '#FF0055', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ fontSize: 16 }}>📈</Text>
                      </View>
                      <View style={styles.menuItemTextGroup}>
                        <Text style={styles.menuItemTitle}>Inject Live Gold Chart 📈</Text>
                        <Text style={styles.menuItemDesc}>Interactive TradingView inside chat</Text>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </TouchableWithoutFeedback>
            )}

            {/* High-Tech Input Bar (Identical to Community Floor) */}
            <View style={styles.discordInputWrapper}>
              <View style={styles.discordInputContainer}>
                {/* Plus Action Button */}
                <TouchableOpacity
                  style={[
                    styles.discordPlusBtn,
                    menuOpen && { backgroundColor: '#00FF66', borderColor: '#00FF66' }
                  ]}
                  onPress={toggleMenu}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 20, fontWeight: '900', color: menuOpen ? '#000000' : '#00FF66', lineHeight: 22 }}>
                    {menuOpen ? '✕' : '+'}
                  </Text>
                </TouchableOpacity>

                {/* Text Input */}
                <TextInput
                  style={styles.discordTextInput}
                  placeholder="Ask about any coin, say 'Show Gold chart', or tap (+)..."
                  placeholderTextColor="#80848E"
                  value={inputMessage}
                  onChangeText={setInputMessage}
                  multiline
                  onKeyPress={(e) => {
                    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                      e.preventDefault?.();
                      handleSend();
                    }
                  }}
                  onSubmitEditing={() => handleSend()}
                />

                {/* Direct Mic Button in AI Desk */}
                <TouchableOpacity
                  style={[
                    styles.discordMicBtn,
                    isRecordingAudio && styles.discordMicBtnRecording
                  ]}
                  onPress={isRecordingAudio ? finishAiAudioRecording : startAiAudioRecording}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 16 }}>
                    {isRecordingAudio ? '⏹️' : '🎙️'}
                  </Text>
                </TouchableOpacity>

                {/* Send Button */}
                <TouchableOpacity
                  style={[
                    styles.discordSendBtn,
                    (inputMessage.trim() || selectedImage) && styles.discordSendBtnActive
                  ]}
                  onPress={() => handleSend()}
                  disabled={!inputMessage.trim() && !selectedImage}
                >
                  <Text style={{ fontSize: 16, color: (inputMessage.trim() || selectedImage) ? '#000000' : '#4E5058', fontWeight: '900' }}>
                    🚀
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </>
      ) : (
        /* ── FLOOR 2: DISCORD MOBILE COMMUNITY FLOOR (#shark-alpha) ── */
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.discordFloorContainer}
        >
          {/* ── DISCORD PRO SEGMENTED SWITCHER (Wide, Balanced Single-Line Bar + Side Search Icon) ── */}
          <View style={styles.communitySegmentTrackWrapper}>
            <View
              style={{
                width: '100%',
                maxWidth: 580,
                alignSelf: 'center',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <View style={styles.communitySegmentTrack}>
                {[
                  { id: 'ALL', label: 'All Chats', icon: 'chatbubbles' },
                  { id: 'ADMIN', label: 'Shark Alpha', icon: 'shield-checkmark' },
                  { id: 'SIGNALS', label: 'SMC Signals', icon: 'trending-up' },
                ].map(tab => {
                  const isActive = communityFilter === tab.id;
                  const hasUnread = tab.id === 'ADMIN' && adminUnreadCount > 0;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      style={[
                        styles.communitySegmentTab,
                        isActive && styles.communitySegmentTabActive,
                      ]}
                      onPress={() => selectFilter(tab.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={tab.icon}
                        size={14}
                        color={isActive ? '#00FF66' : hasUnread ? '#FFE600' : '#8A9BB0'}
                      />
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.communitySegmentTabText,
                          isActive && styles.communitySegmentTabTextActive,
                          hasUnread && !isActive && { color: '#FFE600' }
                        ]}
                      >
                        {tab.label}
                      </Text>

                      {/* Subtle Live Alpha Indicator */}
                      {hasUnread && !isActive && (
                        <View style={styles.communitySegmentUnreadDot} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Compact Side Search Icon Button */}
              <TouchableOpacity
                onPress={() => {
                  setCommunitySearchOpen(prev => {
                    if (prev) setCommunitySearchQuery('');
                    return !prev;
                  });
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: communitySearchOpen ? 'rgba(0, 229, 255, 0.16)' : '#12151E',
                  borderWidth: 1,
                  borderColor: communitySearchOpen ? '#00E5FF' : '#1E2536',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                activeOpacity={0.8}
              >
                <Ionicons name={communitySearchOpen ? 'close' : 'search'} size={16} color="#00E5FF" />
              </TouchableOpacity>
            </View>

            {/* Expandable Search Input (Only shows when clicking the side search icon) */}
            {communitySearchOpen && (
              <View style={{
                width: '100%',
                maxWidth: 580,
                alignSelf: 'center',
                marginTop: 8,
                backgroundColor: '#12151E',
                borderWidth: 1,
                borderColor: '#00E5FF',
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 7,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}>
                <Ionicons name="search" size={14} color="#00E5FF" />
                <TextInput
                  style={{ flex: 1, color: '#FFF', fontSize: 12.5, outlineStyle: 'none' }}
                  placeholder="Search @username, trader name or message..."
                  placeholderTextColor="#64748B"
                  value={communitySearchQuery}
                  onChangeText={setCommunitySearchQuery}
                  autoFocus
                />
                {communitySearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setCommunitySearchQuery('')}>
                    <Ionicons name="close-circle" size={15} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* ── DISCORD-STYLE PINNED ALPHA ANNOUNCEMENT STRIP ── */}
          {latestAdminAlert && (
            <TouchableOpacity
              style={styles.discordPinnedStrip}
              onPress={() => selectFilter('ADMIN')}
              activeOpacity={0.85}
            >
              <View style={styles.discordPinnedLeft}>
                <Ionicons name="pin" size={13} color="#FFE600" />
                <Text style={styles.discordPinnedTitle}>PINNED ALPHA</Text>
                <Text style={styles.discordPinnedSnippet} numberOfLines={1}>
                  {latestAdminAlert.content || 'Institutional order block setup posted'}
                </Text>
              </View>
              <View style={styles.discordPinnedRight}>
                <Text style={styles.discordPinnedViewText}>View</Text>
                <Ionicons name="chevron-forward" size={12} color="#00FF66" />
              </View>
            </TouchableOpacity>
          )}

          {/* Discord Mobile Messages Feed */}
          <FlatList
            ref={communityFlatListRef}
            data={filteredCommunityMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderCommunityMessage}
            contentContainerStyle={styles.discordListContent}
            scrollEventThrottle={16}
            onScroll={(e) => {
              const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
              const distanceFromBottom = contentSize.height - (layoutMeasurement.height + contentOffset.y);
              if (distanceFromBottom > 220) {
                if (!showJumpToBottom) setShowJumpToBottom(true);
              } else if (distanceFromBottom < 60 && !highlightedMsgId) {
                if (showJumpToBottom) setShowJumpToBottom(false);
              }
            }}
            onScrollToIndexFailed={() => {}}
            onContentSizeChange={() => {
              if (!showJumpToBottom && !highlightedMsgId) {
                communityFlatListRef.current?.scrollToEnd({ animated: true });
              }
            }}
            ListHeaderComponent={() => (
              /* Discord Channel Start Banner (Ultra Clean Institutional, Zero Yellow) */
              <View style={styles.discordWelcomeBanner}>
                <View style={[styles.discordHashCircle, { borderColor: '#1E2536', borderWidth: 1.5, backgroundColor: '#12151E' }]}>
                  <Text style={[styles.discordBigHash, { color: '#00E5FF' }]}>#</Text>
                </View>
                <Text style={[styles.discordWelcomeTitle, { color: '#FFFFFF' }]}>WELCOME TO SHARK ALPHA</Text>
                <Text style={styles.discordWelcomeDesc}>
                  This is the start of the #shark-alpha institutional floor. SMC liquidity setups, Order Blocks, and real-time quant discussions.
                </Text>

                {/* Discord Date Divider */}
                <View style={styles.discordDateDivider}>
                  <View style={styles.discordDateLine} />
                  <Text style={styles.discordDateText}>TODAY</Text>
                  <View style={styles.discordDateLine} />
                </View>
              </View>
            )}
          />

          {/* Floating "Return to Latest Messages" Button when viewing older / quoted messages */}
          {showJumpToBottom && (
            <View
              style={{
                alignItems: 'center',
                marginBottom: 8,
                zIndex: 50,
              }}
            >
              <TouchableOpacity
                onPress={returnToLatestMessages}
                activeOpacity={0.85}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                  backgroundColor: '#111726',
                  borderWidth: 1.5,
                  borderColor: '#00E5FF',
                  borderRadius: 20,
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  shadowColor: '#00E5FF',
                  shadowOpacity: 0.35,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Ionicons name="arrow-down-circle" size={16} color="#00E5FF" />
                <Text
                  style={{
                    color: '#00E5FF',
                    fontSize: 11.5,
                    fontWeight: '900',
                    letterSpacing: 0.5,
                  }}
                >
                  RETURN TO LATEST MESSAGES
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Discord Mobile Floating Input Bar (Or VIP Locked Bar for Free Users / Suspended Bar) */}
          {(() => {
            if (currentUser?.status === 'Suspended' || currentUser?.isBlocked) {
              return (
                <View style={styles.communityLockedWrapper}>
                  <View style={[styles.communityLockedBar, { borderColor: '#FF0055', backgroundColor: 'rgba(255,0,85,0.12)' }]}>
                    <View style={styles.communityLockedContent}>
                      <View style={[styles.communityLockedIconCircle, { backgroundColor: 'rgba(255,0,85,0.2)' }]}>
                        <Ionicons name="ban" size={17} color="#FF0055" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.communityLockedTitle, { color: '#FF4D88', letterSpacing: 0.5 }]}>
                          ACCOUNT RESTRICTED • READ-ONLY MODE
                        </Text>
                        <Text style={styles.communityLockedSub}>
                          Posting in the syndicate floor has been temporarily suspended by Desk Admin.
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            }

            const userPlanRaw = (currentUser?.plan || 'free').toLowerCase();
            const isVipUser = userPlanRaw.includes('vip') || userPlanRaw.includes('lifetime');
            const isPremiumUser = userPlanRaw.includes('premium') || userPlanRaw.includes('pro') || userPlanRaw.includes('shark partner');
            const isCurrentUserAdmin = String(currentUser?.role || '').toUpperCase() === 'ADMIN';
            const isFreeUser = !isVipUser && !isPremiumUser && !isCurrentUserAdmin;

            if (isFreeUser) {
              return (
                <View style={styles.discordInputWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.discordInputContainer,
                      {
                        borderColor: 'rgba(255, 230, 0, 0.35)',
                        backgroundColor: '#151924',
                      },
                    ]}
                    onPress={() => setPlanUpgradeModalVisible(true)}
                    activeOpacity={0.85}
                  >
                    {/* Same '+' Button as normal input bar */}
                    <View style={[styles.discordPlusBtn, { opacity: 0.55 }]}>
                      <Ionicons name="add" size={20} color="#B5BAC1" />
                    </View>

                    {/* Locked Text Input Area with Lock Icon + Upgrade Explanation next to it */}
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        paddingVertical: 4,
                      }}
                    >
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: 'rgba(255, 230, 0, 0.16)',
                          borderWidth: 1,
                          borderColor: 'rgba(255, 230, 0, 0.45)',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Ionicons name="lock-closed" size={13} color="#FFE600" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: '#E2E8F0',
                            fontSize: 12,
                            fontWeight: '800',
                          }}
                          numberOfLines={1}
                        >
                          Message #shark-alpha{' '}
                          <Text style={{ color: '#FFE600', fontWeight: '900', fontSize: 11 }}>
                            • Upgrade to VIP / Premium to unlock chat
                          </Text>
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          backgroundColor: '#FFE600',
                          paddingHorizontal: 9,
                          paddingVertical: 4,
                          borderRadius: 12,
                        }}
                      >
                        <Ionicons name="flash" size={11} color="#000" />
                        <Text style={{ color: '#000', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 }}>
                          UPGRADE
                        </Text>
                      </View>
                    </View>

                    {/* Same Mic Button as normal input bar */}
                    <View style={[styles.discordMicBtn, { opacity: 0.55 }]}>
                      <Ionicons name="mic" size={18} color="#80848E" />
                    </View>

                    {/* Same Send Arrow Button as normal input bar */}
                    <View style={[styles.discordSendBtn, { opacity: 0.55 }]}>
                      <Ionicons name="arrow-up" size={18} color="#4E5058" />
                    </View>
                  </TouchableOpacity>
                </View>
              );
            }

            // Detect if user is typing @mention to show quick @username Tag Autocomplete
            const mentionMatch = communityChatInput.match(/@([a-zA-Z0-9_]*)$/);
            const mentionQuery = mentionMatch ? mentionMatch[1].toLowerCase() : null;
            const mentionSuggestions = mentionQuery !== null
              ? usersDirectory.filter(u =>
                  (u.username || '').toLowerCase().includes(mentionQuery) ||
                  (u.name || '').toLowerCase().includes(mentionQuery)
                ).slice(0, 6)
              : [];

            // Display typing indicator strictly when OTHER floor traders are typing (standard Telegram/Discord behavior)
            const seenTypers = new Set();
            const dedupedTypers = (communityTypingUsers || []).filter(t => {
              if (t.clientId && t.clientId === myCommunityClientId) return false;
              const k = (t.name || t.username || '').toLowerCase().trim();
              if (!k || seenTypers.has(k)) return false;
              seenTypers.add(k);
              return true;
            });

            return (
              <View style={styles.discordInputWrapper}>
                {/* ✍️ Live Floor Typing Indicator (Smartly formatted for 1, 2, 3, or 100+ Traders) */}
                {dedupedTypers.length > 0 && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 7,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      marginBottom: 5,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3.5 }}>
                      <Animated.View
                        style={{
                          width: 5.5,
                          height: 5.5,
                          borderRadius: 3,
                          backgroundColor: '#00FF66',
                          opacity: typingDot1,
                        }}
                      />
                      <Animated.View
                        style={{
                          width: 5.5,
                          height: 5.5,
                          borderRadius: 3,
                          backgroundColor: '#00FF66',
                          opacity: typingDot2,
                        }}
                      />
                      <Animated.View
                        style={{
                          width: 5.5,
                          height: 5.5,
                          borderRadius: 3,
                          backgroundColor: '#00FF66',
                          opacity: typingDot3,
                        }}
                      />
                    </View>
                    <Ionicons name="pencil" size={11} color="#00FF66" />
                    <Text
                      style={{
                        color: '#94A3B8',
                        fontSize: 11,
                        fontWeight: '700',
                        letterSpacing: 0.2,
                      }}
                      numberOfLines={1}
                    >
                      <Text style={{ color: '#00FF66', fontWeight: '800' }}>
                        {formatTypingText(dedupedTypers)}
                      </Text>
                    </Text>
                  </View>
                )}

                {/* @username Tag Autocomplete Bar (100% English) */}
                {mentionSuggestions.length > 0 && (
                  <View style={{
                    backgroundColor: '#111726',
                    borderWidth: 1,
                    borderColor: '#00E5FF',
                    borderRadius: 10,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}>
                    <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>QUICK @TAG:</Text>
                    {mentionSuggestions.map(u => (
                      <TouchableOpacity
                        key={u.email}
                        onPress={() => {
                          setCommunityChatInput(prev => prev.replace(/@([a-zA-Z0-9_]*)$/, `@${u.username} `));
                        }}
                        style={{
                          backgroundColor: 'rgba(0, 229, 255, 0.14)',
                          borderWidth: 1,
                          borderColor: '#00E5FF',
                          borderRadius: 12,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                        }}
                      >
                        <Text style={{ color: '#00E5FF', fontSize: 11, fontWeight: '800' }}>
                          {u.name} (@{u.username})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Quoted Reply Banner (Replying to Trader Display Name) */}
                {communityReplyTo && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#121826',
                      borderWidth: 1,
                      borderColor: '#00E5FF',
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      marginBottom: 8,
                      gap: 8,
                    }}
                  >
                    <Ionicons name="return-down-forward" size={15} color="#00E5FF" />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#00E5FF', fontSize: 11, fontWeight: '900' }}>
                        Replying to {communityReplyTo.senderName || communityReplyTo.senderUsername}
                      </Text>
                      <Text style={{ color: '#94A3B8', fontSize: 11 }} numberOfLines={1}>
                        {communityReplyTo.content}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setCommunityReplyTo(null)} style={{ padding: 4 }}>
                      <Ionicons name="close" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Attached Chart Image Preview Bar */}
                {communityImageAttachment && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#121826',
                      borderWidth: 1.5,
                      borderColor: '#00FF66',
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      marginBottom: 8,
                      gap: 10,
                    }}
                  >
                    <Image
                      source={{ uri: communityImageAttachment.uri }}
                      style={{ width: 42, height: 32, borderRadius: 6, backgroundColor: '#090C12' }}
                      resizeMode="cover"
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#00FF66', fontSize: 11.5, fontWeight: '900' }}>
                        CHART SCREENSHOT ATTACHED
                      </Text>
                      <Text style={{ color: '#94A3B8', fontSize: 10.5 }}>
                        Ready to post to #shark-alpha
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setCommunityImageAttachment(null)} style={{ padding: 4 }}>
                      <Ionicons name="close" size={16} color="#FF4D6D" />
                    </TouchableOpacity>
                  </View>
                )}

                {/* '+' Composer Action Popover (Chart Upload for All + Alpha/Signal Strictly for ADMIN) */}
                {adminTypeMenuOpen && (
                  <View style={styles.adminComposerPopover}>
                    {/* Option 1: Upload Chart Image (Available to All Unlocked Members & Admins) */}
                    <TouchableOpacity
                      style={styles.adminComposerOption}
                      onPress={pickCommunityImage}
                    >
                      <Ionicons name="image-outline" size={17} color="#00E5FF" />
                      <View style={{ marginLeft: 10 }}>
                        <Text style={[styles.adminComposerOptionTitle, { color: '#00E5FF' }]}>
                          Upload Chart Screenshot
                        </Text>
                        <Text style={styles.adminComposerOptionDesc}>
                          Attach a chart image from your device to discuss with the floor
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Option 2: Standard Floor Chat */}
                    <TouchableOpacity
                      style={[
                        styles.adminComposerOption,
                        adminComposerMode === 'NORMAL' && styles.adminComposerOptionActive,
                        !isCurrentUserAdmin && { borderBottomWidth: 0 }
                      ]}
                      onPress={() => {
                        setAdminComposerMode('NORMAL');
                        setIsAdminBroadcastMode(false);
                        setAdminTypeMenuOpen(false);
                      }}
                    >
                      <Ionicons name="chatbubbles-outline" size={16} color="#B5BAC1" />
                      <View style={{ marginLeft: 10 }}>
                        <Text style={styles.adminComposerOptionTitle}>Standard Floor Chat</Text>
                        <Text style={styles.adminComposerOptionDesc}>Post in #all-chats discussion feed</Text>
                      </View>
                    </TouchableOpacity>

                    {/* Option 3 & 4: Strictly Visible ONLY to Verified Database Admins (role === 'ADMIN') */}
                    {isCurrentUserAdmin && (
                      <>
                        <TouchableOpacity
                          style={[
                            styles.adminComposerOption,
                            adminComposerMode === 'ALPHA' && styles.adminComposerOptionActive
                          ]}
                          onPress={() => {
                            setAdminComposerMode('ALPHA');
                            setIsAdminBroadcastMode(true);
                            setAdminTypeMenuOpen(false);
                          }}
                        >
                          <Ionicons name="shield-checkmark" size={16} color="#00FF66" />
                          <View style={{ marginLeft: 10 }}>
                            <Text style={[styles.adminComposerOptionTitle, { color: '#00FF66' }]}>
                              Shark Alpha Broadcast (Admin)
                            </Text>
                            <Text style={styles.adminComposerOptionDesc}>
                              Post official institutional announcement in All Chats & Shark Alpha
                            </Text>
                          </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.adminComposerOption,
                            { borderBottomWidth: 0 }
                          ]}
                          onPress={() => {
                            setAdminTypeMenuOpen(false);
                            setSignalModalOpen(true);
                          }}
                        >
                          <Ionicons name="trending-up" size={16} color="#FFE600" />
                          <View style={{ marginLeft: 10 }}>
                            <Text style={[styles.adminComposerOptionTitle, { color: '#FFE600' }]}>
                              Broadcast SMC Trade Signal (Admin)
                            </Text>
                            <Text style={styles.adminComposerOptionDesc}>
                              Open institutional signal execution form (Entry / SL / TP)
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                )}

                {/* Active Alpha Composer Indicator Pill */}
                {isCurrentUserAdmin && adminComposerMode === 'ALPHA' && (
                  <View style={styles.adminActiveBannerStrip}>
                    <Ionicons name="shield-checkmark" size={13} color="#00FF66" />
                    <Text style={styles.adminActiveBannerText}>SHARK ALPHA BROADCAST ACTIVE</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setAdminComposerMode('NORMAL');
                        setIsAdminBroadcastMode(false);
                      }}
                      style={{ padding: 2 }}
                    >
                      <Ionicons name="close-circle" size={15} color="#80848E" />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Attached Audio Preview Chip in Community */}
                {communityAudioAttachment && (
                  <View style={styles.communityAudioAttachedBar}>
                    <TouchableOpacity
                      style={styles.communityAudioAttachedPlay}
                      onPress={() => togglePlayAudio(communityAudioAttachment.uri, 'draft_community')}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={playingAudioId === 'draft_community' ? "pause" : "play"}
                        size={14}
                        color="#000"
                      />
                    </TouchableOpacity>
                    <Text style={styles.communityAudioAttachedText}>
                      VOICE NOTE ATTACHED ({communityAudioAttachment.duration})
                    </Text>
                    <TouchableOpacity
                      onPress={() => setCommunityAudioAttachment(null)}
                      style={styles.communityAudioAttachedRemove}
                    >
                      <Ionicons name="close" size={16} color="#FF4D6D" />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Live Community Audio Recording Bar */}
                {isCommunityRecording && (
                  <View style={styles.communityRecordingBanner}>
                    <View style={styles.recDotGlow} />
                    <Text style={styles.communityRecordingTimer}>
                      RECORDING VOICE NOTE... {formatDuration(communityRecordSeconds)}
                    </Text>
                    <View style={styles.recActions}>
                      <TouchableOpacity
                        style={styles.recCancelBtn}
                        onPress={cancelCommunityAudioRecording}
                      >
                        <Text style={styles.recCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.recSendBtn}
                        onPress={finishCommunityAudioRecording}
                      >
                        <Ionicons name="checkmark" size={18} color="#000" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <View style={styles.discordInputContainer}>
                  {/* '+' Composer Menu Toggle Button */}
                  <TouchableOpacity
                    style={[
                      styles.discordPlusBtn,
                      ((isCurrentUserAdmin && adminComposerMode === 'ALPHA') || adminTypeMenuOpen) && styles.discordPlusBtnAdmin
                    ]}
                    onPress={() => setAdminTypeMenuOpen(!adminTypeMenuOpen)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 18, fontWeight: '900', color: ((isCurrentUserAdmin && adminComposerMode === 'ALPHA') || adminTypeMenuOpen) ? '#000000' : '#B5BAC1' }}>
                      {isCurrentUserAdmin && adminComposerMode === 'ALPHA' ? '🛡️' : (adminTypeMenuOpen ? '✕' : '+')}
                    </Text>
                  </TouchableOpacity>

                  {/* Discord Text Input */}
                  <TextInput
                    style={styles.discordTextInput}
                    placeholder={
                      isCurrentUserAdmin && isAdminBroadcastMode
                        ? 'Broadcast official #shark-alpha announcement...'
                        : 'Message #shark-alpha'
                    }
                    placeholderTextColor="#80848E"
                    value={communityChatInput}
                    onChangeText={handleCommunityChatInputChange}
                    multiline
                    onKeyPress={(e) => {
                      if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                        e.preventDefault?.();
                        handleSendCommunityMessage();
                      }
                    }}
                    onSubmitEditing={() => handleSendCommunityMessage()}
                  />

                  {/* Direct Voice Note Mic Button in Community Floor */}
                  <TouchableOpacity
                    style={[
                      styles.discordMicBtn,
                      isCommunityRecording && styles.discordMicBtnRecording,
                      communityAudioAttachment && styles.discordMicBtnHasAudio
                    ]}
                    onPress={isCommunityRecording ? finishCommunityAudioRecording : startCommunityAudioRecording}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 16 }}>
                      {isCommunityRecording ? '⏹️' : (communityAudioAttachment ? '✅' : '🎙️')}
                    </Text>
                  </TouchableOpacity>

                  {/* Discord Send Button (Sends Text, Image, or Audio) */}
                  <TouchableOpacity
                    style={[
                      styles.discordSendBtn,
                      (communityChatInput.trim() || communityAudioAttachment || communityImageAttachment) && styles.discordSendBtnActive
                    ]}
                    onPress={() => handleSendCommunityMessage()}
                    disabled={!communityChatInput.trim() && !communityAudioAttachment && !communityImageAttachment}
                  >
                    <Text style={{ fontSize: 16, color: (communityChatInput.trim() || communityAudioAttachment || communityImageAttachment) ? '#000000' : '#4E5058', fontWeight: '900' }}>
                      🚀
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })()}
        </KeyboardAvoidingView>
      )}

      {/* ── SMC SIGNAL CREATOR MODAL (100% ENGLISH • ADMIN ONLY) ── */}
      <Modal visible={signalModalOpen} transparent animationType="slide">
        <View style={styles.signalModalOverlay}>
          <View style={styles.signalModalContent}>
            {/* Header */}
            <View style={styles.signalModalHeader}>
              <View style={styles.signalModalHeaderLeft}>
                <Image source={SHARK_LOGO} style={styles.signalModalSharkLogo} resizeMode="contain" />
                <View>
                  <Text style={styles.signalModalTitle}>SMC TRADE EXECUTION</Text>
                  <Text style={styles.signalModalSubtitle}>Broadcast institutional setup to #smc-signals</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setSignalModalOpen(false)}
                style={styles.signalModalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#80848E" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 520 }} showsVerticalScrollIndicator={false}>
              {/* Direction Switcher (BUY vs SELL) */}
              <View style={styles.signalDirectionSwitchRow}>
                <TouchableOpacity
                  style={[
                    styles.signalDirToggleBtn,
                    signalDirection === 'BUY' && styles.signalDirToggleBtnBuy
                  ]}
                  onPress={() => setSignalDirection('BUY')}
                >
                  <Ionicons name="trending-up" size={16} color={signalDirection === 'BUY' ? '#000' : '#00FF66'} />
                  <Text style={[styles.signalDirToggleText, signalDirection === 'BUY' && { color: '#000' }]}>
                    BUY / LONG
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.signalDirToggleBtn,
                    signalDirection === 'SELL' && styles.signalDirToggleBtnSell
                  ]}
                  onPress={() => setSignalDirection('SELL')}
                >
                  <Ionicons name="trending-down" size={16} color={signalDirection === 'SELL' ? '#fff' : '#FF3355'} />
                  <Text style={[styles.signalDirToggleText, signalDirection === 'SELL' && { color: '#fff' }]}>
                    SELL / SHORT
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Asset Quick Chips */}
              <Text style={styles.signalFieldLabel}>ASSET SYMBOL</Text>
              <View style={styles.signalSymbolChipsRow}>
                {['XAUUSD', 'BTCUSDT', 'ETHUSDT', 'EURUSD', 'SOLUSDT'].map(sym => (
                  <TouchableOpacity
                    key={sym}
                    style={[
                      styles.signalSymbolChip,
                      signalSymbol === sym && styles.signalSymbolChipActive
                    ]}
                    onPress={() => setSignalSymbol(sym)}
                  >
                    <Text
                      style={[
                        styles.signalSymbolChipText,
                        signalSymbol === sym && styles.signalSymbolChipTextActive
                      ]}
                    >
                      {sym}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.signalModalInput}
                value={signalSymbol}
                onChangeText={setSignalSymbol}
                placeholder="Symbol (e.g. XAUUSD)"
                placeholderTextColor="#657285"
              />

              {/* Entry & Stop Loss Row */}
              <View style={styles.signalTwoColRow}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <Text style={styles.signalFieldLabel}>ENTRY PRICE</Text>
                  <TextInput
                    style={styles.signalModalInput}
                    value={signalEntry}
                    onChangeText={setSignalEntry}
                    placeholder="e.g. 4,068.50"
                    placeholderTextColor="#657285"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <Text style={[styles.signalFieldLabel, { color: '#FF6680' }]}>STOP LOSS</Text>
                  <TextInput
                    style={[styles.signalModalInput, { borderColor: '#FF3355' }]}
                    value={signalSL}
                    onChangeText={setSignalSL}
                    placeholder="e.g. 4,058.00"
                    placeholderTextColor="#657285"
                  />
                </View>
              </View>

              {/* Take Profit 1 & Take Profit 2 Row */}
              <View style={styles.signalTwoColRow}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <Text style={[styles.signalFieldLabel, { color: '#00FF66' }]}>TARGET 1 (TP1)</Text>
                  <TextInput
                    style={[styles.signalModalInput, { borderColor: '#00FF66' }]}
                    value={signalTP1}
                    onChangeText={setSignalTP1}
                    placeholder="e.g. 4,095.00"
                    placeholderTextColor="#657285"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <Text style={[styles.signalFieldLabel, { color: '#00E5FF' }]}>TARGET 2 (RUNNER TP2)</Text>
                  <TextInput
                    style={[styles.signalModalInput, { borderColor: '#00E5FF' }]}
                    value={signalTP2}
                    onChangeText={setSignalTP2}
                    placeholder="e.g. 4,115.00"
                    placeholderTextColor="#657285"
                  />
                </View>
              </View>

              {/* Notes / Rationale */}
              <Text style={styles.signalFieldLabel}>SMC TECHNICAL RATIONALE</Text>
              <TextInput
                style={[styles.signalModalInput, { height: 60 }]}
                value={signalNotes}
                onChangeText={setSignalNotes}
                placeholder="e.g. Liquidity sweep below 4060 with bullish FVG confirmation"
                placeholderTextColor="#657285"
                multiline
              />

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.signalSubmitBtn}
                onPress={handleSendSignal}
                activeOpacity={0.8}
              >
                <Ionicons name="paper-plane" size={17} color="#000" />
                <Text style={styles.signalSubmitBtnText}>BROADCAST TO SMC SIGNALS</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── MESSAGE ACTIONS & ADMIN MODERATION SHEET (100% ENGLISH • ROLE-GATED) ── */}
      <Modal visible={adminActionSheetOpen} transparent animationType="fade">
        <View style={styles.adminActionSheetOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setAdminActionSheetOpen(false)}
          />
          <View style={styles.adminActionSheetContent}>
            <View style={styles.adminActionSheetHeader}>
              <Text style={styles.adminActionSheetTitle}>
                {String(currentUser?.role || '').toUpperCase() === 'ADMIN'
                  ? 'DESK ADMIN MODERATION'
                  : 'MESSAGE OPTIONS'}
              </Text>
              <Text style={styles.adminActionSheetUser}>
                Author: {selectedMsgForAdminAction?.senderName || 'Trader'}
              </Text>
            </View>

            {/* Pin & Block: Strictly Visible ONLY to Verified Admins (role === 'ADMIN') */}
            {String(currentUser?.role || '').toUpperCase() === 'ADMIN' && (
              <>
                <TouchableOpacity
                  style={styles.adminActionRow}
                  onPress={() => handlePinMessage(selectedMsgForAdminAction)}
                >
                  <Ionicons name="pin" size={18} color="#FFE600" />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.adminActionRowText}>Pin Message to Channel Top</Text>
                    <Text style={styles.adminActionRowSub}>Display as a highlighted banner for all floor members</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.adminActionRow}
                  onPress={() => handleBlockUser(selectedMsgForAdminAction?.senderName)}
                >
                  <Ionicons name="ban" size={18} color="#FF3355" />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={[styles.adminActionRowText, { color: '#FF3355' }]}>Restrict & Block User</Text>
                    <Text style={styles.adminActionRowSub}>Hide messages and suspend floor posting privileges</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}

            {/* Delete Message (Available to Admin for any message, or to Author for their own message) */}
            <TouchableOpacity
              style={[styles.adminActionRow, { borderBottomWidth: 0 }]}
              onPress={() => handleDeleteMessage(selectedMsgForAdminAction?.id)}
            >
              <Ionicons name="trash-outline" size={18} color="#FF6680" />
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.adminActionRowText, { color: '#FF6680' }]}>Delete Message Permanently</Text>
                <Text style={styles.adminActionRowSub}>Remove immediately from the community floor feed</Text>
              </View>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.adminActionCancelBtn}
              onPress={() => setAdminActionSheetOpen(false)}
            >
              <Text style={styles.adminActionCancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── TRADER IDENTITY POPUP CARD (OPENS WHEN TAPPING A TRADER'S NAME OR AVATAR IN COMMUNITY) ── */}
      <Modal visible={Boolean(selectedTraderProfile)} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                maxWidth: 370,
                backgroundColor: '#0B0E15',
                borderWidth: 1.5,
                borderColor: selectedTraderProfile?.isAdmin ? '#00FF66' : '#1E293B',
                borderRadius: 20,
                padding: 22,
                alignItems: 'center',
              },
            ]}
          >
            {/* Top Close Button */}
            <TouchableOpacity
              onPress={() => setSelectedTraderProfile(null)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: '#141923',
                borderWidth: 1,
                borderColor: '#232D3F',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="close" size={16} color="#94A3B8" />
            </TouchableOpacity>

            {/* Avatar Circle */}
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: '#121824',
                borderWidth: 2,
                borderColor: selectedTraderProfile?.isAdmin ? '#00FF66' : '#FFE600',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                marginBottom: 12,
              }}
            >
              {selectedTraderProfile?.avatar &&
              (selectedTraderProfile.avatar.startsWith('data:') ||
                selectedTraderProfile.avatar.startsWith('http') ||
                selectedTraderProfile.avatar.startsWith('file:')) ? (
                <Image
                  source={{ uri: selectedTraderProfile.avatar }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <Text
                  style={{
                    color: selectedTraderProfile?.isAdmin ? '#00FF66' : '#FFE600',
                    fontSize: 22,
                    fontWeight: '900',
                    letterSpacing: 1,
                  }}
                >
                  {getTraderInitials(selectedTraderProfile?.name, selectedTraderProfile?.username)}
                </Text>
              )}
            </View>

            {/* Display Name */}
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 18,
                fontWeight: '900',
                letterSpacing: 0.4,
              }}
            >
              {selectedTraderProfile?.name || 'Trader'}
            </Text>

            {/* Unique @Username Pill */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                backgroundColor: 'rgba(0, 229, 255, 0.12)',
                borderWidth: 1,
                borderColor: 'rgba(0, 229, 255, 0.4)',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 4,
                marginTop: 6,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#00E5FF', fontSize: 13, fontWeight: '900', letterSpacing: 0.3 }}>
                @{selectedTraderProfile?.username || 'trader'}
              </Text>
            </View>

            {/* Info Rows: Role (Admin/Moderator vs Member) & Membership Plan */}
            <View
              style={{
                width: '100%',
                backgroundColor: '#07090E',
                borderWidth: 1,
                borderColor: '#192231',
                borderRadius: 14,
                padding: 14,
                gap: 12,
                marginBottom: 16,
              }}
            >
              {/* Role / Authority Row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#64748B', fontSize: 10.5, fontWeight: '800', letterSpacing: 0.8 }}>
                  SYNDICATE ROLE
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                    backgroundColor: selectedTraderProfile?.isAdmin
                      ? 'rgba(0, 255, 102, 0.14)'
                      : 'rgba(148, 163, 184, 0.12)',
                    borderWidth: 1,
                    borderColor: selectedTraderProfile?.isAdmin ? '#00FF66' : '#334155',
                    paddingHorizontal: 9,
                    paddingVertical: 3,
                    borderRadius: 8,
                  }}
                >
                  <Ionicons
                    name={selectedTraderProfile?.isAdmin ? 'shield-checkmark' : 'person'}
                    size={12}
                    color={selectedTraderProfile?.isAdmin ? '#00FF66' : '#94A3B8'}
                  />
                  <Text
                    style={{
                      color: selectedTraderProfile?.isAdmin ? '#00FF66' : '#E2E8F0',
                      fontSize: 10.5,
                      fontWeight: '900',
                      letterSpacing: 0.4,
                    }}
                  >
                    {selectedTraderProfile?.roleTitle || 'FLOOR TRADER'}
                  </Text>
                </View>
              </View>

              {/* Divider */}
              <View style={{ height: 1, backgroundColor: '#141B28' }} />

              {/* Membership Plan Row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#64748B', fontSize: 10.5, fontWeight: '800', letterSpacing: 0.8 }}>
                  MEMBERSHIP PLAN
                </Text>
                <View
                  style={{
                    backgroundColor:
                      selectedTraderProfile?.plan === 'PREMIUM'
                        ? '#00FF66'
                        : selectedTraderProfile?.plan === 'VIP'
                          ? '#FFE600'
                          : '#334155',
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      color:
                        selectedTraderProfile?.plan === 'PREMIUM' || selectedTraderProfile?.plan === 'VIP'
                          ? '#000000'
                          : '#FFFFFF',
                      fontSize: 10.5,
                      fontWeight: '900',
                      letterSpacing: 0.5,
                    }}
                  >
                    {selectedTraderProfile?.plan || 'VIP'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons: @Tag Trader in Chat + Close */}
            <View style={{ flexDirection: 'row', width: '100%', gap: 10 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  backgroundColor: '#00E5FF',
                  borderRadius: 10,
                  paddingVertical: 11,
                }}
                onPress={() => {
                  const handle = selectedTraderProfile?.username || 'trader';
                  const mention = `@${handle} `;
                  setCommunityChatInput(prev =>
                    prev.includes(mention) ? prev : `${prev}${prev && !prev.endsWith(' ') ? ' ' : ''}${mention}`
                  );
                  setSelectedTraderProfile(null);
                  showAppToast(`Tagged @${handle}`);
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="at" size={16} color="#000" />
                <Text style={{ color: '#000', fontSize: 12, fontWeight: '900', letterSpacing: 0.5 }}>
                  TAG IN CHAT
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  paddingHorizontal: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#141923',
                  borderWidth: 1,
                  borderColor: '#232D3F',
                  borderRadius: 10,
                  paddingVertical: 11,
                }}
                onPress={() => setSelectedTraderProfile(null)}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '800' }}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── FULL-SCREEN HIGH-RES CHART LIGHTBOX MODAL ── */}
      <Modal
        visible={selectedLightboxImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedLightboxImage(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(5, 7, 11, 0.94)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
          }}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setSelectedLightboxImage(null)}
          />
          <View
            style={{
              width: '100%',
              maxWidth: 780,
              backgroundColor: '#0B0E17',
              borderWidth: 1.5,
              borderColor: '#1E293B',
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            {/* Lightbox Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#161F30',
                backgroundColor: '#0E131F',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="stats-chart" size={15} color="#00E5FF" />
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 0.4 }}>
                  {selectedLightboxImage?.author || 'SHARK QUANT'}
                </Text>
                <View
                  style={{
                    backgroundColor: 'rgba(0, 229, 255, 0.14)',
                    borderWidth: 1,
                    borderColor: '#00E5FF',
                    borderRadius: 6,
                    paddingHorizontal: 7,
                    paddingVertical: 2,
                  }}
                >
                  <Text style={{ color: '#00E5FF', fontSize: 9.5, fontWeight: '900' }}>
                    {selectedLightboxImage?.tag || '#CHART_SETUP'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedLightboxImage(null)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: '#182132',
                  borderWidth: 1,
                  borderColor: '#2A374E',
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                }}
              >
                <Ionicons name="close" size={14} color="#E2E8F0" />
                <Text style={{ color: '#E2E8F0', fontSize: 11, fontWeight: '800' }}>CLOSE</Text>
              </TouchableOpacity>
            </View>

            {/* High-Res Chart Image Area */}
            {selectedLightboxImage?.uri ? (
              <Image
                source={{ uri: selectedLightboxImage.uri }}
                style={{ width: '100%', height: 440, backgroundColor: '#06080C' }}
                resizeMode="contain"
              />
            ) : null}
          </View>
        </View>
      </Modal>

      {/* ── INSTITUTIONAL COMMAND DRAWER (ENGLISH & MINIMALIST) ── */}
      <Modal visible={sessionsDrawerOpen} transparent animationType="fade">
        <View style={styles.appleDrawerBackdrop}>
          {/* Dismiss backdrop on click outside */}
          <TouchableOpacity
            style={styles.appleBackdropDismiss}
            activeOpacity={1}
            onPress={() => setSessionsDrawerOpen(false)}
          />
          <View style={styles.appleDrawerContainer}>
            {/* 1. Header Bar: Brand + Close */}
            <View style={styles.drawerTopHeaderBar}>
              <View style={styles.drawerTopHeaderLeft}>
                <Image source={SHARK_LOGO} style={styles.drawerSharkLogoIcon} resizeMode="contain" />
                <View>
                  <Text style={styles.drawerTopHeaderTitle}>COMMAND DESK</Text>
                  <Text style={styles.drawerTopHeaderSubtitle}>SHARK TRADERS AI</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setSessionsDrawerOpen(false)}
                style={styles.appleCloseBtn}
                accessibilityLabel="Close Drawer"
              >
                <Ionicons name="close" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* 2. User Profile Card (Ultra-Organized Institutional Layout) */}
            <View style={styles.appleProfileCard}>
              <View style={[styles.appleProfileHeader, { alignItems: 'center' }]}>
                {/* Avatar with '+' button */}
                <View style={styles.appleAvatarWrapper}>
                  <TouchableOpacity
                    style={styles.appleAvatarBox}
                    onPress={handleQuickAvatarPickFromDrawer}
                    activeOpacity={0.8}
                  >
                    {currentUser?.avatar && (currentUser.avatar.startsWith('data:') || currentUser.avatar.startsWith('http') || currentUser.avatar.startsWith('file:')) ? (
                      <Image source={{ uri: currentUser.avatar }} style={styles.appleAvatarImg} resizeMode="cover" />
                    ) : (
                      <Text style={{ color: '#00FF66', fontSize: 16, fontWeight: '900', letterSpacing: 1 }}>
                        {getTraderInitials(currentUser?.name, currentUser?.email)}
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.appleAvatarPlusBtn}
                    onPress={handleQuickAvatarPickFromDrawer}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="camera" size={11} color="#000" />
                  </TouchableOpacity>
                </View>

                {/* Name, Plan Badge, @Username & Email (Clean 3-Row Stack) */}
                <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
                  {/* Line 1: Display Name + Plan Badge */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                    <Text style={[styles.appleProfileName, { flexShrink: 1 }]} numberOfLines={1}>
                      {currentUser?.name || 'Trader'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setSessionsDrawerOpen(false);
                        setPlanUpgradeModalVisible(true);
                      }}
                      style={[
                        styles.appleVipBadge,
                        currentUser?.plan === 'PREMIUM' && { backgroundColor: '#00FF66' },
                        currentUser?.plan === 'VIP' && { backgroundColor: '#FFE600' },
                        currentUser?.plan === 'FREE' && { backgroundColor: '#2A3447', borderWidth: 1, borderColor: '#475569' },
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text style={[
                        styles.appleVipBadgeText,
                        currentUser?.plan === 'FREE' ? { color: '#E2E8F0' } : { color: '#000' }
                      ]}>
                        {currentUser?.plan || 'FREE'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Line 2: Unique @Username */}
                  <Text style={{ color: '#00E5FF', fontSize: 11.5, fontWeight: '800', marginTop: 2 }} numberOfLines={1}>
                    @{currentUser?.username || 'trader'}
                  </Text>

                  {/* Line 3: Verified Gmail */}
                  <Text style={[styles.appleProfileRole, { marginTop: 1 }]} numberOfLines={1}>
                    {currentUser?.email || ''}
                  </Text>
                </View>

                {/* Right: Sleek Edit Profile Vector Icon Button */}
                <TouchableOpacity
                  onPress={() => {
                    setSessionsDrawerOpen(false);
                    setEditNameInput(currentUser?.name || '');
                    setEditUsernameInput(currentUser?.username || '');
                    setEditAvatarInput(
                      currentUser?.avatar && (currentUser.avatar.startsWith('data:') || currentUser.avatar.startsWith('http') || currentUser.avatar.startsWith('file:'))
                        ? currentUser.avatar
                        : ''
                    );
                    setEditProfileModalVisible(true);
                  }}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor: 'rgba(0, 229, 255, 0.1)',
                    borderWidth: 1,
                    borderColor: 'rgba(0, 229, 255, 0.35)',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="create-outline" size={16} color="#00E5FF" />
                </TouchableOpacity>
              </View>

              {/* Luxury Upgrade & LOG OUT Action Row */}
              <View style={styles.drawerQuickLinksRow}>
                <TouchableOpacity
                  style={styles.drawerUpgradeLuxuryBtn}
                  onPress={() => {
                    setSessionsDrawerOpen(false);
                    setPlanUpgradeModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.upgradeCrownCircle}>
                    <MaterialCommunityIcons name="crown" size={15} color="#FFE600" />
                  </View>
                  <Text style={styles.drawerUpgradeLuxuryText}>UPGRADE PLAN</Text>
                  <Ionicons name="chevron-forward" size={13} color="#FFE600" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.drawerGoogleIdBtn,
                    {
                      backgroundColor: 'rgba(255, 51, 102, 0.12)',
                      borderColor: 'rgba(255, 51, 102, 0.45)'
                    }
                  ]}
                  onPress={handleLogout}
                  activeOpacity={0.8}
                >
                  <Ionicons name="log-out-outline" size={14} color="#FF3366" />
                  <Text style={[styles.drawerGoogleIdText, { color: '#FF3366', fontWeight: '900' }]}>LOG OUT</Text>
                </TouchableOpacity>
              </View>

              {/* Clean Symmetrical Capital & Risk Widget */}
              <View style={[styles.appleVaultWidget, { paddingVertical: 10, paddingHorizontal: 12 }]}>
                <View style={[styles.appleVaultItem, { alignItems: 'flex-start', flex: 1.2 }]}>
                  <Text style={styles.appleVaultLabel}>SAVED CAPITAL</Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 4,
                    backgroundColor: '#070A0F',
                    borderWidth: 1,
                    borderColor: '#1E293B',
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    width: '92%'
                  }}>
                    <Text style={{ color: '#00FF66', fontSize: 13.5, fontWeight: '900', marginRight: 3 }}>$</Text>
                    <TextInput
                      style={{
                        flex: 1,
                        color: '#FFFFFF',
                        fontSize: 13.5,
                        fontWeight: '900',
                        paddingVertical: 0,
                        outlineStyle: 'none'
                      }}
                      placeholder="0"
                      placeholderTextColor="#475569"
                      keyboardType="numeric"
                      value={globalBalance}
                      onChangeText={updateGlobalBalance}
                      onBlur={() => showAppToast(`SAVED CAPITAL: $${Number(globalBalance || 0).toLocaleString()}`)}
                      onSubmitEditing={() => showAppToast(`SAVED CAPITAL: $${Number(globalBalance || 0).toLocaleString()}`)}
                    />
                  </View>
                </View>

                <View style={styles.appleVaultDivider} />

                <TouchableOpacity
                  style={[styles.appleVaultItem, { alignItems: 'flex-start', paddingLeft: 12, flex: 0.9 }]}
                  onPress={() => {
                    const steps = [0.5, 1, 2, 3, 5];
                    const nextIdx = (steps.indexOf(Number(globalRiskPercent)) + 1) % steps.length;
                    updateGlobalRisk(steps[nextIdx]);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.appleVaultLabel}>RISK PER TRADE</Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 4,
                    backgroundColor: '#070A0F',
                    borderWidth: 1,
                    borderColor: '#1E293B',
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    width: '100%'
                  }}>
                    <Text style={{ color: '#FFE600', fontSize: 13.5, fontWeight: '900' }}>{globalRiskPercent}%</Text>
                    <Ionicons name="swap-vertical" size={13} color="#64748B" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* 3. Quick Actions: New Analysis + Community */}
            <View style={styles.appleActionRow}>
              <TouchableOpacity style={styles.appleActionNewChat} onPress={startNewChat} activeOpacity={0.8}>
                <Ionicons name="add" size={18} color="#000" />
                <Text style={styles.appleActionNewChatText}>New Analysis</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.appleActionCommunity}
                onPress={() => {
                  setSessionsDrawerOpen(false);
                  handleOpenCommunity();
                }}
                activeOpacity={0.8}
              >
                <View style={styles.appleCommunityIcon}>
                  <Ionicons name="people" size={16} color="#000" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.appleCommunityTitle}>Community</Text>
                  <Text style={styles.appleCommunitySub}>
                    {`+1,${String(usersDirectory.length || 4).padStart(3, '0')} Traders`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={15} color="#FFE600" />
              </TouchableOpacity>
            </View>

            {/* 4. Section Header: Conversations */}
            <View style={styles.appleSectionHeader}>
              <Text style={styles.appleSectionTitle}>CONVERSATIONS</Text>
              <View style={styles.appleCountPill}>
                <Text style={styles.appleCountPillText}>{sessionsList.length}</Text>
              </View>
            </View>

            {/* Search Bar */}
            <View style={styles.appleSearchContainer}>
              <Ionicons name="search" size={14} color="#8E8E93" />
              <TextInput
                style={styles.appleSearchInput}
                placeholder="Search sessions..."
                placeholderTextColor="#636366"
                value={sessionSearchQuery}
                onChangeText={setSessionSearchQuery}
              />
              {sessionSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSessionSearchQuery('')}>
                  <Ionicons name="close-circle" size={14} color="#8E8E93" />
                </TouchableOpacity>
              )}
            </View>

            {/* 5. Scrollable Sessions List */}
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {filteredSessions.map((s) => {
                const isActive = currentSessionId === s.id;
                const msgCount = (sessionsMessages[s.id] || []).length;
                return (
                  <View
                    key={s.id}
                    style={[styles.appleSessionCard, isActive && styles.appleSessionCardActive]}
                  >
                    <TouchableOpacity
                      style={styles.appleSessionTouch}
                      onPress={() => switchSession(s.id)}
                    >
                      <View style={[styles.appleSessionDot, isActive && styles.appleSessionDotActive]} />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text
                          style={[styles.appleSessionTitle, isActive && styles.appleSessionTitleActive]}
                          numberOfLines={1}
                        >
                          {s.title}
                        </Text>
                        <Text style={styles.appleSessionSub}>
                          {s.updatedAt || 'Active'} • {msgCount} msgs
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {sessionsList.length > 1 && (
                      <TouchableOpacity
                        onPress={() => deleteSession(s.id)}
                        style={styles.appleDeleteBtn}
                        title="Delete Session"
                      >
                        <Ionicons name="trash-outline" size={14} color="#FF3B30" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </ScrollView>

            {/* 6. Bottom Footer */}
            <View style={styles.appleDrawerFooter}>
              <Text style={styles.appleDrawerFooterText}>SHARK QUANT • INSTITUTIONAL EDITION</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── AUTONOMOUS LIVE VOICE PHONE CALL MODAL (WITH IN-CALL TRADINGVIEW) ── */}
      <Modal visible={liveCallActive} transparent animationType="slide">
        <View style={styles.callModalOverlay}>
          <View style={[styles.callModalContainer, callActiveChart ? styles.callModalContainerExpanded : null]}>
            {/* 1. Call Header Bar */}
            <View style={styles.callTopRow}>
              <View style={styles.callStatusBadge}>
                <View style={[styles.callLiveDot, isAiSpeaking ? { backgroundColor: '#FFE600' } : { backgroundColor: '#00FF66' }]} />
                <Text style={styles.callStatusText}>
                  {isAiSpeaking ? 'SHARK QUANT IS SPEAKING 🎙️' : 'LIVE DIRECT CALL (ON-AIR)'}
                </Text>
              </View>
              <View style={styles.callTimerBadge}>
                <Ionicons name="time-outline" size={13} color="#00FF66" />
                <Text style={styles.callTimerText}>{formatDuration(callDuration)}</Text>
              </View>
            </View>

            {/* 2. IN-CALL TRADINGVIEW CHART (If active) or SHARK AVATAR */}
            {callActiveChart ? (
              <View style={styles.inCallChartWrapper}>
                <View style={styles.inCallChartHeader}>
                  <View style={styles.inCallChartAssetInfo}>
                    <View style={styles.inCallChartLiveDot} />
                    <Text style={styles.inCallChartTitle}>
                      {callActiveChart.rawSymbol || callActiveChart.symbol} • LIVE IN-CALL
                    </Text>
                  </View>

                  {/* Timeframe Switcher in Call */}
                  <View style={styles.inCallTfRow}>
                    {['1', '5', '15', '60', '240'].map((tf) => (
                      <TouchableOpacity
                        key={tf}
                        style={[
                          styles.inCallTfBtn,
                          callActiveChart.interval === tf && styles.inCallTfBtnActive
                        ]}
                        onPress={() => setCallActiveChart((prev) => ({ ...prev, interval: tf }))}
                      >
                        <Text style={[
                          styles.inCallTfBtnText,
                          callActiveChart.interval === tf && styles.inCallTfBtnTextActive
                        ]}>
                          {tf === '60' ? '1H' : tf === '240' ? '4H' : tf + 'M'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={styles.inCallCloseChartBtn}
                      onPress={() => setCallActiveChart(null)}
                      accessibilityLabel="Close Chart"
                    >
                      <Ionicons name="close" size={16} color="#FF0055" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* The Embedded Live Chart */}
                <LiveTradingViewChart symbol={callActiveChart.symbol} interval={callActiveChart.interval} />
              </View>
            ) : (
              <View style={styles.callAvatarWrapper}>
                <Image
                  source={SHARK_LOGO}
                  style={{ width: 85, height: 85, marginBottom: 8 }}
                  resizeMode="contain"
                />
                <Text style={styles.callFriendName}>SHARK QUANT • خويا الحوت</Text>
                <Text style={styles.callFriendRole}>شريكك وصاحبك في التداول • مكالمة صوتية حية</Text>

                {/* Animated Voice Waves */}
                <View style={styles.voiceWavesContainer}>
                  <Animated.View style={[styles.waveBar, { height: waveAnim1 }]} />
                  <Animated.View style={[styles.waveBar, { height: waveAnim2 }]} />
                  <Animated.View style={[styles.waveBar, { height: waveAnim3 }]} />
                  <Animated.View style={[styles.waveBar, { height: waveAnim4 }]} />
                  <Animated.View style={[styles.waveBar, { height: waveAnim2 }]} />
                </View>
              </View>
            )}

            {/* 3. Status Ribbon */}
            <View style={styles.callStatusRibbon}>
              <Text style={styles.callStatusRibbonText}>{callStatusMessage}</Text>
            </View>

            {/* 4. Live Dialogue Transcript Box */}
            <View style={styles.transcriptBox}>
              {callUserLiveText ? (
                <View style={styles.callUserSpeechRow}>
                  <Text style={styles.callUserSpeechLabel}>🎙️ أنت:</Text>
                  <Text style={styles.callUserSpeechText}>{callUserLiveText}</Text>
                </View>
              ) : null}

              <View style={styles.callAiSpeechRow}>
                <Text style={styles.transcriptSpeaker}>🦈 الحوت (شريكك):</Text>
                <Text style={styles.transcriptContent}>{callTranscript}</Text>
              </View>
            </View>

            {/* 5. Quick Voice Command Pills (Tap or Say Aloud) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.voiceCommandsScroll}
              contentContainerStyle={styles.voiceCommandsRow}
            >
              <TouchableOpacity
                style={styles.voiceCommandPill}
                onPress={() => sendLiveCallMessage('وريني شارت الذهب دابا وفين كاين الدخول')}
              >
                <Text style={styles.voiceCommandText}>📊 شارت الذهب</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.voiceCommandPill}
                onPress={() => sendLiveCallMessage('وريني شارت البيتكوين فريم 15 دقيقة')}
              >
                <Text style={styles.voiceCommandText}>🪙 شارت البيتكوين</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.voiceCommandPill}
                onPress={() => sendLiveCallMessage('افتح شارت الناسداك QQQ دابا')}
              >
                <Text style={styles.voiceCommandText}>📈 شارت الناسداك</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.voiceCommandPill}
                onPress={() => sendLiveCallMessage('حلل لي السيولة والصفقة المتاحة دابا')}
              >
                <Text style={styles.voiceCommandText}>⚡ تحليل السيولة</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.voiceCommandPill, { borderColor: '#FF0055' }]}
                onPress={() => sendLiveCallMessage('صافي شكرا خويا بسلامة عليك')}
              >
                <Text style={[styles.voiceCommandText, { color: '#FF0055' }]}>🔴 اقطع الخط (بسلامة)</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* 6. Call Controls Bottom Dock */}
            <View style={styles.callControlsRow}>
              {/* Share Screen (Gemini sees your chart live) */}
              <TouchableOpacity
                style={[styles.callControlCircle, callScreenSharing && { backgroundColor: '#00FF66', borderColor: '#00FF66' }]}
                onPress={toggleCallScreenShare}
                accessibilityLabel="Share Screen"
              >
                <Ionicons name="desktop-outline" size={22} color={callScreenSharing ? '#000' : '#FFF'} />
              </TouchableOpacity>

              {/* Mute Microphone */}
              <TouchableOpacity
                style={[styles.callControlCircle, callMicMuted && { backgroundColor: '#FF0055' }]}
                onPress={toggleCallMic}
                accessibilityLabel="Mute Microphone"
              >
                <Ionicons name={callMicMuted ? 'mic-off' : 'mic'} size={24} color="#FFF" />
              </TouchableOpacity>

              {/* End Call Button */}
              <TouchableOpacity
                style={styles.callEndBtn}
                onPress={endLiveCall}
                accessibilityLabel="End Call"
              >
                <Ionicons name="call" size={28} color="#FFF" />
              </TouchableOpacity>

              {/* Speaker / Toggle Audio */}
              <TouchableOpacity
                style={[styles.callControlCircle, !callSpeakerActive && { backgroundColor: '#333' }]}
                onPress={() => setCallSpeakerActive((prev) => !prev)}
                accessibilityLabel="Toggle Speaker"
              >
                <Ionicons name={callSpeakerActive ? 'volume-high' : 'volume-mute'} size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Google Account Switcher via Supabase OAuth (No manual email typing) */}
      <Modal visible={authModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxWidth: 420 }]}>
            <Image source={SHARK_LOGO} style={{ width: 68, height: 68, alignSelf: 'center', marginBottom: 8 }} resizeMode="contain" />
            <Text style={styles.modalTitle}>GOOGLE ACCOUNT</Text>

            {currentUser && (
              <View style={[styles.authCurrentPlanRow, { flexDirection: 'column', gap: 6, paddingVertical: 10 }]}>
                <Text style={{ color: '#A0B0C4', fontSize: 11, fontWeight: '700' }}>
                  Connected: <Text style={{ color: '#FFF', fontWeight: '900' }}>{currentUser.email}</Text> (@{currentUser.username})
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.authCurrentPlanLabel}>PLAN:</Text>
                  <View style={[
                    styles.authCurrentPlanBadge,
                    currentUser.plan === 'PREMIUM' && { backgroundColor: '#00FF66' },
                    currentUser.plan === 'VIP' && { backgroundColor: '#FFE600' },
                    currentUser.plan === 'FREE' && { backgroundColor: '#4E5058' },
                  ]}>
                    <Text style={[
                      styles.authCurrentPlanBadgeText,
                      currentUser.plan === 'FREE' && { color: '#FFF' }
                    ]}>
                      {currentUser.plan === 'PREMIUM' ? '👑 PREMIUM' : currentUser.plan === 'VIP' ? '⚡ VIP' : 'FREE TIER'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.modalGoogleBtn, googleLoading && { opacity: 0.7 }]}
              onPress={handleSupabaseGoogleOAuth}
              disabled={googleLoading}
            >
              <Ionicons name="logo-google" size={18} color="#000" />
              <Text style={styles.modalGoogleBtnText}>
                {googleLoading ? 'CONNECTING TO GOOGLE...' : 'CONTINUE WITH GOOGLE'}
              </Text>
            </TouchableOpacity>

            {currentUser && (
              <TouchableOpacity
                style={{
                  marginTop: 8,
                  backgroundColor: 'rgba(255,51,102,0.16)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,51,102,0.45)',
                  borderRadius: 10,
                  paddingVertical: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={16} color="#FF3366" />
                <Text style={{ color: '#FF3366', fontWeight: '900', fontSize: 12 }}>LOG OUT 🚪</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setAuthModalVisible(false)}>
              <Text style={styles.modalCloseText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── COMMUNITY HONOR CODE MODAL (100% ENGLISH, NO EMOJI AVATARS) ── */}
      <Modal visible={communityRulesModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxWidth: 460, maxHeight: '90%', borderColor: '#1E293B', borderWidth: 1.5 }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ alignItems: 'center', marginBottom: 14 }}>
                <Image source={SHARK_LOGO} style={{ width: 64, height: 64 }} resizeMode="contain" />
                <Text style={[styles.rulesModalTitle, { letterSpacing: 1 }]}>SYNDICATE CODE OF HONOR</Text>
                <Text style={styles.rulesModalSubtitle}>
                  Institutional Trading Floor & Liquidity Desk Guidelines
                </Text>
              </View>

              <View style={styles.ruleCard}>
                <View style={styles.ruleIconCircle}>
                  <Ionicons name="shield-checkmark" size={16} color="#00FF66" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.ruleTitle, { textAlign: 'left' }]}>1. Institutional Discipline & Mutual Respect</Text>
                  <Text style={[styles.ruleDesc, { textAlign: 'left' }]}>Zero tolerance for spam, toxic behavior, or unverified hype on the trading floor.</Text>
                </View>
              </View>

              <View style={styles.ruleCard}>
                <View style={styles.ruleIconCircle}>
                  <Ionicons name="trending-up" size={16} color="#FFE600" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.ruleTitle, { textAlign: 'left', color: '#FFE600' }]}>2. Strict Risk Management (1% - 2%)</Text>
                  <Text style={[styles.ruleDesc, { textAlign: 'left' }]}>Capital preservation comes first. Always trade with a defined Stop-Loss and R:R.</Text>
                </View>
              </View>

              <View style={styles.ruleCard}>
                <View style={styles.ruleIconCircle}>
                  <Ionicons name="ban" size={16} color="#FF3366" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.ruleTitle, { textAlign: 'left', color: '#FF3366' }]}>3. No External Promotions or Links</Text>
                  <Text style={[styles.ruleDesc, { textAlign: 'left' }]}>This floor is strictly dedicated to SMC setups, order flow, and live quant execution.</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.rulesCheckboxRow}
                onPress={() => setRulesAgreedCheckbox(!rulesAgreedCheckbox)}
                activeOpacity={0.8}
              >
                <View style={[styles.customCheckbox, rulesAgreedCheckbox && styles.customCheckboxActive]}>
                  {rulesAgreedCheckbox && <Ionicons name="checkmark" size={14} color="#000" />}
                </View>
                <Text style={[styles.rulesCheckboxText, { textAlign: 'left' }]}>
                  I agree to abide by the SHARK QUANT institutional floor rules and risk standards.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.rulesConfirmBtn,
                  !rulesAgreedCheckbox && styles.rulesConfirmBtnDisabled
                ]}
                onPress={handleAcceptCommunityRules}
                disabled={!rulesAgreedCheckbox}
              >
                <Ionicons name="shield-checkmark" size={18} color="#000" />
                <Text style={styles.rulesConfirmBtnText}>ENTER SYNDICATE FLOOR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setCommunityRulesModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>CANCEL</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── PLAN TIERS & UPGRADE MODAL (100% ENGLISH) ── */}
      <Modal visible={planUpgradeModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxWidth: 500, maxHeight: '92%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <Text style={[styles.planModalTitle, { letterSpacing: 1 }]}>SHARK QUANT MEMBERSHIP</Text>
                <Text style={styles.planModalSubtitle}>
                  Select your institutional execution tier
                </Text>
              </View>

              {/* TIER 1: FREE */}
              <View style={[
                styles.planTierCard,
                currentUser?.plan === 'FREE' && styles.planTierCardCurrent
              ]}>
                <View style={styles.planTierHeader}>
                  <View>
                    <Text style={styles.planTierName}>FREE TIER</Text>
                    <Text style={styles.planTierPrice}>$0 / Month • Read-Only Access</Text>
                  </View>
                  {currentUser?.plan === 'FREE' && (
                    <View style={styles.planCurrentTag}>
                      <Text style={styles.planCurrentTagText}>CURRENT PLAN</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.planTierFeature, { textAlign: 'left' }]}>• Basic market price queries</Text>
                <Text style={[styles.planTierFeature, { textAlign: 'left' }]}>• Read-only access to the Syndicate Community Floor</Text>
                {currentUser?.plan === 'FREE' && (
                  <View style={styles.planActiveBtn}>
                    <Text style={styles.planActiveBtnText}>ACTIVE PLAN</Text>
                  </View>
                )}
              </View>

              {/* TIER 2: VIP TRADER */}
              <View style={[
                styles.planTierCard,
                styles.planTierCardVip,
                currentUser?.plan === 'VIP' && styles.planTierCardCurrentVip
              ]}>
                <View style={styles.planTierHeader}>
                  <View>
                    <Text style={[styles.planTierName, { color: '#FFE600' }]}>VIP TRADER</Text>
                    <Text style={[styles.planTierPrice, { color: '#FFE600' }]}>$49 / Month • Full Desk & Floor Access</Text>
                  </View>
                  {currentUser?.plan === 'VIP' && (
                    <View style={[styles.planCurrentTag, { backgroundColor: '#FFE600' }]}>
                      <Text style={[styles.planCurrentTagText, { color: '#000' }]}>CURRENT PLAN</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.planTierFeature, { textAlign: 'left' }]}>• Unlimited AI Quant Desk analysis & live TradingView charts</Text>
                <Text style={[styles.planTierFeature, { textAlign: 'left' }]}>• Full posting, voice notes & @tagging in Community Floor</Text>
                <Text style={[styles.planTierFeature, { textAlign: 'left' }]}>• Real-time SMC scalping & intraday trade setups</Text>
                <Text style={[styles.planTierFeature, { textAlign: 'left' }]}>• Live 1-on-1 voice call with Shark AI</Text>
                {currentUser?.plan !== 'VIP' ? (
                  <TouchableOpacity
                    style={[styles.planSelectBtn, { backgroundColor: '#FFE600' }]}
                    onPress={() => handleUpgradePlan('VIP')}
                  >
                    <Text style={[styles.planSelectBtnText, { color: '#000' }]}>REQUEST VIP ACTIVATION 🔒</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.planActiveBtn, { borderColor: '#FFE600' }]}>
                    <Text style={[styles.planActiveBtnText, { color: '#FFE600' }]}>ACTIVE PLAN</Text>
                  </View>
                )}
              </View>

              {/* TIER 3: SHARK PREMIUM */}
              <View style={[
                styles.planTierCard,
                styles.planTierCardPremium,
                currentUser?.plan === 'PREMIUM' && styles.planTierCardCurrentPremium
              ]}>
                <View style={styles.planTierHeader}>
                  <View>
                    <Text style={[styles.planTierName, { color: '#00FF66' }]}>SHARK PREMIUM (PARTNER)</Text>
                    <Text style={[styles.planTierPrice, { color: '#00FF66' }]}>$99 / Month • Institutional Syndicate Partner</Text>
                  </View>
                  {currentUser?.plan === 'PREMIUM' && (
                    <View style={[styles.planCurrentTag, { backgroundColor: '#00FF66' }]}>
                      <Text style={[styles.planCurrentTagText, { color: '#000' }]}>CURRENT PLAN</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.planTierFeature, { textAlign: 'left' }]}>• Complete institutional quant suite & order-flow alerts</Text>
                <Text style={[styles.planTierFeature, { textAlign: 'left' }]}>• Exclusive SHARK PARTNER badge on the trading floor</Text>
                <Text style={[styles.planTierFeature, { textAlign: 'left' }]}>• Priority execution & direct desk support</Text>
                {currentUser?.plan !== 'PREMIUM' ? (
                  <TouchableOpacity
                    style={[styles.planSelectBtn, { backgroundColor: '#00FF66' }]}
                    onPress={() => handleUpgradePlan('PREMIUM')}
                  >
                    <Text style={[styles.planSelectBtnText, { color: '#000' }]}>REQUEST PREMIUM ACTIVATION 🔒</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.planActiveBtn, { borderColor: '#00FF66' }]}>
                    <Text style={[styles.planActiveBtnText, { color: '#00FF66' }]}>ACTIVE PLAN</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setPlanUpgradeModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>CLOSE</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── ULTRA-SLEEK INSTITUTIONAL EDIT PROFILE MODAL (100% ENGLISH, ZERO EMOJIS) ── */}
      <Modal visible={editProfileModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            {
              maxWidth: 430,
              backgroundColor: '#0B0E14',
              borderWidth: 1.5,
              borderColor: '#1E293B',
              borderRadius: 20,
              padding: 22
            }
          ]}>
            {/* Top Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <View>
                <Text style={{
                  color: '#FFFFFF',
                  fontFamily: Platform.OS === 'ios' ? 'Impact' : 'monospace',
                  fontSize: 18,
                  fontWeight: '900',
                  letterSpacing: 1.2
                }}>
                  TRADER IDENTITY
                </Text>
                <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', marginTop: 2 }}>
                  Customize your display name, @handle & photo
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setEditProfileModalVisible(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#141923',
                  borderWidth: 1,
                  borderColor: '#232D3F',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name="close" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Clean Avatar Upload Section (No Silly Emojis) */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#07090E',
              borderWidth: 1,
              borderColor: '#1A2232',
              borderRadius: 14,
              padding: 14,
              marginBottom: 18,
              gap: 14
            }}>
              <View style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#111722',
                borderWidth: 2,
                borderColor: '#00FF66',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {editAvatarInput && (editAvatarInput.startsWith('data:') || editAvatarInput.startsWith('http') || editAvatarInput.startsWith('file:')) ? (
                  <Image source={{ uri: editAvatarInput }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <Text style={{ color: '#00FF66', fontSize: 20, fontWeight: '900', letterSpacing: 1 }}>
                    {getTraderInitials(editNameInput || currentUser?.name, currentUser?.email)}
                  </Text>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ color: '#E2E8F0', fontSize: 12, fontWeight: '800', marginBottom: 6 }}>
                  PROFILE PICTURE
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: '#00FF66',
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      borderRadius: 10
                    }}
                    onPress={() => handlePickCustomAvatar('edit')}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="camera" size={15} color="#000" />
                    <Text style={{ color: '#000', fontSize: 11, fontWeight: '900', letterSpacing: 0.4 }}>
                      UPLOAD PHOTO
                    </Text>
                  </TouchableOpacity>

                  {editAvatarInput ? (
                    <TouchableOpacity
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        borderRadius: 10,
                        backgroundColor: 'rgba(255,51,102,0.14)',
                        borderWidth: 1,
                        borderColor: 'rgba(255,51,102,0.35)'
                      }}
                      onPress={() => setEditAvatarInput('')}
                    >
                      <Ionicons name="trash-outline" size={14} color="#FF3366" />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </View>

            {/* 1. DISPLAY NAME */}
            <Text style={{ color: '#94A3B8', fontSize: 10.5, fontWeight: '900', letterSpacing: 1, marginBottom: 6 }}>
              DISPLAY NAME
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  textAlign: 'left',
                  marginBottom: 14,
                  backgroundColor: '#07090E',
                  borderColor: '#1E293B',
                  fontSize: 13.5,
                  fontWeight: '700'
                }
              ]}
              value={editNameInput}
              onChangeText={setEditNameInput}
              placeholder="e.g. Smart Money"
              placeholderTextColor="#475569"
            />

            {/* 2. UNIQUE @USERNAME */}
            <Text style={{ color: '#00E5FF', fontSize: 10.5, fontWeight: '900', letterSpacing: 1, marginBottom: 6 }}>
              UNIQUE @HANDLE (FOR SEARCH & @TAG)
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#07090E',
              borderWidth: 1,
              borderColor: 'rgba(0, 229, 255, 0.4)',
              borderRadius: 10,
              paddingHorizontal: 12,
              marginBottom: 18
            }}>
              <Text style={{ color: '#00E5FF', fontSize: 14, fontWeight: '900', marginRight: 4 }}>@</Text>
              <TextInput
                style={{
                  flex: 1,
                  color: '#FFFFFF',
                  fontSize: 13.5,
                  fontWeight: '800',
                  paddingVertical: 11,
                  outlineStyle: 'none'
                }}
                value={editUsernameInput}
                onChangeText={(txt) => setEditUsernameInput(txt.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                placeholder="smartmoneymor"
                placeholderTextColor="#475569"
                autoCapitalize="none"
              />
            </View>

            {/* SAVE & CANCEL BUTTONS */}
            <TouchableOpacity
              style={{
                backgroundColor: '#00FF66',
                borderRadius: 12,
                paddingVertical: 13,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 8
              }}
              onPress={handleSaveProfile}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle" size={18} color="#000" />
              <Text style={{
                color: '#000',
                fontFamily: Platform.OS === 'ios' ? 'Impact' : 'monospace',
                fontSize: 13.5,
                fontWeight: '900',
                letterSpacing: 1
              }}>
                SAVE CHANGES
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setEditProfileModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── CLEAN VIBRANT SPLASH SCREEN (BIG SHARK + BIG BOLD TITLE ONLY, NO LIGHTS, VIVID COLORS) ── */}
      {appSplashVisible && (
        <Animated.View
          style={[
            styles.appSplashScreenOverlay,
            { opacity: splashFadeAnim }
          ]}
          pointerEvents={appSplashVisible ? 'auto' : 'none'}
        >
          <Animated.View
            style={[
              styles.appSplashCenterBox,
              { transform: [{ scale: splashScaleAnim }] }
            ]}
          >
            {/* BIG AGGRESSIVE SHARK - NO FRAME */}
            <Image
              source={SHARK_LOGO}
              style={styles.appSplashSharkLogoBig}
              resizeMode="contain"
            />

            {/* BRAND TITLE - EXACT MATCH TO HEADER LOGO (TEXT, SHAPE & STYLE) */}
            <View style={styles.appSplashBrandBlock}>
              <View style={styles.appSplashLogoRow}>
                <Text style={styles.appSplashWordWhite}>SHARK</Text>
                <Text style={styles.appSplashWordYellow}>QUANT</Text>
              </View>
              <Text style={styles.appSplashTagline}>INSTITUTIONAL QUANT DESK</Text>
            </View>
          </Animated.View>
        </Animated.View>
      )}

      {/* إشعار عائم منبثق للنسخ والمشاركة */}
      {toastText && (
        <View style={styles.floatingToastBox}>
          <Ionicons name="checkmark-circle" size={16} color="#00FF66" />
          <Text style={styles.floatingToastText}>{toastText}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    height: Platform.OS === 'web' ? '100vh' : '100%',
    maxHeight: Platform.OS === 'web' ? '100vh' : '100%',
    backgroundColor: '#0D0E12',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#12141A',
    borderBottomWidth: 2,
    borderBottomColor: '#1F2738',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sharkLogoMain: {
    width: 68,
    height: 60,
  },
  sharkLogoDrawer: {
    width: 76,
    height: 68,
  },
  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerCommunityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 230, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 230, 0, 0.4)',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 16,
  },
  headerCommunityText: {
    color: '#FFE600',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerNewChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#00FF66',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headerNewChatText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerMenuBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1E2536',
    borderWidth: 1,
    borderColor: '#FFE600',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  calendarHeaderText: {
    color: '#FFE600',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sharkGraffitiBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#00FF66',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-4deg' }],
  },
  logoTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoWordWhite: {
    fontFamily: Platform.OS === 'ios' ? 'Impact' : 'monospace',
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  logoWordYellow: {
    fontFamily: Platform.OS === 'ios' ? 'Impact' : 'monospace',
    fontSize: 20,
    fontWeight: '900',
    color: '#FFE600',
    letterSpacing: 1.5,
  },
  logoTagline: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 0.8,
    marginTop: 1,
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E2536',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FFE600',
  },
  googleDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#00FF66',
  },
  userPillText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  tickerStrip: {
    backgroundColor: '#050608',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#171F2C',
  },
  tickerScroll: {
    paddingHorizontal: 14,
    gap: 12,
  },
  tickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161922',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2A3040',
    gap: 6,
  },
  tickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tickerSymbol: {
    color: '#FFE600',
    fontSize: 12,
    fontWeight: '900',
  },
  tickerPrice: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tickerUp: {
    color: '#00FF66',
    fontSize: 11,
    fontWeight: '800',
  },
  tickerDown: {
    color: '#FF0055',
    fontSize: 11,
    fontWeight: '800',
  },
  chatArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24, // Clean bottom clearance above high-tech input dock
    gap: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  // شريط اسم المستخدم — ستايل الشوارع الأصفر
  userNameBadge: {
    backgroundColor: '#FFE600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-end',
    marginBottom: -4,
    zIndex: 10,
    borderRadius: 0,
  },
  userNameBadgeText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
  },
  userBubble: {
    backgroundColor: '#18202E',
    borderWidth: 1.5,
    borderColor: '#2A374F',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderTopRightRadius: 2,
    maxWidth: '85%',
  },
  userAudioBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#18202E',
    borderWidth: 1.5,
    borderColor: '#00F0FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderTopRightRadius: 2,
  },
  audioPlayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#00F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioWaveformStatic: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  staticBar: {
    width: 3,
    backgroundColor: '#00F0FF',
    borderRadius: 2,
  },
  audioDurationText: {
    color: '#00F0FF',
    fontSize: 11,
    fontWeight: '800',
  },
  userUploadedImage: {
    width: 220,
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  userBubbleText: {
    color: '#FFF',
    fontSize: 15,
    lineHeight: 22,
  },
  userBubbleTime: {
    color: '#65778E',
    fontSize: 9,
    marginTop: 4,
    textAlign: 'right',
  },
  aiDropWrapper: {
    marginVertical: 4,
  },
  streetSignBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#00FF66',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: -6,
    zIndex: 10,
  },
  // نفس ستايل SHARK PARTNER لكن أصفر — لرسائل المستخدم
  streetSignBadgeYellow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFE600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-end',
    marginBottom: -6,
    zIndex: 10,
  },
  // badge الاسم + الخطة فوق رسالة المستخدم
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
    marginBottom: 4,
  },
  userNameText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  userPlanBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  userPlanBadgeText: {
    color: '#000',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  streetSignTextDark: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
  },
  streetArticleCard: {
    backgroundColor: '#11151E',
    borderWidth: 1.5,
    borderColor: '#1E283A',
    borderRadius: 14,
    padding: 16,
    paddingTop: 16,
  },
  friendlyText: {
    color: '#E1E9F5',
    fontSize: 14.5,
    lineHeight: 23,
  },
  // ✅ بانر الصيانة — Street Sign / NYC Graffiti Style
  maintenanceWrapper: {
    alignSelf: 'center',
    marginVertical: 16,
    width: '88%',
    maxWidth: 360,
    transform: [{ rotate: '-1deg' }],
  },
  maintenanceCautionStrip: {
    backgroundColor: '#FFE600',
    paddingVertical: 5,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  maintenanceCautionText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
  },
  maintenanceBanner: {
    backgroundColor: '#0A0A0C',
    borderWidth: 2,
    borderColor: '#FFE600',
    borderTopWidth: 0,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  maintenanceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
  },
  maintenanceRedDot: {
    width: 7,
    height: 7,
    borderRadius: 0,
    backgroundColor: '#FF2D55',
  },
  maintenanceLabel: {
    color: '#FF2D55',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 3,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
  },
  maintenanceCode: {
    color: '#FFE600',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
    marginBottom: 6,
  },
  maintenanceDesc: {
    color: '#6677AA',
    fontSize: 11,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
    letterSpacing: 0.3,
    lineHeight: 17,
  },
  maintenanceTime: {
    color: '#334455',
    fontSize: 9,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
    marginTop: 10,
    letterSpacing: 1.5,
  },
  chartWideBox: {
    backgroundColor: '#080A10',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#00FF66',
    overflow: 'hidden',
    marginVertical: 10,
  },
  chartWideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0E131E',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chartDotLive: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#00FF66',
  },
  chartWideTitle: {
    color: '#00FF66',
    fontSize: 11,
    fontWeight: '800',
  },
  cardTimeClean: {
    color: '#55647A',
    fontSize: 9.5,
  },
  // تذييل الرسالة: التوقيت + أزرار النسخ والمشاركة
  msgActionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  msgShareIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconMiniBtn: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#18202E',
  },
  // بطاقة الصفقة المؤسسية المتكاملة بتصميم SHARK QUANT الحصري
  tradeCardContainer: {
    marginTop: 14,
    backgroundColor: '#090C12',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  tradeCardTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#171D2A',
    marginBottom: 10,
  },
  tradeDeskBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tradeDeskBrandText: {
    color: '#8A9DB4',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  tradeStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4,
    borderWidth: 1,
  },
  tradeStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  tradeStatusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  tradeMainHero: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tradeAssetSymbol: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  tradeAssetSub: {
    color: '#5C708A',
    fontSize: 8.5,
    fontWeight: '700',
    marginTop: 1,
    letterSpacing: 0.5,
  },
  tradeHeroRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tradeDirectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  tradeDirectionPillText: {
    color: '#000',
    fontSize: 10.5,
    fontWeight: '900',
  },
  tradeRrTag: {
    backgroundColor: '#161B26',
    borderWidth: 1,
    borderColor: '#253147',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
  },
  tradeRrTagText: {
    color: '#FFE600',
    fontSize: 10,
    fontWeight: '900',
  },
  tradeLevelsGrid: {
    gap: 7,
    marginBottom: 10,
  },
  tradeLevelCard: {
    backgroundColor: '#10131B',
    borderWidth: 1,
    borderColor: '#19202D',
    borderLeftWidth: 3.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tradeLevelTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  tradeLevelTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tradeCopyMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#161C27',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tradeCopyMiniText: {
    color: '#8A9DB4',
    fontSize: 9,
    fontWeight: '700',
  },
  tradeLevelValueLarge: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '900',
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
    letterSpacing: 1,
  },
  tradeReasonBox: {
    backgroundColor: '#07090D',
    borderWidth: 1,
    borderColor: '#182130',
    borderLeftWidth: 3,
    borderLeftColor: '#00FF66',
    borderRadius: 6,
    padding: 9,
    marginBottom: 10,
  },
  tradeReasonHeader: {
    color: '#00FF66',
    fontSize: 9.5,
    fontWeight: '900',
    marginBottom: 3,
  },
  tradeReasonText: {
    color: '#A0B2C6',
    fontSize: 11,
    lineHeight: 16,
  },
  tradeShareRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  tradeShareBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 6,
  },
  tradeShareBtnTextDark: {
    color: '#000',
    fontSize: 10.5,
    fontWeight: '900',
  },
  tradeShareBtnCopyAll: {
    flex: 1.2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#121722',
    borderWidth: 1,
    borderColor: '#FFE600',
    paddingVertical: 8,
    borderRadius: 6,
  },
  tradeShareBtnCopyAllText: {
    color: '#FFE600',
    fontSize: 10.5,
    fontWeight: '900',
  },

  // حاسبة اللوت وإدارة رأس المال
  calcToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#171E2B',
    borderWidth: 1,
    borderColor: '#31405C',
    borderRadius: 6,
    paddingVertical: 7,
    marginTop: 6,
    marginBottom: 8,
  },
  calcToggleBtnText: {
    color: '#FFE600',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  calcBoxContainer: {
    backgroundColor: '#07090E',
    borderWidth: 1,
    borderColor: '#243248',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  calcRowInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  calcInputLabel: {
    color: '#899AB5',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  calcInput: {
    backgroundColor: '#121622',
    borderWidth: 1,
    borderColor: '#2B3B55',
    borderRadius: 6,
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  calcSavedNotice: {
    color: '#00FF66',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 3,
  },
  riskChipsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  riskChip: {
    flex: 1,
    backgroundColor: '#141824',
    borderWidth: 1,
    borderColor: '#2B3B55',
    borderRadius: 4,
    paddingVertical: 5,
    alignItems: 'center',
  },
  riskChipActive: {
    backgroundColor: '#FFE600',
    borderColor: '#FFE600',
  },
  riskChipText: {
    color: '#899AB5',
    fontSize: 10,
    fontWeight: '800',
  },
  riskChipTextActive: {
    color: '#000',
    fontWeight: '900',
  },
  calcResultsGrid: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  calcResultCard: {
    flex: 1,
    backgroundColor: '#10141F',
    borderWidth: 1,
    borderColor: '#1D2638',
    borderRadius: 6,
    padding: 6,
    alignItems: 'center',
  },
  calcResultTitle: {
    color: '#7687A1',
    fontSize: 8.5,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  calcResultValLots: {
    color: '#00FF66',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
  },
  calcResultValSl: {
    color: '#FF2D55',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
  },
  calcResultValTp: {
    color: '#FFE600',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
  },

  // أنماط نافذة التقويم الاقتصادي والأخبار المباشرة
  modalCalendarContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    backgroundColor: '#0D1017',
    borderWidth: 2,
    borderColor: '#1F2B3E',
    borderRadius: 16,
    padding: 16,
  },
  modalCalendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2333',
  },
  modalCalendarTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  closeModalBtn: {
    padding: 4,
  },
  calendarTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  calendarTabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#141A26',
    borderWidth: 1,
    borderColor: '#222E42',
    alignItems: 'center',
  },
  calendarTabBtnActive: {
    backgroundColor: 'rgba(255,230,0,0.12)',
    borderColor: '#FFE600',
  },
  calendarTabText: {
    color: '#8395AF',
    fontSize: 11,
    fontWeight: '800',
  },
  calendarTabTextActive: {
    color: '#FFE600',
    fontWeight: '900',
  },
  calendarItemCard: {
    backgroundColor: '#121722',
    borderWidth: 1,
    borderColor: '#1E2838',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  calendarItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  impactBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  impactHigh: {
    backgroundColor: 'rgba(255,45,85,0.2)',
    borderWidth: 1,
    borderColor: '#FF2D55',
  },
  impactMed: {
    backgroundColor: 'rgba(255,230,0,0.2)',
    borderWidth: 1,
    borderColor: '#FFE600',
  },
  impactText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFF',
  },
  calendarTime: {
    color: '#7B8FA8',
    fontSize: 11,
    fontWeight: '700',
  },
  calendarEventTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
  },
  calendarStatsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  calendarStatText: {
    color: '#A0B2C9',
    fontSize: 11,
    fontWeight: '600',
  },
  calendarAdviceBox: {
    backgroundColor: '#090C12',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 2,
    borderLeftColor: '#00FF66',
  },
  calendarAdviceText: {
    color: '#00FF66',
    fontSize: 10.5,
    fontWeight: '700',
    lineHeight: 15,
  },
  newsCard: {
    backgroundColor: '#121722',
    borderWidth: 1,
    borderColor: '#1E2838',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  newsSourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  newsSource: {
    color: '#00F0FF',
    fontSize: 10,
    fontWeight: '800',
  },
  newsTime: {
    color: '#6F829C',
    fontSize: 10,
  },
  newsTitle: {
    color: '#FFF',
    fontSize: 12.5,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 6,
  },
  newsLinkTap: {
    color: '#FFE600',
    fontSize: 10,
    fontWeight: '800',
  },
  // إشعار عائم منبثق
  floatingToastBox: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#0F141F',
    borderWidth: 1,
    borderColor: '#00FF66',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  floatingToastText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  // ── Antigravity-Style Minimalist Inline Thinking Indicator ──
  inlineThinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  inlineThinkingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A9BB0',
    fontStyle: 'italic',
  },
  inlineThinkingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF66',
  },

  // ── Antigravity-Style Muted Reasoning Accordion ──
  antigravityThoughtWrapper: {
    marginBottom: 8,
    borderRadius: 6,
  },
  antigravityThoughtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  antigravityThoughtHeaderText: {
    fontSize: 11.5,
    color: '#7E8F9F',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  antigravityThoughtBody: {
    marginTop: 4,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#263347',
    paddingVertical: 4,
  },
  antigravityThoughtText: {
    fontSize: 11.5,
    color: '#8A9BB0',
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  typingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  typingNoticeText: {
    color: '#00FF66',
    fontSize: 11,
    fontWeight: '700',
  },
  previewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#181E2B',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#00FF66',
  },
  previewImg: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },
  previewInfo: {
    flex: 1,
  },
  previewText: {
    color: '#FFF',
    fontSize: 12,
  },
  previewRemove: {
    color: '#FF0055',
    fontSize: 11,
    fontWeight: '800',
  },
  recordBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141824',
    borderTopWidth: 2,
    borderTopColor: '#00F0FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  recDotGlow: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF0055',
  },
  recText: {
    color: '#00F0FF',
    fontSize: 11,
    fontWeight: '800',
  },
  recActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recCancelBtn: {
    padding: 4,
  },
  recCancelText: {
    color: '#FF0055',
    fontSize: 12,
    fontWeight: '800',
  },
  recSendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 60,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 99,
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  popoverMenu: {
    backgroundColor: '#11151E',
    borderWidth: 2,
    borderColor: '#00FF66',
    borderRadius: 16,
    padding: 8,
    gap: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#161C28',
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemTextGroup: {
    flex: 1,
  },
  menuItemTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  menuItemDesc: {
    color: '#7D8FA4',
    fontSize: 10.5,
    marginTop: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#10131A',
    borderTopWidth: 1.5,
    borderTopColor: '#1E2536',
    gap: 10,
    zIndex: 100,
  },
  plusMasterBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#181C26',
    borderWidth: 1.5,
    borderColor: '#00FF66',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusMasterBtnActive: {
    backgroundColor: '#00FF66',
  },
  streetInput: {
    flex: 1,
    backgroundColor: '#090B10',
    borderWidth: 1.5,
    borderColor: '#242F42',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    color: '#FFF',
    fontSize: 13.5,
    maxHeight: 90,
    outlineStyle: 'none',
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  sendStickerBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendActive: {
    backgroundColor: '#00FF66',
  },
  sendInactive: {
    backgroundColor: '#181E29',
  },
  /* ── APPLE-STYLE MOBILE SESSIONS DRAWER ── */
  appleDrawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  appleBackdropDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  appleDrawerContainer: {
    width: '85%',
    maxWidth: 360,
    backgroundColor: '#0D111A',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 25,
  },
  appleProfileCard: {
    backgroundColor: '#141A26',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  appleProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appleAvatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 255, 102, 0.12)',
    borderWidth: 1.5,
    borderColor: '#00FF66',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleProfileName: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  appleVipBadge: {
    backgroundColor: '#FFE600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  appleVipBadgeText: {
    color: '#000',
    fontSize: 9.5,
    fontWeight: '900',
  },
  appleProfileRole: {
    color: '#8E9BB0',
    fontSize: 11,
    marginTop: 2,
  },
  appleCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleVaultWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0D15',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  appleVaultItem: {
    flex: 1,
  },
  appleVaultLabel: {
    color: '#6F7F95',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  appleVaultValue: {
    color: '#00FF66',
    fontSize: 13.5,
    fontWeight: '800',
    marginTop: 1,
  },
  appleVaultDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 10,
  },
  appleActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  appleActionNewChat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00FF66',
    paddingVertical: 11,
    borderRadius: 14,
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  appleActionNewChatText: {
    color: '#000000',
    fontSize: 12.5,
    fontWeight: '800',
  },
  appleActionCommunity: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141A26',
    borderWidth: 1,
    borderColor: 'rgba(255, 230, 0, 0.3)',
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  appleCommunityIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFE600',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleCommunityTitle: {
    color: '#FFE600',
    fontSize: 11.5,
    fontWeight: '800',
  },
  appleCommunitySub: {
    color: '#8E9BB0',
    fontSize: 9.5,
  },
  appleSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  appleSectionTitle: {
    color: '#8E9BB0',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  appleCountPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  appleCountPillText: {
    color: '#00FF66',
    fontSize: 10,
    fontWeight: '700',
  },
  appleSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141A26',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 10,
  },
  appleSearchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    padding: 0,
  },
  appleSessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121722',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  appleSessionCardActive: {
    backgroundColor: '#15212A',
    borderColor: '#00FF66',
  },
  appleSessionTouch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  appleSessionDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#3A485E',
  },
  appleSessionDotActive: {
    backgroundColor: '#00FF66',
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  appleSessionTitle: {
    color: '#D1DBE8',
    fontSize: 12.5,
    fontWeight: '600',
  },
  appleSessionTitleActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  appleSessionSub: {
    color: '#728299',
    fontSize: 10,
    marginTop: 2,
  },
  appleDeleteBtn: {
    padding: 6,
    marginLeft: 4,
  },
  appleDrawerFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    marginTop: 8,
  },
  appleDrawerFooterText: {
    color: '#55657B',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* ── COMMUNITY HEADER & NAV BUTTONS ── */
  headerCommunityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 230, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 230, 0, 0.35)',
  },
  headerCommunityText: {
    color: '#FFE600',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  commFloorBadgePill: {
    backgroundColor: '#FFE600',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  commFloorBadgePillText: {
    color: '#000000',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: -0.2,
  },

  /* ── DISCORD MOBILE CHANNEL HEADER ── */
  discordHeaderBar: {
    backgroundColor: '#1E1F22',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#111214',
  },
  discordHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  discordBackBtn: {
    padding: 4,
    marginRight: 2,
  },
  discordHeaderHash: {
    color: '#80848E',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  discordHeaderChannelTitle: {
    color: '#F2F3F5',
    fontSize: 15.5,
    fontWeight: '800',
  },
  discordHeaderTopic: {
    color: '#949BA4',
    fontSize: 10,
    fontWeight: '500',
  },
  discordHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  discordHeaderIconBtn: {
    padding: 4,
  },

  /* ── DISCORD MOBILE FLOOR & MESSAGES (DARK QUANT THEME) ── */
  discordFloorContainer: {
    flex: 1,
    backgroundColor: '#0D0E12',
  },
  discordListContent: {
    paddingVertical: 12,
    paddingBottom: 24,
    maxWidth: 780,
    width: '100%',
    alignSelf: 'center',
  },
  discordWelcomeBanner: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  discordHashCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#161922',
    borderColor: '#FFE600',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  discordBigHash: {
    color: '#FFE600',
    fontSize: 28,
    fontWeight: '900',
  },
  discordWelcomeTitle: {
    color: '#FFE600',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  discordWelcomeDesc: {
    color: '#8A9DB4',
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 14,
  },
  discordFilterTagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  /* ── DISCORD PRO SEGMENTED SWITCHER & PINNED STRIP ── */
  communitySegmentTrackWrapper: {
    width: '100%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#0B0D13',
    borderBottomWidth: 1,
    borderBottomColor: '#181F2E',
    zIndex: 50,
  },
  communitySegmentTrack: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12151E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2536',
    padding: 4,
    height: 40,
  },
  communitySegmentTab: {
    flex: 1,
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderRadius: 9,
  },
  communitySegmentTabActive: {
    backgroundColor: '#1A2233',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.45)',
  },
  communitySegmentTabText: {
    color: '#8A9BB0',
    fontSize: 12,
    fontWeight: '700',
  },
  communitySegmentTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  communitySegmentUnreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFE600',
    marginLeft: 2,
  },
  discordPinnedStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F131C',
    borderBottomWidth: 1,
    borderBottomColor: '#1A2232',
    paddingHorizontal: 16,
    paddingVertical: 7,
    zIndex: 49,
  },
  discordPinnedLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 8,
  },
  discordPinnedTitle: {
    color: '#FFE600',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  discordPinnedSnippet: {
    flex: 1,
    color: '#9EAEBF',
    fontSize: 11.5,
  },
  discordPinnedRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  discordPinnedViewText: {
    color: '#00FF66',
    fontSize: 11,
    fontWeight: '800',
  },
  discordMeBubble: {
    backgroundColor: '#161C28',
    borderWidth: 1,
    borderColor: '#242F44',
    borderRadius: 14,
    borderTopRightRadius: 2,
    paddingHorizontal: 13,
    paddingVertical: 9,
    marginTop: 3,
    alignSelf: 'flex-end',
  },
  discordMeBubbleText: {
    color: '#F4F7FB',
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'right',
  },
  discordDateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 10,
  },
  discordDateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E2536',
  },
  discordDateText: {
    color: '#8A9DB4',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  discordMessageRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 7,
    alignItems: 'flex-start',
  },
  discordMessageRowMe: {
    flexDirection: 'row-reverse',
    alignSelf: 'flex-end',
    justifyContent: 'flex-start',
    maxWidth: '86%',
    paddingRight: 16,
    paddingLeft: 36,
  },
  discordContentColMe: {
    marginRight: 10,
    marginLeft: 0,
    alignItems: 'flex-end',
  },
  discordHeaderRowMe: {
    flexDirection: 'row-reverse',
  },
  discordMeAvatar: {
    borderColor: '#FFE600',
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 230, 0, 0.15)',
  },
  discordAvatarBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0F131C',
    borderWidth: 1,
    borderColor: '#1E2536',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  discordAdminAvatar: {
    borderColor: '#00FF66',
    borderWidth: 1.5,
  },
  discordAvatarSharkLogo: {
    width: 24,
    height: 22,
  },
  discordAvatarLetters: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  discordContentCol: {
    flex: 1,
    marginLeft: 12,
  },
  discordHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  discordAuthorName: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  discordTagBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  discordTagBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  discordTimeText: {
    color: '#65778E',
    fontSize: 10.5,
    fontWeight: '400',
    marginLeft: 4,
  },
  discordPlainMessageText: {
    color: '#DBDEE1',
    fontSize: 13.5,
    lineHeight: 20,
  },
  discordEmbedBox: {
    backgroundColor: '#131620',
    borderWidth: 1,
    borderColor: '#1E2536',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    marginBottom: 4,
    minWidth: 180,
  },
  discordEmbedBoxMe: {
    borderLeftWidth: 0,
    borderRightWidth: 4,
    borderRightColor: '#FFE600',
    alignSelf: 'flex-end',
  },
  discordEmbedTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  discordEmbedTagTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  discordEmbedBodyText: {
    color: '#E0E8F5',
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 6,
  },
  discordEmbedFooterText: {
    color: '#65778E',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  discordReactionsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  discordReactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#141720',
    borderWidth: 1,
    borderColor: '#242D3D',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discordReactionBtnActive: {
    backgroundColor: 'rgba(0, 255, 102, 0.15)',
    borderColor: '#00FF66',
  },
  discordReactionEmoji: {
    fontSize: 13,
  },
  discordReactionNumber: {
    color: '#8A9DB4',
    fontSize: 11,
    fontWeight: '700',
  },
  discordReactionNumberActive: {
    color: '#00FF66',
  },
  discordReactionReplyBtn: {
    padding: 4,
    marginLeft: 4,
  },

  /* ── QUANT HIGH-TECH INPUT BAR ── */
  discordInputWrapper: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#11141D',
    borderTopWidth: 1.5,
    borderTopColor: '#1F2738',
  },
  discordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181C26',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#2A344A',
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 8,
  },
  discordPlusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#202638',
    borderWidth: 1,
    borderColor: '#34415C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discordPlusBtnAdmin: {
    backgroundColor: '#00FF66',
    borderColor: '#00FF66',
  },
  discordTextInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13.5,
    maxHeight: 80,
    paddingVertical: 4,
    outlineStyle: 'none',
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  discordSendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#202638',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discordSendBtnActive: {
    backgroundColor: '#00FF66',
  },
  discordMicBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E2332',
    borderWidth: 1,
    borderColor: '#2A354A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  discordMicBtnRecording: {
    backgroundColor: 'rgba(255, 0, 85, 0.25)',
    borderColor: '#FF0055',
  },
  discordMicBtnHasAudio: {
    backgroundColor: 'rgba(0, 255, 102, 0.25)',
    borderColor: '#00FF66',
  },
  communityAudioAttachedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141A29',
    borderWidth: 1.5,
    borderColor: '#FFE600',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    gap: 10,
  },
  communityAudioAttachedPlay: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFE600',
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityAudioAttachedText: {
    flex: 1,
    color: '#FFE600',
    fontSize: 12,
    fontWeight: '800',
  },
  communityAudioAttachedRemove: {
    padding: 4,
  },
  communityRecordingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161926',
    borderWidth: 1.5,
    borderColor: '#FF0055',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  communityRecordingTimer: {
    color: '#FF0055',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  voiceNotePlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F131D',
    borderWidth: 1.5,
    borderColor: '#29354D',
    borderRadius: 12,
    padding: 10,
    marginVertical: 6,
    gap: 12,
    maxWidth: 320,
  },
  voiceNotePlayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C2436',
    borderWidth: 1.5,
    borderColor: '#FFE600',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceNotePlayCircleActive: {
    backgroundColor: '#00FF66',
    borderColor: '#00FF66',
  },
  voiceWaveCol: {
    flex: 1,
  },
  voiceWaveBarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 26,
    marginBottom: 4,
  },
  voiceWaveSingleBar: {
    width: 3,
    backgroundColor: '#4B5E7E',
    borderRadius: 2,
  },
  voiceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voiceDurationLabel: {
    color: '#FFE600',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  voiceLabelSmall: {
    color: '#6F829D',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  aiVoiceBriefCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D111A',
    borderWidth: 1.5,
    borderColor: '#00FF66',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  aiVoiceBriefPlayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#16222F',
    borderWidth: 1.5,
    borderColor: '#00FF66',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiVoiceBriefPlayCircleActive: {
    backgroundColor: '#00FF66',
    borderColor: '#00FF66',
  },
  aiVoiceBriefWaveCol: {
    flex: 1,
  },
  aiVoiceBriefHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  aiVoiceLivePulse: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#00FF66',
  },
  aiVoiceBriefTitle: {
    color: '#00FF66',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  aiVoiceBriefSub: {
    color: '#7F92A8',
    fontSize: 10,
    fontWeight: '700',
  },
  // ── SMC SIGNAL & ADMIN CONTROL STYLES ──
  discordAdminDotBtn: {
    marginLeft: 'auto',
    padding: 4,
  },
  signalCardBox: {
    backgroundColor: '#111522',
    borderWidth: 1.5,
    borderColor: '#1F2A3F',
    borderLeftWidth: 4,
    borderRadius: 10,
    padding: 14,
    marginTop: 4,
    marginBottom: 4,
    minWidth: 260,
  },
  signalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  signalSymbolWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signalDirBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  signalDirBadgeText: {
    color: '#000000',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  signalSymbolHeader: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  signalTfChip: {
    backgroundColor: '#1E2638',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#2D3A54',
  },
  signalTfChipText: {
    color: '#9CA9BF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  signalLiveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4,
  },
  signalLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  signalLiveTagText: {
    color: '#D1DBE8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  signalMatrixGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  signalMatrixBlock: {
    flex: 1,
    minWidth: 105,
    backgroundColor: '#171C2B',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#26334D',
    padding: 8,
  },
  signalMatrixBlockSL: {
    borderColor: 'rgba(255, 51, 85, 0.35)',
    backgroundColor: 'rgba(255, 51, 85, 0.06)',
  },
  signalMatrixBlockTP: {
    borderColor: 'rgba(0, 255, 102, 0.35)',
    backgroundColor: 'rgba(0, 255, 102, 0.06)',
  },
  signalMatrixLabel: {
    color: '#7D8C9E',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  signalMatrixVal: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  signalRunnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  signalRunnerText: {
    color: '#A0E4F1',
    fontSize: 11,
    fontWeight: '700',
  },
  signalNotesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#141A27',
    borderRadius: 6,
    padding: 9,
    marginBottom: 8,
  },
  signalNotesText: {
    flex: 1,
    color: '#C5D2E5',
    fontSize: 12,
    lineHeight: 18,
  },
  signalFooterRow: {
    marginTop: 2,
  },
  signalFooterText: {
    color: '#65778E',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Admin Composer Popover
  adminComposerPopover: {
    backgroundColor: '#141824',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2A364F',
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  adminComposerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1F293D',
  },
  adminComposerOptionActive: {
    backgroundColor: 'rgba(0, 255, 102, 0.08)',
  },
  adminComposerOptionTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  adminComposerOptionDesc: {
    color: '#7B899E',
    fontSize: 10.5,
    marginTop: 1,
  },
  adminActiveBannerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    borderWidth: 1,
    borderColor: '#00FF66',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 6,
    justifyContent: 'space-between',
  },
  adminActiveBannerText: {
    color: '#00FF66',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // Signal Modal Styles
  signalModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 12, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  signalModalContent: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#10131D',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#222C40',
    padding: 20,
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  signalModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2333',
    paddingBottom: 12,
  },
  signalModalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  signalModalSharkLogo: {
    width: 32,
    height: 32,
  },
  signalModalTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  signalModalSubtitle: {
    color: '#7D8C9E',
    fontSize: 10.5,
    marginTop: 1,
  },
  signalModalCloseBtn: {
    padding: 4,
  },
  signalDirectionSwitchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  signalDirToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#161B28',
    borderWidth: 1.5,
    borderColor: '#26334A',
  },
  signalDirToggleBtnBuy: {
    backgroundColor: '#00FF66',
    borderColor: '#00FF66',
  },
  signalDirToggleBtnSell: {
    backgroundColor: '#FF3355',
    borderColor: '#FF3355',
  },
  signalDirToggleText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  signalFieldLabel: {
    color: '#8E9FB8',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 5,
    marginTop: 6,
  },
  signalSymbolChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  signalSymbolChip: {
    backgroundColor: '#161B28',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#26334A',
  },
  signalSymbolChipActive: {
    backgroundColor: 'rgba(255, 230, 0, 0.15)',
    borderColor: '#FFE600',
  },
  signalSymbolChipText: {
    color: '#9CA9BF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  signalSymbolChipTextActive: {
    color: '#FFE600',
  },
  signalModalInput: {
    backgroundColor: '#141824',
    borderWidth: 1.5,
    borderColor: '#28354D',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 13,
    marginBottom: 8,
    outlineStyle: 'none',
  },
  signalTwoColRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signalSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00FF66',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
    marginBottom: 6,
  },
  signalSubmitBtnText: {
    color: '#000000',
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  // Admin Action Sheet Styles
  adminActionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 12, 0.85)',
    justifyContent: 'flex-end',
  },
  adminActionSheetContent: {
    backgroundColor: '#121622',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1.5,
    borderTopColor: '#253147',
    padding: 20,
    paddingBottom: 30,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  adminActionSheetHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#1F2A3F',
    paddingBottom: 12,
    marginBottom: 10,
  },
  adminActionSheetTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  adminActionSheetUser: {
    color: '#7C8B9F',
    fontSize: 11,
    marginTop: 2,
  },
  adminActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2333',
  },
  adminActionRowText: {
    color: '#E0E8F5',
    fontSize: 13,
    fontWeight: '800',
  },
  adminActionRowSub: {
    color: '#657489',
    fontSize: 10.5,
    marginTop: 1,
  },
  adminActionCancelBtn: {
    backgroundColor: '#181E2C',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 14,
  },
  adminActionCancelBtnText: {
    color: '#8E9CB0',
    fontSize: 13,
    fontWeight: '800',
  },

  // ── CLEAN VIBRANT SPLASH STYLES ──
  appSplashScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#06080B',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  appSplashCenterBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  appSplashSharkLogoBig: {
    width: 170,
    height: 151,
    marginBottom: 14,
  },
  appSplashBrandBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  appSplashLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appSplashWordWhite: {
    fontFamily: Platform.OS === 'ios' ? 'Impact' : 'monospace',
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  appSplashWordYellow: {
    fontFamily: Platform.OS === 'ios' ? 'Impact' : 'monospace',
    fontSize: 24,
    fontWeight: '900',
    color: '#FFE600',
    letterSpacing: 2,
  },
  appSplashTagline: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 1.5,
    marginTop: 4,
    textAlign: 'center',
  },

  headerLiveCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#00FF66',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  headerLiveCallDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#0A0D14',
  },
  headerLiveCallText: {
    color: '#0A0D14',
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  callModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 10, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  callModalContainer: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0E1118',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#00FF66',
    padding: 22,
    alignItems: 'center',
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  callModalContainerExpanded: {
    maxWidth: 820,
    padding: 16,
  },
  callTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
  },
  callStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#1A2332',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#24324A',
  },
  callLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF66',
  },
  callStatusText: {
    color: '#00FF66',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  callTimerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 255, 102, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00FF66',
  },
  callTimerText: {
    color: '#00FF66',
    fontSize: 13,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },

  inCallChartWrapper: {
    width: '100%',
    marginBottom: 12,
  },
  inCallChartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#131924',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1F2A3D',
  },
  inCallChartAssetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  inCallChartLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF66',
  },
  inCallChartTitle: {
    color: '#00FF66',
    fontSize: 12.5,
    fontWeight: '800',
  },
  inCallTfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inCallTfBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1C2434',
    borderWidth: 1,
    borderColor: '#2D3A52',
  },
  inCallTfBtnActive: {
    backgroundColor: '#00FF66',
    borderColor: '#00FF66',
  },
  inCallTfBtnText: {
    color: '#8CA0B8',
    fontSize: 10.5,
    fontWeight: '700',
  },
  inCallTfBtnTextActive: {
    color: '#000',
    fontWeight: '900',
  },
  inCallCloseChartBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 0, 85, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },

  callAvatarWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  callAvatarRing: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#00FF66',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  callFriendName: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '900',
  },
  callFriendRole: {
    color: '#00F0FF',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  voiceWavesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 8,
    marginVertical: 10,
  },
  waveBar: {
    width: 7,
    backgroundColor: '#00FF66',
    borderRadius: 3.5,
  },

  callStatusRibbon: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 8,
  },
  callStatusRibbonText: {
    color: '#00F0FF',
    fontSize: 11.5,
    fontWeight: '700',
    textAlign: 'center',
  },

  transcriptBox: {
    width: '100%',
    backgroundColor: '#070A0F',
    borderWidth: 1,
    borderColor: '#1F2A3D',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    maxHeight: 180,
  },
  callUserSpeechRow: {
    backgroundColor: '#131924',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#24324A',
  },
  callUserSpeechLabel: {
    color: '#FFE600',
    fontSize: 10.5,
    fontWeight: '800',
    marginBottom: 2,
  },
  callUserSpeechText: {
    color: '#FFF',
    fontSize: 12.5,
    lineHeight: 18,
  },
  callAiSpeechRow: {},
  transcriptSpeaker: {
    color: '#00FF66',
    fontSize: 10.5,
    fontWeight: '800',
    marginBottom: 4,
  },
  transcriptContent: {
    color: '#E0E8F5',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },

  voiceCommandsScroll: {
    maxHeight: 46,
    width: '100%',
    marginBottom: 16,
  },
  voiceCommandsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  voiceCommandPill: {
    backgroundColor: '#161D2B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D3A52',
  },
  voiceCommandText: {
    color: '#E0E8F5',
    fontSize: 11.5,
    fontWeight: '700',
  },

  callControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 28,
    width: '100%',
    marginTop: 4,
  },
  callControlCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1C2434',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D3A52',
  },
  callEndBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FF0055',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '135deg' }],
    shadowColor: '#FF0055',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#11151E',
    borderWidth: 2,
    borderColor: '#24324A',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  modalSub: {
    color: '#8A9DB4',
    fontSize: 11.5,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#090B10',
    borderWidth: 1.5,
    borderColor: '#24324A',
    borderRadius: 8,
    padding: 10,
    color: '#FFF',
    fontSize: 13,
    marginBottom: 14,
  },
  modalGoogleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    backgroundColor: '#00FF66',
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalGoogleBtnText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
  },
  modalCloseBtn: {
    marginTop: 12,
  },
  modalCloseText: {
    color: '#65778E',
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Plan Badge Pill in Header ──
  headerPlanPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 6,
  },
  headerPlanPillPremium: {
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    borderColor: '#00FF66',
  },
  headerPlanPillVip: {
    backgroundColor: 'rgba(255, 230, 0, 0.1)',
    borderColor: '#FFE600',
  },
  headerPlanPillFree: {
    backgroundColor: 'rgba(142, 142, 147, 0.12)',
    borderColor: '#636366',
  },
  headerPlanPillEmoji: {
    fontSize: 12,
  },
  headerPlanPillText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // ── Drawer Profile Avatar & Fast Account Buttons ──
  appleAvatarWrapper: {
    position: 'relative',
    width: 48,
    height: 48,
  },
  appleAvatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1C1C1E',
    borderWidth: 1.5,
    borderColor: '#00FF66',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  appleAvatarImg: {
    width: '100%',
    height: '100%',
  },
  appleAvatarPlusBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#00FF66',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0D111A',
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 4,
  },
  appleAvatarEmoji: {
    fontSize: 24,
  },
  drawerQuickLinksRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    width: '100%',
  },
  drawerUpgradeLuxuryBtn: {
    flex: 1.35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 230, 0, 0.08)',
    borderWidth: 1.5,
    borderColor: '#FFE600',
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: 9,
    shadowColor: '#FFE600',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  upgradeCrownCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 230, 0, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerUpgradeLuxuryText: {
    color: '#FFE600',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  drawerGoogleIdBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.35)',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 9,
  },
  drawerGoogleIdText: {
    color: '#E0E6ED',
    fontSize: 10.5,
    fontWeight: '700',
  },
  discordAvatarCustomImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  drawerTopHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  drawerTopHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  drawerSharkLogoIcon: {
    width: 32,
    height: 32,
  },
  drawerTopHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '900',
    textAlign: 'left',
  },
  drawerTopHeaderSubtitle: {
    color: '#00FF66',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1,
  },
  drawerAccountActionRow: {
    marginTop: 12,
    marginBottom: 4,
    width: '100%',
  },
  drawerEditProfileFullBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 255, 102, 0.08)',
    borderWidth: 1,
    borderColor: '#00FF66',
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  drawerEditProfileFullBtnText: {
    color: '#00FF66',
    fontSize: 11.5,
    fontWeight: '800',
  },
  drawerSubActionRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  drawerAccountBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: '#00FF66',
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  drawerAccountBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Current Active Plan Preview in Google Sign-In ──
  authCurrentPlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#090B10',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
    width: '100%',
  },
  authCurrentPlanLabel: {
    color: '#8A9DB4',
    fontSize: 11.5,
  },
  authCurrentPlanBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  authCurrentPlanBadgeText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900',
  },

  // ── Community Rules & Avatar Modal Styles ──
  rulesModalTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 6,
  },
  rulesModalSubtitle: {
    color: '#8A9DB4',
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: 3,
  },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#0F131A',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  ruleIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleTitle: {
    color: '#00FF66',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
    textAlign: 'right',
  },
  ruleDesc: {
    color: '#9CA3AF',
    fontSize: 10.5,
    lineHeight: 15,
    textAlign: 'right',
  },
  avatarPickerSectionTitle: {
    color: '#FFE600',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 8,
    textAlign: 'right',
  },
  avatarChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    justifyContent: 'center',
  },
  avatarChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F131A',
    borderWidth: 1.5,
    borderColor: '#1F2937',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  avatarChipActive: {
    borderColor: '#00FF66',
    backgroundColor: 'rgba(0, 255, 102, 0.12)',
  },
  avatarChipEmoji: {
    fontSize: 16,
  },
  avatarChipLabel: {
    color: '#8A9DB4',
    fontSize: 11,
    fontWeight: '700',
  },
  avatarChipLabelActive: {
    color: '#00FF66',
    fontWeight: '800',
  },
  rulesCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#090B10',
    borderWidth: 1,
    borderColor: '#24324A',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  customCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#65778E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customCheckboxActive: {
    backgroundColor: '#00FF66',
    borderColor: '#00FF66',
  },
  rulesCheckboxText: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'right',
  },
  rulesConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00FF66',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  rulesConfirmBtnDisabled: {
    backgroundColor: '#273549',
    opacity: 0.6,
  },
  rulesConfirmBtnText: {
    color: '#000',
    fontSize: 12.5,
    fontWeight: '900',
  },

  // ── Plan Upgrade Modal Styles ──
  planModalTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
  planModalSubtitle: {
    color: '#8A9DB4',
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: 3,
  },
  planTierCard: {
    backgroundColor: '#0F131A',
    borderWidth: 1.5,
    borderColor: '#1F2937',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  planTierCardVip: {
    borderColor: '#8A7500',
    backgroundColor: '#141208',
  },
  planTierCardPremium: {
    borderColor: '#00662A',
    backgroundColor: '#09150F',
  },
  planTierCardCurrent: {
    borderColor: '#8E8E93',
  },
  planTierCardCurrentVip: {
    borderColor: '#FFE600',
    shadowColor: '#FFE600',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  planTierCardCurrentPremium: {
    borderColor: '#00FF66',
    shadowColor: '#00FF66',
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  planTierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 6,
  },
  planTierName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
  planTierPrice: {
    color: '#8A9DB4',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  planCurrentTag: {
    backgroundColor: '#636366',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  planCurrentTagText: {
    color: '#FFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  planTierFeature: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 18,
    marginBottom: 2,
    textAlign: 'right',
  },
  planSelectBtn: {
    marginTop: 10,
    backgroundColor: '#1F2937',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  planSelectBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
  },
  planActiveBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#636366',
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  planActiveBtnText: {
    color: '#65778E',
    fontSize: 11,
    fontWeight: '800',
  },

  // ── Custom Profile & Avatar Upload Styles ──
  avatarUploadHeroBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#090B10',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    width: '100%',
  },
  avatarHeroCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#141822',
    borderWidth: 2,
    borderColor: '#00FF66',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  avatarHeroImg: {
    width: '100%',
    height: '100%',
  },
  avatarHeroEmoji: {
    fontSize: 34,
  },
  avatarDeviceUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00FF66',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  avatarDeviceUploadBtnText: {
    color: '#000',
    fontSize: 11.5,
    fontWeight: '900',
  },
  avatarSubOrText: {
    color: '#8A9DB4',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  avatarChipEmojiOnly: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0F131A',
    borderWidth: 1.5,
    borderColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarChipEmojiOnlyActive: {
    borderColor: '#00FF66',
    backgroundColor: 'rgba(0, 255, 102, 0.15)',
  },
  editProfileTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
  editProfileSubtitle: {
    color: '#8A9DB4',
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: 3,
  },
  editProfileFieldLabel: {
    color: '#CBD5E1',
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'right',
    width: '100%',
  },
  editProfileSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00FF66',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 6,
    width: '100%',
  },
  editProfileSaveBtnText: {
    color: '#000',
    fontSize: 12.5,
    fontWeight: '900',
  },

  // ── Luxury Fog & Blur Styles for Free Tier ──
  vipBlurContainer: {
    position: 'relative',
    marginVertical: 8,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#0C0F17',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 230, 0, 0.3)',
    minHeight: 180,
  },
  vipBlurredContent: {
    padding: 14,
    opacity: 0.35,
    ...(Platform.OS === 'web' ? { filter: 'blur(7px)', userSelect: 'none' } : {}),
  },
  blurredText: {
    color: '#8A9DB4',
    fontSize: 14,
    lineHeight: 22,
  },
  mockSignalBox: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#161D2B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A364F',
  },
  vipFogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 13, 19, 0.84)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    zIndex: 10,
  },
  vipLockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 230, 0, 0.12)',
    borderWidth: 1.5,
    borderColor: '#FFE600',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 8,
  },
  vipLockBadgeTitle: {
    color: '#FFE600',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  vipLockBadgeDesc: {
    color: '#CBD5E1',
    fontSize: 11.5,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
    maxWidth: 290,
  },
  vipUnlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFE600',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    shadowColor: '#FFE600',
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  vipUnlockBtnText: {
    color: '#000000',
    fontSize: 12.5,
    fontWeight: '900',
  },

  // ── Community Locked Bar Styles ──
  communityLockedWrapper: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#11141D',
    borderTopWidth: 1.5,
    borderTopColor: '#1F2738',
  },
  communityLockedBar: {
    backgroundColor: '#161A26',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 230, 0, 0.35)',
    borderRadius: 14,
    padding: 10,
  },
  communityLockedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  communityLockedIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 230, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityLockedTitle: {
    color: '#FFE600',
    fontSize: 12,
    fontWeight: '900',
  },
  communityLockedSub: {
    color: '#8A9DB4',
    fontSize: 10.5,
    marginTop: 2,
  },
  communityUpgradePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFE600',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  communityUpgradePillText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900',
  },
});
