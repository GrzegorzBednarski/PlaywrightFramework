import * as fs from 'fs';
import * as path from 'path';

function sanitizeLenientJson(input: string): string {
  let result = '';
  let inString = false;
  let escape = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (escape) {
      // previous char was backslash, keep as-is
      result += ch;
      escape = false;
      continue;
    }
    if (ch === '\\') {
      // start escape sequence
      result += ch;
      escape = true;
      continue;
    }
    if (ch === '"') {
      // toggle string state
      inString = !inString;
      result += ch;
      continue;
    }
    if (inString) {
      const code = ch.charCodeAt(0);
      if (code === 0x0a) {
        // LF inside string -> escape
        result += '\\n';
        continue;
      }
      if (code === 0x0d) {
        // CR inside string -> escape
        result += '\\r';
        continue;
      }
      if (code === 0x09) {
        // TAB inside string -> escape
        result += '\\t';
        continue;
      }
      if (code < 0x20) {
        // other control chars -> unicode escape
        result += '\\u' + code.toString(16).padStart(4, '0');
        continue;
      }
    }
    result += ch;
  }
  return result;
}

/**
 * Loads a JSON fixture file and applies dynamic replacements to its content.
 *
 * @param relativePath - Path to the fixture file relative to the fixtures directory (e.g., 'intercepts/userList.json')
 * @param replacements - Optional object containing placeholder-value pairs for replacement (e.g., { '%USER_NAME%': 'Alice' })
 * @returns The parsed JSON object with all placeholders replaced by their corresponding values
 *
 * @example
 * ```typescript
 * const fixtureData = loadFixtureWithReplacements('intercepts/userGreeting.json', {
 *   '%USER_NAME%': 'Alice',
 *   '%TODAY_DATE%': new Date().toISOString(),
 * });
 * ```
 */
export function loadFixtureWithReplacements(
  relativePath: string,
  replacements?: Record<string, string | number>
) {
  const filePath = path.join(__dirname, '..', 'fixtures', relativePath);
  const raw = fs.readFileSync(filePath, 'utf-8');

  let json: any;
  try {
    json = JSON.parse(raw);
  } catch (err: any) {
    // Attempt lenient sanitization (handles unescaped control chars / multiline strings)
    try {
      const sanitized = sanitizeLenientJson(raw);
      json = JSON.parse(sanitized);
    } catch {
      const message = `Failed to parse JSON fixture: ${relativePath}. Original error: ${err.message}.`;
      throw new Error(message);
    }
  }

  const applyReplacements = (obj: any) => {
    if (Array.isArray(obj)) {
      obj.forEach(item => applyReplacements(item));
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (typeof obj[key] === 'object') {
          applyReplacements(obj[key]);
        } else if (typeof obj[key] === 'string') {
          for (const [placeholder, value] of Object.entries(replacements || {})) {
            if (obj[key].includes(placeholder)) {
              obj[key] = obj[key].replace(placeholder, String(value));
            }
          }
        }
      }
    }
  };

  applyReplacements(json);
  return json;
}
