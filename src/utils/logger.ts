/**
 * Simple logger utility
 * Can be replaced with a more robust solution like Winston or Pino
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface Logger {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

function formatTimestamp(): string {
  return new Date().toISOString();
}

function log(level: LogLevel, ...args: unknown[]): void {
  const timestamp = formatTimestamp();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  switch (level) {
    case 'error':
      console.error(prefix, ...args);
      break;
    case 'warn':
      console.warn(prefix, ...args);
      break;
    case 'debug':
      if (process.env.NODE_ENV === 'development') {
        console.debug(prefix, ...args);
      }
      break;
    default:
      console.log(prefix, ...args);
  }
}

export const logger: Logger = {
  info: (...args: unknown[]) => log('info', ...args),
  warn: (...args: unknown[]) => log('warn', ...args),
  error: (...args: unknown[]) => log('error', ...args),
  debug: (...args: unknown[]) => log('debug', ...args),
};

