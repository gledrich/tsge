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
  } else if (pathStr === 'width' || pathStr === 'height') {
    // Try components first as they might be the source of truth syncing to bounds
    const shape = obj.getComponent(Dino.ShapeComponent);
    const text = obj.getComponent(Dino.TextComponent);
    target = shape || text || obj.bounds;
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

  // Larger search window to find the object definition
  const searchWindowStart = Math.max(0, match.index - 1000);
  const searchWindowEnd = Math.min(code.length, match.index + 2000);
  const snippet = code.substring(searchWindowStart, searchWindowEnd);

  let updatedSnippet = snippet;
  const paths = propertyPath.split('.');

  if (paths.length === 2 && paths[0] === 'position') {
    // Improved regex to handle multiline Vector2 and extra spaces
    const posRegex = /position:\s*new\s*(?:Dino\.)?Vector2\s*\(\s*([\s\S]*?)\s*,\s*([\s\S]*?)\s*\)/;
    const posMatch = posRegex.exec(snippet);
    if (posMatch) {
      const newX = paths[1] === 'x' ? val : posMatch[1].trim();
      const newY = paths[1] === 'y' ? val : posMatch[2].trim();
      const vectorPrefix = posMatch[0].includes('Dino.') ? 'Dino.' : '';
      updatedSnippet = snippet.replace(posRegex, `position: new ${vectorPrefix}Vector2(${newX}, ${newY})`);
    }
  } else {
    // Handle other properties, including those inside components
    const propName = propertyPath.includes('.') ? propertyPath.split('.').pop() : propertyPath;
    const propRegex = new RegExp(`(\\b${propName}\\s*:\\s*)([^,\\n}]+)`);
    const propMatch = propRegex.exec(snippet);
    
    if (propMatch) {
      const formattedVal = typeof val === 'string' ? `'${val}'` : val;
      updatedSnippet = snippet.replace(propRegex, `$1${formattedVal}`);
    }
  }

  if (snippet !== updatedSnippet) {
    return code.substring(0, searchWindowStart) + updatedSnippet + code.substring(searchWindowEnd);
  }

  return null;
};

/**
 * Helper to extract a value from the code for a specific tag and property.
 */
export const getValueFromCode = (code: string, tag: string, propertyPath: string): any => {
  const tagRegex = new RegExp(`tag:\\s*['"\`]${tag}['"\`]`, 'g');
  const match = tagRegex.exec(code);
  if (!match) return undefined;

  const searchWindowStart = Math.max(0, match.index - 1000);
  const searchWindowEnd = Math.min(code.length, match.index + 2000);
  const snippet = code.substring(searchWindowStart, searchWindowEnd);

  const paths = propertyPath.split('.');

  if (paths.length === 2 && paths[0] === 'position') {
    const posRegex = /position:\s*new\s*(?:Dino\.)?Vector2\s*\(\s*([\s\S]*?)\s*,\s*([\s\S]*?)\s*\)/;
    const posMatch = posRegex.exec(snippet);
    if (posMatch) {
      const valStr = paths[1] === 'x' ? posMatch[1].trim() : posMatch[2].trim();
      const val = parseFloat(valStr);
      return isNaN(val) ? valStr : val;
    }
  } else {
    const propName = propertyPath.includes('.') ? propertyPath.split('.').pop() : propertyPath;
    const propRegex = new RegExp(`\\b${propName}\\s*:\\s*([^,\\n}]+)`);
    const propMatch = propRegex.exec(snippet);
    
    if (propMatch) {
      let val: any = propMatch[1].trim();
      if (val === 'true') return true;
      if (val === 'false') return false;
      if (!isNaN(parseFloat(val))) return parseFloat(val);
      if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        return val.substring(1, val.length - 1);
      }
      return val;
    }
  }
  return undefined;
};

/**
 * Individual input row for a property, handles its own sync loop and value formatting.
 */
const InspectorRow: React.FC<{
  def: PropertyRowDef;
  selectedObject: InspectableObject;
}> = ({ def, selectedObject }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [lastSyncedValue, setLastSyncedValue] = React.useState<any>(undefined);
  const [isModified, setIsModified] = React.useState(false);

  // Fetch the current value from the editor code to establish a baseline
  const refreshBaseline = React.useCallback(() => {
    const tag = selectedObject.metadata.tag;
    if (!tag) return;

    const onValueReceived = (event: Event) => {
      window.removeEventListener('playground-editor-value', onValueReceived);
      const customEvent = event as CustomEvent<string>;
      const code = customEvent.detail;
      const val = getValueFromCode(code, tag, def.propertyPath);
      setLastSyncedValue(val);
    };

    window.addEventListener('playground-editor-value', onValueReceived);
    window.dispatchEvent(new CustomEvent('playground-get-value'));
  }, [selectedObject, def.propertyPath]);

  // Refresh baseline when object changes or code is updated externally
  useEffect(() => {
    refreshBaseline();
    const handleUpdate = () => refreshBaseline();
    window.addEventListener('playground-update-code', handleUpdate);
    window.addEventListener('playground-script-selected', handleUpdate);
    return () => {
      window.removeEventListener('playground-update-code', handleUpdate);
      window.removeEventListener('playground-script-selected', handleUpdate);
    };
  }, [refreshBaseline]);

  // Sync runtime value to the input box and check for modifications
  useEffect(() => {
    let rafId: number;
    const loop = () => {
      const resolved = resolveComponentPath(selectedObject, def.propertyPath);
      if (resolved && resolved.target) {
        const val = resolved.target[resolved.prop];
        
        // Update input if not focused
        if (inputRef.current && document.activeElement !== inputRef.current) {
          if (def.type === 'checkbox') {
            inputRef.current.checked = !!val;
          } else if (def.type === 'number') {
            inputRef.current.value = typeof val === 'number' ? val.toFixed(2) : '0';
          } else {
            inputRef.current.value = val !== undefined ? String(val) : '';
          }
        }

        // Compare runtime value with baseline to determine modified state
        let modified = false;
        if (typeof val === 'number' && typeof lastSyncedValue === 'number') {
          // Use epsilon for float comparison to handle dragging jitter
          modified = Math.abs(val - lastSyncedValue) > 0.01;
        } else {
          modified = val !== lastSyncedValue;
        }
        setIsModified(modified);
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [selectedObject, def, lastSyncedValue]);

  const parseValue = (element: HTMLInputElement) => {
    let val: any = def.type === 'checkbox' ? element.checked : element.value;
    if (def.type === 'number') val = parseFloat(val);
    return val;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseValue(e.target);
    const resolved = resolveComponentPath(selectedObject, def.propertyPath);
    if (resolved && resolved.target) {
      resolved.target[resolved.prop] = val;
    }
  };

  const handleSync = () => {
    if (!inputRef.current) return;
    const tag = selectedObject.metadata.tag;
    if (!tag) return;

    const val = parseValue(inputRef.current);

    const onValueReceived = (event: Event) => {
      window.removeEventListener('playground-editor-value', onValueReceived);
      const customEvent = event as CustomEvent<string>;
      const code = customEvent.detail;

      const newCode = getUpdatedCodeSnippet(code, tag, def.propertyPath, val);
      if (newCode) {
        window.dispatchEvent(new CustomEvent('playground-update-code', { detail: newCode }));
        setLastSyncedValue(val);
        setIsModified(false);
      }
    };

    window.addEventListener('playground-editor-value', onValueReceived);
    window.dispatchEvent(new CustomEvent('playground-get-value'));
  };

  return (
    <div className={`prop-row ${isModified ? 'modified' : ''}`}>
      <label>{def.label}</label>
      <div className="input-group">
        <input
          type={def.type}
          step="any"
          ref={inputRef}
          onChange={handleChange}
        />
        <i 
          className="fa-solid fa-floppy-disk save-prop-icon" 
          onClick={handleSync}
          title="Save this property to code"
        />
      </div>
    </div>
  );
};

export default InspectorRow;
