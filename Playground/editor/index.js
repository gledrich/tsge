import sidebar from '../sidebar/index.js';
import { getScript, updateScript } from '../helpers.js';
import createConsole from '../console/index.js';
import { updatePlayground } from '../index.js';

let editorInstance = null;

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
    if (editorInstance) {
      await updateScript(editorInstance.getValue(), false);
      await updatePlayground();
      await updateEditor(true);
    }
  };

  const editorDiv = document.createElement('div');
  editorDiv.id = 'editor-textbox';
  editorDiv.className = 'editor-textbox';
  editorDiv.style.width = '100%';
  editorDiv.style.height = 'calc(100% - 40px)'; // Adjust for banner height

  banner.appendChild(title);
  iconsContainer.appendChild(save);
  banner.appendChild(iconsContainer);
  div.appendChild(banner);
  div.appendChild(editorDiv);
  container.appendChild(div);
  container.appendChild(createConsole());

  // Initialize Ace Editor after a short delay to ensure DOM attachment
  setTimeout(() => {
    editorInstance = ace.edit('editor-textbox');
    editorInstance.setTheme('ace/theme/tomorrow_night_eighties');
    editorInstance.session.setMode('ace/mode/javascript');
    editorInstance.setOptions({
      fontSize: '10pt',
      tabSize: 2,
      useSoftTabs: true,
      showPrintMargin: false,
      wrap: true
    });

    // Save Command
    editorInstance.commands.addCommand({
      name: 'save',
      bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
      exec: function () {
        save.click();
      }
    });
  }, 0);

  return container;
};

export const updateEditor = async (shouldFetchScript = true) => {
  const saveIcon = document.getElementById('saveIcon');

  if (saveIcon) {
    saveIcon.classList.remove('save');
    saveIcon.classList.add('saving');
  }

  let script = '';

  if (shouldFetchScript) {
    script = await getScript();
  } else if (editorInstance) {
    script = editorInstance.getValue();
  }

  const options = {
    indent_size: 2,
    space_in_empty_paren: false,
    preserve_newlines: true
  };

  // Only beautify if fetched
  if (shouldFetchScript && window.js_beautify) {
    script = js_beautify(script, options) + '\n\n';
  }

  if (editorInstance && shouldFetchScript) {
    // Preserve cursor/scroll position if possible
    const pos = editorInstance.getCursorPosition();
    editorInstance.setValue(script, -1);
    editorInstance.moveCursorToPosition(pos);
  }

  if (saveIcon) {
    saveIcon.classList.remove('saving');
    saveIcon.classList.add('save');
  }
};

export const insertTextToEditor = (text) => {
  if (editorInstance) {
    editorInstance.insert(text);
    editorInstance.focus();
  }
};

export const getEditorValue = () => {
  if (editorInstance) {
    return editorInstance.getValue();
  }
  return '';
};
