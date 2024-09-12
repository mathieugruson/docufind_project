import { Injectable, NotFoundException } from '@nestjs/common';
import { createFolderWorkSpace } from 'src/folder-creation/library/createFolderWorkSpace';
import { FolderCreationGateway } from './folder-creation.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { readDirectoryStructure } from './library/readDirectoryStructure';

type CreateFolderWorkSpaceType = {
    folderPath: string;
    language: string;
}

@Injectable()
export class FolderCreationService {
    constructor(
        private readonly folderCreationGateway: FolderCreationGateway,
        private readonly userService : UserService,
        private readonly prisma: PrismaService

    ) {}


    async getOcrAndVectorizationDone(folderInfo: CreateFolderWorkSpaceType) : Promise<any[]> {
        this.folderCreationGateway.emitProgress({ message: `Processing start` });

        return await createFolderWorkSpace(folderInfo, this.folderCreationGateway)
        
    }

    async getfolderNameFromEmail(email : string) {

        const user = await this.userService.findByEmail(email)

        console.log('getfolderNameFromEmail user\n', user);
        console.log('getfolderNameFromEmail user.fileFolder\n', user.fileFolder);

        
        return user.fileFolder

    }

    async createUserFolder(userEmail: string, folderName: string) {
        // Retrieve the user by their email
        const user = await this.prisma.user.findUnique({
          where: {
            email: userEmail,
          },
        });
    
        // Throw an exception if the user doesn't exist
        if (!user) {
          throw new NotFoundException('User not found');
        }

        return await this.prisma.userFolder.create({
            data: {
              folderName,
              user : {
                connect : {
                  id : user.id,
                }
              }
            },
            select: {
              id: true,
              folderName: true,
              // Notice that userId is not included here
            },
          });

    }

    async getDirectoryStructure(folderPath: string) : Promise<any[]> {
      const { tree: dirItems, fileCount }  = await readDirectoryStructure(folderPath)
      return dirItems

    }



    


}