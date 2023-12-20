import sidebar from '../sidebar/index.js';
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
  const container = document.createElement('div');
  container.className = 'editor-container';
  container.appendChild(sidebar());

  const div = document.createElement('div');
  div.id = 'editor';
  div.className = 'editor';

  const banner = document.createElement('div');
  banner.className = 'banner';

  const title = document.createElement('h2');
  title.innerText = 'Editor';
  title.onclick = () => {
    if (div.classList.contains('hidden')) {
      div.classList.remove('hidden');
    }
  };

  const iconsContainer = document.createElement('div');
  iconsContainer.className = 'icons-container';
  const expand = document.createElement('i');
  expand.className = 'fa-solid fa-window-maximize expand';
  expand.onclick = () => {
    if (div.classList.contains('hidden')) {
      div.classList.remove('hidden');
    } else if (div.classList.contains('expanded')) {
      div.classList.remove('expanded');
    } else {
      div.classList.add('expanded');
    }
  };
  const close = document.createElement('i');
  close.className = 'fa-solid fa-rectangle-xmark close';
  close.onclick = () => {
    if (div.classList.contains('hidden')) {
      div.classList.remove('hidden');
    } else {
      div.classList.add('hidden');
    }

    div.classList.remove('expanded');
  };

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
        await updateEditor(true);
      }, 500);
    }
  };

  banner.appendChild(title);
  iconsContainer.appendChild(close);
  iconsContainer.appendChild(expand);
  banner.appendChild(iconsContainer);
  div.appendChild(banner);
  pre.appendChild(textbox);
  div.appendChild(pre);
  container.appendChild(div);

  return container;
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
