import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './user.dto';
import { hash } from 'bcrypt'
// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService){}

    async create(dto:CreateUserDto){
        const user = await this.prisma.user.findUnique({
            where: {
                email : dto.email,
            }
        })        
        
        if (user) {
            throw new ConflictException('email duplicated')
        } 
        
        const newUser = await this.prisma.user.create({
            
            data: {
                ...dto,
                password : await hash(dto.password, 10)
            }
        })

        const { password, ...result } = newUser
        
        return result
        
    }

    async findByEmail(email : string) {
        return await this.prisma.user.findUnique({
            where: {
                email: email,
            }
        })
    }


}