import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LogManager, LogEntry, LogLevel } from '../utils/LogManager';
import '../styles/console.css';

const Console: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');
  const consoleTextRef = useRef<HTMLDivElement>(null);
  
  const logManager = useMemo(() => new LogManager((updatedLogs) => {
    setLogs([...updatedLogs]);
  }), []);

  useEffect(() => {
    const originalLog = window.console.log;
    const originalInfo = window.console.info;
    const originalWarn = window.console.warn;
    const originalError = window.console.error;
    
    window.console.log = (...args: unknown[]) => {
      originalLog(...args);
      logManager.add('log', ...args);
    };
    window.console.info = (...args: unknown[]) => {
      originalInfo(...args);
      logManager.add('info', ...args);
    };
    window.console.warn = (...args: unknown[]) => {
      originalWarn(...args);
      logManager.add('warn', ...args);
    };
    window.console.error = (...args: unknown[]) => {
      originalError(...args);
      logManager.add('error', ...args);
    };

    return () => {
      window.console.log = originalLog;
      window.console.info = originalInfo;
      window.console.warn = originalWarn;
      window.console.error = originalError;
    };
  }, [logManager]);

  useEffect(() => {
    if (consoleTextRef.current) {
      consoleTextRef.current.scrollTop = consoleTextRef.current.scrollHeight;
    }
  }, [logs]);

  const clearConsole = () => {
    logManager.clear();
  };

  const handleFilterChange = (newFilter: LogLevel | 'all') => {
    setFilter(newFilter);
    logManager.setFilter(newFilter);
  };

  return (
    <div className="console">
      <div className="console-header">
        <div className="header-left">
          <b className="title">Console</b>
          <div className="filter-chips">
            {(['all', 'log', 'info', 'warn', 'error'] as const).map((f) => (
              <span 
                key={f} 
                className={`filter-chip ${filter === f ? 'active' : ''} ${f}`}
                onClick={() => handleFilterChange(f)}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
        <i 
          className="fa-solid fa-trash-can clear-btn" 
          title="Clear Console"
          onClick={clearConsole}
        />
      </div>
      <div className="console-text" ref={consoleTextRef}>
        {logs.map((log) => (
          <div key={log.id} className={`console-line ${log.level}`}>
            <span className="bash">$</span>
            <pre>{log.message}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Console;
