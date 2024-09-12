import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request, Response, NextFunction } from 'express';
import { FolderCreationService } from './folder-creation.service';

// Define a custom request interface that includes the user and folderName properties
interface CustomRequest extends Request {
  user?: {
    username: string;
  };
  folderName?: string;
}

@Injectable()
export class FolderNameMiddleware implements NestMiddleware {
  constructor(private readonly folderCreationService: FolderCreationService,
    private jwtService : JwtService) {}

  async use(req: CustomRequest, res: Response, next: NextFunction) {


    const token = this.extractTokenFromHeader(req)
    
    if (!token) throw new UnauthorizedException()
        
    try {
        const payload = await this.jwtService.verifyAsync(token, {
            secret:process.env.jwtSecretKey,
        
        })
            
        req['user'] = payload
        const folderName = await this.folderCreationService.getfolderNameFromEmail(payload.username);
        req['folderName'] = folderName



    } catch (error) {
      console.error('Error fetching folder name:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
        
    }
    
    next();
  }

  private extractTokenFromHeader(request: Request) {
      const [type, token] = request.headers.authorization.split(' ') ?? []
  
      return type === 'Bearer' ? token: undefined
  
  }

}