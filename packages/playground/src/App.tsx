import { useState, useEffect, useCallback } from 'react';
import * as Dino from 'dino-ge';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Inspector from './components/Inspector';
import Console from './components/Console';
import Toolbar from './components/Toolbar';
import Logo from './components/Logo';
import { getCurrentScriptId, getScript, updateScript } from './utils/helpers';
import './App.css';

const { Engine } = Dino;

function App() {
  const [currentScriptId, setCurrentScriptIdState] = useState(getCurrentScriptId());
  const [isPaused, setIsPaused] = useState(false);
  const [isDebug, setIsDebug] = useState(false);
  const [isInspectorVisible, setIsInspectorVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  useEffect(() => {
    Engine.paused = isPaused;
  }, [isPaused]);

  useEffect(() => {
    Engine.debug = isDebug;
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
    <div className="playground-root">
      <Logo visible={!isInspectorVisible} />
      
      <div className={`editor-layout ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="toggle-sidebar" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
          <i className={`fa-solid ${isSidebarCollapsed ? 'fa-chevron-left' : 'fa-chevron-right'}`} />
        </div>
        <div className="main-content">
          <Sidebar />
          <Editor 
            currentScriptId={currentScriptId} 
            onRefresh={handleRefresh}
          />
          <Console />
        </div>
      </div>

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
