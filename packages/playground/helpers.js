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
  input.name = Date.now().toString();
  input.id = Date.now().toString();
  input.placeholder = labelText;

  label.htmlFor = input.name;
  label.hidden = true;

  div.appendChild(label);
  div.appendChild(input);

  return div;
};

const createInitialFile = async (id) => {
  const defaultContent = `import { Engine, Scene, Sprite, Vector2, Text } from 'dino-ge';

// Your playground script starts here!
`;
  
  await fetch(`/file/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      data: defaultContent,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return defaultContent;
};

export const getScript = async (id = 'script') => {
  const res = await fetch(`/file/${id}`);

  if (res.status === 404) {
    return await createInitialFile(id);
  } else if (res.status === 200) {
    return await res.json();
  } else {
    window.alert('Error loading script');
    return '';
  }
};

export const updateScript = async (data, upsert = true, id = 'script') => {
  const res = await fetch(`/file/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      data,
      upsert,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    window.alert('Error updating script.');
  }
};
