import { createEditor, updateEditor, getEditorValue } from './editor/index.js';
import { createInspector } from './inspector/index.js';
import { getScript, updateScript } from './helpers.js';
import Engine from '../built/Engine.js';

let script;
let updateInspectorToggleState;

window.onload = async () => {
  const logo = makeLogo();
  const editor = createEditor();
  const inspector = createInspector(() => {
    if (updateInspectorToggleState) updateInspectorToggleState(inspector, logo);
  });

  document.body.appendChild(logo);
  document.body.appendChild(editor);
  document.body.appendChild(inspector);

  setupActionButtons(inspector, logo);
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

const setupActionButtons = (inspector, logo) => {
  const actionButtons = document.createElement('div');
  actionButtons.className = 'action-buttons';

  const inspectorToggle = document.createElement('i');
  inspectorToggle.className = 'fa-solid fa-sliders';
  inspectorToggle.title = 'Toggle Property Inspector';

  updateInspectorToggleState = (insp, lg) => {
    const isHidden = insp.classList.contains('hidden');
    inspectorToggle.style.color = isHidden ? 'white' : '#43aa8b';
    lg.style.display = isHidden ? 'block' : 'none';
  };

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
    
    // Auto-open inspector if turning debug ON and inspector is hidden
    if (Engine.debug && inspector.classList.contains('hidden')) {
      inspectorToggle.click();
    }
  };

  inspectorToggle.onclick = () => {
    inspector.classList.toggle('hidden');
    updateInspectorToggleState(inspector, logo);
  };

  actionButtons.appendChild(play);
  actionButtons.appendChild(pause);
  actionButtons.appendChild(refresh);
  actionButtons.appendChild(debug);
  actionButtons.appendChild(inspectorToggle);

  document.body.appendChild(actionButtons);

  // Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      refresh.click();
    }
  });
};
