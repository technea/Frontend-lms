import React, { useState, useEffect, useRef } from 'react';
import socketService from '../../services/socketService';
import authService from '../../services/authService';
import {
  Container, Row, Col, Form, Button,
  Card, Badge, ListGroup, Offcanvas, Modal
} from 'react-bootstrap';
import {
  FaPaperPlane, FaHashtag, FaUsers, FaBars, FaPlus
} from 'react-icons/fa';
import DashboardSidebar from '../../components/DashboardSidebar';
import Navbar from '../../components/Navbar';
import '../../styles/Chat.css';

const CommunityChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [room, setRoom] = useState('General');
  const [rooms, setRooms] = useState(['General']);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showRooms, setShowRooms] = useState(false);
  const [user, setUser] = useState(null);
  const [typingUser, setTypingUser] = useState(null);
  const [connected, setConnected] = useState(false);
  const lastMessageRef = useRef(null);
  const prevRoomRef = useRef(null);

  /* ---- Socket connection (runs ONCE) ---- */
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const token = authService.getToken();
    setUser(currentUser);

    if (!token) {
      console.error('No auth token found for chat');
      return;
    }

    // Connect socket ONCE
    const socket = socketService.connect(token);

    // Register listeners
    const handleMessage = (msg) => setMessages((prev) => [...prev, msg]);
    const handleRoomHistory = (msgs) => setMessages(msgs);
    const handleUserTyping = (data) =>
      setTypingUser(data.isTyping ? data.userName : null);

    socketService.onMessage(handleMessage);
    socketService.onRoomHistory(handleRoomHistory);
    socketService.onUserTyping(handleUserTyping);

    // Track connection status
    if (socket) {
      socket.on('connect', () => setConnected(true));
      socket.on('disconnect', () => setConnected(false));
      if (socket.connected) setConnected(true);
    }

    // Cleanup on unmount only
    return () => {
      socketService.offMessage(handleMessage);
      socketService.offRoomHistory(handleRoomHistory);
      socketService.offUserTyping(handleUserTyping);
      socketService.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Join/leave rooms when room changes ---- */
  useEffect(() => {
    if (!socketService.isConnected() && !socketService.socket) return;

    // Leave previous room
    if (prevRoomRef.current && prevRoomRef.current !== room) {
      socketService.leaveRoom(prevRoomRef.current);
    }

    // Join new room
    setMessages([]);
    setTypingUser(null);
    socketService.joinRoom(room);
    prevRoomRef.current = room;
  }, [room]);

  /* ---- Auto-scroll to latest message ---- */
  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ---- Handlers ---- */
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socketService.sendMessage(room, newMessage);
      setNewMessage('');
      socketService.sendTyping(room, false);
    }
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (newRoomName.trim()) {
      const formattedName = newRoomName.trim().replace(/\s+/g, '-');
      if (!rooms.includes(formattedName)) {
        setRooms([...rooms, formattedName]);
        setRoom(formattedName);
      }
      setNewRoomName('');
      setShowCreateModal(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    socketService.sendTyping(room, e.target.value.length > 0);
  };

  /* ---- Room list (reused in desktop sidebar + mobile offcanvas) ---- */
  const RoomList = () => (
    <div className="rooms-container">
      <ListGroup variant="flush" className="rooms-list">
        {rooms.map((r) => (
          <ListGroup.Item
            key={r}
            onClick={() => { setRoom(r); setShowRooms(false); }}
            className={`room-item border-0 ${room === r ? 'active' : ''}`}
          >
            <div className="d-flex align-items-center gap-2">
              <div className={`room-icon ${room === r ? 'active' : ''}`}>
                <FaHashtag />
              </div>
              <span className="fw-medium">{r}</span>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
      
      <div className="px-3 mt-3">
        <Button 
          variant="outline-primary" 
          className="w-100 rounded-pill d-flex align-items-center justify-content-center gap-2 py-2"
          onClick={() => setShowCreateModal(true)}
          style={{ fontSize: '13px', fontWeight: 600 }}
        >
          <FaPlus size={12} /> Create Room
        </Button>
      </div>
    </div>
  );

  /* ---- Render ---- */
  return (
    <div className="edu-dashboard">
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="edu-main chat-page">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* ========== Main layout ========== */}
        <Container
          fluid
          className="chat-content-wrapper px-0 px-md-3 px-lg-4 py-0 py-md-3 py-lg-4"
        >
          <Row className="chat-row g-0 g-md-3 g-lg-4 flex-nowrap">

            {/* ----- Desktop Rooms Sidebar (hidden on mobile) ----- */}
            <Col
              lg={3}
              md={4}
              className="rooms-sidebar-col d-none d-md-flex flex-column"
            >
              <Card className="glass-card flex-grow-1 border-0 shadow-lg overflow-hidden">
                <Card.Header className="bg-transparent border-0 pt-4 pb-2 px-3 px-lg-4">
                  <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                    <FaUsers className="text-primary" />
                    Rooms
                  </h5>
                </Card.Header>
                <Card.Body className="px-1 scrollable-rooms p-0">
                  <RoomList />
                </Card.Body>
              </Card>
            </Col>

            {/* ----- Chat Main Area ----- */}
            <Col
              lg={9}
              md={8}
              xs={12}
              className="chat-main-col d-flex flex-column"
            >
              <Card className="glass-card chat-box-card border-0 shadow-lg flex-grow-1">

                {/* Header */}
                <Card.Header className="chat-header d-flex justify-content-between align-items-center border-0">
                  <div className="d-flex align-items-center gap-2 gap-md-3 overflow-hidden">
                    {/* Hamburger — only on mobile */}
                    <Button
                      variant="link"
                      className="p-0 text-dark d-md-none flex-shrink-0"
                      onClick={() => setShowRooms(true)}
                      aria-label="Open rooms"
                    >
                      <FaBars size={18} />
                    </Button>
                    <div className="overflow-hidden">
                      <h5 className="mb-0 fw-bold text-truncate">#{room}</h5>
                      <small className="text-muted d-none d-sm-block">
                        Community Chat
                      </small>
                    </div>
                  </div>
                  <Badge 
                    bg={connected ? "success" : "secondary"} 
                    className="rounded-pill px-2 px-md-3 py-2 flex-shrink-0"
                  >
                    {connected ? 'Online' : 'Connecting…'}
                  </Badge>
                </Card.Header>

                {/* Messages */}
                <Card.Body className="chat-messages-body p-3 p-md-4" id="chat-scroll">
                  {messages.length === 0 ? (
                    <div className="empty-chat-placeholder">
                      <FaHashtag size={36} className="mb-3 opacity-25" />
                      <p className="text-muted mb-0">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isSender = msg.sender?._id === user?._id;
                      return (
                        <div
                          key={msg._id || idx}
                          className={`message-wrapper ${isSender ? 'sender' : 'receiver'}`}
                        >
                          {!isSender && (
                            <div className="msg-avatar flex-shrink-0">
                              {msg.sender?.avatar ? (
                                <img src={msg.sender.avatar} alt="avatar" />
                              ) : (
                                <div className="avatar-placeholder">
                                  {msg.senderName?.[0]?.toUpperCase() || 'U'}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="msg-content-wrapper">
                            {!isSender && (
                              <span className="sender-name">{msg.senderName}</span>
                            )}
                            <div className="msg-bubble">
                              <span className="msg-text">{msg.message}</span>
                              <span className="msg-time">
                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={lastMessageRef} />
                </Card.Body>

                {/* Footer / Input */}
                <Card.Footer className="chat-footer border-0 p-3 p-md-4">
                  {typingUser && (
                    <div className="typing-status mb-2">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <small className="ms-2 text-primary fw-medium">
                        {typingUser} is typing…
                      </small>
                    </div>
                  )}

                  <Form onSubmit={handleSendMessage} className="chat-input-form">
                    <div className="input-group">
                      <Form.Control
                        type="text"
                        className="chat-input-field"
                        placeholder="Type a message…"
                        value={newMessage}
                        onChange={handleTyping}
                        autoComplete="off"
                        disabled={!connected}
                      />
                      <Button
                        type="submit"
                        className="send-message-btn"
                        aria-label="Send message"
                        disabled={!connected || !newMessage.trim()}
                      >
                        <FaPaperPlane />
                      </Button>
                    </div>
                  </Form>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Container>

        {/* ========== Mobile Rooms Drawer ========== */}
        <Offcanvas
          show={showRooms}
          onHide={() => setShowRooms(false)}
          placement="start"
          className="mobile-rooms-offcanvas"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title className="fw-bold d-flex align-items-center gap-2">
              <FaUsers className="text-primary" /> Chat Rooms
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="px-2 py-0">
            <RoomList />
          </Offcanvas.Body>
        </Offcanvas>

        {/* ========== Create Room Modal ========== */}
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered className="create-room-modal">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold h5">Create New Room</Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-3">
            <Form onSubmit={handleCreateRoom}>
              <Form.Group className="mb-3">
                <Form.Label className="small text-muted fw-bold">ROOM NAME</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="e.g. Web-Development"
                  className="rounded-3 py-2 border-0 bg-light"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  autoFocus
                />
                <Form.Text className="text-muted small">
                  Room names will be formatted with hyphens.
                </Form.Text>
              </Form.Group>
              <div className="d-flex gap-2">
                <Button variant="light" className="flex-grow-1 rounded-pill" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" className="flex-grow-1 rounded-pill">
                  Create
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default CommunityChat;
