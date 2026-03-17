import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import gsap from 'gsap';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: "Greetings! I'm your NexLearn Intelligence Guide. How can I assist your learning journey today?" }] }
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
                parts: [{ text: "I'm currently recalibrating my neural circuits. Please stand by or check your connection!" }] 
            }]);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={styles.container}>
            {/* Chat Window */}
            {isOpen && (
                <div ref={chatRef} style={styles.chatWindow} className="ai-chat-window">
                    <div style={styles.header}>
                        <div style={styles.headerLeft}>
                            <div style={styles.botIcon}>🪄</div>
                            <div>
                                <h4 style={styles.headerTitle}>NexLearn Guide</h4>
                                <span style={styles.onlineStatus}>Neural Link Active</span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>×</button>
                    </div>

                    <div style={styles.messagesArea}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                ...styles.messageBubble,
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                backgroundColor: msg.role === 'user' ? '#2D5BE3' : '#fff',
                                color: msg.role === 'user' ? '#fff' : '#1A1916',
                                borderRadius: msg.role === 'user' ? '18px 18px 0 18px' : '0 18px 18px 18px',
                                border: msg.role === 'user' ? 'none' : '1px solid #E2E0D8'
                            }}>
                                {msg.parts[0].text}
                            </div>
                        ))}
                        {loading && (
                            <div style={{...styles.messageBubble, alignSelf: 'flex-start', backgroundColor: '#fff', border:'1px solid #E2E0D8', borderRadius:'0 18px 18px 18px'}}>
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
                            placeholder="Ask anything about NexLearn..."
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
                {isOpen ? '×' : '🪄'}
            </button>

            <style>{`
                .typing-dots span {
                    animation: blink 1.4s infinite both;
                    font-size: 1.5rem;
                    line-height: 0;
                    color: #2D5BE3;
                }
                .typing-dots span:nth-child(2) { animation-delay: .2s; }
                .typing-dots span:nth-child(3) { animation-delay: .4s; }
                @keyframes blink {
                    0% { opacity: .2; }
                    20% { opacity: 1; }
                    100% { opacity: .2; }
                }
                @media (max-width: 480px) {
                    .ai-chat-window {
                        width: 90vw !important;
                        right: 5vw !important;
                        bottom: 90px !important;
                        height: 70vh !important;
                    }
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
        backgroundColor: '#2D5BE3',
        color: '#fff',
        border: 'none',
        fontSize: '1.8rem',
        cursor: 'pointer',
        boxShadow: '0 8px 30px rgba(45, 91, 227, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    chatWindow: {
        width: '380px',
        height: '500px',
        backgroundColor: '#F9F8F4',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(26, 25, 22, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #E2E0D8'
    },
    header: {
        padding: '20px',
        background: '#1A1916',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
    botIcon: { fontSize: '1.4rem', backgroundColor: 'rgba(255,255,255,0.1)', width:'40px', height:'40px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius: '12px' },
    headerTitle: { margin: 0, fontSize: '0.95rem', fontWeight: '700', letterSpacing:'0.5px', textTransform:'uppercase' },
    onlineStatus: { fontSize: '0.7rem', opacity: 0.6, display:'flex', alignItems:'center', gap:'5px' },
    closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '1.8rem', cursor: 'pointer', opacity:0.6 },
    messagesArea: {
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: '#F9F8F4'
    },
    messageBubble: {
        maxWidth: '85%',
        padding: '14px 18px',
        fontSize: '0.9rem',
        lineHeight: '1.5',
        boxShadow: '0 4px 12px rgba(26, 25, 22, 0.03)',
        fontFamily: "'Inter', sans-serif"
    },
    inputArea: {
        padding: '18px',
        borderTop: '1px solid #E2E0D8',
        display: 'flex',
        gap: '12px',
        backgroundColor: '#fff'
    },
    input: {
        flex: 1,
        padding: '12px 18px',
        borderRadius: '14px',
        border: '1px solid #E2E0D8',
        outline: 'none',
        fontSize: '0.9rem',
        backgroundColor: '#F9F8F4'
    },
    sendBtn: {
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        backgroundColor: '#2D5BE3',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s'
    }
};

export default AIChatbot;
