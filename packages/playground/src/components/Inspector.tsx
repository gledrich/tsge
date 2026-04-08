import React, { useEffect, useState } from 'react';
import * as Dino from 'dino-ge';
import InspectorRow, { InspectableObject, PropertyRowDef, resolveComponentPath, getUpdatedCodeSnippet } from './InspectorRow';
import '../styles/inspector.css';

const { Engine } = Dino;

interface InspectorProps {
  visible: boolean;
  onClose: () => void;
}

const SECTIONS: Record<string, { rows: PropertyRowDef[], component?: any }> = {
  General: {
    component: Dino.TagComponent,
    rows: [
      { label: 'Tag', type: 'text', propertyPath: 'tag' },
      { label: 'Visible', type: 'checkbox', propertyPath: 'visible' },
      { label: 'Z-Index', type: 'number', propertyPath: 'zIndex' }
    ]
  },
  Transform: {
    component: Dino.TransformComponent,
    rows: [
      { label: 'X', type: 'number', propertyPath: 'position.x' },
      { label: 'Y', type: 'number', propertyPath: 'position.y' },
      { label: 'Width', type: 'number', propertyPath: 'width' },
      { label: 'Height', type: 'number', propertyPath: 'height' }
    ]
  },
  Physics: {
    component: Dino.PhysicsComponent,
    rows: [
      { label: 'Velocity X', type: 'number', propertyPath: '_physics.velocity.x' },
      { label: 'Velocity Y', type: 'number', propertyPath: '_physics.velocity.y' },
      { label: 'Accel X', type: 'number', propertyPath: '_physics.acceleration.x' },
      { label: 'Accel Y', type: 'number', propertyPath: '_physics.acceleration.y' },
      { label: 'Mass', type: 'number', propertyPath: '_physics.mass' },
      { label: 'Restitution', type: 'number', propertyPath: '_physics.restitution' },
      { label: 'Friction', type: 'number', propertyPath: '_physics.friction' },
      { label: 'Is Static', type: 'checkbox', propertyPath: '_physics.isStatic' }
    ]
  }
};

const Inspector: React.FC<InspectorProps> = ({ visible, onClose }) => {
  const [selectedObject, setSelectedObject] = useState<InspectableObject | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Sync the currently selected engine object
  useEffect(() => {
    if (!visible) return;
    
    let rafId: number;
    const loop = () => {
      setSelectedObject(Engine.selectedObject as InspectableObject | null);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [visible]);

  const handleApplyToCode = () => {
    if (!selectedObject) return;
    const tag = selectedObject.metadata.tag;
    if (!tag) return;

    setIsApplying(true);

    const onValueReceived = (event: Event) => {
      window.removeEventListener('playground-editor-value', onValueReceived);
      const customEvent = event as CustomEvent<string>;
      let currentCode = customEvent.detail;
      let hasChanges = false;

      // Iterate through all sections and rows to apply current values
      Object.values(SECTIONS).forEach(section => {
        if (section.component && !selectedObject.hasComponent(section.component)) {
          return;
        }

        section.rows.forEach(def => {
          const resolved = resolveComponentPath(selectedObject, def.propertyPath);
          if (resolved && resolved.target) {
            const val = resolved.target[resolved.prop];
            const newCode = getUpdatedCodeSnippet(currentCode, tag, def.propertyPath, val);
            if (newCode) {
              currentCode = newCode;
              hasChanges = true;
            }
          }
        });
      });

      if (hasChanges) {
        window.dispatchEvent(new CustomEvent('playground-update-code', { detail: currentCode }));
      }
      
      setTimeout(() => setIsApplying(false), 500);
    };

    window.addEventListener('playground-editor-value', onValueReceived);
    window.dispatchEvent(new CustomEvent('playground-get-value'));
  };

  if (!visible) return null;

  return (
    <div className="inspector-container">
      <div className="inspector-header">
        <div className="header-left">
          <h2>Inspector</h2>
          {selectedObject && (
            <button 
              className={`apply-btn ${isApplying ? 'applying' : ''}`} 
              onClick={handleApplyToCode}
              title="Apply all current values to code"
            >
              <i className={`fa-solid ${isApplying ? 'fa-check' : 'fa-save'}`} />
              <span>Apply to Code</span>
            </button>
          )}
        </div>
        <i className="fa-solid fa-xmark" style={{ cursor: 'pointer' }} onClick={onClose} />
      </div>
      <div className="inspector-body">
        {(!Engine.debug || !selectedObject) ? (
          <div className="no-selection">Toggle Debug Mode and click an object to inspect.</div>
        ) : (
          <div className="inspector-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(SECTIONS).map(([sectionName, config]) => {
              if (config.component && !selectedObject.hasComponent(config.component)) {
                return null;
              }
              
              return (
                <div key={sectionName} className="inspector-section">
                  <h3>{sectionName}</h3>
                  {config.rows.map((def) => (
                    <InspectorRow 
                      key={def.propertyPath} 
                      def={def} 
                      selectedObject={selectedObject} 
                    />
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inspector;
