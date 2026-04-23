import React from 'react';

const assetBase = '/assets/CodeBuddyAssets/4337_29293';

const StatusBar: React.FC = () => {
  return (
    <div className="status-bar">
      <div className="status-bar-left">
        <span className="status-time">9:00</span>
      </div>
      <div className="status-bar-right">
        <img src={`${assetBase}/41.svg`} alt="signal" className="status-icon" />
        <img src={`${assetBase}/40.svg`} alt="wifi" className="status-icon" />
        <img src={`${assetBase}/39.svg`} alt="battery" className="status-icon" />
      </div>
    </div>
  );
};

export default StatusBar;
