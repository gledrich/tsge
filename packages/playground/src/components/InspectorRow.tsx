import React, { useEffect, useRef } from 'react';
import * as Dino from 'dino-ge';

export interface PropertyRowDef {
  label: string;
  type: string;
  propertyPath: string;
}

export interface InspectableObject extends Dino.GameObject {
  [key: string]: any;
}

/**
 * Resolves a dot-notation property path to the actual target object and property key.
 * Maps flat configuration keys (e.g., 'tag', '_physics.velocity.x') to their respective ECS Components.
 */
export const resolveComponentPath = (obj: InspectableObject, pathStr: string): { target: any, prop: string } | null => {
  let target: any = obj;
  let propPath = pathStr;

  if (pathStr === 'tag' || pathStr === 'zIndex') {
    target = obj.metadata;
    propPath = pathStr;
  } else if (pathStr === 'visible') {
    target = obj.getComponent(Dino.VisibilityComponent);
    propPath = pathStr;
  } else if (pathStr.startsWith('_physics.')) {
    target = obj.getComponent(Dino.PhysicsComponent);
    propPath = pathStr.replace('_physics.', '');
  }

  if (!target) return null;

  const paths = propPath.split('.');
  if (paths.length === 2) {
    if (paths[0] === 'position') {
      // Use transform.position so we can read and write to the actual Vector2 reference
      return { target: obj.transform.position, prop: paths[1] };
    }
    return { target: target[paths[0]], prop: paths[1] };
  }
  
  return { target, prop: propPath };
};

/**
 * Helper to update the raw code string based on the modified property.
 */
export const getUpdatedCodeSnippet = (code: string, tag: string, propertyPath: string, val: any): string | null => {
  const tagRegex = new RegExp(`tag:\\s*['"\`]${tag}['"\`]`, 'g');
  const match = tagRegex.exec(code);
  if (!match) return null;

  const searchWindowStart = Math.max(0, match.index - 500);
  const searchWindowEnd = Math.min(code.length, match.index + 500);
  const snippet = code.substring(searchWindowStart, searchWindowEnd);

  let updatedSnippet = snippet;
  const paths = propertyPath.split('.');

  if (paths.length === 2 && paths[0] === 'position') {
    const posRegex = /position:\s*new\s*(?:Dino\.)?Vector2\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/;
    const posMatch = posRegex.exec(snippet);
    if (posMatch) {
      const newX = paths[1] === 'x' ? val : posMatch[1].trim();
      const newY = paths[1] === 'y' ? val : posMatch[2].trim();
      const vectorPrefix = posMatch[0].includes('Dino.') ? 'Dino.' : '';
      updatedSnippet = snippet.replace(posRegex, `position: new ${vectorPrefix}Vector2(${newX}, ${newY})`);
    }
  } else {
    const propRegex = new RegExp(`(\\b${propertyPath}\\s*:\\s*)([^,\\n}]+)`);
    const propMatch = propRegex.exec(snippet);
    if (propMatch) {
      const formattedVal = typeof val === 'string' ? `'${val}'` : val;
      updatedSnippet = snippet.replace(propRegex, `$1${formattedVal}`);
    } else if (propertyPath.startsWith('_physics.')) {
      const physicsProp = propertyPath.replace('_physics.', '');
      const altRegex = new RegExp(`(\\b${physicsProp}\\s*:\\s*)([^,\\n}]+)`);
      const altMatch = altRegex.exec(snippet);
      if (altMatch) {
        const formattedVal = typeof val === 'string' ? `'${val}'` : val;
        updatedSnippet = snippet.replace(altRegex, `$1${formattedVal}`);
      }
    }
  }

  if (snippet !== updatedSnippet) {
    return code.substring(0, searchWindowStart) + updatedSnippet + code.substring(searchWindowEnd);
  }

  return null;
};

/**
 * Individual input row for a property, handles its own sync loop and value formatting.
 */
const InspectorRow: React.FC<{
  def: PropertyRowDef;
  selectedObject: InspectableObject;
}> = ({ def, selectedObject }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync runtime value to the input box constantly, unless focused
  useEffect(() => {
    let rafId: number;
    const loop = () => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        const resolved = resolveComponentPath(selectedObject, def.propertyPath);
        if (resolved && resolved.target) {
          const val = resolved.target[resolved.prop];
          if (def.type === 'checkbox') {
            inputRef.current.checked = !!val;
          } else if (def.type === 'number') {
            inputRef.current.value = typeof val === 'number' ? val.toFixed(2) : '0';
          } else {
            inputRef.current.value = val !== undefined ? String(val) : '';
          }
        }
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [selectedObject, def]);

  const parseValue = (e: React.ChangeEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
    let val: any = def.type === 'checkbox' ? e.target.checked : e.target.value;
    if (def.type === 'number') val = parseFloat(val);
    return val;
  };

  // Mutate the runtime object immediately
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseValue(e);
    const resolved = resolveComponentPath(selectedObject, def.propertyPath);
    if (resolved && resolved.target) {
      resolved.target[resolved.prop] = val;
    }
  };

  // Trigger a code sync when the user leaves the input
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const tag = selectedObject.metadata.tag;
    if (!tag) return;

    const val = parseValue(e);

    const onValueReceived = (event: Event) => {
      window.removeEventListener('playground-editor-value', onValueReceived);
      const customEvent = event as CustomEvent<string>;
      const code = customEvent.detail;

      const newCode = getUpdatedCodeSnippet(code, tag, def.propertyPath, val);
      if (newCode) {
        window.dispatchEvent(new CustomEvent('playground-update-code', { detail: newCode }));
      }
    };

    window.addEventListener('playground-editor-value', onValueReceived);
    window.dispatchEvent(new CustomEvent('playground-get-value'));
  };

  return (
    <div className="prop-row">
      <label>{def.label}</label>
      <input
        type={def.type}
        step="any"
        ref={inputRef}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </div>
  );
};

export default InspectorRow;
