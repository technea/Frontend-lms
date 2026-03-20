import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    socket = null;

    connect(token) {
        if (this.socket) {
            this.socket.disconnect();
        }

        // According to Socket.io v4: Use 'auth' object for authentication
        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
            auth: {
                token: token
            }
        });

        this.socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket Connection Error:', err.message);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from socket server:', reason);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinRoom(room) {
        if (this.socket) {
            this.socket.emit('joinRoom', room);
        }
    }

    // Updated with acknowledgement support
    sendMessage(room, message, callback) {
        if (this.socket) {
            this.socket.emit('sendMessage', { room, message }, (response) => {
                if (callback) callback(response);
            });
        }
    }

    sendTyping(room, isTyping) {
        if (this.socket) {
            this.socket.emit('typing', { room, isTyping });
        }
    }

    onMessage(callback) {
        if (this.socket) {
            this.socket.on('message', callback);
        }
    }

    // Renamed according to new backend event name
    onRoomHistory(callback) {
        if (this.socket) {
            this.socket.on('roomHistory', callback);
        }
    }

    onUserTyping(callback) {
        if (this.socket) {
            this.socket.on('userTyping', callback);
        }
    }
}

const socketService = new SocketService();
export default socketService;
