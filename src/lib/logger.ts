type Level = "info" | "warn" | "error";

function write(level: Level, message: string, context?: Record<string, unknown>) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };
  console[level](JSON.stringify(payload));
}

export const log = {
  info: (message: string, context?: Record<string, unknown>) => write("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => write("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) => write("error", message, context),
};
