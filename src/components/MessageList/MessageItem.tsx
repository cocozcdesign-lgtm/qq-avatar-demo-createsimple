import React from 'react';
import type { MessageItemData } from './data';

const MessageItem: React.FC<MessageItemData> = (props) => {
  const {
    avatar,
    avatarType,
    name,
    nameColor,
    nameGradient,
    vipBadge,
    decorIcons,
    separatorIcon,
    time,
    message,
    prefix,
    prefixColor,
    countPrefix,
    badgeCount,
    hasDot,
    muteIcon,
    groupImages,
    extraIcon,
    opacitySubtext,
    customAvatar,
  } = props;

  const renderAvatar = () => {
    if (customAvatar === 'folder') {
      return (
        <div className="msg-avatar folder-avatar">
          <div className="folder-icon-inner">
            <div className="folder-dot" />
          </div>
        </div>
      );
    }
    if (customAvatar === true) {
      return (
        <div className="msg-avatar public-avatar">
          <div className="public-icon-inner">
            <div className="public-dot" />
          </div>
        </div>
      );
    }
    if (groupImages && groupImages.length > 0) {
      return (
        <div className="msg-avatar group-grid-avatar">
          <div className="grid-inner">
            {groupImages.map((img, i) => (
              <img key={i} src={img} alt="" className="grid-img" />
            ))}
          </div>
          {hasDot && <div className="badge-dot" />}
        </div>
      );
    }
    const avatarContent = avatarType === 'img' ? (
      <img src={avatar} alt="" className="avatar-img" />
    ) : (
      <img src={avatar} alt="" className="avatar-svg" />
    );

    return (
      <div className="msg-avatar">
        <div className="avatar-wrapper">
          {avatarContent}
        </div>
        {badgeCount && badgeCount > 0 && (
          <div className="badge-number">
            <span>{badgeCount}</span>
          </div>
        )}
        {hasDot && !badgeCount && <div className="badge-dot" />}
      </div>
    );
  };

  const renderVipBadge = () => {
    if (!vipBadge) return null;
    const { type, level, icon, sideIcon } = vipBadge;

    let bgStyle = '';
    let textColor = '';
    if (type === 'svip') {
      bgStyle = 'linear-gradient(0deg, rgba(255,255,255,0.50) 0%, rgba(255,255,255,0.50) 100%), #F7D5A6, linear-gradient(135deg, rgba(255,239.64,200.13,0) 0%, #FBE2B7 26%, #EFBC86 100%)';
      textColor = '#985B23';
    } else if (type === 'bigvip') {
      bgStyle = 'linear-gradient(0deg, rgba(255,255,255,0.50) 0%, rgba(255,255,255,0.50) 100%), #F7B2FF, linear-gradient(138deg, rgba(255,221.68,212.46,0) 0%, #FDC6E4 37%, #F89CFF 100%)';
      textColor = '#513E9B';
    } else {
      bgStyle = 'linear-gradient(0deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.30) 100%), #FFD8D9';
      textColor = '#FF3E42';
    }

    return (
      <div className="vip-badge-container">
        <div className="vip-badge-wrap">
          <img src={icon} alt="" className="vip-left-icon" />
          <div className="vip-badge-bg" style={{ background: bgStyle }}>
            {type === 'bigvip' ? (
              <span className="vip-level-text" style={{ color: textColor }}>
                <span style={{ fontSize: '8.8px' }}>大</span>
                <span style={{ fontSize: '11px' }}>VIP3</span>
              </span>
            ) : (
              <span className="vip-level-text" style={{ color: textColor, fontSize: '11px' }}>
                {level}
              </span>
            )}
          </div>
          <img src={sideIcon} alt="" className="vip-side-icon" />
        </div>
      </div>
    );
  };

  const renderNameLine = () => {
    const nameStyle: React.CSSProperties = {};
    if (nameGradient) {
      nameStyle.background = nameGradient;
      nameStyle.WebkitBackgroundClip = 'text';
      nameStyle.color = 'transparent';
    } else if (nameColor) {
      nameStyle.color = nameColor;
    } else {
      nameStyle.color = '#1A1C1E';
    }

    return (
      <div className="name-line">
        <div className="name-left">
          <span className="msg-name" style={nameStyle}>{name}</span>
          {renderVipBadge()}
          {separatorIcon && <img src={separatorIcon} alt="" className="separator-icon" />}
          {decorIcons && decorIcons.map((icon, i) => (
            <img key={i} src={icon} alt="" className="decor-icon" />
          ))}
        </div>
        <span className="msg-time">{time}</span>
      </div>
    );
  };

  const renderMessageLine = () => {
    return (
      <div className="message-line">
        <div className="message-text-area">
          {extraIcon && (
            <img src={extraIcon} alt="" className="msg-extra-prefix-icon" />
          )}
          {prefix && (
            <span className="msg-prefix" style={{ color: prefixColor || '#F74C30' }}>{prefix}</span>
          )}
          {countPrefix && (
            <span className="msg-count-prefix" style={{ opacity: opacitySubtext ? 0.35 : 1 }}>{countPrefix}</span>
          )}
          <span className="msg-text">{message}</span>
        </div>
        {muteIcon && (
          <img src={muteIcon} alt="" className="msg-mute-icon" />
        )}
      </div>
    );
  };

  return (
    <div className="message-item">
      {renderAvatar()}
      <div className="message-item-content">
        {renderNameLine()}
        {renderMessageLine()}
      </div>
    </div>
  );
};

export default MessageItem;
