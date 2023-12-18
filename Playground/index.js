import sidebar from './sidebar/index.js';

window.onload = async () => {
  const playground = createPlayground();
  const editor = createEditor();

  document.body.appendChild(sidebar());
  document.body.appendChild(playground);
  document.body.appendChild(editor);

  let savedScript = localStorage.getItem('script.js');

  if (savedScript) {
    console.log(savedScript);
  } else {
    localStorage.setItem(
      'script.js',
      `
      import Engine from '../built/Engine.js';
      import Text from '../built/Text.js'; 
      import Vector2 from '../built/Vector2.js';

      const engine = new Engine(
        {
          onLoad: () => {
            console.log('loaded');
          },
          update: () => {
            console.log('updated');
          },
        },
        {
          title: 'Playground',
          backgroundColour: '#A7DCCC',
          width: ${playground.offsetWidth},
          height: ${playground.offsetHeight},
        }
      )

      engine.callbacks.onLoad();
    `
    );

    savedScript = localStorage.getItem('script.js');
  }

  updatePlayground();
  updateEditor();
};

const createPlayground = () => {
  const div = document.createElement('div');
  div.id = 'playground';
  div.className = 'playground';

  return div;
};

export const updatePlayground = () => {
  document.getElementById('script.js')?.remove();

  const script = document.createElement('script');
  script.type = 'module';
  script.innerHTML = localStorage.getItem('script.js');
  script.id = 'script.js';
  document.body.appendChild(script);
};

const createEditor = () => {
  const div = document.createElement('div');
  div.id = 'editor';
  div.className = 'editor';

  const title = document.createElement('h2');
  title.innerText = 'Script.ts';

  const textbox = document.createElement('textarea');
  textbox.id = 'editor-textbox';
  textbox.className = 'editor-textbox';
  textbox.addEventListener('change', () => {
    updatePlayground();
  });

  div.appendChild(title);
  div.appendChild(textbox);

  return div;
};

export const updateEditor = () => {
  document.getElementById('editor-textbox').innerText =
    localStorage.getItem('script.js');
};
