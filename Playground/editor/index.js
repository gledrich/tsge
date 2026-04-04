import sidebar from '../sidebar/index.js';
import { getScript, updateScript } from '../helpers.js';
import createConsole from '../console/index.js';
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
  container.className = 'editor-container collapsed';
  container.appendChild(sidebar());

  // Toggle Sidebar Button
  const toggleBtn = document.createElement('div');
  toggleBtn.className = 'toggle-sidebar';
  toggleBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
  toggleBtn.onclick = () => {
    container.classList.toggle('collapsed');
    const icon = toggleBtn.querySelector('i');
    if (container.classList.contains('collapsed')) {
      icon.className = 'fa-solid fa-chevron-left';
    } else {
      icon.className = 'fa-solid fa-chevron-right';
    }
  };
  container.appendChild(toggleBtn);

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

  const save = document.createElement('i');
  save.id = 'saveIcon';
  save.className = 'fa-solid fa-cloud save';
  save.onclick = async () => {
    await updateScript(textbox.innerText, false);
    await updatePlayground();
    await updateEditor(true);
  };

  const pre = document.createElement('pre');
  const textbox = document.createElement('code');
  textbox.id = 'editor-textbox';
  textbox.className = 'editor-textbox';
  textbox.spellcheck = 'false';
  textbox.contentEditable = 'true';
  
  // Tab Support & Shortcuts
  textbox.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '  ');
    }
    
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      save.click();
    }
  });

  textbox.onchange = async () => await updateEditor(false);

  banner.appendChild(title);
  iconsContainer.appendChild(save);
  banner.appendChild(iconsContainer);
  div.appendChild(banner);
  pre.appendChild(textbox);
  div.appendChild(pre);
  container.appendChild(div);
  container.appendChild(createConsole());

  return container;
};

export const updateEditor = async (shouldFetchScript = true) => {
  const saveIcon = document.getElementById('saveIcon');

  if (saveIcon) {
    saveIcon.classList.remove('save');
    saveIcon.classList.add('saving');
  }

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

  if (saveIcon) {
    saveIcon.classList.remove('saving');
    saveIcon.classList.add('save');
  }
};
