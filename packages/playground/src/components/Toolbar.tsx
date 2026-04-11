import React from 'react';

interface ToolbarProps {
  isPaused: boolean;
  isDebug: boolean;
  arePanelsMinimized: boolean;
  onTogglePause: () => void;
  onToggleDebug: () => void;
  onTogglePanels: () => void;
  onRefresh: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  isPaused,
  isDebug,
  arePanelsMinimized,
  onTogglePause,
  onToggleDebug,
  onTogglePanels,
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
      <i 
        className={`fa-solid ${arePanelsMinimized ? 'fa-expand' : 'fa-compress'}`} 
        onClick={onTogglePanels}
        title={arePanelsMinimized ? 'Restore Panels' : 'Minimize All Panels'}
      />
    </div>
  );
};

export default Toolbar;
