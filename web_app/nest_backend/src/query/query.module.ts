import { Module } from '@nestjs/common';
import { QueryController } from './query.controller';
import { QueryService } from './query.service';
import { QueryGateway } from './query.gateway';
import { JwtService } from '@nestjs/jwt';
import { FolderCreationModule } from 'src/folder-creation/folder-creation.module'; // Adjust the path as necessary
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [FolderCreationModule], // Import the FolderCreationModule
  controllers: [QueryController],
  providers: [QueryService, QueryGateway, JwtService, UserService, PrismaService],
})
export class QueryModule {}