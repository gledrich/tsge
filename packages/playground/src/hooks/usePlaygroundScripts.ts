import { useCallback, useEffect } from 'react';
import * as Dino from 'dino-ge';
import { getScript, updateScript } from '../utils/helpers';
import { instrumentCode } from '../utils/ast-utils';
import { usePlayground } from '../context/PlaygroundContext';

const { Engine } = Dino;

export const usePlaygroundScripts = () => {
  const { 
    currentScriptId, 
    setCurrentScriptId, 
    isViewportReady, 
    setIsPaused 
  } = usePlayground();

  const updatePlayground = useCallback(async () => {
    if (!isViewportReady) return;

    Engine.destroyAll();
    
    document.querySelectorAll('script[data-playground-script]').forEach(s => s.remove());
    
    const container = document.getElementById('playground-canvas-container');
    if (container) {
      container.querySelectorAll('canvas').forEach(c => c.remove());
    }

    const scriptText = await getScript(currentScriptId);
    const result = instrumentCode(scriptText);

    if (result.error) {
      window.dispatchEvent(new CustomEvent('playground-syntax-error', { detail: result.error }));
    } else {
      window.dispatchEvent(new CustomEvent('playground-syntax-error', { detail: null }));
    }
    
    requestAnimationFrame(() => {
      const script = document.createElement('script');
      script.type = 'module';
      script.innerHTML = result.code;
      script.setAttribute('data-playground-script', currentScriptId);
      document.body.appendChild(script);
    });
  }, [currentScriptId, isViewportReady]);

  const handleRefresh = useCallback(async (editorValue: string) => {
    await updateScript(editorValue, false, currentScriptId);
    await updatePlayground();
    setIsPaused(false);
  }, [currentScriptId, updatePlayground, setIsPaused]);

  useEffect(() => {
    updatePlayground();
  }, [updatePlayground]);

  useEffect(() => {
    const handleScriptSelected = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setCurrentScriptId(customEvent.detail);
    };
    window.addEventListener('playground-script-selected', handleScriptSelected);
    return () => window.removeEventListener('playground-script-selected', handleScriptSelected);
  }, [setCurrentScriptId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        window.dispatchEvent(new CustomEvent('playground-refresh'));
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { handleRefresh, updatePlayground };
};
