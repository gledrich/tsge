import React from 'react';

interface ToolbarProps {
  isPaused: boolean;
  isDebug: boolean;
  onTogglePause: () => void;
  onToggleDebug: () => void;
  onRefresh: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  isPaused,
  isDebug,
  onTogglePause,
  onToggleDebug,
  onRefresh
}) => {
  return (
    <div className="toolbar">
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
        className={`fa-solid fa-bug ${isDebug ? 'active-debug' : ''}`} 
        onClick={onToggleDebug}
        title="Toggle Debug Mode"
      />
    </div>
  );
};

export default Toolbar;
