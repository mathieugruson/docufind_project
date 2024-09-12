import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: 'progress',
  cors: {
    origin: '*', // Adjust according to your needs
  },
  transports: ['websocket', 'polling'], // Ensure WebSocket is allowed
})

export class FolderCreationGateway {

  @WebSocketServer()
  server: Server;

  emitProgress(data: any) {
    this.server.emit('progress', data);
  }
}
