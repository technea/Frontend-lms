import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import authService from '../services/authService';
import gsap from 'gsap';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: "Hello! I'm your AI Tutor. How can I help you today?" }] }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const chatRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            gsap.fromTo(chatRef.current, 
                { y: 50, opacity: 0, scale: 0.9 },
                { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
            );
        }
    }, [isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', parts: [{ text: input }] };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const chatHistory = messages.map(msg => ({
                role: msg.role === 'model' ? 'model' : 'user',
                parts: msg.parts
            }));

            const res = await api.post('/ai/chat', { message: input, chatHistory });
            const aiMessage = { role: 'model', parts: [{ text: res.data.response }] };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{ text: "Sorry, I'm having a bit of a headache. Please check if the API key is set or try again later!" }] 
            }]);
        } finally {
            setLoading(false);
        }
    };

    if (!authService.getCurrentUser()) return null;

    return (
        <div style={styles.container}>
            {/* Chat Window */}
            {isOpen && (
                <div ref={chatRef} style={styles.chatWindow}>
                    <div style={styles.header}>
                        <div style={styles.headerLeft}>
                            <div style={styles.botIcon}>🤖</div>
                            <div>
                                <h4 style={styles.headerTitle}>AI Assistant</h4>
                                <span style={styles.onlineStatus}>Online</span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>×</button>
                    </div>

                    <div style={styles.messagesArea}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                ...styles.messageBubble,
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                backgroundColor: msg.role === 'user' ? '#6366f1' : '#f1f5f9',
                                color: msg.role === 'user' ? '#fff' : '#0f172a',
                                borderRadius: msg.role === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0'
                            }}>
                                {msg.parts[0].text}
                            </div>
                        ))}
                        {loading && (
                            <div style={{...styles.messageBubble, alignSelf: 'flex-start', backgroundColor: '#f1f5f9'}}>
                                <div className="typing-dots">
                                    <span>.</span><span>.</span><span>.</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} style={styles.inputArea}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            style={styles.input}
                        />
                        <button type="submit" disabled={loading} style={styles.sendBtn}>
                            {loading ? '...' : '➤'}
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                style={{
                    ...styles.toggleBtn,
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)'
                }}
            >
                {isOpen ? '×' : '🤖'}
            </button>

            <style>{`
                .typing-dots span {
                    animation: blink 1.4s infinite both;
                    font-size: 1.5rem;
                    line-height: 0;
                }
                .typing-dots span:nth-child(2) { animation-delay: .2s; }
                .typing-dots span:nth-child(3) { animation-delay: .4s; }
                @keyframes blink {
                    0% { opacity: .2; }
                    20% { opacity: 1; }
                    100% { opacity: .2; }
                }
            `}</style>
        </div>
    );
};

const styles = {
    container: {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '15px'
    },
    toggleBtn: {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        fontSize: '1.8rem',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    chatWindow: {
        width: '380px',
        height: '500px',
        backgroundColor: '#fff',
        borderRadius: '24px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
    },
    header: {
        padding: '20px',
        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
    botIcon: { fontSize: '1.5rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '5px', borderRadius: '10px' },
    headerTitle: { margin: 0, fontSize: '1.1rem', fontWeight: '700' },
    onlineStatus: { fontSize: '0.75rem', opacity: 0.9 },
    closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '1.8rem', cursor: 'pointer' },
    messagesArea: {
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: '#f8fafc'
    },
    messageBubble: {
        maxWidth: '80%',
        padding: '12px 16px',
        fontSize: '0.95rem',
        lineHeight: '1.4',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
    },
    inputArea: {
        padding: '15px',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        gap: '10px',
        backgroundColor: '#fff'
    },
    input: {
        flex: 1,
        padding: '12px 16px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        outline: 'none',
        fontSize: '0.95rem'
    },
    sendBtn: {
        width: '45px',
        height: '45px',
        borderRadius: '12px',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
};

export default AIChatbot;
