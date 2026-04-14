import { useEffect } from 'react';
import { Panel, Group, Separator, usePanelRef } from 'react-resizable-panels';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Inspector from './components/Inspector';
import SceneExplorer from './components/SceneExplorer';
import Console from './components/Console';
import Viewport from './components/Viewport';
import { usePlayground } from './context/PlaygroundContext';
import { usePlaygroundScripts } from './hooks/usePlaygroundScripts';
import './App.css';

function App() {
  const {
    currentScriptId,
    isInspectorVisible,
    setIsInspectorVisible,
    activeTab,
    setActiveTab,
    arePanelsMinimized,
  } = usePlayground();

  const { handleRefresh } = usePlaygroundScripts();

  const explorerPanelRef = usePanelRef();
  const editorPanelRef = usePanelRef();
  const inspectorPanelRef = usePanelRef();

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

  // Sync all panels when arePanelsMinimized changes
  useEffect(() => {
    if (arePanelsMinimized) {
      explorerPanelRef.current?.collapse();
      editorPanelRef.current?.collapse();
      inspectorPanelRef.current?.collapse();
      setIsInspectorVisible(false);
    } else {
      explorerPanelRef.current?.expand();
      editorPanelRef.current?.expand();
      inspectorPanelRef.current?.expand();
      setIsInspectorVisible(true);
    }
  }, [arePanelsMinimized, explorerPanelRef, editorPanelRef, inspectorPanelRef, setIsInspectorVisible]);

  const togglePanel = (ref: any) => {
    const panel = ref.current;
    if (!panel) return;
    
    if (panel.isCollapsed()) {
      panel.expand();
    } else {
      panel.collapse();
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

        {/* Centre Panel: Viewport & Editor/Console */}
        <Panel defaultSize={60}>
          <Group orientation="vertical">
            {/* Top: Viewport */}
            <Panel defaultSize={60} minSize={50}>
              <Viewport />
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
