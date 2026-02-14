/*
 * JS entrypoint (bootstrapper) for the test runner.
 *
 * The actual runner is written in TypeScript and lives in: `utils/testRunner/main.ts`.
 * We load it via `ts-node/register`.
 *
 * Why do we keep this file in plain JS?
 * - If TypeScript compilation fails (e.g. syntax/type error in config/utils), TS code won’t even start.
 * - This JS layer runs first, so we can print a clean, styled error and save full details to `build/error.log`.
 */

const fs = require('fs');
const path = require('path');

const BUILD_DIR = 'build';
const ERROR_LOG_RELATIVE_PATH = `${BUILD_DIR}\\error.log`;
const ANSI_ESCAPE_REGEX = /\u001b\[[0-9;]*[A-Za-z]/g;

function ensureBuildDir() {
  const dir = path.resolve(process.cwd(), BUILD_DIR);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Strip ANSI escape sequences (colors/control codes) from a string.
 *
 * @param {string} text Text that may include ANSI sequences.
 * @returns {string} Text without ANSI sequences.
 */
function stripAnsi(text) {
  return String(text || '')
    .replace(ANSI_ESCAPE_REGEX, '')
    .trim();
}

/**
 * Write a plain-text error log to `build/error.log`.
 *
 * @param {string} text Error details to persist.
 */
function writeErrorLog(text) {
  const logDir = ensureBuildDir();
  const logPath = path.join(logDir, 'error.log');
  fs.writeFileSync(logPath, stripAnsi(text) + '\n', 'utf8');
}

/**
 * Make console output ASCII-safe by replacing problematic Unicode characters.
 *
 * Some terminals (especially older Windows console hosts) don't render certain Unicode
 * symbols used by tooling (e.g. ts-node's "⨯ Unable to compile TypeScript").
 *
 * @param {string} text Raw console line (usually first line of an error message).
 * @returns {string} Sanitized console line.
 */
function sanitizeConsoleReason(text) {
  return String(text)
    .replace(/⨯/g, 'x')
    .replace(/×/g, 'x')
    .replace(/\u2212/g, '-')
    .trim();
}

/**
 * Extract a short, single-line reason from an error-like value.
 *
 * @param {unknown} err Thrown value or rejection reason.
 * @returns {string} A short message suitable for console output.
 */
function getShortReason(err) {
  if (!err) return '';

  const raw = err && (err.message || err.stack) ? String(err.message || err.stack) : String(err);
  const cleaned = stripAnsi(raw);

  const firstLine = cleaned
    .split(/\r?\n/)
    .map(l => l.trim())
    .find(Boolean);

  const reason = firstLine ? firstLine : cleaned.slice(0, 200);
  return sanitizeConsoleReason(reason);
}

/**
 * Print a styled failure block to stderr and persist full details to `build/error.log`.
 *
 * Intended to be used for runner-level failures (including TypeScript compilation errors).
 *
 * @param {string} title Short, user-facing description.
 * @param {unknown} [err] Optional error payload for additional details.
 *
 * @example
 * try {
 *   require('ts-node/register');
 * } catch (e) {
 *   printStyledFailure('Failed to start test runner (TypeScript compilation error).', e);
 *   process.exit(1);
 * }
 */
function printStyledFailure(title, err) {
  console.error('==================================================================');
  console.error(title);
  console.error('==================================================================');

  if (err) {
    const reason = getShortReason(err);
    if (reason) console.error(reason);
  }

  try {
    if (err) {
      const details = err && (err.stack || err.message) ? err.stack || err.message : String(err);
      writeErrorLog(details);
    } else {
      writeErrorLog(title);
    }

    console.error(`\nMore details saved to: ${ERROR_LOG_RELATIVE_PATH}\n`);
  } catch (e) {
    console.error('Failed to write error.log');
    console.error(e);
  }
}

process.on('uncaughtException', err => {
  printStyledFailure('Uncaught exception.', err);
  process.exit(1);
});

process.on('unhandledRejection', reason => {
  printStyledFailure('Unhandled promise rejection.', reason);
  process.exit(1);
});

try {
  require('ts-node/register');

  const { runTestRunner } = require('../utils/testRunner/main');
  const args = process.argv.slice(2);

  runTestRunner(args);
} catch (err) {
  printStyledFailure('Failed to start test runner (TypeScript compilation error).', err);
  process.exit(1);
}
