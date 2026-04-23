import React, { useState, useEffect, useRef } from 'react';
import StatusBar from './StatusBar';
import NavBar from './NavBar';
import SearchBar from './SearchBar';
import MessageItem from './MessageItem';
import BottomTabBar from './BottomTabBar';
import AvatarUpgrade, { type UpgradeVariant, type ScanVariant } from '../AvatarUpgrade';
import { messageData, type MessageItemData } from './data';
import './style.css';

interface AnimatedMessage extends MessageItemData {
  _id: number;
  _isNew?: boolean;
}

interface MessageListProps {
  mode?: 'logged-in' | 'logged-out';
  avatarSrc?: string;
  upgradeVariant?: UpgradeVariant;
  scanVariant?: ScanVariant;
  editableTags?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ mode = 'logged-out', avatarSrc, upgradeVariant = 'flip', scanVariant = 'sweep', editableTags = false }) => {
  const isStatic = mode === 'logged-out';

  // 头像升级浮层
  const [showUpgrade, setShowUpgrade] = useState(false);

  // 已登录和未登录都直接展示全部消息（静态）
  const initialCount = messageData.length;

  const [visibleMessages, setVisibleMessages] = useState<AnimatedMessage[]>(() => {
    return messageData.slice(0, initialCount).map((item, i) => ({
      ...item,
      _id: i,
      badgeCount: item.badgeCount || (i % 9) + 1,
      hasDot: item.hasDot ?? false,
      _isNew: false,
    }));
  });

  const idCounter = useRef(initialCount);
  const dataIndex = useRef(initialCount);

  useEffect(() => {
    // 不再自动新增消息，所有模式都是静态展示
    return;
  }, [isStatic]);

  return (
    <div className="message-list-page">
      {/* 顶部导航区域 */}
      <div className="top-area">
        <StatusBar />
        <NavBar avatarSrc={isStatic ? avatarSrc : undefined} onAvatarClick={isStatic ? () => setShowUpgrade(true) : undefined} />
      </div>

      {/* 消息内容区域 */}
      <div className="content-area">
        <SearchBar />
        <div className="message-items">
          {visibleMessages.map((item) => (
            <div key={item._id} className={item._isNew ? 'message-item-animated' : ''}>
              <MessageItem {...item} />
            </div>
          ))}
        </div>
      </div>

      {/* 底部 TabBar */}
      <BottomTabBar />

      {/* 头像升级浮层 */}
      <AvatarUpgrade
        visible={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        avatarSrc={avatarSrc || '/assets/avatar.png'}
        variant={upgradeVariant}
        scanVariant={scanVariant}
        editable={editableTags}
        onStartUpgrade={() => {
          console.log('开始升级！');
        }}
      />
    </div>
  );
};

export default MessageList;
