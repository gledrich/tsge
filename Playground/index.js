import sidebar from './sidebar/index.js';
import { createEditor, updateEditor } from './editor/index.js';
import { getScript, updateScript } from './helpers.js';
import Engine from '../built/Engine.js';

let script;
let isPaused = true;

window.onload = async () => {
  const editor = createEditor();

  document.body.appendChild(sidebar());
  document.body.appendChild(editor);

  setupActionButtons();
  script = await getScript();

  await updatePlayground();
  await updateEditor();
};

export const updatePlayground = async () => {
  Engine.destroyAll();
  document.getElementById('script.js')?.remove();

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
    if (isPaused) {
      await updateScript(
        document.getElementById('editor-textbox').innerText,
        false
      );
      await updatePlayground();
      await updateEditor(true);
      window.engine?.callbacks.onLoad();
      isPaused = false;
    }
  };

  const pause = document.createElement('i');
  pause.className = 'fa-solid fa-pause';
  pause.onclick = () => {
    isPaused = true;
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

    window.engine?.callbacks.onLoad();

    if (isPaused) {
      isPaused = false;
    }
  };

  actionButtons.appendChild(play);
  actionButtons.appendChild(pause);
  actionButtons.appendChild(refresh);

  document.body.appendChild(actionButtons);
};
