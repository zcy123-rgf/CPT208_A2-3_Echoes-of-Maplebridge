import { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { askZhangJi } from '../lib/doubaoGuide';

interface GuideChatSheetProps {
  buttonClassName?: string;
  buttonWrapperClassName?: string;
  intro: string;
  prompts: string[];
  title: string;
  subtitle: string;
}

export function GuideChatSheet({
  buttonClassName = '',
  buttonWrapperClassName = '',
  intro,
  prompts,
  title,
  subtitle,
}: GuideChatSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ id: string; role: 'assistant' | 'user'; text: string }>>([
    {
      id: 'welcome',
      role: 'assistant',
      text: intro,
    },
  ]);

  const sendQuestion = async (prefilled?: string) => {
    const question = (prefilled ?? input).trim();
    if (!question || isLoading) {
      return;
    }

    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: 'user', text: question }]);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const response = await askZhangJi(question);
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: 'assistant', text: response.answer }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'The guide is unavailable right now.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={buttonWrapperClassName}>
        <button
          onClick={() => setIsOpen(true)}
          className={`flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-200/30 bg-gradient-to-br from-stone-800 to-stone-700 shadow-2xl transition-all hover:scale-105 hover:shadow-xl active:scale-95 ${buttonClassName}`}
          aria-label="Open AI guide"
        >
          <MessageCircle className="h-6 w-6 text-amber-100" />
        </button>
        <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-amber-500 animate-pulse" />
      </div>

      {isOpen && (
        <div className="absolute inset-0 z-40 bg-black/45 backdrop-blur-sm px-4 py-8">
          <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-2xl">
            <div className="border-b border-stone-200 bg-gradient-to-r from-stone-900 to-stone-700 px-5 pb-4 pt-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-amber-100/90">{subtitle}</p>
                  <h3 className="mt-1 text-xl font-light">{title}</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            <div className="border-b border-stone-200 bg-stone-50 px-5 py-4">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {prompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => void sendQuestion(prompt)}
                    className="shrink-0 rounded-full border border-amber-200 bg-white px-3 py-2 text-xs font-light text-stone-700 hover:border-amber-400 hover:text-amber-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.10),transparent_28%),linear-gradient(180deg,#fafaf9_0%,#ffffff_100%)] px-5 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[86%] rounded-[1.4rem] px-4 py-3 text-sm font-light leading-6 shadow-sm ${
                    message.role === 'assistant'
                      ? 'border border-stone-200 bg-white text-stone-700'
                      : 'ml-auto bg-stone-900 text-white'
                  }`}
                >
                  {message.text}
                </div>
              ))}

              {isLoading && (
                <div className="max-w-[80%] rounded-[1.4rem] border border-stone-200 bg-white px-4 py-3 text-sm font-light text-stone-500">
                  The guide is thinking...
                </div>
              )}
            </div>

            <div className="border-t border-stone-200 bg-white px-5 py-4">
              {error && (
                <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div className="flex items-end gap-3">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  className="min-h-[52px] flex-1 resize-none rounded-[1.4rem] border border-stone-300 px-4 py-3 text-sm outline-none focus:border-amber-500"
                  placeholder="Ask about this story point..."
                />
                <button
                  onClick={() => void sendQuestion()}
                  disabled={!input.trim() || isLoading}
                  className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-stone-900 text-white disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
