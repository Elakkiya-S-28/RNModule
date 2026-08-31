
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  ts: number;
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LEVEL_COLOR: Record<LogLevel, string> = {
  debug: '\x1b[36m',
  info: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};
const RESET = '\x1b[0m';

class Logger {
  private buffer: LogEntry[] = [];
  private readonly maxBuffer = 200;

  enabled = true;

  minLevel: LogLevel = 'debug';

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false;
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[this.minLevel];
  }

  private push(entry: LogEntry): void {
    this.buffer.push(entry);
    if (this.buffer.length > this.maxBuffer) {
      this.buffer.splice(0, this.buffer.length - this.maxBuffer);
    }
  }

  private write(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;
    const entry: LogEntry = { level, message, context, ts: Date.now() };
    this.push(entry);
    const color = LEVEL_COLOR[level];
    const ctx = context ? ` ${JSON.stringify(context)}` : '';

    console[level === 'debug' ? 'log' : level](`${color}[${level.toUpperCase()}]${RESET} ${message}${ctx}`);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.write('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.write('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.write('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.write('error', message, context);
  }

  getBuffer(): ReadonlyArray<LogEntry> {
    return this.buffer.slice();
  }

  clear(): void {
    this.buffer = [];
  }
}

export const logger = new Logger();
export type { LogEntry };
export default logger;
