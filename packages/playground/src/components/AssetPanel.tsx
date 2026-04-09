import React, { useEffect, useState } from 'react';
import '../styles/asset-panel.css';

interface AssetEntry {
  tag: string;
  image: HTMLImageElement;
}

const AssetPanel: React.FC = () => {
  const [assets, setAssets] = useState<AssetEntry[]>([]);

  useEffect(() => {
    const updateAssets = () => {
      // Directly access global state to ensure we see assets even if multiple Dino instances exist
      const global = globalThis as any;
      const loaderState = global.__DINO_LOADER_STATE__;
      
      if (loaderState && loaderState.assets) {
        const assetsMap = loaderState.assets as Map<string, HTMLImageElement>;
        setAssets(Array.from(assetsMap.entries()).map(([tag, image]) => ({
          tag,
          image
        })));
      }
    };

    updateAssets();
    // Poll for new assets
    const interval = setInterval(updateAssets, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="asset-panel">
      <div className="asset-list">
        {assets.length === 0 ? (
          <div className="no-assets">No assets loaded.</div>
        ) : (
          assets.map((asset) => (
            <div key={asset.tag} className="asset-item" title={asset.image.src}>
              <div className="asset-preview">
                <img src={asset.image.src} alt={asset.tag} />
              </div>
              <div className="asset-info">
                <span className="asset-tag">{asset.tag}</span>
                <span className="asset-details">
                  {asset.image.width}x{asset.image.height}px
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssetPanel;
