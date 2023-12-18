import { updatePlayground } from '../index.js';
import { updateEditor } from '../editor/index.js';
import { updateScript } from '../helpers.js';

export default () => {
  const sidebarDiv = document.createElement('div');
  sidebarDiv.className = 'sidebar';

  sidebarDiv.appendChild(makeVectorIcon());
  sidebarDiv.appendChild(makeTextIcon());

  return sidebarDiv;
};

const makeTextIcon = () => {
  const textIcon = document.createElement('button');
  textIcon.textContent = 'T';
  textIcon.className = 'icon';
  textIcon.onclick = async () => {
    await updateTheLot(`
const text = new Text({
tag: 'exampleTag',
colour: 'white',
backgroundColour: '#43aa8b',
fontSize: 50,
zIndex: 10,
text: 'Example',
height: 100,
width: 400,
register: true,
});
text.position = new Vector2(
window.innerWidth / 2 - text.width / 2,
window.innerHeight / 2 - text.height / 2
);
      `);
  };

  return textIcon;
};

const makeVectorIcon = () => {
  const vectorIcon = document.createElement('button');
  vectorIcon.textContent = 'V';
  vectorIcon.className = 'icon';
  vectorIcon.onclick = async () => {
    await updateTheLot(
      `new Vector2(window.innerWidth / 2, window.innerHeight / 2);`
    );
  };

  return vectorIcon;
};

const updateTheLot = async (scriptData) => {
  await updateScript(scriptData);
  await updatePlayground();
  await updateEditor();
};
