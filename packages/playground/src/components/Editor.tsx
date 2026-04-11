import React, { useCallback, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import * as prettier from 'prettier/standalone';
import * as babel from 'prettier/plugins/babel';
import * as estree from 'prettier/plugins/estree';
import { getScript, getFilesList, setCurrentScriptId, updateScript } from '../utils/helpers';
import '../styles/editor.css';

interface EditorProps {
  currentScriptId: string;
  onRefresh: (value: string) => void;
}

const CodeEditor: React.FC<EditorProps> = ({ currentScriptId, onRefresh }) => {
  const [scripts, setScripts] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [editorValue, setEditorValue] = useState<string>('');

  const formatCode = useCallback(async (code: string) => {
    try {
      return await prettier.format(code, {
        parser: 'babel',
        plugins: [babel, estree],
        singleQuote: true,
        trailingComma: 'none',
        printWidth: 80,
        tabWidth: 2
      });
    } catch (err) {
      console.error('Prettier formatting failed:', err);
      return code;
    }
  }, []);

  const handleSave = useCallback(async (value: string) => {
    setIsSaving(true);
    onRefresh(value);
    setTimeout(() => setIsSaving(false), 500);
  }, [onRefresh]);

  const handleFormat = useCallback(async () => {
    setIsFormatting(true);
    const formatted = await formatCode(editorValue);
    if (formatted !== editorValue) {
      setEditorValue(formatted);
    }
    setIsFormatting(false);
  }, [editorValue, formatCode]);

  useEffect(() => {
    const refreshScripts = async () => {
      const list = await getFilesList();
      setScripts(list);
    };
    refreshScripts();
  }, [currentScriptId]);

  useEffect(() => {
    const loadScript = async () => {
      setIsSaving(true);
      const script = await getScript(currentScriptId);
      const formatted = await formatCode(script);
      setEditorValue(formatted);
      setIsSaving(false);
    };
    loadScript();
  }, [currentScriptId, formatCode]);

  useEffect(() => {
    const handleInsertText = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setEditorValue(prev => prev + '\n' + customEvent.detail);
    };

    const handleRefreshEvent = () => {
      onRefresh(editorValue);
    };

    const handleUpdateCodeEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setEditorValue(customEvent.detail);
    };

    const handleGetValueEvent = () => {
      window.dispatchEvent(new CustomEvent('playground-editor-value', { detail: editorValue }));
    };

    window.addEventListener('playground-insert-text', handleInsertText);
    window.addEventListener('playground-refresh', handleRefreshEvent);
    window.addEventListener('playground-update-code', handleUpdateCodeEvent);
    window.addEventListener('playground-get-value', handleGetValueEvent);

    return () => {
      window.removeEventListener('playground-insert-text', handleInsertText);
      window.removeEventListener('playground-refresh', handleRefreshEvent);
      window.removeEventListener('playground-update-code', handleUpdateCodeEvent);
      window.removeEventListener('playground-get-value', handleGetValueEvent);
    };
  }, [editorValue, onRefresh]);

  const handleScriptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentScriptId(e.target.value);
    window.dispatchEvent(new CustomEvent('playground-script-selected', { detail: e.target.value }));
  };

  const handleNewScript = async () => {
    const name = window.prompt('Enter script name:');
    if (name) {
      await updateScript('', false, name); // Initialize empty file
      setCurrentScriptId(name);
      window.dispatchEvent(new CustomEvent('playground-script-selected', { detail: name }));
    }
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave(editor.getValue());
    });

    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
      // Prettier is already handled by handleFormat, but monaco might have its own formatter.
      // We'll trigger our handleFormat
      handleFormat();
    });
  };

  return (
    <div className="editor">
      <div className="banner">
        <div className="icons-container">
          <i 
            className="fa-solid fa-plus new-script" 
            title="New Script" 
            onClick={handleNewScript}
          />
          <select 
            className="script-selector" 
            value={currentScriptId} 
            onChange={handleScriptChange}
          >
            {scripts.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <i 
            className={`fa-solid fa-wand-magic-sparkles format-btn ${isFormatting ? 'active' : ''}`}
            title="Format Code (Shift+Alt+F)"
            onClick={handleFormat}
          />
          <i 
            className={`fa-solid fa-cloud ${isSaving ? 'saving' : 'save'}`} 
            title="Save (Ctrl+S)"
            onClick={() => handleSave(editorValue)}
          />
        </div>
      </div>
      <div className="editor-textbox">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={editorValue}
          onChange={(value) => setEditorValue(value || '')}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on'
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
