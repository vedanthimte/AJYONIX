import React, { useState, useRef, useEffect } from 'react';
import { AIService } from '../services/aiAndReport.service';
import { useAuth } from '../context/AuthContext';
import { Bot, Send, User, Sparkles, HelpCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: string[];
  timestamp: Date;
}

export const AIAssistant: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I am Ayojanix AI, your campus event management copilot. I have live awareness of all college venues, active registrations, budget ledgers, and participant feedback.\n\nHow can I assist you with your events today?`,
      timestamp: new Date(),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const sampleQuestions = [
    'What events are happening this month?',
    'How many participants are registered?',
    'What is the total event expense?',
    'Summarize participant feedback and sentiments',
    'What should I prepare for a 500-person hackathon?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await AIService.askAssistant(textToSend);
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: res.answer,
        sources: res.sources,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: "I'm currently unable to retrieve that metric. Please try asking about active events or registrations.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', backgroundColor: '#eef2ff', borderRadius: 20, color: '#4f46e5', fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
          <Sparkles size={14} />
          <span>ROLE-AWARE COPILOT ({user?.role})</span>
        </div>
        <h1 className="page-title">Ayojanix Campus AI Copilot</h1>
        <p className="page-subtitle">
          Query live campus event data, budget health, volunteer duty statuses, and attendance metrics
        </p>
      </div>

      {/* Suggested Prompt Pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: 12, borderRadius: 20 }}
            disabled={loading}
          >
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '62vh',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {/* Messages Stream */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Bot size={18} />
                  </div>
                )}

                <div
                  style={{
                    backgroundColor: isUser ? '#4f46e5' : '#f1f5f9',
                    color: isUser ? '#ffffff' : '#0f172a',
                    padding: '14px 18px',
                    borderRadius: 18,
                    borderBottomRightRadius: isUser ? 4 : 18,
                    borderBottomLeftRadius: isUser ? 18 : 4,
                    fontSize: 13.5,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-line',
                    boxShadow: isUser ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'none',
                  }}
                >
                  {msg.text}

                  {msg.sources && (
                    <div
                      style={{
                        marginTop: 10,
                        paddingTop: 8,
                        borderTop: '1px solid rgba(0,0,0,0.06)',
                        fontSize: 11,
                        color: '#64748b',
                      }}
                    >
                      Sources: {msg.sources.join(', ')}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: '#e0e7ff',
                      color: '#4338ca',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    {user?.name ? user.name.charAt(0) : 'U'}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', gap: 12, alignSelf: 'flex-start' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#e0e7ff',
                  color: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={18} />
              </div>
              <div
                style={{
                  backgroundColor: '#f1f5f9',
                  padding: '12px 18px',
                  borderRadius: 18,
                  fontSize: 13,
                  color: '#64748b',
                }}
              >
                Ayojanix is thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: 16,
            borderTop: '1px solid var(--border-light)',
            backgroundColor: '#ffffff',
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputQuery);
            }}
            style={{ display: 'flex', gap: 10 }}
          >
            <input
              type="text"
              className="form-input"
              placeholder="Ask Ayojanix AI a question about campus events, registrations, or budgets..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Send size={16} />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
