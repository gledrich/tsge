import { useCallback, useRef } from 'react';
import * as prettier from 'prettier/standalone';
import * as babel from 'prettier/plugins/babel';
import * as estree from 'prettier/plugins/estree';

export const useMonacoEditor = () => {
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

  const applyEdits = useCallback((edits: { range: any, text: string }[]) => {
    const editor = monacoEditorRef.current;
    if (editor) {
      const model = editor.getModel();
      if (model) {
        model.applyEdits(edits.map(edit => ({
          ...edit,
          forceMoveMarkers: true
        })));
        return model.getValue();
      }
    }
    return null;
  }, []);

  const pushEditOperations = useCallback((formatted: string) => {
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
  }, []);

  return {
    monacoEditorRef,
    formatCode,
    applyEdits,
    pushEditOperations
  };
};
