import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    socket = null;
    _listeners = []; // Track registered listeners for cleanup

    connect(token) {
        // Don't reconnect if already connected with the same token
        if (this.socket?.connected) {
            return this.socket;
        }

        // Clean up any existing socket
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }

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
            this.socket.on(event, callback);
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
        if (this.socket?.connected) {
            this.socket.emit('joinRoom', room);
        } else if (this.socket) {
            // Wait for connection then join
            this.socket.once('connect', () => {
                this.socket.emit('joinRoom', room);
            });
        }
    }

    leaveRoom(room) {
        if (this.socket?.connected) {
            this.socket.emit('leaveRoom', room);
        }
    }

    // Updated with acknowledgement support
    sendMessage(room, message, callback) {
        if (this.socket?.connected) {
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

    // Renamed according to new backend event name
    onRoomHistory(callback) {
        this._registerListener('roomHistory', callback);
    }

    onUserTyping(callback) {
        this._registerListener('userTyping', callback);
    }

    // Helper to safely register listeners (even before socket is ready)
    _registerListener(event, callback) {
        this._listeners.push({ event, callback });
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    // Remove specific event listeners
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
