import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function ChatBox({ documentId }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: '👋 Hello! Upload a document and ask me anything about it!' }
  ]);

  useEffect(() => {
    if (documentId) {
      setMessages([
        { role: 'ai', text: '✅ Document uploaded! Ask me anything about it.' }
      ]);
    }
  }, [documentId]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!question.trim()) return;
    if (!documentId) {
      setMessages(prev => [...prev,
        { role: 'user', text: question },
        { role: 'ai', text: '⚠️ Please upload a document first!' }
      ]);
      setQuestion('');
      return;
    }

    const userMsg = { role: 'user', text: question };
    setMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await axios.post('https://doc-extractor-backend-qdzq.onrender.com/api/chat', {
        documentId,
        question
      });
      setMessages(prev => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: '❌ Error: ' + (err.response?.data?.error || err.message)
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="card" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      <h2>💬 Chat with Document</h2>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '10px',
        background: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '16px'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: '12px'
          }}>
            <div style={{
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.role === 'user' ? '#667eea' : 'white',
              color: msg.role === 'user' ? 'white' : '#333',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
            <div style={{
              padding: '10px 14px',
              borderRadius: '18px 18px 18px 4px',
              background: 'white',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              color: '#888'
            }}>
              ⏳ Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask anything about the document..."
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '0.95rem',
            outline: 'none'
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !question.trim()}
          style={{
            padding: '12px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1.2rem'
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default ChatBox;