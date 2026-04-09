import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as prettier from 'prettier/standalone';
import * as babel from 'prettier/plugins/babel';
import * as estree from 'prettier/plugins/estree';
import { getScript, getFilesList, setCurrentScriptId } from '../utils/helpers';
import '../styles/editor.css';

interface EditorProps {
  currentScriptId: string;
  onRefresh: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({ currentScriptId, onRefresh }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [scripts, setScripts] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);

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
    if (!editorInstance) return;
    setIsFormatting(true);
    const currentCode = editorInstance.getValue();
    const formatted = await formatCode(currentCode);
    
    if (formatted !== currentCode) {
      const pos = editorInstance.getCursorPosition();
      editorInstance.setValue(formatted, -1);
      editorInstance.moveCursorToPosition(pos);
    }
    setIsFormatting(false);
  }, [editorInstance, formatCode]);

  useEffect(() => {
    const refreshScripts = async () => {
      const list = await getFilesList();
      setScripts(list);
    };
    refreshScripts();
  }, [currentScriptId]);

  useEffect(() => {
    if (window.ace && editorRef.current && !editorInstance) {
      const aceEditor = window.ace.edit(editorRef.current);
      aceEditor.setTheme('ace/theme/tomorrow_night_eighties');
      aceEditor.session.setMode('ace/mode/javascript');
      aceEditor.setOptions({
        fontSize: '10pt',
        tabSize: 2,
        useSoftTabs: true,
        showPrintMargin: false,
        wrap: true
      });

      aceEditor.commands.addCommand({
        name: 'save',
        bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
        exec: () => {
          handleSave(aceEditor.getValue());
        }
      });

      aceEditor.commands.addCommand({
        name: 'format',
        bindKey: { win: 'Shift-Alt-F', mac: 'Shift-Option-F' },
        exec: () => {
          handleFormat();
        }
      });

      setEditorInstance(aceEditor);
    }
  }, [editorInstance, handleSave, handleFormat]);

  useEffect(() => {
    if (editorInstance) {
      const loadScript = async () => {
        setIsSaving(true);
        const script = await getScript(currentScriptId);
        const formatted = await formatCode(script);

        const pos = editorInstance.getCursorPosition();
        editorInstance.setValue(formatted, -1);
        editorInstance.moveCursorToPosition(pos);
        setIsSaving(false);
      };
      loadScript();
    }
  }, [currentScriptId, editorInstance, formatCode]);

  useEffect(() => {
    const handleInsertText = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (editorInstance) {
        editorInstance.insert(customEvent.detail);
        editorInstance.focus();
      }
    };

    const handleRefreshEvent = () => {
      if (editorInstance) {
        onRefresh(editorInstance.getValue());
      }
    };

    const handleUpdateCodeEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (editorInstance) {
        const pos = editorInstance.getCursorPosition();
        editorInstance.setValue(customEvent.detail, -1);
        editorInstance.moveCursorToPosition(pos);
      }
    };

    const handleGetValueEvent = () => {
      if (editorInstance) {
        window.dispatchEvent(new CustomEvent('playground-editor-value', { detail: editorInstance.getValue() }));
      }
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
  }, [editorInstance, onRefresh]);

  const handleScriptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentScriptId(e.target.value);
    window.dispatchEvent(new CustomEvent('playground-script-selected', { detail: e.target.value }));
  };

  const handleNewScript = async () => {
    const name = window.prompt('Enter script name:');
    if (name) {
      setCurrentScriptId(name);
      window.dispatchEvent(new CustomEvent('playground-script-selected', { detail: name }));
    }
  };

  return (
    <div className="editor">
      <div className="banner">
        <h2>Editor</h2>
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
            onClick={() => handleSave(editorInstance.getValue())}
          />
        </div>
      </div>
      <div id="editor-textbox" className="editor-textbox" ref={editorRef} style={{ width: '100%', height: 'calc(100% - 40px)' }}></div>
    </div>
  );
};

export default Editor;
