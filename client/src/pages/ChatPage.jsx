import { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';
import {
  Send,
  Plus,
  MessageSquare,
  Bot,
  User,
  ChevronDown,
  Trash2,
  FileText,
} from 'lucide-react';
import './ChatPage.css';

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  // load conversations and documents on mount
  useEffect(() => {
    api.get('/chat/').then((r) => setConversations(r.data)).catch(() => {});
    api.get('/documents/').then((r) => {
      const ready = r.data.filter((d) => d.status === 'ready');
      setDocuments(ready);
    }).catch(() => {});
  }, []);

  // load messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    api.get(`/chat/${activeConvId}/messages`)
      .then((r) => setMessages(r.data))
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setLoadingMessages(false));
  }, [activeConvId]);

  // scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function createConversation() {
    try {
      const res = await api.post('/chat/', {
        document_id: selectedDocId || null,
        title: 'New Chat',
      });
      setConversations((prev) => [res.data, ...prev]);
      setActiveConvId(res.data.id);
    } catch {
      toast.error('Failed to create conversation');
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    // auto-create a conversation if none is active
    let convId = activeConvId;
    if (!convId) {
      try {
        const res = await api.post('/chat/', {
          document_id: selectedDocId || null,
          title: input.slice(0, 100),
        });
        convId = res.data.id;
        setConversations((prev) => [res.data, ...prev]);
        setActiveConvId(convId);
      } catch {
        toast.error('Failed to create conversation');
        return;
      }
    }

    const userMessage = input;
    setInput('');
    setSending(true);

    // optimistically add user message
    setMessages((prev) => [
      ...prev,
      { id: 'temp', role: 'user', content: userMessage, created_at: new Date().toISOString() },
    ]);

    try {
      const res = await api.post(`/chat/${convId}/message`, { message: userMessage });
      // replace temp message and add assistant response
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== 'temp');
        return [
          ...withoutTemp,
          { id: `user-${Date.now()}`, role: 'user', content: userMessage, created_at: new Date().toISOString() },
          { id: `asst-${Date.now()}`, role: 'assistant', content: res.data.answer, created_at: new Date().toISOString() },
        ];
      });

      // refresh the conversation list to update titles
      api.get('/chat/').then((r) => setConversations(r.data)).catch(() => {});
    } catch {
      toast.error('Failed to get a response');
      setMessages((prev) => prev.filter((m) => m.id !== 'temp'));
    } finally {
      setSending(false);
    }
  }

  async function deleteConversation(id) {
    try {
      await api.delete(`/chat/${id}`);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvId === id) {
        setActiveConvId(null);
        setMessages([]);
      }
    } catch {
      toast.error('Failed to delete conversation');
    }
  }

  return (
    <div className="chat-page">
      {/* conversation list (left panel) */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h3>Conversations</h3>
          <button className="btn btn-primary btn-icon" onClick={createConversation} title="New chat">
            <Plus size={16} />
          </button>
        </div>

        {/* document selector */}
        <div className="chat-doc-select">
          <FileText size={14} />
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
          >
            <option value="">All documents</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id}>{d.filename}</option>
            ))}
          </select>
        </div>

        <div className="chat-conv-list">
          {conversations.length === 0 ? (
            <div className="chat-conv-empty">
              <MessageSquare size={20} />
              <span>No conversations yet</span>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`chat-conv-item ${activeConvId === conv.id ? 'active' : ''}`}
                onClick={() => setActiveConvId(conv.id)}
              >
                <div className="chat-conv-info">
                  <span className="chat-conv-title">{conv.title}</span>
                  <span className="chat-conv-date">
                    {new Date(conv.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button
                  className="btn btn-ghost btn-icon chat-conv-delete"
                  onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* chat area (right panel) */}
      <div className="chat-main">
        <div className="chat-messages">
          {loadingMessages ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div className="spinner" />
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-welcome">
              <Bot size={48} />
              <h2>Ask me anything</h2>
              <p>Upload a document and start chatting about it. I'll find the relevant parts and help you understand them.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`chat-msg chat-msg-${msg.role} fade-in`}>
                <div className="chat-msg-avatar">
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className="chat-msg-content">
                  <div className="chat-msg-role">{msg.role === 'user' ? 'You' : 'StudyMate'}</div>
                  <div className="chat-msg-text">{msg.content}</div>
                </div>
              </div>
            ))
          )}

          {sending && (
            <div className="chat-msg chat-msg-assistant fade-in">
              <div className="chat-msg-avatar"><Bot size={16} /></div>
              <div className="chat-msg-content">
                <div className="chat-msg-role">StudyMate</div>
                <div className="chat-typing">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* message input */}
        <form className="chat-input-bar" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Ask about your notes..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            autoFocus
          />
          <button
            type="submit"
            className="btn btn-primary btn-icon"
            disabled={!input.trim() || sending}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
