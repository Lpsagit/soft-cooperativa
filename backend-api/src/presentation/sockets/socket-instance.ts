import { Sockets } from './sockets';
import { Server as SocketIOServer } from 'socket.io';

let socketsInstance: Sockets;

export function initSockets(io: SocketIOServer) {
    socketsInstance = new Sockets(io);
}

export function getSocketsInstance(): Sockets {
    if (!socketsInstance) {
        throw new Error('Sockets no inicializado');
    }
    return socketsInstance;
}