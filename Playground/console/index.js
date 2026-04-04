export default () => {
  const container = document.createElement('div');
  container.className = 'console';

  const header = document.createElement('div');
  header.className = 'console-header';

  const title = document.createElement('b');
  title.className = 'title';
  title.innerHTML = 'Console';

  const clearBtn = document.createElement('i');
  clearBtn.className = 'fa-solid fa-trash-can clear-btn';
  clearBtn.title = 'Clear Console';
  clearBtn.onclick = () => {
    consoleText.innerHTML = '';
  };

  const consoleText = document.createElement('div');
  consoleText.innerHTML = '';
  consoleText.className = 'console-text';

  const originalLog = window.console.log;
  window.console.log = (...args) => {
    originalLog(...args);
    const message = args
      .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg))
      .join(' ');
    
    const line = document.createElement('div');
    line.className = 'console-line';
    line.innerHTML = '<span class="bash">$</span><pre>' + message + '</pre>';
    consoleText.appendChild(line);
    container.scrollTop = container.scrollHeight;
  };

  header.appendChild(title);
  header.appendChild(clearBtn);
  container.appendChild(header);
  container.appendChild(consoleText);

  return container;
};
