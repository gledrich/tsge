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
