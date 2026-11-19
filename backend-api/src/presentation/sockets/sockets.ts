import { Server as SocketIOServer, Socket } from 'socket.io';

export class Sockets {
    public io: SocketIOServer;

    constructor( io:SocketIOServer ) {  
        this.io = io;
        this.socketEvent();
    }

     socketEvent(){
        //on Connection
        this.io.on('connection', ( socket ) => {
            console.log(`Cliente conectado: ${socket.id}`);

            // Escuchar evento: mensaje-to-server
           // socket.on('mensaje-to-server', ( data ) => {
           //     console.log( data );
                //emitir evento
           //     socket.broadcast.emit('mensaje-from-server', data  );
           // });

            socket.on('disconnect', ( ) => {
            console.log(`Cliente desconectado: ${socket.id}`);
         });
        
        });
         
    }
}