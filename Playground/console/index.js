export default () => {
  const container = document.createElement('div');
  container.className = 'console';

  const title = document.createElement('b');
  title.className = 'title';
  title.innerHTML = 'Console';

  const consoleText = document.createElement('div');
  consoleText.innerHTML = '';
  consoleText.className = 'console-text';

  window.console.log = (message) =>
    (consoleText.innerHTML +=
      '<p><span className="bash">$</span>' + message + '</p>');

  container.appendChild(title);
  container.appendChild(consoleText);

  return container;
};
