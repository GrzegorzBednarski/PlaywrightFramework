import * as fs from 'fs';
import * as path from 'path';

const BUILD_DIR = 'build';
const ERROR_LOG_FILENAME = 'error.log';
const ERROR_LOG_RELATIVE_PATH = `${BUILD_DIR}\\${ERROR_LOG_FILENAME}`;
const ANSI_ESCAPE_REGEX = /\u001b\[[0-9;]*[A-Za-z]/g;

/**
 * Ensure the `build/` directory exists (created recursively if needed).
 *
 * This is used as a storage location for runner artifacts like `build/error.log`.
 *
 * @returns Absolute path to the resolved `build/` directory.
 */
function ensureBuildDir(): string {
  const dir = path.resolve(process.cwd(), BUILD_DIR);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Strip ANSI escape sequences (colors/control codes) from a string.
 *
 * Useful for writing clean logs to disk (so `build/error.log` is readable
 * even when console output is colored).
 *
 * @param text Text that may include ANSI sequences.
 * @returns Cleaned text without ANSI sequences.
 */
function stripAnsi(text: string): string {
  return text.replace(ANSI_ESCAPE_REGEX, '').trim();
}

/**
 * Normalize unknown error payloads into a consistent `{ message, details }` shape.
 *
 * - `Error` instances keep stack/message.
 * - strings are used as-is.
 * - other values are JSON-stringified when possible.
 *
 * @param err Any thrown value (`throw ...`), rejection reason or error-like object.
 * @returns Normalized error message and optional details (typically stack trace).
 */
function normalizeError(err: unknown): { message: string; details?: string } {
  if (err instanceof Error) {
    return {
      message: err.message || 'Unknown error',
      details: err.stack || err.message,
    };
  }

  if (typeof err === 'string') {
    return { message: err, details: err };
  }

  try {
    const json = JSON.stringify(err, null, 2);
    return { message: 'Unexpected error', details: json };
  } catch {
    return { message: 'Unexpected error', details: String(err) };
  }
}

/**
 * Write a plain-text error log to `build/error.log`.
 *
 * The log is always written without ANSI escape codes.
 *
 * @param text Error details to persist.
 */
export function writeErrorLog(text: string) {
  const logDir = ensureBuildDir();
  const logPath = path.join(logDir, ERROR_LOG_FILENAME);
  fs.writeFileSync(logPath, stripAnsi(text) + '\n', 'utf8');
}

/**
 * Print a styled failure block to stderr and persist full details to `build/error.log`.
 *
 * Use this for any fatal runner-level error where you want:
 * - consistent console formatting
 * - a stable location for full diagnostics (`build/error.log`)
 *
 * @param title Short, user-facing description of what failed.
 * @param err Optional thrown value (Error/string/unknown) for additional details.
 *
 * @example
 * try {
 *   // ...
 * } catch (e) {
 *   printStyledFailure('Performance monitoring failed.', e);
 *   process.exit(1);
 * }
 */
export function printStyledFailure(title: string, err?: unknown) {
  console.error('==================================================================');
  console.error(title);
  console.error('==================================================================');

  if (err !== undefined) {
    const { details } = normalizeError(err);
    if (details) {
      console.error(stripAnsi(details));
    }
  }

  try {
    if (err !== undefined) {
      const { details, message } = normalizeError(err);
      writeErrorLog(details || message);
    } else {
      writeErrorLog(title);
    }

    console.error(`\nMore details saved to: ${ERROR_LOG_RELATIVE_PATH}\n`);
  } catch (e) {
    console.error('Failed to write error.log');
    console.error(e);
  }
}

/**
 * Install global Node.js process error handlers that route unexpected failures
 * through {@link printStyledFailure}.
 *
 * This is especially useful for errors that happen before Playwright executes
 * (e.g. config load failures, Lighthouse tooling, unhandled async rejections).
 *
 * ⚠️ Handlers will terminate the process with exit code 1.
 *
 * @example
 * // In your runner entrypoint:
 * installGlobalErrorHandlers();
 */
export function installGlobalErrorHandlers() {
  process.on('unhandledRejection', reason => {
    printStyledFailure('Unhandled promise rejection.', reason);
    process.exit(1);
  });

  process.on('uncaughtException', error => {
    printStyledFailure('Uncaught exception.', error);
    process.exit(1);
  });
}
