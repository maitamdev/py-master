'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export type ExecutionState = 'idle' | 'loading' | 'running' | 'done' | 'error';

export function usePyodide() {
  const [status, setStatus] = useState<string>('Chưa khởi tạo');
  const [state, setState] = useState<ExecutionState>('idle');
  const [output, setOutput] = useState<string[]>([]);
  const [isReady, setIsReady] = useState<boolean>(false);
  const workerRef = useRef<Worker | null>(null);

  const initWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;

    setState('loading');
    setStatus('Đang khởi tạo môi trường Python...');

    const worker = new Worker('/pyodide-worker.js');
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { type, message, text, error } = e.data;

      switch (type) {
        case 'status':
          setStatus(message);
          break;
        case 'ready':
          setIsReady(true);
          setState('idle');
          setStatus('Python đã sẵn sàng');
          break;
        case 'running':
          setState('running');
          setStatus('Đang chạy mã...');
          break;
        case 'stdout':
          setOutput((prev) => [...prev, text]);
          break;
        case 'stderr':
          setOutput((prev) => [...prev, `[stderr] ${text}`]);
          break;
        case 'error':
          setState('error');
          setStatus('Có lỗi khi thực thi');
          setOutput((prev) => [...prev, `Lỗi:\n${error}\n`]);
          break;
        case 'done':
          setState('done');
          setStatus('Thực thi hoàn thành');
          break;
      }
    };

    worker.postMessage({ type: 'init' });
    return worker;
  }, []);

  const runCode = useCallback(
    (code: string, inputs: string[] = []) => {
      let worker = workerRef.current;
      if (!worker) {
        worker = initWorker();
      }

      setOutput([]);
      setState('running');
      setStatus('Đang chạy mã...');

      worker.postMessage({
        type: 'run',
        code,
        inputs,
      });
    },
    [initWorker]
  );

  const stopExecution = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      setIsReady(false);
      setState('idle');
      setStatus('Đã dừng thực thi');
      setOutput((prev) => [...prev, '\n[Đã dừng chương trình]\n']);
    }
  }, []);

  const resetOutput = useCallback(() => {
    setOutput([]);
    setState('idle');
    setStatus(isReady ? 'Sẵn sàng' : 'Chưa khởi tạo');
  }, [isReady]);

  // Auto-initialize worker on mount so Pyodide is warm and ready immediately
  useEffect(() => {
    initWorker();
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [initWorker]);

  return {
    state,
    status,
    output: output.join(''),
    isReady,
    runCode,
    stopExecution,
    resetOutput,
    initWorker,
  };
}
