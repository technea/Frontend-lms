import { io } from 'socket.io-client';
import { API_BASE_URL } from './api';

// Detect if we're running on Vercel (serverless = no WebSocket support)
const IS_VERCEL = window.location.hostname.includes('vercel.app');

// Derive the socket URL dynamically. 
const getSocketUrl = () => {
    // On Vercel, we don't need a socket URL (polling only mode)
    if (IS_VERCEL) return null;

    // Priority 1: Environment variable
    if (process.env.REACT_APP_SOCKET_URL) return process.env.REACT_APP_SOCKET_URL;
    
    // Priority 2: Localhost detection
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
        return `${window.location.protocol}//${window.location.hostname}:5000`;
    }
    
    // Priority 3: Fallback to API base URL (removing /api)
    return API_BASE_URL ? API_BASE_URL.replace(/\/api$/, '') : 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

class SocketService {
    socket = null;
    _listeners = [];
    _isPollingMode = IS_VERCEL; // True when on Vercel (no WebSocket)

    get isPollingMode() {
        return this._isPollingMode;
    }

    connect(token) {
        // On Vercel: skip Socket.io entirely, use HTTP polling only
        if (this._isPollingMode) {
            console.log('☁️ Vercel detected — running in HTTP polling-only mode (no WebSocket)');
            return null;
        }

        // If already connected, just return the socket
        if (this.socket?.connected) {
            console.log('✅ Socket already connected');
            return this.socket;
        }

        // If currently connecting, don't start a new one
        if (this.socket) {
            console.log('⏳ Socket connection attempt already pending...');
            return this.socket;
        }

        if (!token) {
            console.error('❌ Cannot connect: No token provided');
            return null;
        }

        console.log(`🔌 Attempting socket connection to: ${SOCKET_URL}`);

        this.socket = io(SOCKET_URL, {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            auth: {
                token: token
            },
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('✅ Socket connected successfully with ID:', this.socket.id);
        });

        this.socket.on('connect_error', (err) => {
            console.error('❌ Socket connection error:', err.message);
        });

        this.socket.on('disconnect', (reason) => {
            console.warn('🔌 Socket disconnected:', reason);
            if (reason === "io server disconnect") {
                this.socket.connect();
            }
        });

        // Register any listeners that were set up before connect
        this._listeners.forEach(({ event, callback }) => {
            if (this.socket) {
                this.socket.off(event, callback);
                this.socket.on(event, callback);
            }
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
        if (this._isPollingMode) return; // No-op on Vercel
        if (!this.socket) {
            console.warn('Cannot join room: Socket not initialized');
            return;
        }
        
        if (this.socket.connected) {
            this.socket.emit('joinRoom', room);
            console.log(`➡️ Joined room immediately: ${room}`);
        } else {
            console.log(`⏳ Buffering joinRoom for ${room} until connected...`);
            this.socket.once('connect', () => {
                this.socket.emit('joinRoom', room);
                console.log(`➡️ Joined room after connecting: ${room}`);
            });
        }
    }

    leaveRoom(room) {
        if (this._isPollingMode) return;
        if (this.socket?.connected) {
            this.socket.emit('leaveRoom', room);
        }
    }

    sendMessage(room, message, callback) {
        if (this._isPollingMode) return; // On Vercel, messages go via HTTP only
        if (this.socket) {
            this.socket.emit('sendMessage', { room, message }, (response) => {
                if (callback) callback(response);
            });
        }
    }

    sendTyping(room, isTyping) {
        if (this._isPollingMode) return;
        if (this.socket?.connected) {
            this.socket.emit('typing', { room, isTyping });
        }
    }

    onMessage(callback) {
        if (this._isPollingMode) return;
        this._registerListener('message', callback);
    }

    onRoomHistory(callback) {
        if (this._isPollingMode) return;
        this._registerListener('roomHistory', callback);
    }

    deleteMessage(messageId) {
        if (this._isPollingMode) return;
        if (this.socket?.connected) {
            this.socket.emit('deleteMessage', messageId);
        }
    }

    onMessageDeleted(callback) {
        if (this._isPollingMode) return;
        this._registerListener('messageDeleted', callback);
    }

    offMessageDeleted(callback) {
        this._removeListener('messageDeleted', callback);
    }

    onUserTyping(callback) {
        if (this._isPollingMode) return;
        this._registerListener('userTyping', callback);
    }

    _registerListener(event, callback) {
        const exists = this._listeners.some(l => l.event === event && l.callback === callback);
        if (!exists) {
            this._listeners.push({ event, callback });
        }
        
        if (this.socket) {
            this.socket.off(event, callback);
            this.socket.on(event, callback);
        }
    }

    offMessage(callback) { this._removeListener('message', callback); }
    offRoomHistory(callback) { this._removeListener('roomHistory', callback); }
    offUserTyping(callback) { this._removeListener('userTyping', callback); }

    _removeListener(event, callback) {
        this._listeners = this._listeners.filter(
            (l) => !(l.event === event && l.callback === callback)
        );
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    isConnected() {
        if (this._isPollingMode) return false; // Polling mode = never "socket connected"
        return this.socket?.connected || false;
    }
}

const socketService = new SocketService();
export default socketService;
