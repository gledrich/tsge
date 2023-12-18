import sidebar from './sidebar/index.js';
import { createEditor, updateEditor } from './editor/index.js';
import { getScript } from './helpers.js';

let script;

window.onload = async () => {
  const playground = createPlayground();
  const editor = createEditor();

  document.body.appendChild(sidebar());
  document.body.appendChild(playground);
  document.body.appendChild(editor);

  script = await getScript();

  await updatePlayground();
  await updateEditor();
};

const createPlayground = () => {
  const div = document.createElement('div');
  div.id = 'playground';
  div.className = 'playground';

  return div;
};

export const updatePlayground = async () => {
  document.getElementById('script.js')?.remove();

  const script = document.createElement('script');
  script.type = 'module';
  script.innerHTML = await getScript();
  script.id = 'script.js';
  document.body.appendChild(script);
};
