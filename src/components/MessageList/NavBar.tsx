import React, { useEffect, useState } from 'react';

const assetBase = '/qq-avatar-demo-createsimple/assets/CodeBuddyAssets/4337_29293';

export type AvatarEffect =
  | 'peek-avatar'
  | 'upgrade-badge'
  | 'flip-enter'
  | 'shake-enter'
  | 'organic-blob'
  | 'energy-ring'
  | 'red-dot'
  | 'bubble-tip'
  | 'spotlight'
  | 'up-tag';

interface NavBarProps {
  avatarSrc?: string;
  onAvatarClick?: () => void;
  avatarEffect?: AvatarEffect;
}

const NavBar: React.FC<NavBarProps> = ({ avatarSrc, onAvatarClick, avatarEffect = 'peek-avatar' }) => {
  const [shakeDone, setShakeDone] = useState(false);

  // flip-enter: 循环翻转（翻到背面停留2s后翻回，再等3s又翻过去）
  const [flipState, setFlipState] = useState<'idle' | 'flipping' | 'back' | 'returning'>('idle');
  useEffect(() => {
    if (avatarEffect !== 'flip-enter') {
      setFlipState('idle');
      return;
    }
    // 只翻一次：翻到背面 → 停留2秒 → 翻回正面
    let cancelled = false;
    const t1 = setTimeout(() => {
      if (cancelled) return;
      setFlipState('flipping');
    }, 400);
    const t2 = setTimeout(() => {
      if (cancelled) return;
      setFlipState('back');
    }, 700); // 400 + 300ms动画
    const t3 = setTimeout(() => {
      if (cancelled) return;
      setFlipState('returning');
    }, 2700); // 700 + 2000ms停留
    const t4 = setTimeout(() => {
      if (cancelled) return;
      setFlipState('idle');
    }, 3000); // 2700 + 300ms翻回动画

    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [avatarEffect]);

  // shake-enter
  useEffect(() => {
    if (avatarEffect === 'shake-enter') {
      setShakeDone(false);
      const t = setTimeout(() => setShakeDone(true), 600);
      return () => clearTimeout(t);
    }
  }, [avatarEffect]);

  const effectClass = `nav-avatar-effect-${avatarEffect}`;
  const shakeClass = avatarEffect === 'shake-enter' && !shakeDone ? 'nav-avatar-shake-active' : '';


  return (
    <div className="nav-bar">
      <div className="nav-bar-content">
        <div className="nav-bar-left">
          {avatarSrc ? (
            <div className={`nav-avatar-circle ${effectClass} ${shakeClass}`} onClick={onAvatarClick} style={{ cursor: 'pointer' }}>
              {/* 呼吸光环（含微光扫过） */}
              {avatarEffect === 'breathing-glow' && <><div className="nav-avatar-glow-ring" /><div className="nav-avatar-shimmer" /></>}
              {/* 边框流光 */}
              {avatarEffect === 'border-flow' && (
                <svg className="nav-avatar-border-flow" viewBox="0 0 46 46" fill="none">
                  <defs>
                    <linearGradient id="borderGrad" x1="0" y1="0" x2="46" y2="46" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#B4E4FF" />
                      <stop offset="50%" stopColor="#0099FF" />
                      <stop offset="100%" stopColor="#82CFFF" />
                    </linearGradient>
                  </defs>
                  <circle cx="23" cy="23" r="21" stroke="url(#borderGrad)" strokeWidth="2.5" strokeDasharray="8 5" fill="none" />
                </svg>
              )}
              {/* 微光扫过 */}
              {avatarEffect === 'shimmer-sweep' && <div className="nav-avatar-shimmer" />}
              {/* 小人探头 */}
              {avatarEffect === 'peek-avatar' && (
                <div className="nav-avatar-peek">
                  <img src={`${assetBase}/60.svg`} alt="peek" className="nav-avatar-peek-img" />
                </div>
              )}
              {/* 翻面剪影方案：双面卡片 */}
              {avatarEffect === 'flip-enter' ? (
                <div className={`nav-flip-card ${flipState === 'flipping' ? 'nav-flip-card-flipping' : ''} ${flipState === 'back' ? 'nav-flip-card-flipped' : ''} ${flipState === 'returning' ? 'nav-flip-card-returning' : ''}`}>
                  {/* 正面：头像 */}
                  <div className="nav-flip-face nav-flip-front">
                    <img src={avatarSrc} alt="avatar" className="nav-flip-face-img" />
                  </div>
                  {/* 背面：小人剪影 */}
                  <div className="nav-flip-face nav-flip-back">
                    <img src="/qq-avatar-demo-createsimple/assets/小人剪影.png" alt="silhouette" className="nav-flip-silhouette-img" />
                  </div>
                </div>
              ) : avatarEffect === 'organic-blob' ? (
                <div className="nav-avatar-organic-wrap">
                  <div className="nav-organic-border" />
                  <div className="nav-organic-img-clip">
                    <img src={avatarSrc} alt="avatar" className="nav-organic-img" />
                  </div>
                </div>
              ) : (
                <img src={avatarSrc} alt="avatar" className="nav-avatar-circle-img" />
              )}
              {/* 升级角标：精致向上箭头 */}
              {avatarEffect === 'upgrade-badge' && (
                <div className="nav-avatar-badge">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2.5L4 8.5h2.5V13h3V8.5H12L8 2.5z" fill="url(#badgeArrowGrad)" />
                    <defs>
                      <linearGradient id="badgeArrowGrad" x1="8" y1="2.5" x2="8" y2="13" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FFFFFF" />
                        <stop offset="1" stopColor="#B8E4FF" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              )}
              {/* QQ秀剪影 */}
              {avatarEffect === 'silhouette-hint' && (
                <div className="nav-avatar-silhouette">
                  <img src="/qq-avatar-demo-createsimple/assets/小人剪影.png" alt="silhouette" className="nav-avatar-silhouette-img" />
                </div>
              )}
              {/* 能量圈 */}
              {avatarEffect === 'energy-ring' && (
                <div className="nav-energy-ring" />
              )}
              {/* 红点 */}
              {avatarEffect === 'red-dot' && (
                <div className="nav-avatar-red-dot" />
              )}
              {/* 气泡提示 */}
              {avatarEffect === 'bubble-tip' && (
                <div className="nav-bubble-tip">
                  <span className="nav-bubble-tip-text">来创建QQ秀吧</span>
                </div>
              )}
              {/* UP 文字标签 */}
              {avatarEffect === 'up-tag' && (
                <div className="nav-avatar-up-tag">
                  <svg className="nav-up-tag-arrow" width="8" height="8" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2L3 9h3.5v5h3V9H13L8 2z" fill="white" />
                  </svg>
                  <span className="nav-avatar-up-tag-text">UP</span>
                </div>
              )}
            </div>
          ) : (
            <img src={`${assetBase}/60.svg`} alt="avatar" className="nav-avatar-icon" onClick={onAvatarClick} style={{ cursor: 'pointer' }} />
          )}
          <div className="nav-title-area">
            <span className="nav-title">飞翔的企鹅</span>
            <div className="nav-status">
              <img src={`${assetBase}/42.svg`} alt="status" className="nav-status-icon" />
              <span className="nav-status-text">在线</span>
              <img src={`${assetBase}/43.svg`} alt="arrow" className="nav-status-arrow" />
            </div>
          </div>
        </div>
        <div className="nav-bar-right">
          <img src={`${assetBase}/44.svg`} alt="add" className="nav-add-icon" />
        </div>
      </div>
    </div>
  );
};

export default NavBar;
