'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, X, User, RefreshCw } from 'lucide-react';
import type { AIMessage, AIContext } from '@/types';
import { MarkdownContent } from '@/components/blocks/markdown-content';

const INITIAL_MESSAGES: AIMessage[] = [
  {
    id: 'welcome',
    role: 'model',
    content: `Xin chào! Tôi là **Giáo viên AI** của bạn. 🐍\n\nTôi ở đây để giúp bạn hiểu sâu bản chất lập trình Python, gợi ý cách giải bài tập mà không làm mất đi niềm vui tự mình giải được code!\n\nBạn đang gặp khó khăn gì ở bài học này?`,
    timestamp: '2026-01-01T00:00:00.000Z',
  },
];

export function AITutorPanel({
  context,
  isOpen,
  onClose,
}: {
  context?: AIContext;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<AIMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          context,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-reply`,
            role: 'model',
            content: data.reply,
            timestamp: new Date().toISOString(),
          },
        ]);
      } else if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-err`,
            role: 'model',
            content: `⚠️ ${data.error}`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (e) {
      console.error('Chat error:', e);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          role: 'model',
          content: 'Không thể kết nối với dịch vụ AI. Vui lòng thử lại sau giây lát.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [context, input, loading, messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold leading-tight">Giáo viên AI (Gemini)</h3>
            <p className="text-[11px] text-sky-100 opacity-90">
              {context?.lessonTitle ? `Đang học: ${context.lessonTitle}` : 'Trợ lý học Python'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Đóng bảng gia sư AI"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2.5 text-xs ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role === 'model' && (
              <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                m.role === 'user'
                  ? 'bg-sky-600 text-white rounded-br-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-xs shadow-xs'
              }`}
            >
              <MarkdownContent content={m.content} className="text-xs" />
            </div>
            {m.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-500" />
            <span>Giáo viên đang suy nghĩ...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi về đề bài, gợi ý cách làm, lỗi code..."
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-sky-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white transition-all shrink-0"
            aria-label="Gửi câu hỏi"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
