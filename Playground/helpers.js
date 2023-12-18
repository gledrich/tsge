export const createTextButton = (text, onclick) => {
  const btn = document.createElement('button');
  btn.textContent = text || 'Text';
  btn.onclick = onclick;

  document.body.appendChild(btn);
};

export const openDialog = ({ labelText = '' }) => {
  const div = document.createElement('div');
  const label = document.createElement('label');
  label.textContent = labelText;
  const input = document.createElement('input');
  input.type = 'text';
  input.name = Date.now();
  input.id = Date.now();
  input.placeholder = labelText;

  label.htmlFor = input.name;
  label.hidden = true;

  div.appendChild(label);
  div.appendChild(input);

  return div;
};

const createInitialFile = async () => {
  const res = await fetch('/file/123', {
    method: 'PUT',
    body: JSON.stringify({
      data: `import Engine from '../built/Engine.js';
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
`,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    window.alert('Error');
  }

  const file = await res.json();

  return file;
};

export const getScript = async () => {
  const res = await fetch('/file/123');
  let script;

  if (res.status === 404) {
    script = await createInitialFile();
  } else if (res.status === 200) {
    script = await res.json();
  } else {
    window.alert('Error');
  }

  return script;
};
