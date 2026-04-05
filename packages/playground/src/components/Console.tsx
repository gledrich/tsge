import React, { useState, useEffect, useRef } from 'react';
import '../styles/console.css';

const Console: React.FC = () => {
  const [logs, setLogs] = useState<{ id: number; message: string }[]>([]);
  const consoleTextRef = useRef<HTMLDivElement>(null);
  const nextLogId = useRef(0);

  useEffect(() => {
    const originalLog = window.console.log;
    
    window.console.log = (...args: unknown[]) => {
      originalLog(...args);
      const message = args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(' ');
      
      setLogs((prev) => [...prev, { id: nextLogId.current++, message }]);
    };

    return () => {
      window.console.log = originalLog;
    };
  }, []);

  useEffect(() => {
    if (consoleTextRef.current) {
      consoleTextRef.current.scrollTop = consoleTextRef.current.scrollHeight;
    }
  }, [logs]);

  const clearConsole = () => {
    setLogs([]);
  };

  return (
    <div className="console">
      <div className="console-header">
        <b className="title">Console</b>
        <i 
          className="fa-solid fa-trash-can clear-btn" 
          title="Clear Console"
          onClick={clearConsole}
        />
      </div>
      <div className="console-text" ref={consoleTextRef}>
        {logs.map((log) => (
          <div key={log.id} className="console-line">
            <span className="bash">$</span>
            <pre>{log.message}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Console;
