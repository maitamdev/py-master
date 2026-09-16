'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Bot, Send, RefreshCw, User, ArrowLeft } from 'lucide-react';
import type { AIMessage } from '@/types';
import { MarkdownContent } from '@/components/blocks/markdown-content';

const SUGGESTED_QUESTIONS = [
  'Vòng lặp while khác vòng lặp for ở những điểm cơ bản nào?',
  'Làm sao để hiểu bản chất của tham chiếu (reference) trong Python?',
  'Khi nào tôi nên dùng Tuple thay vì List?',
  'Giải thích đệ quy (recursion) bằng một ví dụ trực quan đời thường.',
  'Class và Object trong lập trình hướng đối tượng là gì?',
];

const INITIAL_MESSAGES: AIMessage[] = [
  {
    id: 'welcome',
    role: 'model',
    content: `Xin chào bạn! Tôi là **Giáo viên AI** của nền tảng **PYTHON-MASTER** 🐍\n\nTôi đồng hành cùng bạn xuyên suốt lộ trình học Python toàn diện. Mục tiêu của tôi là giải thích trực quan, gợi mở tư duy và hướng dẫn bạn tự mình code thành công.\n\nBạn muốn tìm hiểu hoặc cần giải đáp về chủ đề nào hôm nay?`,
    timestamp: '2026-01-01T00:00:00.000Z',
  },
];

export default function AITutorPage() {
  const [messages, setMessages] = useState<AIMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
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
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `model-${Date.now()}`,
            role: 'model',
            content: data.reply,
            timestamp: new Date().toISOString(),
          },
        ]);
      } else if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'model',
            content: `⚠️ ${data.error}`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          content: 'Không thể kết nối đến máy chủ AI. Vui lòng kiểm tra lại kết nối mạng.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-[#090d16]">
      {/* Header Bar */}
      <div className="h-14 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/course"
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Khóa học</span>
          </Link>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white">
              Giáo viên AI Cá nhân hóa (Gemini)
            </h1>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          Hỗ trợ phương pháp Socratic Hint-First
        </span>
      </div>

      {/* Main Chat Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-4xl w-full mx-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 text-sm ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role === 'model' && (
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-5 h-5" />
              </div>
            )}
            <div
              className={`max-w-[85%] sm:max-w-[78%] p-4 rounded-2xl leading-relaxed ${
                m.role === 'user'
                  ? 'bg-sky-600 text-white rounded-br-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-bl-xs shadow-xs'
              }`}
            >
              <MarkdownContent content={m.content} />
            </div>
            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2.5 text-xs text-slate-400 p-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Giáo viên đang suy nghĩ và chuẩn bị câu trả lời...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Suggested Questions + Input Bar */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Suggested Pills */}
          {messages.length <= 2 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 shrink-0">Gợi ý câu hỏi:</span>
              {SUGGESTED_QUESTIONS.slice(0, 3).map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="shrink-0 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Form */}
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
              placeholder="Nhập câu hỏi hoặc yêu cầu giải thích về Python..."
              className="flex-1 px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-sky-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-semibold text-sm transition-all shrink-0 flex items-center gap-2"
            >
              <span>Gửi</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
