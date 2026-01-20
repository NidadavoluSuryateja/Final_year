import { Platform } from 'react-native';

// in-memory logs only; file saving happens via react-native-fs when available

type LogEntry = {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  meta?: any;
};

let logs: LogEntry[] = [];

const pushLog = (entry: LogEntry) => {
  logs.unshift(entry);
  if (logs.length > 200) logs.pop();
};

export const getLogs = (): LogEntry[] => logs;

export const clearLogs = () => {
  logs = [];
};

export const captureConsole = () => {
  const origError: any = console.error;
  const origWarn: any = console.warn;
  const origLog: any = console.log;

  console.error = (...args: any[]) => {
    try {
      pushLog({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: JSON.stringify(args),
      });
    } catch {}
    try {
      if (typeof origError === 'function') {
        origError.apply(console, args as any);
      }
    } catch {
      // swallow any errors invoking the original console method to avoid
      // crashing the app if the original console implementation is unusual
    }
  };

  console.warn = (...args: any[]) => {
    try {
      pushLog({
        timestamp: new Date().toISOString(),
        level: 'warn',
        message: JSON.stringify(args),
      });
    } catch {}
    try {
      if (typeof origWarn === 'function') {
        origWarn.apply(console, args as any);
      }
    } catch {}
  };

  console.log = (...args: any[]) => {
    try {
      pushLog({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: JSON.stringify(args),
      });
    } catch {}
    try {
      if (typeof origLog === 'function') {
        origLog.apply(console, args as any);
      }
    } catch {}
  };

  // global handler
  const oldHandler = (globalThis as any).ErrorUtils?.getGlobalHandler?.();
  (globalThis as any).ErrorUtils?.setGlobalHandler?.(
    (error: any, isFatal?: boolean) => {
      try {
        pushLog({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `${error.message}\n${error.stack}`,
        });
      } catch {}
      if (oldHandler) oldHandler(error, isFatal);
    },
  );
};

export const saveLogsToFile = async (): Promise<string> => {
  const content = logs
    .map(l => `${l.timestamp} [${l.level}] ${l.message}`)
    .join('\n\n');
  const fileName = `ar_logs_${Date.now()}.log`;
  // Lazy-require react-native-fs to avoid native-module access at bundle evaluation time
  let RNFS: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    RNFS = require('react-native-fs');
  } catch {
    throw new Error(
      'react-native-fs is not installed or failed to load. Install and rebuild the app.',
    );
  }

  if (!RNFS) {
    throw new Error('react-native-fs native module is not available.');
  }

  const basePath =
    Platform.OS === 'android'
      ? RNFS.ExternalDirectoryPath
      : RNFS.DocumentDirectoryPath;
  if (!basePath) {
    throw new Error('Unable to determine writable directory on this platform.');
  }

  const path = `${basePath}/${fileName}`;
  await RNFS.writeFile(path, content, 'utf8');
  return path;
};

export default {
  captureConsole,
  getLogs,
  clearLogs,
  saveLogsToFile,
};
