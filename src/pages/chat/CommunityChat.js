import React, { useState, useEffect, useRef } from 'react';
import socketService from '../../services/socketService';
import authService from '../../services/authService';
import { Container, Row, Col, Form, Button, Card, Badge, ListGroup } from 'react-bootstrap';
import { FaPaperPlane, FaUserCircle, FaHashtag, FaUsers } from 'react-icons/fa';
import DashboardSidebar from '../../components/DashboardSidebar';
import Navbar from '../../components/Navbar';
import '../../styles/Chat.css';

import React, { useState, useEffect, useRef } from 'react';
import socketService from '../../services/socketService';
import authService from '../../services/authService';
import { Container, Row, Col, Form, Button, Card, Badge, ListGroup, Offcanvas } from 'react-bootstrap';
import { FaPaperPlane, FaUserCircle, FaHashtag, FaUsers, FaBars } from 'react-icons/fa';
import DashboardSidebar from '../../components/DashboardSidebar';
import Navbar from '../../components/Navbar';
import '../../styles/Chat.css';

const CommunityChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [room, setRoom] = useState('General');
  const [rooms] = useState(['General', 'Web Development', 'Mobile Dev', 'AI & ML', 'Student Support']);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showRooms, setShowRooms] = useState(false);
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

  const RoomList = () => (
    <ListGroup variant="flush" className="rooms-list">
      {rooms.map((r) => (
        <ListGroup.Item 
          key={r}
          onClick={() => {
            setRoom(r);
            setShowRooms(false);
          }}
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
  );

  return (
    <div className="dashboard-container">
      <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="dashboard-main chat-page">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <Container fluid className="chat-content-wrapper px-0 px-md-4 py-0 py-md-4">
          <Row className="chat-row g-0 g-md-4">
            {/* Desktop Rooms Sidebar */}
            <Col lg={3} md={4} className="rooms-sidebar-col d-none d-md-block">
              <Card className="glass-card h-100 border-0 shadow-lg">
                <Card.Header className="bg-transparent border-0 pt-4 pb-2 px-4">
                  <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                    <FaUsers className="text-primary" /> Rooms
                  </h5>
                </Card.Header>
                <Card.Body className="px-2 scrollable-rooms">
                  <RoomList />
                </Card.Body>
              </Card>
            </Col>

            {/* Chat Area */}
            <Col lg={9} md={8} className="chat-main-col">
              <Card className="glass-card chat-box-card border-0 shadow-lg">
                <Card.Header className="chat-header d-flex justify-content-between align-items-center px-3 px-md-4 py-3">
                   <div className="d-flex align-items-center gap-3">
                      <Button 
                        variant="link" 
                        className="p-0 text-dark d-md-none" 
                        onClick={() => setShowRooms(true)}
                      >
                         <FaBars size={20} />
                      </Button>
                      <div>
                        <h5 className="mb-0 fw-bold">#{room}</h5>
                        <small className="text-muted opacity-75">Community Chat</small>
                      </div>
                   </div>
                   <div className="header-actions">
                      <Badge bg="success" className="rounded-pill px-2 px-md-3 py-2">Online</Badge>
                   </div>
                </Card.Header>

                <Card.Body className="chat-messages-body p-3 p-md-4" id="chat-scroll">
                  {messages.length === 0 ? (
                    <div className="empty-chat-placeholder">
                       <FaHashtag size={40} className="mb-3 opacity-25" />
                       <p className="text-muted">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div 
                        key={msg._id || idx} 
                        className={`message-wrapper ${msg.sender?._id === user?._id ? 'sender' : 'receiver'}`}
                      >
                        {msg.sender?._id !== user?._id && (
                          <div className="msg-avatar">
                            {msg.sender?.avatar ? (
                              <img src={msg.sender.avatar} alt="avatar" />
                            ) : (
                              <div className="avatar-placeholder">
                                {msg.senderName?.[0] || 'U'}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="msg-content-wrapper">
                          {msg.sender?._id !== user?._id && (
                            <span className="sender-name">{msg.senderName}</span>
                          )}
                          <div className="msg-bubble">
                            <div className="msg-text">{msg.message}</div>
                            <span className="msg-time">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={lastMessageRef} />
                </Card.Body>

                <Card.Footer className="chat-footer p-3 p-md-4 border-0">
                  {typingUser && (
                    <div className="typing-status mb-2">
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <small className="ms-2">{typingUser} is typing...</small>
                    </div>
                  )}
                  <Form onSubmit={handleSendMessage} className="chat-input-form">
                    <div className="input-group">
                      <Form.Control 
                        type="text"
                        className="chat-input-field border-0 shadow-none px-4"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={handleTyping}
                        autoComplete="off"
                      />
                      <Button type="submit" variant="primary" className="send-message-btn">
                        <FaPaperPlane />
                      </Button>
                    </div>
                  </Form>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Container>

        {/* Mobile Rooms Drawer */}
        <Offcanvas show={showRooms} onHide={() => setShowRooms(false)} placement="start" className="mobile-rooms-offcanvas">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title className="fw-bold">
               <FaUsers className="text-primary me-2" /> Chat Rooms
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="px-2">
             <RoomList />
          </Offcanvas.Body>
        </Offcanvas>
      </div>
    </div>
  );
};

export default CommunityChat;
