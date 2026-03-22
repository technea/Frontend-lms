import { io } from 'socket.io-client';
import { API_BASE_URL } from './api';

// Derived socket URL from API URL if not explicitly provided
// e.g. https://backend.vercel.app/api -> https://backend.vercel.app
const DEFAULT_SOCKET_URL = API_BASE_URL ? API_BASE_URL.replace(/\/api$/, '') : 'http://localhost:5000';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || DEFAULT_SOCKET_URL;

class SocketService {
    socket = null;
    _listeners = []; // Track registered listeners for cleanup

    connect(token) {
        // Don't reconnect if already connected with the same token
        if (this.socket?.connected) {
            console.log('Already connected to socket');
            return this.socket;
        }

        // Clean up any existing socket
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }

        console.log('🔌 Attempting socket connection to:', SOCKET_URL);

        // According to Socket.io v4: Use 'auth' object for authentication
        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'], // Allow polling fallback
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            auth: {
                token: token
            }
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to socket server:', this.socket.id);
        });

        this.socket.on('connect_error', (err) => {
            console.error('❌ Socket Connection Error:', err.message);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('🔌 Disconnected from socket server:', reason);
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('🔄 Reconnected after', attemptNumber, 'attempts');
        });

        // Re-register any pending listeners on the new socket
        this._listeners.forEach(({ event, callback }) => {
            if (this.socket) this.socket.on(event, callback);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
        this._listeners = [];
    }

    joinRoom(room) {
        if (!this.socket) return;

        // If connected, emit immediately
        if (this.socket.connected) {
            this.socket.emit('joinRoom', room);
            console.log('Room Join emitted (connected):', room);
        } else {
            // Buffer it: wait for connection then join
            this.socket.once('connect', () => {
                this.socket.emit('joinRoom', room);
                console.log('Room Join emitted (delayed):', room);
            });
        }
    }

    leaveRoom(room) {
        if (this.socket?.connected) {
            this.socket.emit('leaveRoom', room);
        }
    }

    sendMessage(room, message, callback) {
        // We allow emit even if not "connected" status yet, socket.io will buffer internally
        if (this.socket) {
            this.socket.emit('sendMessage', { room, message }, (response) => {
                console.log('Message Ack:', response);
                if (callback) callback(response);
            });
        }
    }

    sendTyping(room, isTyping) {
        if (this.socket?.connected) {
            this.socket.emit('typing', { room, isTyping });
        }
    }

    onMessage(callback) {
        this._registerListener('message', callback);
    }

    onRoomHistory(callback) {
        this._registerListener('roomHistory', callback);
    }

    onUserTyping(callback) {
        this._registerListener('userTyping', callback);
    }

    _registerListener(event, callback) {
        // Prevent duplicate local listeners in our queue
        const exists = this._listeners.some(l => l.event === event && l.callback === callback);
        if (!exists) {
            this._listeners.push({ event, callback });
        }
        
        if (this.socket) {
            // Remove previous instances of same callback to avoid duplicates on the socket
            this.socket.off(event, callback);
            this.socket.on(event, callback);
        }
    }

    offMessage(callback) {
        this._removeListener('message', callback);
    }

    offRoomHistory(callback) {
        this._removeListener('roomHistory', callback);
    }

    offUserTyping(callback) {
        this._removeListener('userTyping', callback);
    }

    _removeListener(event, callback) {
        this._listeners = this._listeners.filter(
            (l) => !(l.event === event && l.callback === callback)
        );
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    isConnected() {
        return this.socket?.connected || false;
    }
}

const socketService = new SocketService();
export default socketService;
