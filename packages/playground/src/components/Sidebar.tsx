import React, { useState } from 'react';
import '../styles/sidebar.css';

interface Snippet {
  icon: string;
  label: string;
  code: string;
}

const snippets: Snippet[] = [
  { icon: 'fa-arrows-up-down-left-right', label: 'Vector2', code: 'new Vector2(0, 0)' },
  { icon: 'fa-font', label: 'Text', code: `new Text({
  tag: 'textObj',
  text: 'Hello World',
  fontSize: 30,
  colour: 'white',
  position: new Vector2(100, 100),
  width: 200,
  zIndex: 10
});` },
  { icon: 'fa-square', label: 'Rectangle', code: `new Rectangle({
  tag: 'rectObj',
  position: new Vector2(100, 100),
  width: 50,
  height: 50,
  colour: '#43aa8b',
  zIndex: 5
});` },
  { icon: 'fa-circle', label: 'Circle', code: `new Circle({
  tag: 'circleObj',
  position: new Vector2(100, 100),
  radius: 25,
  colour: '#F94144',
  zIndex: 5
});` },
  { icon: 'fa-image', label: 'Sprite', code: `new Sprite({
  tag: 'spriteObj',
  img: dinoImg,
  rows: 1,
  cols: 24,
  position: new Vector2(100, 100),
  startCol: 0,
  endCol: 4,
  zIndex: 5
});` },
  { icon: 'fa-minus', label: 'Line', code: `new Line({
  tag: 'lineObj',
  width: 2,
  p1: new Vector2(0, 0),
  p2: new Vector2(100, 100),
  zIndex: 1
});` }
];

const Sidebar: React.FC<Record<string, never>> = () => {
  const [isMinimized, setIsMinimized] = useState(true);

  const insertSnippet = (code: string) => {
    window.dispatchEvent(new CustomEvent('playground-insert-text', { detail: code }));
  };

  return (
    <div className={`sidebar ${isMinimized ? 'minimized' : ''}`}>
      <div className="sidebar-header" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="sidebar-title">Snippets</div>
        <i className={`fa-solid fa-chevron-down sidebar-toggle-icon`} />
      </div>
      {!isMinimized && (
        <div className="snippets-grid">
          {snippets.map((s, index) => (
            <button 
              key={index} 
              className="snippet-btn" 
              title={s.label}
              onClick={() => insertSnippet(s.code)}
            >
              <i className={`fa-solid ${s.icon}`} />
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
