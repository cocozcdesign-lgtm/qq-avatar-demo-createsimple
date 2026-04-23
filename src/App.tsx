import React, { useState, useEffect, useRef } from 'react';
import StatusBar from './components/MessageList/StatusBar';
import NavBar from './components/MessageList/NavBar';
import type { AvatarEffect } from './components/MessageList/NavBar';
import SearchBar from './components/MessageList/SearchBar';
import MessageItem from './components/MessageList/MessageItem';
import BottomTabBar from './components/MessageList/BottomTabBar';
import AvatarUpgrade from './components/AvatarUpgrade';
import { messageData } from './components/MessageList/data';
import './components/MessageList/style.css';
import type { UpgradeVariant, ScanVariant, RevealVariant, FlowType, TransitionVariant, AwakenVariant, SaveVariant, SaveExitVariant, IntroVariant } from './components/AvatarUpgrade';

const SETTINGS_KEY = 'avatar-upgrade-settings';
const SETTINGS_VERSION = 6;

const ALL_AVATAR_EFFECTS: AvatarEffect[] = [
  'peek-avatar', 'upgrade-badge', 'flip-enter', 'shake-enter', 'organic-blob', 'energy-ring', 'red-dot', 'bubble-tip', 'spotlight', 'up-tag',
];

interface Settings {
  isLoggedIn: boolean;
  variant: UpgradeVariant;
  editable: boolean;
  scanVariant: ScanVariant;
  revealVariant: RevealVariant;
  flowType: FlowType;
  transitionVariant: TransitionVariant;
  awakenVariant: AwakenVariant;
  saveVariant: SaveVariant;
  saveExitVariant: SaveExitVariant;
  introVariant: IntroVariant;
  avatarEffect: AvatarEffect;
}

function loadSettings(): Settings {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (raw) {
    try {
      const t = JSON.parse(raw);
      if (t._v === SETTINGS_VERSION) {
        return {
          isLoggedIn: t.isLoggedIn ?? false,
          variant: ['flip', 'shake', 'float'].includes(t.variant) ? t.variant : 'float',
          editable: t.editable ?? true,
          scanVariant: ['sweep', 'outline'].includes(t.scanVariant) ? t.scanVariant : 'outline',
          revealVariant: ['silhouette', 'pillar', 'particle'].includes(t.revealVariant) ? t.revealVariant : 'silhouette',
          flowType: ['full', 'infiltrate'].includes(t.flowType) ? t.flowType : 'full',
          transitionVariant: ['direct', 'shrink', 'shatter'].includes(t.transitionVariant) ? t.transitionVariant : 'direct',
          awakenVariant: ['click', 'auto'].includes(t.awakenVariant) ? t.awakenVariant : 'click',
          saveVariant: ['simple', 'edit'].includes(t.saveVariant) ? t.saveVariant : 'simple',
          saveExitVariant: ['shrink-to-corner', 'fly-out'].includes(t.saveExitVariant) ? t.saveExitVariant : 'shrink-to-corner',
          introVariant: ['replace', 'stack'].includes(t.introVariant) ? t.introVariant : 'replace',
          avatarEffect: ALL_AVATAR_EFFECTS.includes(t.avatarEffect) ? t.avatarEffect : 'peek-avatar',
        };
      }
    } catch { /* ignore */ }
  }
  return { isLoggedIn: false, variant: 'float', editable: true, scanVariant: 'outline', revealVariant: 'silhouette', flowType: 'full', transitionVariant: 'direct', awakenVariant: 'click', saveVariant: 'simple', saveExitVariant: 'shrink-to-corner', introVariant: 'replace', avatarEffect: 'peek-avatar' };
}

interface MenuOption {
  key: string;
  label: string;
  group: string;
}

const menuOptions: MenuOption[] = [
  { key: 'logged-in', label: '已登录（小人）', group: '登录状态' },
  { key: 'logged-out', label: '未登录（头像）', group: '登录状态' },
  // ========== 1. 吸引注意 ==========
  { key: 'effect-red-dot', label: '红点', group: '① 吸引注意' },
  { key: 'effect-shake-enter', label: '抖动入场', group: '① 吸引注意' },
  { key: 'effect-energy-ring', label: '能量圈', group: '① 吸引注意' },
  { key: 'effect-upgrade-badge', label: '升级角标 ✦', group: '① 吸引注意' },
  { key: 'effect-organic-blob', label: '有机形态', group: '① 吸引注意' },
  { key: 'effect-up-tag', label: 'UP', group: '① 吸引注意' },
  // ========== 2. 角色化引导 ==========
  { key: 'effect-peek-avatar', label: '小人探头', group: '② 角色化引导' },
  { key: 'effect-silhouette-hint', label: 'QQ秀剪影', group: '② 角色化引导' },
  // ========== 3. 负向施压 ==========
  { key: 'effect-flip-enter', label: '翻面剪影', group: '③ 负向施压' },
  // ========== 4. 直白告知 ==========
  { key: 'effect-bubble-tip', label: '气泡提示', group: '④ 直白告知' },
  { key: 'effect-spotlight', label: '蒙层聚焦', group: '④ 直白告知' },
  // 流程类型
  { key: 'flow-full', label: '长流程', group: '流程类型' },
  { key: 'flow-infiltrate', label: '渗透流程', group: '流程类型' },
  // 长流程子选项
  { key: 'flip', label: '翻转头像', group: '升级方案' },
  { key: 'shake', label: '抖动头像', group: '升级方案' },
  { key: 'float', label: '浮动头像', group: '升级方案' },
  { key: 'sweep', label: '扫光扫描', group: '扫描方案' },
  { key: 'outline', label: '描边扫描', group: '扫描方案' },
  { key: 'silhouette', label: '剪影揭色', group: '揭晓方案' },
  { key: 'pillar', label: '光柱降临', group: '揭晓方案' },
  { key: 'particle', label: '碎光聚合', group: '揭晓方案' },
  { key: 'editable', label: '可编辑标签', group: '扩展选项' },
  // 渗透流程子选项
  { key: 'trans-direct', label: '直接淡出', group: '渗透过渡' },
  { key: 'trans-shrink', label: '缩放吸入', group: '渗透过渡' },
  { key: 'trans-shatter', label: '碎裂化粒子', group: '渗透过渡' },
  { key: 'awaken-click', label: '点击唤醒', group: '唤醒方案' },
  { key: 'awaken-auto', label: '自动播放', group: '唤醒方案' },
  { key: 'save-simple', label: '仅保存按钮', group: '保存方案' },
  { key: 'save-edit', label: '编辑+保存', group: '保存方案' },
  { key: 'intro-replace', label: '逐句覆盖', group: '引言方案' },
  { key: 'intro-stack', label: '逐句堆叠', group: '引言方案' },
  { key: 'saveexit-shrink', label: '整体收缩', group: '保存退出' },
  { key: 'saveexit-flyout', label: '形象飞出', group: '保存退出' },
];

const MessageListPage: React.FC<{
  mode: 'logged-in' | 'logged-out';
  avatarSrc: string;
  upgradeVariant: UpgradeVariant;
  scanVariant: ScanVariant;
  revealVariant: RevealVariant;
  editableTags: boolean;
  flowType: FlowType;
  transitionVariant: TransitionVariant;
  awakenVariant: AwakenVariant;
  saveVariant: SaveVariant;
  saveExitVariant: SaveExitVariant;
  introVariant: IntroVariant;
  avatarEffect: AvatarEffect;
  onSave?: () => void;
}> = ({ mode, avatarSrc, upgradeVariant, scanVariant, revealVariant, editableTags, flowType, transitionVariant, awakenVariant, saveVariant, saveExitVariant, introVariant, avatarEffect, onSave }) => {
  const isLoggedOut = mode === 'logged-out';
  const [upgradeVisible, setUpgradeVisible] = useState(false);
  const [spotlightDismissed, setSpotlightDismissed] = useState(false);
  const showSpotlight = isLoggedOut && avatarEffect === 'spotlight' && !spotlightDismissed;

  // 切换方案时重置蒙层
  useEffect(() => {
    setSpotlightDismissed(false);
  }, [avatarEffect]);
  const initialCount = messageData.length;
  const [messages, setMessages] = useState(() =>
    messageData.slice(0, initialCount).map((e, i) => ({
      ...e,
      _id: i,
      badgeCount: e.badgeCount || (i % 9 + 1),
      hasDot: e.hasDot ?? false,
      _isNew: false,
    }))
  );
  const nextId = useRef(initialCount);
  const nextIdx = useRef(initialCount);

  useEffect(() => {
    // 所有模式都静态展示，不再自动新增消息
  }, [isLoggedOut]);

  return (
    <div className="message-list-page">
      <div className="top-area">
        <StatusBar />
        <NavBar
          avatarSrc={isLoggedOut ? avatarSrc : undefined}
          onAvatarClick={isLoggedOut ? () => setUpgradeVisible(true) : undefined}
          avatarEffect={isLoggedOut ? avatarEffect : undefined}
        />
      </div>
      <div className="content-area">
        <SearchBar />
        <div className="message-items">
          {messages.map((m) => (
            <div key={m._id} className={m._isNew ? 'message-item-animated' : ''}>
              <MessageItem {...m} />
            </div>
          ))}
        </div>
      </div>
      <BottomTabBar />
      {/* 蒙层聚焦方案 */}
      {showSpotlight && (
        <div
          className="spotlight-overlay"
          onClick={() => setSpotlightDismissed(true)}
        >
          <div
            className="spotlight-hole"
            onClick={(e) => {
              e.stopPropagation();
              setUpgradeVisible(true);
              setSpotlightDismissed(true);
            }}
          />
          <div className="spotlight-guide">
            <div className="spotlight-arrow" />
            <span className="spotlight-guide-text">点击头像，创建你的QQ秀</span>
          </div>
        </div>
      )}
      <AvatarUpgrade
        visible={upgradeVisible}
        onClose={() => setUpgradeVisible(false)}
        avatarSrc={avatarSrc || '/qq-avatar-demo-createsimple/assets/avatar.png'}
        variant={upgradeVariant}
        scanVariant={scanVariant}
        revealVariant={revealVariant}
        editable={editableTags}
        flowType={flowType}
        transitionVariant={transitionVariant}
        awakenVariant={awakenVariant}
        saveVariant={saveVariant}
        saveExitVariant={saveExitVariant}
        introVariant={introVariant}
        onStartUpgrade={() => { console.log('开始升级！'); }}
        onSave={() => {
          setUpgradeVisible(false);
          onSave?.();
        }}
      />
    </div>
  );
};

const App: React.FC = () => {
  const initialSettings = useRef(loadSettings()).current;
  const [isLoggedIn, setIsLoggedIn] = useState(initialSettings.isLoggedIn);
  const [variant, setVariant] = useState<UpgradeVariant>(initialSettings.variant);
  const [scanVariant, setScanVariant] = useState<ScanVariant>(initialSettings.scanVariant);
  const [revealVariant, setRevealVariant] = useState<RevealVariant>(initialSettings.revealVariant);
  const [flowType, setFlowType] = useState<FlowType>(initialSettings.flowType);
  const [transitionVariant, setTransitionVariant] = useState<TransitionVariant>(initialSettings.transitionVariant);
  const [awakenVariant, setAwakenVariant] = useState<AwakenVariant>(initialSettings.awakenVariant);
  const [saveVariant, setSaveVariant] = useState<SaveVariant>(initialSettings.saveVariant);
  const [saveExitVariant, setSaveExitVariant] = useState<SaveExitVariant>(initialSettings.saveExitVariant);
  const [introVariant, setIntroVariant] = useState<IntroVariant>(initialSettings.introVariant);
  const [editable, setEditable] = useState(initialSettings.editable);
  const [avatarEffect, setAvatarEffect] = useState<AvatarEffect>(initialSettings.avatarEffect);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      _v: SETTINGS_VERSION, isLoggedIn, variant, editable, scanVariant,
      revealVariant, flowType, transitionVariant, awakenVariant, saveVariant, saveExitVariant, introVariant, avatarEffect,
    }));
  }, [isLoggedIn, variant, editable, scanVariant, revealVariant, flowType, transitionVariant, awakenVariant, saveVariant, saveExitVariant, introVariant, avatarEffect]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const revealKeys = ['silhouette', 'pillar', 'particle'];
  const transitionKeys = ['trans-direct', 'trans-shrink', 'trans-shatter'];
  const awakenKeys = ['awaken-click', 'awaken-auto'];
  const saveKeys = ['save-simple', 'save-edit'];
  const saveExitKeys = ['saveexit-shrink', 'saveexit-flyout'];
  const introKeys = ['intro-replace', 'intro-stack'];
  const handleSelect = (key: string) => {
    if (key === 'logged-in') { setIsLoggedIn(true); setMenuOpen(false); return; }
    if (key === 'logged-out') { setIsLoggedIn(false); setMenuOpen(false); return; }
    if (key.startsWith('effect-')) {
      setAvatarEffect(key.replace('effect-', '') as AvatarEffect);
      setMenuOpen(false);
      return;
    }
    if (key === 'flow-full') setFlowType('full');
    else if (key === 'flow-infiltrate') setFlowType('infiltrate');
    else if (key === 'editable') { setEditable(v => !v); return; }
    else if (key === 'sweep' || key === 'outline') setScanVariant(key);
    else if (revealKeys.includes(key)) setRevealVariant(key as RevealVariant);
    else if (transitionKeys.includes(key)) setTransitionVariant(key.replace('trans-', '') as TransitionVariant);
    else if (awakenKeys.includes(key)) setAwakenVariant(key.replace('awaken-', '') as AwakenVariant);
    else if (saveKeys.includes(key)) setSaveVariant(key.replace('save-', '') as SaveVariant);
    else if (saveExitKeys.includes(key)) setSaveExitVariant(key === 'saveexit-shrink' ? 'shrink-to-corner' : 'fly-out');
    else if (introKeys.includes(key)) setIntroVariant(key.replace('intro-', '') as IntroVariant);
    else {
      setIsLoggedIn(false);
      setVariant(key as UpgradeVariant);
    }
    setMenuOpen(false);
  };

  const isActive = (key: string): boolean => {
    if (key === 'logged-in') return isLoggedIn;
    if (key === 'logged-out') return !isLoggedIn;
    if (key.startsWith('effect-')) return avatarEffect === key.replace('effect-', '');
    if (key === 'flow-full') return flowType === 'full';
    if (key === 'flow-infiltrate') return flowType === 'infiltrate';
    if (key === 'flip' || key === 'shake' || key === 'float') return variant === key;
    if (key === 'sweep' || key === 'outline') return scanVariant === key;
    if (revealKeys.includes(key)) return revealVariant === key;
    if (transitionKeys.includes(key)) return transitionVariant === key.replace('trans-', '');
    if (awakenKeys.includes(key)) return awakenVariant === key.replace('awaken-', '');
    if (saveKeys.includes(key)) return saveVariant === key.replace('save-', '');
    if (saveExitKeys.includes(key)) return saveExitVariant === (key === 'saveexit-shrink' ? 'shrink-to-corner' : 'fly-out');
    if (introKeys.includes(key)) return introVariant === key.replace('intro-', '');
    if (key === 'editable') return editable;
    return false;
  };

  // 智能隐藏：某组的所有选项都不可用时，整组隐藏
  const isGroupVisible = (group: string): boolean => {
    if (group === '登录状态') return true;
    // 四大类入口方案：仅未登录显示
    if (['① 吸引注意', '② 角色化引导', '③ 负向施压', '④ 直白告知'].includes(group)) return !isLoggedIn;
    if (group === '流程类型') return !isLoggedIn;
    // 长流程子选项
    if (['升级方案', '扫描方案', '揭晓方案', '扩展选项'].includes(group)) {
      return !isLoggedIn && flowType === 'full';
    }
    // 渗透流程子选项
    if (['渗透过渡', '唤醒方案', '保存方案', '引言方案', '保存退出'].includes(group)) {
      return !isLoggedIn && flowType === 'infiltrate';
    }
    return true;
  };

  const effectLabels: Record<string, string> = {
    'peek-avatar': '探头', 'upgrade-badge': '角标',
    'flip-enter': '翻面', 'shake-enter': '抖动', 'organic-blob': '有机形态', 'energy-ring': '能量圈',
    'red-dot': '红点',
    'bubble-tip': '气泡',
    'spotlight': '蒙层',
    'up-tag': 'UP',
  };
  const variantLabels: Record<string, string> = { flip: '翻转', shake: '抖动', float: '浮动' };
  const scanLabels: Record<string, string> = { sweep: '扫光', outline: '描边' };
  const revealLabels: Record<string, string> = { silhouette: '剪影', pillar: '光柱', particle: '碎光' };
  const transitionLabels: Record<string, string> = { direct: '淡出', shrink: '吸入', shatter: '碎裂' };
  const awakenLabels: Record<string, string> = { click: '点击', auto: '自动' };
  const saveLabels: Record<string, string> = { simple: '仅保存', edit: '编辑' };
  const saveExitLabels: Record<string, string> = { 'shrink-to-corner': '收缩', 'fly-out': '飞出' };
  const introLabels: Record<string, string> = { replace: '覆盖', stack: '堆叠' };
  const flowLabels: Record<string, string> = { full: '长流程', infiltrate: '渗透' };

  const statusText = isLoggedIn
    ? '已登录'
    : flowType === 'infiltrate'
      ? `${effectLabels[avatarEffect]} · ${flowLabels[flowType]} · ${transitionLabels[transitionVariant]} · ${awakenLabels[awakenVariant]} · ${introLabels[introVariant]} · ${saveLabels[saveVariant]} · ${saveExitLabels[saveExitVariant]}`
      : `${effectLabels[avatarEffect]} · ${flowLabels[flowType]} · ${variantLabels[variant]} · ${scanLabels[scanVariant]} · ${revealLabels[revealVariant]}${editable ? ' · 编辑' : ''}`;

  const groups = ['登录状态', '① 吸引注意', '② 角色化引导', '③ 负向施压', '④ 直白告知', '流程类型', '升级方案', '扫描方案', '揭晓方案', '渗透过渡', '唤醒方案', '引言方案', '保存方案', '保存退出', '扩展选项'];

  let visibleGroupIdx = 0;

  return (
    <div style={{ position: 'relative' }}>
      <MessageListPage
        key={`${isLoggedIn}-${variant}-${editable}-${scanVariant}-${revealVariant}-${flowType}-${transitionVariant}-${awakenVariant}-${saveVariant}-${saveExitVariant}-${introVariant}-${avatarEffect}`}
        mode={isLoggedIn ? 'logged-in' : 'logged-out'}
        avatarSrc="/qq-avatar-demo-createsimple/assets/avatar.png"
        upgradeVariant={variant}
        scanVariant={scanVariant}
        revealVariant={revealVariant}
        editableTags={editable}
        flowType={flowType}
        transitionVariant={transitionVariant}
        awakenVariant={awakenVariant}
        saveVariant={saveVariant}
        saveExitVariant={saveExitVariant}
        introVariant={introVariant}
        avatarEffect={avatarEffect}
        onSave={() => setIsLoggedIn(true)}
      />

      <div ref={menuRef} style={{ position: 'absolute', top: 6, right: 16, zIndex: 999 }}>
        <button
          onClick={() => setMenuOpen(v => !v)}
          style={{
            background: 'rgba(0,0,0,0.55)',
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            padding: '4px 12px',
            fontSize: 11,
            fontFamily: 'PingFang SC, sans-serif',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>{statusText}</span>
          <span style={{ fontSize: 8, opacity: 0.7, transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
        </button>

        {menuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 4,
            background: 'rgba(30,30,30,0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: 12,
            padding: '6px 0',
            minWidth: 150,
            maxHeight: 520,
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            animation: 'menuFadeIn 150ms ease-out',
          }}>
            {(() => { visibleGroupIdx = 0; return null; })()}
            {groups.map((group) => {
              if (!isGroupVisible(group)) return null;
              const opts = menuOptions.filter(o => o.group === group);
              if (opts.length === 0) return null;
              const showDivider = visibleGroupIdx > 0;
              visibleGroupIdx++;
              return (
                <div key={group}>
                  {showDivider && <div style={{ height: 0.5, background: 'rgba(255,255,255,0.1)', margin: '4px 12px' }} />}
                  <div style={{ padding: '5px 14px 3px', fontSize: 9, color: 'rgba(255,255,255,0.35)', fontFamily: 'PingFang SC, sans-serif' }}>
                    {group}
                  </div>
                  {opts.map(opt => {
                    const active = isActive(opt.key);
                    return (
                      <div
                        key={opt.key}
                        onClick={() => handleSelect(opt.key)}
                        style={{
                          padding: '6px 14px',
                          fontSize: 12,
                          fontFamily: 'PingFang SC, sans-serif',
                          color: active ? '#5AC8FA' : 'rgba(255,255,255,0.85)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'background 0.15s',
                          borderRadius: 6,
                          margin: '0 4px',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span>{opt.label}</span>
                        {active && <span style={{ fontSize: 10 }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes menuFadeIn {
          from { opacity: 0; transform: translateY(-4px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default App;
