import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Plus, MessageSquare, Trash2, Terminal, StopCircle,
  Send, Menu, Sparkles, Cpu, ArrowRight, Copy, Check,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import api, { streamURL } from './api';
import Button from './components/ui/Button';

interface Message {
  id:        string;
  role:      'user' | 'assistant';
  content:   string;
  streaming?: boolean;
}
interface Session { _id: string; title: string; updatedAt: string; }

const PROMPTS = [
  { label: 'Explain recursion with a simple example',         icon: '🔄' },
  { label: 'What is the difference between TCP and UDP?',     icon: '🌐' },
  { label: 'How does binary search work?',                    icon: '🔍' },
  { label: 'Explain OOP concepts with examples',              icon: '📦' },
  { label: 'What is Big O notation?',                         icon: '📊' },
  { label: 'Help me understand database normalization',       icon: '🗄️' },
];

const MAX_CHARS = 4000;

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function updateLastAssistant(msgs: Message[], updater: (m: Message) => Message): Message[] {
  const idx = msgs.length - 1;
  if (idx < 0 || msgs[idx].role !== 'assistant') return msgs;
  const next = [...msgs];
  next[idx] = updater({ ...msgs[idx] });
  return next;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1.5 px-1" aria-label="AI is thinking" role="status">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <button
      onClick={copy}
      aria-label={copied ? 'Copied!' : 'Copy response'}
      className="flex items-center gap-1 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-1 text-[11px] font-medium text-muted/60 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-cyan/50 cursor-pointer"
    >
      {copied
        ? <><Check className="h-3 w-3 text-green" aria-hidden="true" />Copied</>
        : <><Copy className="h-3 w-3" aria-hidden="true" />Copy</>
      }
    </button>
  );
}

export default function ChatPortal() {
  const { user }       = useAuth();
  const [messages,     setMessages]     = useState<Message[]>([]);
  const [input,        setInput]        = useState('');
  const [sending,      setSending]      = useState(false);
  const [sessionId,    setSessionId]    = useState<string | null>(null);
  const [sessions,     setSessions]     = useState<Session[]>([]);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef    = useRef<HTMLTextAreaElement>(null);
  const abortRef       = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!user) return;
    api.get('/api/user/chats')
      .then(r => setSessions(r.data.sessions ?? []))
      .catch(() => {});
  }, [user, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, [input]);

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || sending || msg.length > MAX_CHARS) return;

    const history = messages
      .filter(m => m.content.trim())
      .map(m => ({ role: m.role, content: m.content.trim() }));

    setMessages(prev => [
      ...prev,
      { id: makeId(), role: 'user',      content: msg },
      { id: makeId(), role: 'assistant', content: '', streaming: true },
    ]);
    setInput('');
    setSending(true);
    abortRef.current = new AbortController();

    try {
      const response = await fetch(streamURL('/api/chat/stream'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history,
          ...(sessionId ? { sessionId } : {}),
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) throw new Error(`Server error ${response.status}`);

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          let data: { type: string; token?: string; sessionId?: string; message?: string };
          try { data = JSON.parse(trimmed.slice(6)); } catch { continue; }

          if (data.type === 'token' && data.token) {
            setMessages(prev => updateLastAssistant(prev, m => ({ ...m, content: m.content + data.token })));
          } else if (data.type === 'done') {
            if (data.sessionId) setSessionId(data.sessionId);
            setMessages(prev => updateLastAssistant(prev, m => ({ ...m, streaming: false })));
          } else if (data.type === 'error') {
            throw new Error(data.message || 'Stream error');
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      const errMsg = err.message?.includes('Failed to fetch')
        ? 'Connection failed — check that the server is running.'
        : err.message || 'Something went wrong. Please try again.';
      setMessages(prev =>
        updateLastAssistant(prev, m => ({
          ...m,
          content: m.content.trim() ? m.content : `⚠️ ${errMsg}`,
          streaming: false,
        })),
      );
    } finally {
      setSending(false);
      abortRef.current = null;
    }
  }, [input, sending, messages, sessionId]);

  const stopStream = () => {
    abortRef.current?.abort();
    setSending(false);
    setMessages(prev => updateLastAssistant(prev, m => ({ ...m, streaming: false })));
  };

  const loadSession = async (id: string) => {
    try {
      const res = await api.get(`/api/user/chats/${id}`);
      setMessages(res.data.session.messages.map((m: any) => ({
        id:      makeId(),
        role:    m.role,
        content: m.content,
      })));
      setSessionId(id);
      setSidebarOpen(false);
    } catch {}
  };

  const deleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await api.delete(`/api/user/chats/${id}`);
      setSessions(prev => prev.filter(s => s._id !== id));
      if (sessionId === id) newChat();
    } catch {}
  };

  const newChat = () => {
    setMessages([]);
    setSessionId(null);
    setInput('');
  };

  const charCount = input.length;
  const nearLimit = charCount > MAX_CHARS * 0.85;
  const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

  return (
    <div className="flex h-[calc(100svh-4rem)] w-full overflow-hidden bg-bg">

      {/* Sidebar overlay (mobile) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ── SIDEBAR ── */}
      <aside
        role="complementary"
        aria-label="Chat history"
        className={cn(
          'fixed top-16 bottom-0 left-0 z-30 flex w-72 min-w-72 flex-col gap-4',
          'border-r border-white/[0.04] bg-bg-elevated/95 px-4 py-5 backdrop-blur-xl',
          'transition-transform duration-200 md:relative md:top-0 md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Button
          onClick={newChat}
          variant="secondary"
          size="md"
          className="w-full justify-start gap-2 border-white/[0.06] bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-white hover:bg-white/[0.06]"
        >
          <Plus className="h-4 w-4 text-cyan" aria-hidden="true" />
          New Thread
        </Button>

        {sessions.length > 0 ? (
          <>
            <p className="mt-2 px-2 text-[10px] font-bold uppercase tracking-widest text-muted/50">
              Recent Chats
            </p>
            <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
              {sessions.map(s => (
                <div
                  key={s._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => loadSession(s._id)}
                  onKeyDown={e => e.key === 'Enter' && loadSession(s._id)}
                  aria-label={`Load chat: ${s.title}`}
                  className={cn(
                    'group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all',
                    sessionId === s._id
                      ? 'border border-white/[0.06] bg-white/[0.06] text-white'
                      : 'border border-transparent text-muted hover:bg-white/[0.03] hover:text-foreground',
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MessageSquare className={cn('h-3.5 w-3.5 shrink-0', sessionId === s._id ? 'text-cyan' : 'text-muted/40')} aria-hidden="true" />
                    <span className="truncate">{s.title}</span>
                  </div>
                  <button
                    onClick={e => deleteSession(e, s._id)}
                    aria-label={`Delete chat: ${s.title}`}
                    className="cursor-pointer rounded-md p-1 opacity-0 transition-all group-hover:opacity-100 hover:bg-pink/10 hover:text-pink text-muted/40 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-cyan/50"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center px-4">
            <MessageSquare className="h-8 w-8 text-muted/20" aria-hidden="true" />
            <p className="text-xs text-muted/50 leading-relaxed">Your conversations will appear here</p>
          </div>
        )}

        <div className="mt-auto border-t border-white/[0.05] pt-4 flex items-center justify-between text-[11px] font-semibold text-muted/60">
          <div className="flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-violet" aria-hidden="true" />
            Llama 3.3 70B
          </div>
          <span className="rounded bg-white/[0.04] border border-white/[0.05] px-1.5 py-0.5 text-[9px] uppercase tracking-wider">
            Groq
          </span>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-bg relative">

        {/* Top bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.04] bg-bg/60 px-5 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              className="cursor-pointer rounded-xl border border-white/[0.05] p-2 text-foreground transition-all hover:bg-white/[0.04] md:hidden focus-visible:outline-2 focus-visible:outline-cyan/50"
              onClick={() => setSidebarOpen(v => !v)}
              aria-label="Toggle chat history"
              aria-expanded={sidebarOpen}
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-cyan hidden sm:block" aria-hidden="true" />
              <span className="font-display text-sm font-bold text-white">AI Chat</span>
              {sessionId && (
                <span className="hidden sm:inline-flex items-center rounded-full border border-white/[0.05] bg-white/[0.02] px-2 py-0.5 text-[10px] font-semibold text-muted/60">
                  Session active
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {sending && (
              <button
                onClick={stopStream}
                aria-label="Stop response generation"
                className="cursor-pointer flex items-center gap-1.5 rounded-xl border border-pink/20 bg-pink/[0.04] px-3 py-1.5 text-xs font-bold text-pink transition-all hover:bg-pink/[0.08] focus-visible:outline-2 focus-visible:outline-cyan/50"
              >
                <StopCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Stop
              </button>
            )}
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.01] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" aria-hidden="true" />
              Connected
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 md:px-6" id="chat-messages">
          <div className="mx-auto flex max-w-3xl flex-col gap-6">

            {/* Empty state / prompt suggestions */}
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-10 text-center sm:py-16"
                aria-label="Start a new conversation"
              >
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.05] bg-gradient-to-br from-cyan/10 to-violet/10">
                  <Sparkles className="h-6 w-6 text-cyan" aria-hidden="true" />
                </div>
                <h2 className="font-display text-2xl font-black tracking-tight text-white md:text-3xl">
                  How can I help you study?
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted leading-relaxed">
                  Ask about complex topics, get explanations, or explore any subject you're studying.
                </p>

                <div className="mt-8 grid grid-cols-1 gap-2.5 text-left lg:grid-cols-2">
                  {PROMPTS.map(p => (
                    <button
                      key={p.label}
                      onClick={() => sendMessage(p.label)}
                      className="group flex items-start gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.01] p-4 text-left text-sm font-medium text-muted transition-all hover:border-white/10 hover:bg-white/[0.025] hover:text-white focus-visible:outline-2 focus-visible:outline-cyan/50 cursor-pointer"
                    >
                      <span className="text-base mt-0.5 flex-shrink-0" aria-hidden="true">{p.icon}</span>
                      <span className="flex-1 leading-relaxed">{p.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-cyan" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Message list */}
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn('flex w-full gap-3.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {/* AI avatar */}
                {msg.role === 'assistant' && (
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/[0.05] bg-gradient-to-b from-neutral-900 to-neutral-950 text-[10px] font-black tracking-widest text-cyan"
                    aria-hidden="true"
                  >
                    AI
                  </div>
                )}

                <div
                  className={cn(
                    'min-w-0 text-sm leading-relaxed',
                    msg.role === 'assistant'
                      ? 'flex-1 rounded-xl border border-white/[0.05] bg-neutral-900/30 px-4 py-4 text-zinc-200 sm:px-5'
                      : 'max-w-[88%] rounded-xl border border-cyan/10 bg-gradient-to-br from-cyan/[0.05] to-transparent px-4 py-3.5 text-white sm:max-w-[85%] sm:px-5',
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <div>
                      <div className="markdown-body prose prose-invert max-w-none prose-sm">
                        {msg.content ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                  <div className="my-4 overflow-hidden rounded-xl border border-white/[0.06] text-[11px] shadow-2xl font-mono">
                                    <div className="flex items-center justify-between border-b border-white/[0.04] bg-[#060609] px-4 py-2 font-sans">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted/50">{match[1]}</span>
                                      <button
                                        onClick={() => navigator.clipboard.writeText(String(children))}
                                        aria-label="Copy code"
                                        className="flex items-center gap-1 text-[10px] text-muted/40 hover:text-muted transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan/50"
                                      >
                                        <Copy className="h-3 w-3" aria-hidden="true" />
                                        Copy
                                      </button>
                                    </div>
                                    <SyntaxHighlighter
                                      style={oneDark}
                                      language={match[1]}
                                      PreTag="div"
                                      customStyle={{ background: '#020204', padding: '1rem', margin: 0, fontSize: '0.8125rem' }}
                                      {...props}
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  </div>
                                ) : (
                                  <code className="rounded border border-white/[0.05] bg-white/[0.05] px-1.5 py-0.5 font-mono text-xs text-cyan" {...props}>
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        ) : msg.streaming ? (
                          <TypingIndicator />
                        ) : null}
                        {msg.streaming && msg.content && (
                          <span className="cursor-blink" aria-hidden="true" />
                        )}
                      </div>
                      {/* Copy button for completed messages */}
                      {!msg.streaming && msg.content && (
                        <div className="mt-3 flex justify-end border-t border-white/[0.04] pt-2.5">
                          <CopyButton text={msg.content} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                  )}
                </div>
              </motion.div>
            ))}

            <div ref={messagesEndRef} className="h-1" aria-hidden="true" />
          </div>
        </div>

        {/* Input bar */}
        <div className="border-t border-white/[0.04] bg-bg/90 px-4 py-4 backdrop-blur-xl md:px-6">
          <div className="mx-auto max-w-3xl">
            <div
              className="flex items-end gap-3 rounded-2xl border border-white/[0.06] bg-neutral-900/50 p-3 shadow-2xl transition-all duration-200 focus-within:border-white/[0.12] focus-within:shadow-[0_0_0_1px_rgba(56,217,245,0.07)]"
            >
              <label htmlFor="chat-input" className="sr-only">Message CampusGPT</label>
              <textarea
                id="chat-input"
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask anything about your coursework…"
                rows={1}
                disabled={sending}
                maxLength={MAX_CHARS}
                aria-describedby="chat-input-hint"
                className="max-h-[160px] min-h-[1.5rem] flex-1 resize-none border-none bg-transparent py-1 text-sm leading-relaxed text-white outline-none placeholder:text-muted/40 disabled:opacity-40"
              />
              <button
                onClick={() => sendMessage()}
                disabled={sending || !input.trim()}
                aria-label="Send message"
                className={cn(
                  'flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-all',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan/50',
                  input.trim() && !sending
                    ? 'bg-white text-black hover:scale-105 active:scale-95'
                    : 'bg-white/10 text-white/20 cursor-not-allowed',
                )}
              >
                <Send className="h-4 w-4 fill-current" aria-hidden="true" />
              </button>
            </div>

            <div id="chat-input-hint" className="mt-2 flex items-center justify-between px-1 text-[11px] text-muted/40">
              <span>Enter to send · Shift + Enter for new line</span>
              {nearLimit && (
                <span
                  aria-live="polite"
                  className={cn(
                    'font-mono font-bold rounded border px-1.5 py-0.5',
                    charCount >= MAX_CHARS ? 'text-pink border-pink/15 bg-pink/5' : 'text-amber border-amber/15 bg-amber/5',
                  )}
                >
                  {charCount}/{MAX_CHARS}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
