/**
 * Lightweight & robust Python Syntax Highlighter
 * Transforms raw Python code into styled HTML with syntax classes
 */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const KEYWORDS = new Set([
  'def', 'class', 'if', 'elif', 'else', 'while', 'for', 'in', 'return',
  'import', 'from', 'as', 'try', 'except', 'finally', 'raise', 'with',
  'pass', 'break', 'continue', 'lambda', 'yield', 'and', 'or', 'not',
  'is', 'None', 'True', 'False', 'async', 'await', 'global', 'nonlocal', 'match', 'case'
]);

const BUILTINS = new Set([
  'print', 'input', 'len', 'range', 'int', 'str', 'float', 'bool',
  'list', 'dict', 'set', 'tuple', 'open', 'type', 'sum', 'min', 'max',
  'sorted', 'enumerate', 'zip', 'isinstance', 'abs', 'all', 'any',
  'round', 'help', 'id', 'map', 'filter', 'iter', 'next', 'reversed',
  'super', 'format', 'chr', 'ord', 'bin', 'hex', 'oct', 'dir'
]);

export function highlightPython(code: string): string {
  if (!code) return '';

  const lines = code.split('\n');
  const highlightedLines = lines.map((line) => {
    let result = '';
    let i = 0;
    const len = line.length;

    while (i < len) {
      // 1. Comments: # to end of line
      if (line[i] === '#') {
        const comment = line.slice(i);
        result += `<span class="text-emerald-500/80 dark:text-emerald-400/80 italic">${escapeHtml(comment)}</span>`;
        break;
      }

      // 2. Multi-character or single-character Strings
      // Match optional prefix f, r, b, rf, etc. followed by ' or "
      const strPrefixMatch = line.slice(i).match(/^([frbFRB]{1,2})?(["'])/);
      if (strPrefixMatch) {
        const prefix = strPrefixMatch[1] || '';
        const quote = strPrefixMatch[2];
        const tripleQuote = quote.repeat(3);
        const startIdx = i;

        if (line.slice(i + prefix.length).startsWith(tripleQuote)) {
          // Triple quote string on single line (if closed) or rest of line
          const searchFrom = i + prefix.length + 3;
          const endIdx = line.indexOf(tripleQuote, searchFrom);
          if (endIdx !== -1) {
            const rawStr = line.slice(startIdx, endIdx + 3);
            result += `<span class="text-amber-300 dark:text-amber-300 font-normal">${escapeHtml(rawStr)}</span>`;
            i = endIdx + 3;
            continue;
          }
        } else {
          // Standard single or double quote string
          let endIdx = -1;
          for (let j = i + prefix.length + 1; j < len; j++) {
            if (line[j] === '\\') {
              j++; // skip escaped char
              continue;
            }
            if (line[j] === quote) {
              endIdx = j;
              break;
            }
          }
          if (endIdx !== -1) {
            const rawStr = line.slice(startIdx, endIdx + 1);
            result += `<span class="text-amber-300 dark:text-amber-200 font-normal">${escapeHtml(rawStr)}</span>`;
            i = endIdx + 1;
            continue;
          }
        }
      }

      // 3. Numbers (integers, floats)
      const numMatch = line.slice(i).match(/^(\b\d+(\.\d+)?([eE][+-]?\d+)?\b)/);
      if (numMatch && (i === 0 || !/[a-zA-Z_]/.test(line[i - 1]))) {
        result += `<span class="text-teal-400 dark:text-teal-300 font-mono">${escapeHtml(numMatch[1])}</span>`;
        i += numMatch[1].length;
        continue;
      }

      // 4. Identifiers (Keywords, Builtins, Function calls, normal words)
      const identMatch = line.slice(i).match(/^([a-zA-Z_][a-zA-Z0-9_]*)/);
      if (identMatch) {
        const word = identMatch[1];
        const nextCharAfterWord = line[i + word.length];

        if (KEYWORDS.has(word)) {
          result += `<span class="text-purple-400 dark:text-purple-300 font-semibold">${escapeHtml(word)}</span>`;
        } else if (BUILTINS.has(word)) {
          result += `<span class="text-sky-400 dark:text-sky-300 font-semibold">${escapeHtml(word)}</span>`;
        } else if (nextCharAfterWord === '(') {
          result += `<span class="text-yellow-300 dark:text-yellow-200 font-medium">${escapeHtml(word)}</span>`;
        } else {
          result += `<span class="text-slate-100 dark:text-slate-100">${escapeHtml(word)}</span>`;
        }

        i += word.length;
        continue;
      }

      // 5. Operators & punctuation
      const opMatch = line.slice(i).match(/^([+\-*/%=<>!&|^~:]+)/);
      if (opMatch) {
        result += `<span class="text-rose-400/90 dark:text-rose-300/90 font-mono">${escapeHtml(opMatch[1])}</span>`;
        i += opMatch[1].length;
        continue;
      }

      // 6. Other characters (whitespace, parentheses, brackets, etc.)
      result += escapeHtml(line[i]);
      i++;
    }

    return result;
  });

  return highlightedLines.join('\n');
}
