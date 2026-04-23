import React from 'react';

const assetBase = '/assets/CodeBuddyAssets/4337_29293';

const BottomTabBar: React.FC = () => {
  return (
    <div className="bottom-tab-bar">
      <div className="tab-bar-inner">
        <div className="tab-item active">
          <img src={`${assetBase}/35.svg`} alt="消息" className="tab-icon" />
          <span className="tab-label active-label">消息</span>
        </div>
        <div className="tab-item">
          <img src={`${assetBase}/36.svg`} alt="联系人" className="tab-icon" />
          <span className="tab-label">联系人</span>
        </div>
        <div className="tab-item">
          <img src={`${assetBase}/37.svg`} alt="发现" className="tab-icon" />
          <span className="tab-label">发现</span>
        </div>
        <div className="tab-item">
          <div className="tab-icon-wrap">
            <img src={`${assetBase}/38.svg`} alt="我的" className="tab-icon-me" />
          </div>
          <span className="tab-label">我的</span>
        </div>
      </div>
      <div className="home-indicator" />
    </div>
  );
};

export default BottomTabBar;
