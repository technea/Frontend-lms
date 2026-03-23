import { io } from 'socket.io-client';
import { API_BASE_URL } from './api';

// Derive the socket URL dynamically. 
// If we are on localhost, we point to localhost:5000.
// If NOT on localhost, we derive from API URL.
const getSocketUrl = () => {
    // Priority 1: Environment variable
    if (process.env.REACT_APP_SOCKET_URL) return process.env.REACT_APP_SOCKET_URL;
    
    // Priority 2: Localhost detection
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
        // We use the same protocol as the page (http/https) but port 5000
        return `${window.location.protocol}//${window.location.hostname}:5000`;
    }
    
    // Priority 3: Fallback to API base URL (removing /api)
    return API_BASE_URL ? API_BASE_URL.replace(/\/api$/, '') : 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

class SocketService {
    socket = null;
    _listeners = []; // Track registered listeners for cleanup

    connect(token) {
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
            transports: ['polling', 'websocket']
        });

        this.socket.on('connect', () => {
            console.log('✅ Socket connected successfully with ID:', this.socket.id);
        });

        this.socket.on('connect_error', (err) => {
            console.error('❌ Socket connection error:', err.message);
        });

        this.socket.on('disconnect', (reason) => {
            console.warn('🔌 Socket disconnected:', reason);
            // If the server forced disconnect, try to reconnect manually after a delay
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
        if (this.socket?.connected) {
            this.socket.emit('leaveRoom', room);
        }
    }

    sendMessage(room, message, callback) {
        if (this.socket) {
            this.socket.emit('sendMessage', { room, message }, (response) => {
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
        return this.socket?.connected || false;
    }
}

const socketService = new SocketService();
export default socketService;
