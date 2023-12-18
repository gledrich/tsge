import { getScript, updateScript } from '../helpers.js';
import { updatePlayground } from '../index.js';

export const createEditor = () => {
  const div = document.createElement('div');
  div.id = 'editor';
  div.className = 'editor';

  const title = document.createElement('h2');
  title.innerText = 'Script.ts';

  const textbox = document.createElement('textarea');
  textbox.id = 'editor-textbox';
  textbox.className = 'editor-textbox';
  textbox.addEventListener('change', async () => {
    await updateScript(textbox.value, false);
    await updatePlayground();
  });

  div.appendChild(title);
  div.appendChild(textbox);

  return div;
};

export const updateEditor = async () => {
  const s = await getScript();
  console.log(s);
  document.getElementById('editor-textbox').value = s;
};
