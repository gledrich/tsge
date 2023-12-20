import { createEditor, updateEditor } from './editor/index.js';
import { getScript, updateScript } from './helpers.js';
import Engine from '../built/Engine.js';

let script;

window.onload = async () => {
  const editor = createEditor();

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
  refresh.onclick = async () => {
    await updateScript(
      document.getElementById('editor-textbox').innerText,
      false
    );
    await updatePlayground();
    await updateEditor(true);

    if (Engine.paused) {
      Engine.paused = false;
    }
  };

  actionButtons.appendChild(play);
  actionButtons.appendChild(pause);
  actionButtons.appendChild(refresh);

  document.body.appendChild(actionButtons);
};
