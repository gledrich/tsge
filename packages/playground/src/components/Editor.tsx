import React, { useCallback, useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import * as prettier from 'prettier/standalone';
import * as babel from 'prettier/plugins/babel';
import * as estree from 'prettier/plugins/estree';
import { getScript, getFilesList, setCurrentScriptId, updateScript } from '../utils/helpers';
import { Edit, instrumentCode } from '../utils/ast-utils';
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
  const monacoEditorRef = useRef<any>(null);

  const formatCode = useCallback(async (code: string, range?: { start: number, end: number }) => {
    try {
      return await prettier.format(code, {
        parser: 'babel',
        plugins: [babel, estree],
        singleQuote: true,
        trailingComma: 'none',
        printWidth: 80,
        tabWidth: 2,
        ...(range ? { rangeStart: range.start, rangeEnd: range.end } : {})
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
      const editor = monacoEditorRef.current;
      if (editor) {
        const model = editor.getModel();
        if (model) {
          model.pushEditOperations([], [{
            range: model.getFullModelRange(),
            text: formatted
          }], () => null);
        }
      }
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
      const result = instrumentCode(formatted); // Initialize mapping
      if (result.error) console.warn(result.error);
      setIsSaving(false);
    };
    loadScript();
  }, [currentScriptId, formatCode]);

  useEffect(() => {
    const handleInsertText = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setEditorValue(prev => {
        const newValue = prev + '\n' + customEvent.detail;
        const result = instrumentCode(newValue); // Refresh mapping
        if (result.error) {
          window.dispatchEvent(new CustomEvent('playground-syntax-error', { detail: result.error }));
        } else {
          window.dispatchEvent(new CustomEvent('playground-syntax-error', { detail: null }));
        }
        return newValue;
      });
    };

    const handleRefreshEvent = () => {
      onRefresh(editorValue);
    };

    const handleUpdateCodeEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setEditorValue(customEvent.detail);
      const result = instrumentCode(customEvent.detail); // Refresh mapping
      if (result.error) {
        window.dispatchEvent(new CustomEvent('playground-syntax-error', { detail: result.error }));
      } else {
        window.dispatchEvent(new CustomEvent('playground-syntax-error', { detail: null }));
      }
    };

    const handleGetValueEvent = () => {
      window.dispatchEvent(new CustomEvent('playground-editor-value', { detail: editorValue }));
    };

    const handleApplyEditEvent = async (e: Event) => {
      const customEvent = e as CustomEvent<Edit>;
      const { start, end, newText } = customEvent.detail;
      const editor = monacoEditorRef.current;
      if (editor) {
        const model = editor.getModel();
        if (model) {
          const startPos = model.getPositionAt(start);
          const endPos = model.getPositionAt(end);
          const range = {
            startLineNumber: startPos.lineNumber,
            startColumn: startPos.column,
            endLineNumber: endPos.lineNumber,
            endColumn: endPos.column
          };
          model.applyEdits([{
            range,
            text: newText,
            forceMoveMarkers: true
          }]);
          
          let newValue = model.getValue();
          newValue = await formatCode(newValue, { start, end: start + newText.length });
          
          if (newValue !== model.getValue()) {
            model.pushEditOperations([], [{
              range: model.getFullModelRange(),
              text: newValue
            }], () => null);
          }
          
          setEditorValue(newValue);
          const result = instrumentCode(newValue); // Refresh mapping
          if (result.error) {
            window.dispatchEvent(new CustomEvent('playground-syntax-error', { detail: result.error }));
          } else {
            window.dispatchEvent(new CustomEvent('playground-syntax-error', { detail: null }));
          }
        }
      }
    };

    const handleApplyMultiEditEvent = async (e: Event) => {
      const customEvent = e as CustomEvent<Edit[]>;
      const edits = customEvent.detail;
      const editor = monacoEditorRef.current;
      if (editor && edits.length > 0) {
        const model = editor.getModel();
        if (model) {
          let minStart = Number.MAX_SAFE_INTEGER;
          let maxEnd = 0;

          const monacoEdits = edits.map(edit => {
            const startPos = model.getPositionAt(edit.start);
            const endPos = model.getPositionAt(edit.end);
            
            minStart = Math.min(minStart, edit.start);
            maxEnd = Math.max(maxEnd, edit.end + edit.newText.length);

            return {
              range: {
                startLineNumber: startPos.lineNumber,
                startColumn: startPos.column,
                endLineNumber: endPos.lineNumber,
                endColumn: endPos.column
              },
              text: edit.newText,
              forceMoveMarkers: true
            };
          });
          model.applyEdits(monacoEdits);
          
          let newValue = model.getValue();
          newValue = await formatCode(newValue, { start: minStart, end: maxEnd });
          
          if (newValue !== model.getValue()) {
            model.pushEditOperations([], [{
              range: model.getFullModelRange(),
              text: newValue
            }], () => null);
          }

          setEditorValue(newValue);
          const result = instrumentCode(newValue); // Refresh mapping
          if (result.error) {
            window.dispatchEvent(new CustomEvent('playground-syntax-error', { detail: result.error }));
          } else {
            window.dispatchEvent(new CustomEvent('playground-syntax-error', { detail: null }));
          }
        }
      }
    };

    window.addEventListener('playground-insert-text', handleInsertText);
    window.addEventListener('playground-refresh', handleRefreshEvent);
    window.addEventListener('playground-update-code', handleUpdateCodeEvent);
    window.addEventListener('playground-get-value', handleGetValueEvent);
    window.addEventListener('playground-apply-edit', handleApplyEditEvent);
    window.addEventListener('playground-apply-multi-edit', handleApplyMultiEditEvent);

    return () => {
      window.removeEventListener('playground-insert-text', handleInsertText);
      window.removeEventListener('playground-refresh', handleRefreshEvent);
      window.removeEventListener('playground-update-code', handleUpdateCodeEvent);
      window.removeEventListener('playground-get-value', handleGetValueEvent);
      window.removeEventListener('playground-apply-edit', handleApplyEditEvent);
      window.removeEventListener('playground-apply-multi-edit', handleApplyMultiEditEvent);
    };
  }, [editorValue, onRefresh, formatCode]);

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
    monacoEditorRef.current = editor;
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
          onChange={(value) => {
            const newValue = value || '';
            setEditorValue(newValue);
            const result = instrumentCode(newValue); // Update mapping as user types
            if (result.error) {
              window.dispatchEvent(new CustomEvent('playground-syntax-error', { detail: result.error }));
            } else {
              window.dispatchEvent(new CustomEvent('playground-syntax-error', { detail: null }));
            }
          }}
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
