import sidebar from './sidebar/index.js';
import { createEditor, updateEditor } from './editor/index.js';
import { getScript } from './helpers.js';
import Engine from '../built/Engine.js';

let script;
let isPaused = true;

export const engine = new Engine(
  {
    onLoad: () => {},
    update: () => {},
  },
  {
    title: 'Playground',
    backgroundColour: '#A7DCCC',
    width: '100%',
    height: '100%',
  }
);

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
  play.onclick = () => {
    if (isPaused) {
      engine.callbacks.onLoad();
      isPaused = false;
    }
  };

  const pause = document.createElement('i');
  pause.className = 'fa-solid fa-pause';
  pause.onclick = () => {
    isPaused = true;
  };

  actionButtons.appendChild(play);
  actionButtons.appendChild(pause);

  document.body.appendChild(actionButtons);
};
