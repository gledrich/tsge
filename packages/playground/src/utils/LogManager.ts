export type LogLevel = 'log' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: number;
  message: string;
  level: LogLevel;
  timestamp: number;
}

export class LogManager {
  private _logs: LogEntry[] = [];
  private _nextId = 0;
  private _onUpdate?: (logs: LogEntry[]) => void;
  private _filter: LogLevel | 'all' = 'all';

  constructor(onUpdate?: (logs: LogEntry[]) => void) {
    this._onUpdate = onUpdate;
  }

  add(level: LogLevel, ...args: unknown[]) {
    const message = args
      .map((arg) => {
        if (typeof arg === 'object' && arg !== null) {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(' ');

    const entry: LogEntry = {
      id: this._nextId++,
      message,
      level,
      timestamp: Date.now()
    };

    this._logs.push(entry);
    this._notify();
  }

  clear() {
    this._logs = [];
    this._notify();
  }

  setFilter(filter: LogLevel | 'all') {
    this._filter = filter;
    this._notify();
  }

  get filteredLogs(): LogEntry[] {
    if (this._filter === 'all') return this._logs;
    return this._logs.filter(l => l.level === this._filter);
  }

  private _notify() {
    this._onUpdate?.(this.filteredLogs);
  }
}
