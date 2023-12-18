import sidebar from './sidebar.js';

window.onload = () => {
  document.body.appendChild(sidebar());
  document.body.appendChild(playground());
  document.body.appendChild(editor());
};

const playground = () => {
  const div = document.createElement('div');
  div.id = 'playground';
  div.className = 'playground';

  return div;
};

const editor = () => {
  const div = document.createElement('div');
  div.id = 'editor';
  div.className = 'editor';

  const title = document.createTextNode('Script.ts');

  div.appendChild(title);

  return div;
};
