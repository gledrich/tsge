import { getScript } from '../helpers.js';

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
    await updatePlayground();
  });

  div.appendChild(title);
  div.appendChild(textbox);

  return div;
};

export const updateEditor = async () => {
  document.getElementById('editor-textbox').innerText = await getScript();
};
