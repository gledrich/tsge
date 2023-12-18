import sidebar from './sidebar/index.js';
import { createEditor, updateEditor } from './editor/index.js';
import { getScript } from './helpers.js';
import Engine from '../built/Engine.js';

let script;
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

  engine.callbacks.onLoad();
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
