'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Volume2, X, Radio, Send, AlertCircle } from 'lucide-react';
import type { AIContext } from '@/types';

type LiveStatus = 'disconnected' | 'connecting' | 'listening' | 'speaking' | 'processing';

// Define SpeechRecognition interface for TypeScript
interface ISpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

export function LiveTutorPanel({
  context,
  isOpen,
  onClose,
}: {
  context?: AIContext;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<LiveStatus>('disconnected');
  const [transcript, setTranscript] = useState<{ role: 'ai' | 'user'; text: string }[]>([]);
  const [volume, setVolume] = useState<number>(30);
  const [textInput, setTextInput] = useState<string>('');
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const isListeningRef = useRef<boolean>(false);

  // Check speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const windowWithSpeech = window as unknown as {
        SpeechRecognition?: new () => ISpeechRecognition;
        webkitSpeechRecognition?: new () => ISpeechRecognition;
      };
      const SpeechRecognitionClass =
        windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

      if (!SpeechRecognitionClass) {
        setIsSpeechSupported(false);
      }
    }
  }, []);

  // Text-to-Speech function
  const speakText = useCallback((text: string, onFinish?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onFinish?.();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick a Vietnamese voice if present
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.includes('vi') || v.lang.includes('VN'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    utterance.onend = () => {
      onFinish?.();
    };

    utterance.onerror = () => {
      onFinish?.();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Send question to AI backend and speak answer
  const handleUserMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim()) return;

      setStatus('processing');
      setTranscript((prev) => [...prev, { role: 'user', text: userText }]);

      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: userText }],
            context: {
              ...context,
              systemInstructionAddon:
                'Bạn là gia sư giọng nói tiếng Việt thân thiện, trả lời ngắn gọn, cô đọng từ 2-4 câu để phù hợp phát âm thanh bằng giọng nói.',
            },
          }),
        });

        if (!res.ok) {
          throw new Error(`AI API error: ${res.status}`);
        }

        const data = await res.json();
        const aiResponse = data.message || 'Rất tiếc, tôi chưa nghe rõ. Bạn có thể nói lại được không?';

        setTranscript((prev) => [...prev, { role: 'ai', text: aiResponse }]);
        setStatus('speaking');

        speakText(aiResponse, () => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch {
              setStatus('listening');
            }
          } else {
            setStatus('listening');
          }
        });
      } catch (err: unknown) {
        console.error(err);
        const errMsg = 'Có lỗi kết nối tới máy chủ AI. Xin thử lại.';
        setTranscript((prev) => [...prev, { role: 'ai', text: errMsg }]);
        setStatus('speaking');
        speakText(errMsg, () => setStatus('listening'));
      }
    },
    [context, speakText]
  );

  // Start Voice Session
  const startSession = () => {
    setStatus('connecting');
    setErrorMessage('');
    isListeningRef.current = true;

    const welcome = `Chào bạn! Tôi là Trợ lý giọng nói AI. Tôi thấy bạn đang học bài "${context?.lessonTitle || 'Lập trình Python'}". Tôi đang lắng nghe bạn nói đây!`;
    setTranscript([{ role: 'ai', text: welcome }]);
    setStatus('speaking');

    speakText(welcome, () => {
      if (typeof window !== 'undefined') {
        const windowWithSpeech = window as unknown as {
          SpeechRecognition?: new () => ISpeechRecognition;
          webkitSpeechRecognition?: new () => ISpeechRecognition;
        };
        const SpeechRecognitionClass =
          windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

        if (SpeechRecognitionClass) {
          try {
            const recognition = new SpeechRecognitionClass();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'vi-VN';

            recognition.onstart = () => {
              setStatus('listening');
            };

            recognition.onresult = (event: ISpeechRecognitionEvent) => {
              const spokenText = event.results[0]?.[0]?.transcript;
              if (spokenText) {
                handleUserMessage(spokenText);
              }
            };

            recognition.onerror = (e) => {
              console.warn('Speech recognition error:', e.error);
              if (e.error === 'not-allowed') {
                setErrorMessage('Vui lòng cấp quyền sử dụng Micro trên trình duyệt để nói chuyện.');
              }
              setStatus('listening');
            };

            recognition.onend = () => {
              // If still listening and not speaking/processing, we can restart
              if (isListeningRef.current && status === 'listening') {
                try {
                  recognition.start();
                } catch {
                  // Ignore already started
                }
              }
            };

            recognitionRef.current = recognition;
            recognition.start();
          } catch (e) {
            console.error('Recognition error:', e);
            setStatus('listening');
          }
        } else {
          setStatus('listening');
        }
      }
    });
  };

  const stopSession = () => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setStatus('disconnected');
  };

  // Animate volume pulses when listening or speaking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'listening' || status === 'speaking') {
      interval = setInterval(() => {
        setVolume(Math.floor(Math.random() * 60) + 20);
      }, 200);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Clean up on unmount or close
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full ${status !== 'disconnected' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Trò chuyện bằng giọng nói với AI
            </span>
          </div>
          <button
            onClick={() => {
              stopSession();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Voice Visualizer */}
        <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative flex items-center justify-center my-2">
            {status !== 'disconnected' && (
              <div
                className="absolute rounded-full bg-sky-500/20 dark:bg-sky-400/20 transition-all duration-300"
                style={{
                  width: `${110 + volume * 1.2}px`,
                  height: `${110 + volume * 1.2}px`,
                }}
              />
            )}
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all ${
                status === 'speaking'
                  ? 'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white animate-pulse'
                  : status === 'listening'
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white'
                  : status === 'processing'
                  ? 'bg-gradient-to-tr from-purple-500 to-pink-600 text-white animate-spin'
                  : status === 'connecting'
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
              }`}
            >
              {status === 'speaking' ? (
                <Volume2 className="w-10 h-10" />
              ) : status === 'listening' ? (
                <Mic className="w-10 h-10 animate-bounce" />
              ) : (
                <Radio className="w-10 h-10" />
              )}
            </div>
          </div>

          {/* Status Text */}
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {status === 'disconnected'
                ? 'Sẵn sàng nói chuyện với Gia sư AI'
                : status === 'connecting'
                ? 'Đang khởi động micro...'
                : status === 'speaking'
                ? 'AI đang phát âm trả lời...'
                : status === 'processing'
                ? 'AI đang suy nghĩ câu trả lời...'
                : 'Đang lắng nghe bạn nói (hãy nói vào Micro)...'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {context?.lessonTitle
                ? `Bối cảnh: ${context.lessonTitle}`
                : 'Nói chuyện trực tiếp bằng tiếng Việt tự nhiên'}
            </p>
          </div>

          {/* Error notice if micro denied or unsupported */}
          {(errorMessage || !isSpeechSupported) && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {errorMessage ||
                  'Trình duyệt của bạn chưa hỗ trợ Web Speech API. Bạn có thể sử dụng ô nhập văn bản bên dưới.'}
              </span>
            </div>
          )}

          {/* Transcript History */}
          {transcript.length > 0 && (
            <div className="w-full max-h-40 overflow-y-auto p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-xs text-left space-y-2">
              {transcript.map((t, idx) => (
                <div key={idx} className="flex gap-2">
                  <span
                    className={`font-semibold shrink-0 ${
                      t.role === 'ai'
                        ? 'text-sky-600 dark:text-sky-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {t.role === 'ai' ? 'Gia sư AI:' : 'Bạn:'}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">{t.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Optional Text input for fallback */}
          {status !== 'disconnected' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (textInput.trim()) {
                  handleUserMessage(textInput);
                  setTextInput('');
                }
              }}
              className="w-full flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Hoặc gõ câu hỏi tại đây nếu micro ồn..."
                className="flex-1 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-sky-500"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition-colors"
                title="Gửi câu hỏi"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Controls */}
          <div className="flex items-center gap-3 pt-2">
            {status === 'disconnected' ? (
              <button
                onClick={startSession}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-600/30 transition-all hover:scale-105"
              >
                <Mic className="w-4 h-4" />
                <span>Bật Micro & Bắt đầu học</span>
              </button>
            ) : (
              <button
                onClick={stopSession}
                className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition-all"
              >
                Kết thúc buổi học giọng nói
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
