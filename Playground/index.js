import { createEditor, updateEditor } from './editor/index.js';
import { getScript, updateScript } from './helpers.js';
import Engine from '../built/Engine.js';

let script;

window.onload = async () => {
  const logo = makeLogo();
  const editor = createEditor();

  document.body.appendChild(logo);
  document.body.appendChild(editor);

  setupActionButtons();
  script = await getScript();

  await updatePlayground();
  await updateEditor();

  Engine.paused = true;
};

export const updatePlayground = async () => {
  Engine.destroyAll();
  document.getElementById('script.js')?.remove();
  document.getElementById('canvas-container')?.remove();

  const script = document.createElement('script');
  script.type = 'module';
  script.innerHTML = await getScript();
  script.id = 'script.js';
  document.body.appendChild(script);
};

const makeLogo = () => {
  const container = document.createElement('div');
  container.className = 'logo-container';

  const logo = document.createElement('h1');
  logo.innerHTML = 'TSGE';

  container.appendChild(logo);

  return container;
};

const setupActionButtons = () => {
  const actionButtons = document.createElement('div');
  actionButtons.className = 'action-buttons';

  const play = document.createElement('i');
  play.className = 'fa-solid fa-play';
  play.onclick = async () => {
    Engine.paused = false;
  };

  const pause = document.createElement('i');
  pause.className = 'fa-solid fa-pause';
  pause.onclick = () => {
    Engine.paused = true;
    document.getElementById('canvas').style = 'cursor: default';
  };

  const refresh = document.createElement('i');
  refresh.className = 'fa-solid fa-rotate';
  refresh.title = 'Refresh (Ctrl+Enter)';
  refresh.onclick = async () => {
    await updateScript(getEditorValue(), false);
    await updatePlayground();
    await updateEditor(true);

    if (Engine.paused) {
      Engine.paused = false;
    }
  };

  const debug = document.createElement('i');
  debug.className = 'fa-solid fa-bug';
  debug.title = 'Toggle Debug Mode';
  debug.onclick = () => {
    Engine.debug = !Engine.debug;
    debug.style.color = Engine.debug ? '#F94144' : 'white';
  };

  actionButtons.appendChild(play);
  actionButtons.appendChild(pause);
  actionButtons.appendChild(refresh);
  actionButtons.appendChild(debug);

  document.body.appendChild(actionButtons);

  // Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      refresh.click();
    }
  });
};
