import React, { useState, useEffect, useRef } from 'react';
import socketService from '../../services/socketService';
import authService from '../../services/authService';
import { Container, Row, Col, Form, Button, Card, Badge, ListGroup } from 'react-bootstrap';
import { FaPaperPlane, FaUserCircle, FaHashtag, FaUsers } from 'react-icons/fa';
import DashboardSidebar from '../../components/DashboardSidebar';
import Navbar from '../../components/Navbar';
import '../../styles/Chat.css';

const CommunityChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [room, setRoom] = useState('General');
  const [rooms] = useState(['General', 'Web Development', 'Mobile Dev', 'AI & ML', 'Student Support']);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [typingUser, setTypingUser] = useState(null);
  const lastMessageRef = useRef(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const token = authService.getToken();
    setUser(currentUser);

    socketService.connect(token);

    socketService.onMessage((msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socketService.onRoomHistory((msgs) => {
      setMessages(msgs);
    });


    socketService.onUserTyping((data) => {
       if (data.isTyping) {
         setTypingUser(data.userName);
       } else {
         setTypingUser(null);
       }
    });

    socketService.joinRoom(room);

    return () => {
      socketService.disconnect();
    };
  }, [room]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socketService.sendMessage(room, newMessage);
      setNewMessage('');
      socketService.sendTyping(room, false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if(e.target.value.length > 0) {
      socketService.sendTyping(room, true);
    } else {
      socketService.sendTyping(room, false);
    }
  };

  return (
    <div className="dashboard-container">
      <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="dashboard-main chat-page">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <Container fluid className="chat-container py-4">
          <Row className="chat-row h-100">
            {/* Rooms List */}
            <Col lg={3} md={4} className="rooms-sidebar d-none d-md-block">
              <Card className="glass-card h-100 border-0 shadow-lg">
                <Card.Header className="bg-transparent border-0 pt-4 pb-2 px-4">
                  <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                    <FaUsers className="text-primary" /> Rooms
                  </h5>
                </Card.Header>
                <Card.Body className="px-2">
                  <ListGroup variant="flush">
                    {rooms.map((r) => (
                      <ListGroup.Item 
                        key={r}
                        onClick={() => setRoom(r)}
                        className={`room-item border-0 cursor-pointer ${room === r ? 'active' : ''}`}
                      >
                        <div className="d-flex align-items-center gap-3">
                           <div className={`room-icon ${room === r ? 'active' : ''}`}>
                               <FaHashtag />
                           </div>
                           <span className="fw-medium">{r}</span>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>

            {/* Chat Box */}
            <Col lg={9} md={8} className="chat-box-col h-100">
              <Card className="glass-card h-100 border-0 shadow-lg message-area">
                <Card.Header className="chat-header d-flex justify-content-between align-items-center px-4 py-3">
                   <div className="d-flex align-items-center gap-2">
                      <div className="mobile-room-toggle d-md-none">
                         {/* Optional mobile toggle for rooms */}
                      </div>
                      <div>
                        <h5 className="mb-0 fw-bold">#{room}</h5>
                        <small className="text-muted opacity-75">Community Chat</small>
                      </div>
                   </div>
                   <Badge bg="success" className="rounded-pill px-3 py-2">Online</Badge>
                </Card.Header>

                <Card.Body className="chat-messages p-4">
                  {messages.map((msg, idx) => (
                    <div 
                      key={msg._id || idx} 
                      className={`message-wrapper ${msg.sender?._id === user?.id ? 'sender' : 'receiver'}`}
                    >
                      {msg.sender?._id !== user?.id && (
                        <div className="msg-avatar">
                          {msg.sender?.avatar ? (
                            <img src={msg.sender.avatar} alt="avatar" />
                          ) : (
                            <FaUserCircle size={32} className="text-secondary" />
                          )}
                        </div>
                      )}
                      
                      <div className="msg-content-wrapper">
                        {msg.sender?._id !== user?.id && (
                          <span className="sender-name">{msg.senderName}</span>
                        )}
                        <div className="msg-bubble">
                          {msg.message}
                          <span className="msg-time">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={lastMessageRef} />
                </Card.Body>

                <Card.Footer className="chat-input-area p-4 border-0">
                  {typingUser && (
                    <div className="typing-indicator mb-2 animate-pulse">
                        {typingUser} is typing...
                    </div>
                  )}
                  <Form onSubmit={handleSendMessage} className="d-flex gap-2">
                    <Form.Control 
                      type="text"
                      className="chat-input rounded-pill px-4 border-0 shadow-sm"
                      placeholder="Type your message here..."
                      value={newMessage}
                      onChange={handleTyping}
                    />
                    <Button type="submit" variant="primary" className="send-btn rounded-pill px-4">
                      <FaPaperPlane />
                    </Button>
                  </Form>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default CommunityChat;
