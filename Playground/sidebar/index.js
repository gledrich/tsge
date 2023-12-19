import { updatePlayground } from '../index.js';
import { updateEditor } from '../editor/index.js';
import { updateScript } from '../helpers.js';

export default () => {
  const sidebarDiv = document.createElement('div');
  sidebarDiv.className = 'sidebar';

  sidebarDiv.appendChild(
    iconFactory(
      'V',
      `new Vector2(window.innerWidth / 2, window.innerHeight / 2);`
    )
  );
  sidebarDiv.appendChild(
    iconFactory(
      'T',
      `
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
`
    )
  );

  sidebarDiv.appendChild(iconFactory('R', ``));
  sidebarDiv.appendChild(iconFactory('S', ``));
  sidebarDiv.appendChild(iconFactory('L', ``));

  return sidebarDiv;
};

const updateTheLot = async (scriptData) => {
  await updateScript(scriptData);
  await updatePlayground();
  await updateEditor();
};

function iconFactory(text, scriptData) {
  const icon = document.createElement('button');
  icon.textContent = text;
  icon.className = 'icon';
  icon.onclick = async () => {
    await updateTheLot(scriptData);
  };

  return icon;
}
