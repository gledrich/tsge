import React from 'react';

interface ToolbarProps {
  isPaused: boolean;
  isDebug: boolean;
  isInspectorVisible: boolean;
  onTogglePause: () => void;
  onToggleDebug: () => void;
  onToggleInspector: () => void;
  onRefresh: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  isPaused,
  isDebug,
  isInspectorVisible,
  onTogglePause,
  onToggleDebug,
  onToggleInspector,
  onRefresh
}) => {
  return (
    <div className="action-buttons">
      <i 
        className={`fa-solid ${isPaused ? 'fa-play' : 'fa-pause'}`} 
        onClick={onTogglePause}
        title={isPaused ? 'Play' : 'Pause'}
      />
      <i 
        className="fa-solid fa-rotate" 
        onClick={onRefresh}
        title="Refresh (Ctrl+Enter)"
      />
      <i 
        className="fa-solid fa-bug" 
        onClick={onToggleDebug}
        title="Toggle Debug Mode"
        style={{ color: isDebug ? '#F94144' : 'white' }}
      />
      <i 
        className="fa-solid fa-sliders" 
        onClick={onToggleInspector}
        title="Toggle Property Inspector"
        style={{ color: isInspectorVisible ? '#43aa8b' : 'white' }}
      />
    </div>
  );
};

export default Toolbar;
