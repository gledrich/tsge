import React, { useEffect, useState, useRef } from 'react';
import * as Dino from 'dino-ge';
import '../styles/inspector.css';

const { Engine } = Dino;

interface InspectorProps {
  visible: boolean;
  onClose: () => void;
}

interface PropertyRow {
  label: string;
  type: string;
  propertyPath: string;
}

/**
 * Interface representing the properties of a GameObject that the inspector can edit.
 * This provides type safety for dynamic property access while avoiding 'any'.
 */
interface InspectableObject extends Dino.GameObject {
  [key: string]: any; // Fallback for dynamic access to nested properties like position.x
}

const sections: Record<string, PropertyRow[]> = {
  General: [
    { label: 'Tag', type: 'text', propertyPath: 'tag' },
    { label: 'Visible', type: 'checkbox', propertyPath: 'visible' },
    { label: 'Z-Index', type: 'number', propertyPath: 'zIndex' }
  ],
  Transform: [
    { label: 'X', type: 'number', propertyPath: 'position.x' },
    { label: 'Y', type: 'number', propertyPath: 'position.y' }
  ],
  Physics: [
    { label: 'Velocity X', type: 'number', propertyPath: 'velocity.x' },
    { label: 'Velocity Y', type: 'number', propertyPath: 'velocity.y' },
    { label: 'Accel X', type: 'number', propertyPath: 'acceleration.x' },
    { label: 'Accel Y', type: 'number', propertyPath: 'acceleration.y' },
    { label: 'Mass', type: 'number', propertyPath: 'mass' },
    { label: 'Is Static', type: 'checkbox', propertyPath: 'isStatic' }
  ]
};

const Inspector: React.FC<InspectorProps> = ({ visible, onClose }) => {
  const [selectedObject, setSelectedObject] = useState<InspectableObject | null>(null);
  const inputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    let rafId: number;
    const updateLoop = () => {
      const obj = Engine.selectedObject as InspectableObject | null;
      setSelectedObject(obj);

      if (visible && obj) {
        Object.entries(sections).forEach(([, rows]) => {
          rows.forEach(({ propertyPath, type }) => {
            const input = inputsRef.current[propertyPath];
            if (input && document.activeElement !== input) {
              let val;
              const paths = propertyPath.split('.');
              if (paths.length === 2) {
                val = obj[paths[0]]?.[paths[1]];
              } else {
                val = obj[propertyPath];
              }

              if (type === 'checkbox') {
                input.checked = !!val;
              } else if (type === 'number') {
                input.value = typeof val === 'number' ? val.toFixed(2) : '0';
              } else {
                input.value = val !== undefined ? String(val) : '';
              }
            }
          });
        });
      }
      rafId = requestAnimationFrame(updateLoop);
    };

    rafId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(rafId);
  }, [visible]);

  if (!visible) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, propertyPath: string, type: string) => {
    const obj = Engine.selectedObject as InspectableObject | null;
    if (!obj) return;

    let val: any = type === 'checkbox' ? e.target.checked : e.target.value;
    if (type === 'number') val = parseFloat(val);

    const paths = propertyPath.split('.');
    if (paths.length === 2) {
      // eslint-disable-next-line react-hooks/immutability
      if (obj[paths[0]]) obj[paths[0]][paths[1]] = val;
    } else {
      // eslint-disable-next-line react-hooks/immutability
      obj[propertyPath] = val;
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>, propertyPath: string, type: string) => {
    const obj = Engine.selectedObject as InspectableObject | null;
    if (!obj || !obj.tag) return;

    let val: any = type === 'checkbox' ? e.target.checked : e.target.value;
    if (type === 'number') val = parseFloat(val);

    const onValueReceived = (event: Event) => {
      window.removeEventListener('playground-editor-value', onValueReceived);
      const customEvent = event as CustomEvent<string>;
      const code = customEvent.detail;

      try {
        const tagRegex = new RegExp(`tag:\\s*['"\`]${obj.tag}['"\`]`, 'g');
        const match = tagRegex.exec(code);

        if (match) {
          const searchWindowStart = Math.max(0, match.index - 500);
          const searchWindowEnd = Math.min(code.length, match.index + 500);
          const snippet = code.substring(searchWindowStart, searchWindowEnd);

          let updatedSnippet = snippet;
          const paths = propertyPath.split('.');

          if (paths.length === 2 && paths[0] === 'position') {
            const posRegex = /position:\s*new\s*Vector2\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/;
            const posMatch = posRegex.exec(snippet);
            if (posMatch) {
              const newX = paths[1] === 'x' ? val : posMatch[1].trim();
              const newY = paths[1] === 'y' ? val : posMatch[2].trim();
              updatedSnippet = snippet.replace(posRegex, `position: new Vector2(${newX}, ${newY})`);
            }
          } else {
            const propRegex = new RegExp(`(\\b${propertyPath}\\s*:\\s*)([^,\\n}]+)`);
            const propMatch = propRegex.exec(snippet);
            if (propMatch) {
              const formattedVal = typeof val === 'string' ? `'${val}'` : val;
              updatedSnippet = snippet.replace(propRegex, `$1${formattedVal}`);
            }
          }

          if (snippet !== updatedSnippet) {
            const newCode = code.substring(0, searchWindowStart) + updatedSnippet + code.substring(searchWindowEnd);
            window.dispatchEvent(new CustomEvent('playground-update-code', { detail: newCode }));
          }
        }
      } catch (err) {
        console.error('Failed to sync inspector changes to editor:', err);
      }
    };

    window.addEventListener('playground-editor-value', onValueReceived);
    window.dispatchEvent(new CustomEvent('playground-get-value'));
  };

  return (
    <div className="inspector-container">
      <div className="inspector-header">
        <h2>Inspector</h2>
        <i className="fa-solid fa-xmark" style={{ cursor: 'pointer' }} onClick={onClose} />
      </div>
      <div className="inspector-body">
        {(!Engine.debug || !selectedObject) ? (
          <div className="no-selection">Toggle Debug Mode and click an object to inspect.</div>
        ) : (
          <div className="inspector-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(sections).map(([sectionName, rows]) => (
              <div key={sectionName} className="inspector-section">
                <h3>{sectionName}</h3>
                {rows.map(({ label, type, propertyPath }) => (
                  <div key={propertyPath} className="prop-row">
                    <label>{label}</label>
                    <input
                      type={type}
                      step="any"
                      ref={el => inputsRef.current[propertyPath] = el}
                      onChange={(e) => handleInputChange(e, propertyPath, type)}
                      onBlur={(e) => handleInputBlur(e, propertyPath, type)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inspector;
