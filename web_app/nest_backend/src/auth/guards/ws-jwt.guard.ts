import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io'; // Make sure to import Socket


interface AuthenticatedSocket extends Socket {
    user?: any; // Define the type of `user` according to your application needs
  }

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean>  {
    const client: AuthenticatedSocket = context.switchToWs().getClient<AuthenticatedSocket>();
    let token: string;

    // Retrieve the token from the query parameter
    token = Array.isArray(client.handshake.query.token) ? client.handshake.query.token[0] : client.handshake.query.token;

    
    try {
    
        console.log('ICI');

        const user = await this.jwtService.verifyAsync(token, {
            secret:process.env.jwtSecretKey,
        
        })

      console.log('AUTH SOCKET SUCCEED\n');
      
      client.user = user; // Attach the user to the client object
      return true;
    } catch (e) {
        console.log('FAILED');
        
      throw new WsException('Invalid token');
    }
  }
}