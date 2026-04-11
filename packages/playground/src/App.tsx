import { useState, useEffect, useCallback, useRef } from 'react';
import * as Dino from 'dino-ge';
import { Panel, Group, Separator, usePanelRef } from 'react-resizable-panels';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Inspector from './components/Inspector';
import Toolbar from './components/Toolbar';
import Logo from './components/Logo';
import SceneExplorer from './components/SceneExplorer';
import Console from './components/Console';
import { getCurrentScriptId, getScript, updateScript } from './utils/helpers';
import './App.css';

const { Engine } = Dino;

function App() {
  const [currentScriptId, setCurrentScriptIdState] = useState(getCurrentScriptId());
  const [isPaused, setIsPaused] = useState(false);
  const [isDebug, setIsDebug] = useState(false);
  const [isInspectorVisible, setIsInspectorVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<'editor' | 'console'>('editor');
  const [isViewportReady, setIsViewportReady] = useState(false);
  const [arePanelsMinimized, setArePanelsMinimized] = useState(false);

  const explorerPanelRef = usePanelRef();
  const editorPanelRef = usePanelRef();
  const inspectorPanelRef = usePanelRef();
  const viewportContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (globalThis as unknown as { Engine: typeof Engine }).Engine = Engine;

    const onPaused = (e: any) => setIsPaused(e.detail);
    const onDebug = (e: any) => setIsDebug(e.detail);

    Engine.on('paused', onPaused);
    Engine.on('debug', onDebug);

    return () => {
      Engine.off('paused', onPaused);
      Engine.off('debug', onDebug);
    };
  }, []);

  // Monitor viewport container for non-zero dimensions
  useEffect(() => {
    if (!viewportContainerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setIsViewportReady(true);
          observer.disconnect();
        }
      }
    });

    observer.observe(viewportContainerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (Engine.paused !== isPaused) Engine.paused = isPaused;
  }, [isPaused]);

  useEffect(() => {
    if (Engine.debug !== isDebug) Engine.debug = isDebug;
  }, [isDebug]);

  // Sync inspector panel with state
  useEffect(() => {
    const panel = inspectorPanelRef.current;
    if (!panel) return;
    
    if (isInspectorVisible && panel.isCollapsed()) {
      panel.expand();
    } else if (!isInspectorVisible && !panel.isCollapsed()) {
      panel.collapse();
    }
  }, [isInspectorVisible, inspectorPanelRef]);

  const updatePlayground = useCallback(async () => {
    if (!isViewportReady) return;

    const id = currentScriptId;
    (globalThis as any).__DINO_ENGINE_INSTANCE__?.terminate();
    Engine.destroyAll();
    
    document.querySelectorAll('script[data-playground-script]').forEach(s => s.remove());
    
    const container = document.getElementById('playground-canvas-container');
    if (container) {
      container.querySelectorAll('canvas').forEach(c => c.remove());
    }

    const scriptText = await getScript(id);
    
    // Tiny delay to ensure React state has flushed to DOM for the container
    requestAnimationFrame(() => {
      const script = document.createElement('script');
      script.type = 'module';
      script.innerHTML = scriptText;
      script.setAttribute('data-playground-script', id);
      document.body.appendChild(script);
    });
  }, [currentScriptId, isViewportReady]);

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
    if (isPaused) setIsPaused(false);
  };

  const togglePanel = (ref: any) => {
    const panel = ref.current;
    if (!panel) return;
    
    if (panel.isCollapsed()) {
      panel.expand();
    } else {
      panel.collapse();
    }
  };

  const handleToggleAllPanels = () => {
    const newState = !arePanelsMinimized;
    setArePanelsMinimized(newState);

    if (newState) {
      // Minimize all
      explorerPanelRef.current?.collapse();
      editorPanelRef.current?.collapse();
      inspectorPanelRef.current?.collapse();
      setIsInspectorVisible(false);
    } else {
      // Restore all
      explorerPanelRef.current?.expand();
      editorPanelRef.current?.expand();
      inspectorPanelRef.current?.expand();
      setIsInspectorVisible(true);
    }
  };

  return (
    <div className="playground-root">
      <Group orientation="horizontal" className="main-layout">
        {/* Left Panel: Sidebar & Scene Explorer */}
        <Panel 
          defaultSize={20} 
          minSize={20} 
          collapsible={true} 
          collapsedSize={0} 
          panelRef={explorerPanelRef}
        >
          <div className="panel-container">
            <div className="panel-header">Explorer</div>
            <div className="panel-content" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, overflow: 'auto' }}>
                <SceneExplorer />
              </div>
              <div style={{ height: '50%', borderTop: '1px solid var(--border-color)' }}>
                <Sidebar />
              </div>
            </div>
          </div>
        </Panel>
        
        <Separator 
          className="resize-handle-horizontal" 
          onDoubleClick={() => togglePanel(explorerPanelRef)}
        />

        {/* Center Panel: Viewport & Editor/Console */}
        <Panel defaultSize={60}>
          <Group orientation="vertical">
            {/* Top: Viewport */}
            <Panel defaultSize={60} minSize={50}>
              <div className="viewport-panel">
                {!isViewportReady && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-primary)',
                    zIndex: 200,
                    color: 'var(--accent-primary)',
                    flexDirection: 'column',
                    gap: '15px'
                  }}>
                    <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '40px' }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                      Initializing Engine
                    </span>
                  </div>
                )}
                <div id="playground-canvas-container" ref={viewportContainerRef}></div>
                <Logo visible={!isInspectorVisible && isViewportReady} />
                <Toolbar 
                  isPaused={isPaused}
                  isDebug={isDebug}
                  arePanelsMinimized={arePanelsMinimized}
                  onTogglePause={() => setIsPaused(!isPaused)}
                  onToggleDebug={() => {
                    const newDebug = !isDebug;
                    setIsDebug(newDebug);
                    if (newDebug && !isInspectorVisible) setIsInspectorVisible(true);
                  }}
                  onTogglePanels={handleToggleAllPanels}
                  onRefresh={() => window.dispatchEvent(new CustomEvent('playground-refresh'))}
                />
              </div>
            </Panel>
            
            <Separator 
              className="resize-handle-vertical" 
              onDoubleClick={() => togglePanel(editorPanelRef)}
            />

            {/* Bottom: Editor & Console Tabs */}
            <Panel 
              defaultSize={40} 
              minSize={40} 
              collapsible={true} 
              collapsedSize={0} 
              panelRef={editorPanelRef}
            >
              <div className="panel-container">
                <div className="panel-header" style={{ display: 'flex', gap: '10px' }}>
                  <span 
                    style={{ cursor: 'pointer', color: activeTab === 'editor' ? 'var(--accent-primary)' : 'inherit' }}
                    onClick={() => setActiveTab('editor')}
                  >
                    Editor
                  </span>
                  <span 
                    style={{ cursor: 'pointer', color: activeTab === 'console' ? 'var(--accent-primary)' : 'inherit' }}
                    onClick={() => setActiveTab('console')}
                  >
                    Console
                  </span>
                </div>
                <div className="panel-content">
                  {activeTab === 'editor' ? (
                    <Editor 
                      currentScriptId={currentScriptId} 
                      onRefresh={handleRefresh}
                    />
                  ) : (
                    <Console />
                  )}
                </div>
              </div>
            </Panel>
          </Group>
        </Panel>

        {/* Right Panel: Inspector */}
        <Separator 
          className="resize-handle-horizontal" 
          onDoubleClick={() => setIsInspectorVisible(!isInspectorVisible)}
        />
        <Panel 
          defaultSize={20} 
          minSize={20} 
          collapsible={true} 
          collapsedSize={0} 
          panelRef={inspectorPanelRef}
          onResize={(size: any) => {
            // Defer state update to avoid update-during-render crashes
            requestAnimationFrame(() => {
              const isCurrentlyCollapsed = size.asPercentage === 0;
              if (isCurrentlyCollapsed && isInspectorVisible) setIsInspectorVisible(false);
              if (!isCurrentlyCollapsed && !isInspectorVisible) setIsInspectorVisible(true);
            });
          }}
        >
          <div className="panel-container">
            <div className="panel-header">Inspector</div>
            <div className="panel-content">
              <Inspector visible={isInspectorVisible} />
            </div>
          </div>
        </Panel>
      </Group>
    </div>
  );
}

export default App;