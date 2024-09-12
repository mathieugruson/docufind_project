// src/folder-creation/folder-creation.module.ts
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { FolderCreationController } from './folder-creation.controller';
import { FolderCreationService } from './folder-creation.service';
import { FolderCreationGateway } from './folder-creation.gateway';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { FolderNameMiddleware } from './folder-creation.middleware'; // Adjust the path as necessary
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [FolderCreationController],
  providers: [
    FolderCreationService, 
    FolderCreationGateway, 
    JwtService, 
    UserService, 
    PrismaService
  ],
  exports: [FolderCreationService, FolderCreationGateway], // Export the providers so they can be used in other modules

})
export class FolderCreationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(FolderNameMiddleware) // Apply FolderNameMiddleware
      .forRoutes(FolderCreationController); // Apply it for all routes in FolderCreationController
  }
}