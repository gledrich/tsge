import { updatePlayground } from '../index.js';
import { updateEditor } from '../editor/index.js';

export default () => {
  const sidebarDiv = document.createElement('div');
  sidebarDiv.className = 'sidebar';

  sidebarDiv.appendChild(makeTextIcon());
  sidebarDiv.appendChild(makeVectorIcon());

  return sidebarDiv;
};

const makeTextIcon = () => {
  const textIcon = document.createElement('button');
  textIcon.textContent = 'T';
  textIcon.className = 'icon';
  textIcon.onclick = async () => {
    await fetch('/file/123', {
      method: 'PUT',
      body: JSON.stringify({
        data: `
const text = new Text({
  tag: 'completedText',
  colour: 'white',
  backgroundColour: '#43aa8b',
  fontSize: 50,
  zIndex: 10,
  text: 'Completed',
  height: 300,
  width: 500,
  register: true,
});
text.position = new Vector2(
  window.innerWidth / 2 - text.width / 2,
  window.innerHeight / 2 - text.height / 2
);
    `,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    await updateEditor();
    await updatePlayground();
  };

  return textIcon;
};

const makeVectorIcon = () => {
  const vectorIcon = document.createElement('button');
  vectorIcon.textContent = 'V';
  vectorIcon.className = 'icon';
  vectorIcon.onclick = () => {
    document.getElementById('editor-textbox').value += `
    
    new Vector2(window.innerWidth / 2, window.innerHeight / 2);`;
  };

  return vectorIcon;
};
