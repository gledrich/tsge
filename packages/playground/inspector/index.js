import Engine from '../../built/Engine.js';
import { getEditorValue, setEditorValue } from '../editor/index.js';

export const createInspector = (onClose) => {
  const container = document.createElement('div');
  container.className = 'inspector-container hidden'; // Hidden by default, toggleable

  // Prevent clicks from falling through to the game canvas
  container.addEventListener('mousedown', (e) => e.stopPropagation());
  container.addEventListener('mouseup', (e) => e.stopPropagation());
  container.addEventListener('click', (e) => e.stopPropagation());

  const header = document.createElement('div');
  header.className = 'inspector-header';
  const title = document.createElement('h2');
  title.innerText = 'Inspector';
  
  const closeBtn = document.createElement('i');
  closeBtn.className = 'fa-solid fa-xmark';
  closeBtn.style.cursor = 'pointer';
  closeBtn.onclick = () => {
    container.classList.add('hidden');
    if (onClose) onClose();
  };
  
  header.appendChild(title);
  header.appendChild(closeBtn);

  const body = document.createElement('div');
  body.className = 'inspector-body';

  const noSelection = document.createElement('div');
  noSelection.className = 'no-selection';
  noSelection.innerText = 'Toggle Debug Mode and click an object to inspect.';

  const formContainer = document.createElement('div');
  formContainer.className = 'inspector-form';
  formContainer.style.display = 'none';
  formContainer.style.flexDirection = 'column';
  formContainer.style.gap = '1rem';

  // Helper to create rows
  const createRow = (labelText, type, propertyPath) => {
    const row = document.createElement('div');
    row.className = 'prop-row';
    const label = document.createElement('label');
    label.innerText = labelText;
    const input = document.createElement('input');
    input.type = type;
    input.step = 'any';

    // Update Engine when UI changes
    input.addEventListener('input', (e) => {
      const obj = Engine.selectedObject;
      if (!obj) return;
      
      let val = type === 'checkbox' ? e.target.checked : e.target.value;
      if (type === 'number') val = parseFloat(val);
      
      // Handle nested paths (e.g., 'position.x')
      const paths = propertyPath.split('.');
      if (paths.length === 2) {
        obj[paths[0]][paths[1]] = val;
      } else {
        obj[propertyPath] = val;
      }
    });

    // Update Editor when UI value is committed
    input.addEventListener('change', (e) => {
      const obj = Engine.selectedObject;
      if (!obj || !obj.tag) return;
      
      let val = type === 'checkbox' ? e.target.checked : e.target.value;
      if (type === 'number') val = parseFloat(val);

      try {
        const code = getEditorValue();
        
        // Find the tag: 'obj.tag' definition
        const tagRegex = new RegExp(`tag:\\s*['"\`]${obj.tag}['"\`]`, 'g');
        const match = tagRegex.exec(code);
        
        if (match) {
          // Look 500 characters around the tag to find the object instantiation
          const searchWindowStart = Math.max(0, match.index - 500);
          const searchWindowEnd = Math.min(code.length, match.index + 500);
          let snippet = code.substring(searchWindowStart, searchWindowEnd);
          
          let updatedSnippet = snippet;
          const paths = propertyPath.split('.');
          
          if (paths.length === 2 && paths[0] === 'position') {
            // Find position: new Vector2(x, y)
            const posRegex = /position:\s*new\s*Vector2\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/;
            const posMatch = posRegex.exec(snippet);
            if (posMatch) {
              const newX = paths[1] === 'x' ? val : posMatch[1].trim();
              const newY = paths[1] === 'y' ? val : posMatch[2].trim();
              updatedSnippet = snippet.replace(posRegex, `position: new Vector2(${newX}, ${newY})`);
            }
          } else {
            // Find property: value
            // Be careful to match the exact property name
            const propRegex = new RegExp(`(\\b${propertyPath}\\s*:\\s*)([^,\\n}]+)`);
            const propMatch = propRegex.exec(snippet);
            if (propMatch) {
              const formattedVal = typeof val === 'string' ? `'${val}'` : val;
              updatedSnippet = snippet.replace(propRegex, `$1${formattedVal}`);
            }
          }
          
          if (snippet !== updatedSnippet) {
            const newCode = code.substring(0, searchWindowStart) + updatedSnippet + code.substring(searchWindowEnd);
            setEditorValue(newCode);
          }
        }
      } catch(err) {
        console.error('Failed to sync inspector changes to editor:', err);
      }
    });

    row.appendChild(label);
    row.appendChild(input);
    return { row, input, propertyPath, type };
  };

  const sections = {
    General: [
      createRow('Tag', 'text', 'tag'),
      createRow('Visible', 'checkbox', 'visible'),
      createRow('Z-Index', 'number', 'zIndex')
    ],
    Transform: [
      createRow('X', 'number', 'position.x'),
      createRow('Y', 'number', 'position.y')
      // Note: width/height are often getters depending on the shape, so we might skip editing them globally here, or handle specific subclasses if needed.
    ],
    Physics: [
      createRow('Velocity X', 'number', 'velocity.x'),
      createRow('Velocity Y', 'number', 'velocity.y'),
      createRow('Accel X', 'number', 'acceleration.x'),
      createRow('Accel Y', 'number', 'acceleration.y'),
      createRow('Mass', 'number', 'mass'),
      createRow('Is Static', 'checkbox', 'isStatic')
    ]
  };

  const inputs = [];

  for (const [sectionName, rows] of Object.entries(sections)) {
    const section = document.createElement('div');
    section.className = 'inspector-section';
    const sectionTitle = document.createElement('h3');
    sectionTitle.innerText = sectionName;
    section.appendChild(sectionTitle);

    rows.forEach(({ row, input, propertyPath, type }) => {
      section.appendChild(row);
      inputs.push({ input, propertyPath, type });
    });

    formContainer.appendChild(section);
  }

  body.appendChild(noSelection);
  body.appendChild(formContainer);

  container.appendChild(header);
  container.appendChild(body);

  // Update Loop
  const updateLoop = () => {
    if (!container.classList.contains('hidden')) {
      const obj = Engine.selectedObject;

      if (!Engine.debug || !obj) {
        noSelection.style.display = 'block';
        formContainer.style.display = 'none';
        title.innerText = 'Inspector';
      } else {
        noSelection.style.display = 'none';
        formContainer.style.display = 'flex';
        title.innerText = `Inspector: ${obj.constructor.name}`;

        inputs.forEach(({ input, propertyPath, type }) => {
          // Skip updating if user is currently typing in this field
          if (document.activeElement === input) return;

          let val;
          const paths = propertyPath.split('.');
          if (paths.length === 2) {
            val = obj[paths[0]][paths[1]];
          } else {
            val = obj[propertyPath];
          }

          if (type === 'checkbox') {
            input.checked = !!val;
          } else if (type === 'number') {
            input.value = typeof val === 'number' ? val.toFixed(2) : 0;
          } else {
            input.value = val !== undefined ? val : '';
          }
        });
      }
    }
    requestAnimationFrame(updateLoop);
  };

  requestAnimationFrame(updateLoop);

  return container;
};
