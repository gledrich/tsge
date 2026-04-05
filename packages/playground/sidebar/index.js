/* eslint-disable no-unused-vars */
import { updatePlayground } from '../index.js';
import { updateEditor, insertTextToEditor } from '../editor/index.js';
import { updateScript } from '../helpers.js';
/* eslint-enable no-unused-vars */

export default () => {
  const sidebarDiv = document.createElement('div');
  sidebarDiv.className = 'sidebar minimized';

  const header = document.createElement('div');
  header.className = 'sidebar-header';
  header.onclick = () => {
    sidebarDiv.classList.toggle('minimized');
  };

  const title = document.createElement('div');
  title.className = 'sidebar-title';
  title.innerText = 'Snippets';

  const toggleIcon = document.createElement('i');
  toggleIcon.className = 'fa-solid fa-chevron-down sidebar-toggle-icon';

  header.appendChild(title);
  header.appendChild(toggleIcon);
  sidebarDiv.appendChild(header);

  const snippets = [
    { icon: 'fa-arrows-up-down-left-right', label: 'Vector2', code: 'new Vector2(0, 0)' },
    { icon: 'fa-font', label: 'Text', code: `new Text({
  tag: 'textObj',
  text: 'Hello World',
  fontSize: 30,
  colour: 'white',
  position: new Vector2(100, 100),
  width: 200,
  zIndex: 10
});` },
    { icon: 'fa-square', label: 'Rectangle', code: `new Rectangle({
  tag: 'rectObj',
  position: new Vector2(100, 100),
  width: 50,
  height: 50,
  colour: '#43aa8b',
  zIndex: 5
});` },
    { icon: 'fa-circle', label: 'Circle', code: `new Circle({
  tag: 'circleObj',
  position: new Vector2(100, 100),
  radius: 25,
  colour: '#F94144',
  zIndex: 5
});` },
    { icon: 'fa-image', label: 'Sprite', code: `new Sprite({
  tag: 'spriteObj',
  img: dinoImg,
  rows: 1,
  cols: 24,
  position: new Vector2(100, 100),
  startCol: 0,
  endCol: 4,
  zIndex: 5
});` },
    { icon: 'fa-minus', label: 'Line', code: `new Line({
  tag: 'lineObj',
  width: 2,
  p1: new Vector2(0, 0),
  p2: new Vector2(100, 100),
  zIndex: 1
});` }
  ];

  snippets.forEach(s => {
    sidebarDiv.appendChild(snippetFactory(s.icon, s.label, s.code));
  });

  return sidebarDiv;
};

function snippetFactory(iconClass, label, code) {
  const btn = document.createElement('button');
  btn.className = 'snippet-btn';
  btn.title = label;
  btn.innerHTML = `<i class="fa-solid ${iconClass}"></i><span>${label}</span>`;
  
  btn.onclick = () => {
    insertTextToEditor(code);
  };

  return btn;
}
