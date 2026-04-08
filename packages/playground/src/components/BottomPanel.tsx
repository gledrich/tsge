import React, { useState } from 'react';
import SceneExplorer from './SceneExplorer';
import Console from './Console';
import '../styles/bottom-panel.css';

interface BottomPanelProps {
  visible: boolean;
  onToggle: () => void;
}

const BottomPanel: React.FC<BottomPanelProps> = ({ visible, onToggle }) => {
  const [activeTab, setActiveTab] = useState<'scene' | 'console'>('scene');

  return (
    <div className={`bottom-panel ${visible ? 'visible' : 'collapsed'}`}>
      <div className="bottom-panel-toggle" onClick={onToggle}>
        <i className={`fa-solid ${visible ? 'fa-chevron-down' : 'fa-chevron-up'}`} />
        <span>{visible ? 'Hide' : 'Show'} Debug Tools</span>
      </div>
      
      {visible && (
        <div className="bottom-panel-container">
          <div className="bottom-panel-tabs">
            <div 
              className={`bottom-panel-tab ${activeTab === 'scene' ? 'active' : ''}`}
              onClick={() => setActiveTab('scene')}
            >
              <i className="fa-solid fa-layer-group" />
              <span>Scene Explorer</span>
            </div>
            <div 
              className={`bottom-panel-tab ${activeTab === 'console' ? 'active' : ''}`}
              onClick={() => setActiveTab('console')}
            >
              <i className="fa-solid fa-terminal" />
              <span>Console</span>
            </div>
          </div>
          
          <div className="bottom-panel-content">
            {activeTab === 'scene' ? <SceneExplorer /> : <Console />}
          </div>
        </div>
      )}
    </div>
  );
};

export default BottomPanel;
