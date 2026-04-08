import { useState, useEffect, useCallback } from 'react';
import * as Dino from 'dino-ge';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Inspector from './components/Inspector';
import Toolbar from './components/Toolbar';
import Logo from './components/Logo';
import BottomPanel from './components/BottomPanel';
import { getCurrentScriptId, getScript, updateScript } from './utils/helpers';
import './App.css';

const { Engine } = Dino;

function App() {
  const [currentScriptId, setCurrentScriptIdState] = useState(getCurrentScriptId());
  const [isPaused, setIsPaused] = useState(false);
  const [isDebug, setIsDebug] = useState(false);
  const [isInspectorVisible, setIsInspectorVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isBottomPanelVisible, setIsBottomPanelVisible] = useState(false);
  const [isSnippetsCollapsed, setIsSnippetsCollapsed] = useState(true);

  useEffect(() => {
    (globalThis as unknown as { Engine: typeof Engine }).Engine = Engine;

    const onPaused = (e: any) => {
      setIsPaused(e.detail);
    };
    const onDebug = (e: any) => {
      setIsDebug(e.detail);
    };

    Engine.on('paused', onPaused);
    Engine.on('debug', onDebug);

    return () => {
      Engine.off('paused', onPaused);
      Engine.off('debug', onDebug);
    };
  }, []);

  useEffect(() => {
    if (Engine.paused !== isPaused) {
      Engine.paused = isPaused;
    }
  }, [isPaused]);

  useEffect(() => {
    if (Engine.debug !== isDebug) {
      Engine.debug = isDebug;
    }
    
    if ((globalThis as unknown as { Engine: typeof Engine }).Engine) {
      (globalThis as unknown as { Engine: typeof Engine }).Engine.debug = isDebug;
    }
  }, [isDebug]);

  const updatePlayground = useCallback(async () => {
    const id = currentScriptId;
    Engine.destroyAll();
    
    // Remove any previously injected script
    document.querySelectorAll('script[data-playground-script]').forEach(s => s.remove());
    document.getElementById('canvas-container')?.remove();

    const scriptText = await getScript(id);
    const script = document.createElement('script');
    script.type = 'module';
    script.innerHTML = scriptText;
    script.setAttribute('data-playground-script', id);
    document.body.appendChild(script);
  }, [currentScriptId]);

  useEffect(() => {
    updatePlayground();
  }, [updatePlayground]);

  useEffect(() => {
    const handleScriptSelected = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setCurrentScriptIdState(customEvent.detail);
    };
    window.addEventListener('playground-script-selected', handleScriptSelected);
    return () => window.removeEventListener('playground-script-selected', handleScriptSelected);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        window.dispatchEvent(new CustomEvent('playground-refresh'));
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRefresh = async (editorValue: string) => {
    await updateScript(editorValue, false, currentScriptId);
    await updatePlayground();
    if (isPaused) {
      setIsPaused(false);
    }
  };

  return (
    <div className={`playground-root ${isBottomPanelVisible ? 'bottom-panel-open' : ''}`}>
      <Logo visible={!isInspectorVisible} />
      
      <div className={`editor-layout ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="toggle-sidebar" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
          <i className={`fa-solid ${isSidebarCollapsed ? 'fa-chevron-left' : 'fa-chevron-right'}`} />
        </div>
        <div className="main-content">
          <Editor 
            currentScriptId={currentScriptId} 
            onRefresh={handleRefresh}
          />
          <Sidebar 
            isCollapsed={isSnippetsCollapsed}
            onToggle={() => setIsSnippetsCollapsed(!isSnippetsCollapsed)}
          />
        </div>
      </div>

      <BottomPanel 
        visible={isBottomPanelVisible} 
        onToggle={() => setIsBottomPanelVisible(!isBottomPanelVisible)} 
      />

      <Inspector 
        visible={isInspectorVisible} 
        onClose={() => setIsInspectorVisible(false)}
      />
      
      <Toolbar 
        isPaused={isPaused}
        isDebug={isDebug}
        isInspectorVisible={isInspectorVisible}
        onTogglePause={() => setIsPaused(!isPaused)}
        onToggleDebug={() => {
          const newDebug = !isDebug;
          setIsDebug(newDebug);
          if (newDebug && !isInspectorVisible) {
            setIsInspectorVisible(true);
          }
        }}
        onToggleInspector={() => setIsInspectorVisible(!isInspectorVisible)}
        onRefresh={() => {
          window.dispatchEvent(new CustomEvent('playground-refresh'));
        }}
      />
    </div>
  );
}

export default App;
