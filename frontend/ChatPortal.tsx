import { memo, useEffect, useRef, useState, type FormEvent } from 'react';
import { BookOpen, Plus, Trash2, ArrowUp, ArrowUpRight, Square, PanelLeft, X, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api, { streamURL } from './api';
import Button from './components/ui/Button';
import KnowledgeField from './components/ui/KnowledgeField';
interface Message { id: string; role: 'user' | 'assistant'; content: string; streaming?: boolean; }
interface Session { _id: string; title: string; updatedAt: string; }
const prompts = ['Explain recursion with a simple example', 'What is the difference between TCP and UDP?', 'How does binary search work?', 'Explain OOP concepts with examples', 'What is Big O notation?', 'Help me understand database normalization'];
const MAX = 4000;
function CopyButton({ text, label = 'Copy response' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => { if (!copied) return; const timer = setTimeout(() => setCopied(false), 2000); return () => clearTimeout(timer); }, [copied]);
  async function copy() { try { await navigator.clipboard.writeText(text); setCopied(true); setFailed(false); } catch { setFailed(true); } }
  return <><button className="icon-button" title={copied ? 'Copied' : label} aria-label={copied ? 'Copied' : label} onClick={copy}>{copied ? <Check size={16} /> : <Copy size={16} />}</button>{failed && <span role="status" className="field-error">Copy unavailable. Select the text to copy it.</span>}</>;
}
const markdownComponents = {
  h1: ({ children }: any) => <h2>{children}</h2>,
  pre: ({ children }: any) => <>{children}</>,
  code: ({ className, children, node, ...props }: any) => {
    const language = /language-([\w-]+)/.exec(className || '')?.[1];
    const content = String(children).replace(/\n$/, '');
    return language || String(children).includes('\n') ? <div className="code-block"><div className="code-toolbar"><span>{language || 'Code'}</span><CopyButton text={content} label="Copy code" /></div><SyntaxHighlighter style={oneDark} language={language || 'text'} customStyle={{ margin: 0, fontSize: 12, background: '#070a0b', padding: 18 }}>{content}</SyntaxHighlighter></div> : <code {...props}>{children}</code>;
  },
};
const MessageView = memo(function MessageView({ message }: { message: Message }) {
  return <article className={'message ' + (message.role === 'user' ? 'message-user' : 'message-assistant')} aria-label={message.role === 'user' ? 'Your message' : 'CampusGPT response'}>
    {message.role === 'user' ? <div className="message-content"><p>{message.content}</p></div> : <><span className="sr-only">CampusGPT</span><div className="message-content markdown-body">{message.content ? <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{message.content}</ReactMarkdown> : message.streaming ? <div className="typing-dots" role="status" aria-label="Thinking"><i /><i /><i /></div> : null}</div>{!message.streaming && message.content && <div className="message-actions"><CopyButton text={message.content} /></div>}</>}
  </article>;
});
export default function ChatPortal() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState('');
  const [loadingSession, setLoadingSession] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const sidebar = useRef<HTMLElement>(null);
  const historyTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => { let live = true; api.get('/api/user/chats').then(r => { if (live) setSessions(r.data.sessions || []); }).catch(() => { if (live) setError('Chat history is unavailable. You can still start a conversation.'); }); return () => { live = false; }; }, [sessionId]);
  useEffect(() => () => abort.current?.abort(), []);
  useEffect(() => { if (follow.current && scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight; }, [messages]);
  useEffect(() => { if (textarea.current) { textarea.current.style.height = 'auto'; textarea.current.style.height = Math.min(textarea.current.scrollHeight, 160) + 'px'; } }, [input]);
  useEffect(() => {
    if (!sidebarOpen) return;
    const panel = sidebar.current;
    panel?.querySelector<HTMLButtonElement>('button')?.focus();
    function trapFocus(event: KeyboardEvent) {
      if (event.key === 'Escape') { setSidebarOpen(false); return; }
      if (event.key !== 'Tab' || !window.matchMedia('(max-width: 767px)').matches) return;
      const controls = panel?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', trapFocus);
    return () => { document.removeEventListener('keydown', trapFocus); historyTrigger.current?.focus(); };
  }, [sidebarOpen]);
  async function send(text = input) {
    const message = text.trim();
    if (!message || abort.current || loadingSession || message.length > MAX) return;
    const history = messages.filter(m => m.content.trim()).map(m => ({ role: m.role, content: m.content }));
    const id = crypto.randomUUID();
    const controller = new AbortController();
    abort.current = controller; follow.current = true;
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: message }, { id, role: 'assistant', content: '', streaming: true }]);
    setInput(''); setSending(true); setError('');
    const update = (fn: (m: Message) => Message) => setMessages(prev => prev.map(m => m.id === id ? fn(m) : m));
    try {
      const response = await fetch(streamURL('/api/chat/stream'), { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, history, ...(sessionId ? { sessionId } : {}) }), signal: controller.signal });
      if (!response.ok || !response.body) throw new Error('The response could not be loaded. Please try again.');
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = '';
      const receive = (line: string) => {
        if (!line.trim().startsWith('data:')) return;
        let data: any; try { data = JSON.parse(line.trim().slice(5).trim()); } catch { return; }
        if (data.type === 'token' && data.token) update(m => ({ ...m, content: m.content + data.token }));
        if (data.type === 'done') { if (data.sessionId) setSessionId(data.sessionId); update(m => ({ ...m, streaming: false })); }
        if (data.type === 'error') throw new Error(data.message || 'The response was interrupted.');
      };
      while (true) { const { done, value } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true }); const lines = buffer.split('\n'); buffer = lines.pop() || ''; lines.forEach(receive); }
      buffer += decoder.decode(); if (buffer.trim()) receive(buffer);
    } catch (err: any) {
      if (err.name !== 'AbortError') { const text = err.message || 'Connection failed. Please try again.'; setError(text); update(m => ({ ...m, content: m.content || text })); }
    } finally { update(m => ({ ...m, streaming: false })); if (abort.current === controller) { abort.current = null; setSending(false); } }
  }
  function newChat() { abort.current?.abort(); setMessages([]); setSessionId(null); setInput(''); setError(''); setSidebarOpen(false); textarea.current?.focus(); }
  async function loadSession(id: string) {
    if (sending || loadingSession) return;
    setLoadingSession(true); setError('');
    try { const { data } = await api.get('/api/user/chats/' + id); setMessages(data.session.messages.map((m: any) => ({ id: crypto.randomUUID(), role: m.role, content: m.content }))); setSessionId(id); setSidebarOpen(false); follow.current = true; }
    catch { setError('This conversation could not be opened. Please try again.'); }
    finally { setLoadingSession(false); }
  }
  async function deleteSession(id: string) {
    if (sending) return;
    try { await api.delete('/api/user/chats/' + id); setSessions(prev => prev.filter(s => s._id !== id)); if (sessionId === id) newChat(); }
    catch { setError('This conversation could not be deleted. Please try again.'); }
  }
  return <div className="chat-layout">
    {sidebarOpen && <button className="chat-overlay" aria-label="Close chat history" onClick={() => setSidebarOpen(false)} />}
    <aside id="chat-history" ref={sidebar} className={'chat-sidebar ' + (sidebarOpen ? 'open' : '')} aria-label="Chat history" onKeyDown={e => { if (e.key === 'Escape') setSidebarOpen(false); }}>
      <button className="icon-button chat-history-close" aria-label="Close chat history" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
      <Button variant="secondary" onClick={newChat} disabled={loadingSession}>New conversation <Plus size={17} /></Button>
      <h2>Your conversations</h2><div className="session-list">{sessions.length ? sessions.map(s => <div className={'session-row ' + (sessionId === s._id ? 'active' : '')} key={s._id}><button onClick={() => loadSession(s._id)} disabled={sending || loadingSession} title={s.title} aria-current={sessionId === s._id ? 'true' : undefined}>{s.title}</button><button className="icon-button" title={'Delete ' + s.title} aria-label={'Delete ' + s.title} onClick={() => deleteSession(s._id)} disabled={sending}><Trash2 size={14} /></button></div>) : <p className="sidebar-note">Your conversations will find a home here.</p>}</div><p className="sidebar-footer">CampusGPT study space<br />AI study assistant · Groq</p>
    </aside>
    <div className="chat-main"><KnowledgeField className="chat-field" density="low" tint="brass" /><header className="chat-topbar"><div><button ref={historyTrigger} aria-controls="chat-history" className="icon-button chat-history-trigger" aria-label={sidebarOpen ? 'Close chat history' : 'Open chat history'} aria-expanded={sidebarOpen} onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? <X /> : <PanelLeft />}</button><h1>Study chat</h1></div><p>{sending ? 'Thinking with you...' : loadingSession ? 'Opening conversation...' : 'A little room to think.'}</p></header>
      <div ref={scroll} className="chat-scroll" onScroll={e => { const el = e.currentTarget; follow.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100; }}><div className="chat-width">
        {!messages.length && <div className="chat-welcome"><h2>What's on<br /><em>your mind?</em></h2><p>A difficult concept. A small question. A new way of looking at it.</p><div className="prompt-list">{prompts.map(p => <button key={p} onClick={() => send(p)} disabled={sending || loadingSession}>{p}<ArrowUpRight size={16} /></button>)}</div></div>}
        {messages.map(message => <MessageView key={message.id} message={message} />)}
        {error && <p className="alert" role="alert">{error}</p>}
      </div></div>
      <form className="chat-composer" onSubmit={(e: FormEvent) => { e.preventDefault(); send(); }}><div className="chat-width"><div className="composer-box"><label htmlFor="chat-input" className="sr-only">Your message</label><textarea ref={textarea} id="chat-input" rows={1} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} placeholder="Let's think it through..." maxLength={MAX} disabled={sending || loadingSession} />{sending ? <button type="button" className="icon-button" aria-label="Stop response" title="Stop response" onClick={() => abort.current?.abort()}><Square size={16} /></button> : <button type="submit" className="icon-button" aria-label="Send message" title="Send message" disabled={!input.trim() || loadingSession}><ArrowUp size={19} /></button>}</div><div className="composer-note"><span>AI can make mistakes. Check important details.</span>{input.length > MAX * .85 && <span>{input.length}/{MAX}</span>}</div></div></form>
    </div>
  </div>;
}
