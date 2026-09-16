// Pyodide Web Worker for isolated Python execution in browser

/* eslint-disable no-restricted-globals */
let pyodide = null;
let pyodideInitPromise = null;

async function initPyodide() {
  if (pyodide) return pyodide;
  if (pyodideInitPromise) return pyodideInitPromise;

  pyodideInitPromise = (async () => {
    let cdnBase = 'https://cdn.jsdelivr.net/pyodide/v0.27.2/full/';
    // Load pyodide.js with fallback support
    try {
      self.importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.2/full/pyodide.js');
    } catch (e1) {
      try {
        cdnBase = 'https://unpkg.com/pyodide@0.27.2/';
        self.importScripts('https://unpkg.com/pyodide@0.27.2/pyodide.js');
      } catch (e2) {
        cdnBase = 'https://cdnjs.cloudflare.com/ajax/libs/pyodide/0.27.2/';
        self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/pyodide/0.27.2/pyodide.js');
      }
    }

    // @ts-ignore
    pyodide = await self.loadPyodide({
      indexURL: cdnBase,
      stdout: (text) => {
        self.postMessage({ type: 'stdout', text: text + '\n' });
      },
      stderr: (text) => {
        self.postMessage({ type: 'stderr', text: text + '\n' });
      },
    });

    self.postMessage({ type: 'status', message: 'Python đã sẵn sàng!' });
    self.postMessage({ type: 'ready' });
    return pyodide;
  })().catch((err) => {
    pyodideInitPromise = null;
    pyodide = null;
    self.postMessage({
      type: 'error',
      error: 'Không thể khởi tạo Pyodide: ' + (err.message || String(err)),
    });
    throw err;
  });

  return pyodideInitPromise;
}

self.onmessage = async (e) => {
  const { type, code, inputs } = e.data;

  if (type === 'init') {
    await initPyodide();
    return;
  }

  if (type === 'run') {
    try {
      const instance = await initPyodide();
      if (!instance) {
        throw new Error('Môi trường Python chưa khởi tạo thành công.');
      }

      self.postMessage({ type: 'running' });

      // Provide simulated input support if inputs array is given
      if (inputs && inputs.length > 0) {
        const inputListJson = JSON.stringify(inputs);
        await instance.runPythonAsync(`
import builtins
import json

_mock_inputs = json.loads('''${inputListJson}''')
_input_idx = 0

def _custom_input(prompt=""):
    global _input_idx
    if prompt:
        print(prompt, end="")
    if _input_idx < len(_mock_inputs):
        val = _mock_inputs[_input_idx]
        _input_idx += 1
        print(val)
        return str(val)
    return ""

builtins.input = _custom_input
`);
      } else {
        // Default safe input mocking to prevent infinite hang
        await instance.runPythonAsync(`
import builtins

def _default_input(prompt=""):
    if prompt:
        print(prompt, end="")
    return ""

builtins.input = _default_input
`);
      }

      await instance.runPythonAsync(code);
      self.postMessage({ type: 'done', success: true });
    } catch (err) {
      self.postMessage({
        type: 'error',
        error: err.message || String(err),
      });
    }
  }
};
