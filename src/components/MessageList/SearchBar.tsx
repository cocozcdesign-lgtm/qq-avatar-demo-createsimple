import React from 'react';

const assetBase = '/assets/CodeBuddyAssets/4337_29293';

const SearchBar: React.FC = () => {
  return (
    <div className="search-bar">
      <div className="search-input">
        <img src={`${assetBase}/1.svg`} alt="search" className="search-icon" />
        <span className="search-placeholder">搜索</span>
      </div>
    </div>
  );
};

export default SearchBar;
