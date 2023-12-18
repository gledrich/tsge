import { getScript, updateScript } from '../helpers.js';
import { updatePlayground } from '../index.js';
import hljs from 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/es/highlight.min.js';
import js from 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/es/languages/javascript.min.js';

hljs.registerLanguage('javascript', js);
hljs.configure({
  cssSelector: 'textarea',
  languages: ['javascript'],
});

export const createEditor = () => {
  const div = document.createElement('div');
  div.id = 'editor';
  div.className = 'editor';

  const title = document.createElement('h2');
  title.innerText = 'Script.js';

  const pre = document.createElement('pre');
  const textbox = document.createElement('code');
  textbox.id = 'editor-textbox';
  textbox.className = 'editor-textbox';
  textbox.spellcheck = 'on';
  textbox.contentEditable = 'true';
  textbox.onchange = async () => await updateEditor(false);
  textbox.onkeyup = async (e) => {
    if (e.code === 'Enter') {
      await updateScript(textbox.innerText, false);
      await updatePlayground();

      setTimeout(async () => {
        await updateEditor(false);
      }, 500);
    }
  };

  div.appendChild(title);
  pre.appendChild(textbox);
  div.appendChild(pre);

  return div;
};

export const updateEditor = async (shouldFetchScript = true) => {
  let script = document.getElementById('editor-textbox').innerText;

  if (shouldFetchScript) {
    script = await getScript();
  }

  const options = {
    indent_size: 2,
    space_in_empty_paren: false,
    preserve_newlines: true,
  };
  const b = js_beautify(script, options);

  document.getElementById('editor-textbox').innerHTML = hljs.highlight(
    b + '\n\n',
    {
      language: 'javascript',
    }
  ).value;
};
