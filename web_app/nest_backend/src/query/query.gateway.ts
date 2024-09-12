import { SubscribeMessage, WebSocketGateway, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit  } from '@nestjs/websockets';
import { Server, Socket } from "socket.io";
import { ConfigService } from '@nestjs/config';
import { QueryService } from './query.service';
import { WsJwtGuard } from 'src/auth/guards/ws-jwt.guard';
import { UseGuards } from '@nestjs/common';
import { QueryGatewayDto } from './query.dto';


interface AuthenticatedSocket extends Socket {
  user?: any; // Define the type of `user` according to your application needs
}

@WebSocketGateway({
  namespace: 'query',
  cors: {
    origin: '*', // Adjust according to your needs
  },
  transports: ['websocket', 'polling'], // Ensure WebSocket is allowed
})



@UseGuards(WsJwtGuard) // Apply the guard at the gateway level to protect all events
export class QueryGateway {
  constructor(
    protected configService: ConfigService,
    private readonly queryService: QueryService,
    
) {}

  @WebSocketServer()
  server: Server;


  @SubscribeMessage('ask')
  async query(@ConnectedSocket() client : AuthenticatedSocket, @MessageBody() body: QueryGatewayDto) {
    try {

      console.log('body', body);
      const username = client.user.username;

      const answer = await this.queryService.queryLLM(body, username)
      console.log('answer to send', answer);
      
      console.log('start emit');
      client.emit('query', answer);
      console.log('finish emit');

    return answer


  } catch (error) {
      console.error(error);
  }
  }
}
