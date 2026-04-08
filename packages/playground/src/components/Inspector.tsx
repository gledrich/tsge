import React, { useEffect, useState } from 'react';
import * as Dino from 'dino-ge';
import InspectorRow, { InspectableObject, PropertyRowDef } from './InspectorRow';
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

  if (!visible) return null;

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
