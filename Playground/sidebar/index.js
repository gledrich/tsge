import { updateEditor, updatePlayground } from '../index.js';

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
  textIcon.onclick = () => {
    const currentScript = localStorage.getItem('script.js');
    localStorage.setItem(
      'script.js',
      currentScript +
        `
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
    `
    );

    updateEditor();
    updatePlayground();
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
