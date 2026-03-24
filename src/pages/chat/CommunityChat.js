import React, { useState, useEffect, useRef } from 'react';
import socketService from '../../services/socketService';
import authService from '../../services/authService';
import api from '../../services/api';
import {
  Container, Row, Col, Form, Button,
  Card, Badge, ListGroup, Offcanvas, Modal
} from 'react-bootstrap';
import {
  FaPaperPlane, FaHashtag, FaUsers, FaBars, FaPlus, FaTrash
} from 'react-icons/fa';
import DashboardSidebar from '../../components/DashboardSidebar';
import Navbar from '../../components/Navbar';
import '../../styles/Chat.css';

const CommunityChat = () => {
  console.log('--- CHAT RENDER V4.5 ---');
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
  const [connectionError, setConnectionError] = useState(null);
  const isPollingMode = socketService.isPollingMode; // true on Vercel

  const lastMessageRef = useRef(null);
  const prevRoomRef = useRef(null);

  /* ---- Socket connection (runs ONCE) ---- */
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const token = authService.getToken();
    setUser(currentUser);

    if (!token) {
      console.warn('No auth token found for chat');
      return;
    }

    // On Vercel (polling mode), skip socket entirely
    if (isPollingMode) {
      console.log('☁️ Polling mode active — skipping socket connection');
      return;
    }

    // Connect socket ONE PER MOUNT
    const socket = socketService.connect(token);

    // Register listeners
    const handleMessage = (msg) => {
      console.log('📨 New message received via socket:', msg);
      setMessages((prev) => [...prev, msg]);
    }
    const handleRoomHistory = (msgs) => {
      console.log('📜 History loaded:', msgs.length, 'messages');
      setMessages(msgs);
    }
    const handleUserTyping = (data) =>
      setTypingUser(data.isTyping ? data.userName : null);
    const handleMessageDeleted = (id) =>
      setMessages((prev) => prev.filter(m => m._id !== id));

    socketService.onMessage(handleMessage)
    socketService.onRoomHistory(handleRoomHistory);
    socketService.onUserTyping(handleUserTyping);
    socketService.onMessageDeleted(handleMessageDeleted);

    // Track connection status
    if (socket) {
      if (socket.connected) {
        setConnected(true);
        setConnectionError(null);
      }

      socket.on('connect', () => {
        console.log('Chat Status: Online');
        setConnected(true);
        setConnectionError(null);
      });
      socket.on('disconnect', () => {
        console.warn('Chat Status: Offline');
        setConnected(false);
      });
      socket.on('connect_error', (err) => {
        console.error('Chat Connection Error:', err.message);
        setConnectionError(err.message);
        setConnected(false);
      });
    }

    // Cleanup on unmount only
    return () => {
      console.log('Cleaning up chat listeners...');
      socketService.offMessage(handleMessage);
      socketService.offRoomHistory(handleRoomHistory);
      socketService.offUserTyping(handleUserTyping);
      socketService.offMessageDeleted(handleMessageDeleted);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    if (isPollingMode) {
      // Optimistic removal
      setMessages(prev => prev.filter(m => m._id !== msgId));
      try {
        await api.delete(`/chat/messages/${msgId}`);
      } catch (err) {
        console.error('Delete error:', err);
      }
    } else {
      socketService.deleteMessage(msgId);
    }
  };

  /* ---- Join/leave rooms when room changes ---- */
  useEffect(() => {
    // Leave previous room if any
    if (prevRoomRef.current && prevRoomRef.current !== room) {
      console.log(`Leaving room: ${prevRoomRef.current}`);
      socketService.leaveRoom(prevRoomRef.current);
    }

    // Reset messages UI and Join new room (socketService handles if not yet connected)
    console.log(`Join Room Request: ${room}`);
    setMessages([]);
    setTypingUser(null);
    socketService.joinRoom(room);
    prevRoomRef.current = room;
  }, [room]);

  /* ---- Auto-scroll to latest message ---- */
  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ---- Polling Fallback (CRUCIAL for Vercel Deployment) ---- */
  useEffect(() => {
    // Determine if polling should be active:
    // - ALWAYS poll on Vercel (polling mode) since there's no WebSocket
    // - On non-Vercel, only poll if socket is disconnected
    const shouldPoll = isPollingMode || !connected;
    if (!shouldPoll) return;

    // Fetch messages immediately on mount/room change (don't wait for first interval)
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/messages?room=${room}`);
        if (res.data.success) {
          const fetched = res.data.messages.sort((a, b) => new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt));

          setMessages(prev => {
            // Skip update if messages are identical (avoid flickering)
            const prevIds = prev.map(m => m._id).filter(id => id && !String(id).startsWith('temp-')).join(',');
            const fetchedIds = fetched.map(m => m._id).join(',');
            if (prevIds === fetchedIds) return prev;
            return fetched;
          });
        }
      } catch (err) {
        console.error('Polling error:', err.message);
      }
    };

    // Initial fetch
    fetchMessages();

    // Then poll every 3 seconds
    const pollInterval = setInterval(fetchMessages, 3000);

    return () => clearInterval(pollInterval);
  }, [room, connected, isPollingMode]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgText = newMessage;
    setNewMessage('');

    // Optimistic UI: show the message immediately
    const localMsg = {
      _id: `temp-${Date.now()}`,
      sender: { _id: user?._id, name: user?.name },
      senderName: user?.name,
      message: msgText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, localMsg]);

    if (isPollingMode) {
      // VERCEL: Send via HTTP only
      try {
        await api.post('/chat/send', { room, message: msgText });
      } catch (err) {
        console.error('HTTP send error:', err);
        // Remove optimistic message on failure
        setMessages(prev => prev.filter(m => m._id !== localMsg._id));
      }
    } else {
      // NON-VERCEL: Send via Socket (instant) + HTTP (persistence backup)
      if (connected) {
        socketService.sendMessage(room, msgText);
        // Remove the temp message since socket will echo it back
        setMessages(prev => prev.filter(m => m._id !== localMsg._id));
      }
      try {
        await api.post('/chat/send', { room, message: msgText });
      } catch (err) {
        console.error('HTTP send error:', err);
      }
    }

    socketService.sendTyping(room, false);
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

  const handleDeleteRoom = (roomToDelete, e) => {
    e.stopPropagation();
    if (roomToDelete === 'General') return; // Prevent deleting the default room
    const confirmDelete = window.confirm(`Are you sure you want to delete the ${roomToDelete} room?`);
    if (confirmDelete) {
      const updatedRooms = rooms.filter(r => r !== roomToDelete);
      setRooms(updatedRooms);
      // If the user was in the deleted room, move them to General
      if (room === roomToDelete) {
        setRoom('General');
      }
    }
  };

  /* ---- Room list component (Desktop sidebar/Mobile offcanvas) ---- */
  const RoomList = () => (
    <div className="rooms-container">
      <ListGroup variant="flush" className="rooms-list">
        {rooms.map((r) => (
          <ListGroup.Item
            key={r}
            active={room === r}
            onClick={() => { setRoom(r); setShowRooms(false); }}
            className={`room-item border-0 d-flex justify-content-between align-items-center ${room === r ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex align-items-center gap-2 overflow-hidden">
              <div className={`room-icon ${room === r ? 'active' : ''}`}>
                <FaHashtag />
              </div>
              <span className="fw-medium text-truncate">{r}</span>
            </div>
            {r !== 'General' && (
              <Button
                variant="link"
                className="p-0 text-danger opacity-75"
                onClick={(e) => handleDeleteRoom(r, e)}
                style={{ zIndex: 10 }}
              >
                &times;
              </Button>
            )}
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

        <Container
          fluid
          className="chat-content-wrapper px-0 px-md-3 px-lg-4 py-0 py-md-3"
        >
          <Row className="chat-row g-0 g-md-3 g-lg-4 flex-nowrap h-100">

            {/* ----- Desktop Sidebar ----- */}
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

            {/* ----- Chat Area ----- */}
            <Col
              lg={9}
              md={8}
              xs={12}
              className="chat-main-col d-flex flex-column"
            >
              <Card className="glass-card chat-box-card border-0 shadow-lg flex-grow-1">
                <Card.Header className="chat-header d-flex justify-content-between align-items-center border-0">
                  <div className="d-flex align-items-center gap-2 gap-md-3 overflow-hidden">
                    <Button
                      variant="link"
                      className="p-0 text-dark d-md-none flex-shrink-0"
                      onClick={() => setShowRooms(true)}
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
                </Card.Header>

                <Card.Body className="chat-messages-body p-3 p-md-4" id="chat-box">
                  {(!isPollingMode && !connected && connectionError) ? (
                    <div className="empty-chat-placeholder">
                      <FaHashtag size={36} className="mb-3 text-danger" style={{ opacity: 0.5 }} />
                      <h6 className="text-danger fw-bold">Connection Failed</h6>
                      <p className="text-muted small px-4">{connectionError}</p>
                      <Button variant="outline-primary" size="sm" onClick={() => window.location.reload()}>Retry Connection</Button>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="empty-chat-placeholder">
                      <FaHashtag size={36} className="mb-3 opacity-10" />
                      <p className="text-muted small">No messages in # {room} yet.</p>
                      {isPollingMode && <p className="text-info small">☁️ Cloud mode active — messages sync every few seconds</p>}
                      {!isPollingMode && !connected && <p className="text-primary font-size-xs">🔌 Connecting to server...</p>}
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isSender = (msg.sender?._id === user?._id) || (msg.sender === user?._id);
                      return (
                        <div
                          key={msg._id || idx}
                          className={`message-wrapper ${isSender ? 'sender' : 'receiver'}`}
                        >
                          {!isSender && (
                            <div className="msg-avatar flex-shrink-0">
                              {msg.sender?.avatar ? (
                                <img src={msg.sender.avatar.startsWith('/') ? `${process.env.REACT_APP_API_URL.replace('/api', '')}${msg.sender.avatar}` : msg.sender.avatar} alt="avatar" />
                              ) : (
                                <div className="avatar-placeholder">
                                  {msg.senderName?.[0]?.toUpperCase() || 'U'}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="msg-content-wrapper">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span className="sender-name" style={{ fontSize: '11px', fontWeight: 700, color: isSender ? '#2D5BE3' : '#6B6962' }}>
                                {isSender ? 'You' : msg.senderName}
                              </span>
                              {isSender && (
                                <FaTrash
                                  className="text-danger opacity-25 hover-opacity-100 cursor-pointer"
                                  size={10}
                                  onClick={() => handleDeleteMessage(msg._id)}
                                  title="Delete message"
                                />
                              )}
                            </div>
                            <div className="msg-bubble">
                              <span className="msg-text">{msg.message}</span>
                              <span className="msg-time">
                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit', minute: '2-digit'
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

                <Card.Footer className="chat-footer border-0 p-3 p-md-4">
                  {typingUser && (
                    <div className="typing-status mb-2">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <small className="ms-2 text-primary fw-medium font-size-xs">
                        {typingUser} is typing…
                      </small>
                    </div>
                  )}

                  <Form onSubmit={handleSendMessage} className="chat-input-form">
                    <div className="input-group bg-white rounded-pill overflow-hidden border">
                      <Form.Control
                        type="text"
                        className="chat-input-field border-0 px-4 py-2"
                        placeholder={isPollingMode ? "Type a message..." : (connected ? "Type a message..." : (connectionError ? `Error: ${connectionError}` : "🔌 Connecting..."))}
                        value={newMessage}
                        onChange={handleTyping}
                        autoComplete="off"
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        className="rounded-circle d-flex align-items-center justify-content-center m-1 p-0"
                        style={{ width: '38px', height: '38px' }}
                        disabled={!newMessage.trim()}
                      >
                        <FaPaperPlane size={14} />
                      </Button>
                    </div>
                  </Form>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Container>

        {/* Mobile Sidebar */}
        <Offcanvas show={showRooms} onHide={() => setShowRooms(false)} placement="start">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title className="fw-bold">Chat Rooms</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body><RoomList /></Offcanvas.Body>
        </Offcanvas>

        {/* Create Room Modal */}
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="h5 fw-bold">Create Room</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleCreateRoom}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Room name..."
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  autoFocus
                />
              </Form.Group>
              <Button type="submit" className="w-100 rounded-pill">Create Room</Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default CommunityChat;
