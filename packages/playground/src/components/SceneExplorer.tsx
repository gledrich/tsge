import React, { useEffect, useState } from 'react';
import * as Dino from 'dino-ge';
import '../styles/scene-explorer.css';

const { Engine } = Dino;

interface SceneNodeProps {
  object: Dino.GameObject;
  selectedId: Dino.GameObject | null;
  onSelect: (obj: Dino.GameObject) => void;
  depth: number;
}

const SceneNode: React.FC<SceneNodeProps> = ({ object, selectedId, onSelect, depth }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const children = Array.from(object.transform.children)
    .map(t => t.gameObject)
    .filter((obj): obj is Dino.GameObject => !!obj);

  const hasChildren = children.length > 0;
  const isSelected = selectedId === object;

  return (
    <div className="scene-node-container">
      <div 
        className={`scene-node ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${depth * 12 + 5}px` }}
        onClick={() => onSelect(object)}
      >
        {hasChildren ? (
          <i 
            className={`fa-solid ${isExpanded ? 'fa-caret-down' : 'fa-caret-right'} toggle-icon`}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          />
        ) : (
          <span className="spacer" />
        )}
        <i className={`fa-solid ${getIconForObject(object)} type-icon`} />
        <span className="node-tag">{object.metadata.tag || 'GameObject'}</span>
      </div>
      {hasChildren && isExpanded && (
        <div className="node-children">
          {children.map((child) => (
            <SceneNode 
              key={child.id} 
              object={child} 
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const getIconForObject = (obj: Dino.GameObject): string => {
  if (obj.constructor.name === 'Circle') return 'fa-circle';
  if (obj.constructor.name === 'Rectangle') return 'fa-square';
  if (obj.constructor.name === 'Sprite') return 'fa-image';
  if (obj.constructor.name === 'Text') return 'fa-font';
  if (obj.constructor.name === 'Line') return 'fa-minus';
  if (obj.constructor.name === 'Tilemap') return 'fa-border-all';
  return 'fa-cube';
};

const SceneExplorer: React.FC = () => {
  const [rootObjects, setRootObjects] = useState<Dino.GameObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<Dino.GameObject | null>(null);

  useEffect(() => {
    let rafId: number;
    const loop = () => {
      let allObjects: Dino.GameObject[] = [];
      
      const scene = (Engine as any).currentScene;
      const sceneObjects = scene?.objects;
      const globalObjects = Engine.objects;

      if (sceneObjects) {
        allObjects = Array.from(sceneObjects);
      } else {
        allObjects = Array.from(globalObjects);
      }

      if (allObjects.length > 0) {
        // Only log if count changes to avoid spamming
        if (allObjects.length !== (window as any)._lastObjCount) {
          console.log(`SceneExplorer found ${allObjects.length} objects (Scene: ${!!scene})`);
          (window as any)._lastObjCount = allObjects.length;
        }
      }

      // Filter for objects that have no parent transform
      const roots = allObjects.filter(obj => !obj.transform.parent);
      
      if (allObjects.length > 0 && roots.length === 0) {
        console.warn('SceneExplorer: Objects exist but no roots found. Hierarchy might be circular or broken.', allObjects);
      }

      setRootObjects(roots);
      setSelectedObject(Engine.selectedObject);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleSelect = (obj: Dino.GameObject) => {
    Engine.selectedObject = obj;
    // If not in debug mode, enable it to show the selection
    if (!Engine.debug) {
      Engine.debug = true;
    }
  };

  return (
    <div className="scene-explorer">
      <div className="explorer-content">
        {rootObjects.length === 0 ? (
          <div className="empty-scene">No objects in scene</div>
        ) : (
          rootObjects.map((obj) => (
            <SceneNode 
              key={obj.id} 
              object={obj} 
              selectedId={selectedObject}
              onSelect={handleSelect}
              depth={0}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SceneExplorer;
