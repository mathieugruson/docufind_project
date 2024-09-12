import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/auth.dto';
import { UserService } from 'src/user/user.service';
import { compare } from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { hash } from 'bcrypt'


const EXPIRE_TIME = 60 * 1000 * 60 * 5

@Injectable()
export class AuthService {
    constructor(private userService: UserService,
        private jwtService : JwtService) {}


    async login(dto: LoginDto) {

        console.log('c1');
        

        const user = await this.validateUser(dto)

        console.log('c2 : ', user);
        const payload = {
            username : user.email,
            sub: {
                name: user.name,
            }
        }

        console.log('process.env.jwtSercretKey\n', process.env.jwtSecretKey);
        console.log('process.env.jwtRefreshTokenKey\n', process.env.jwtRefreshTokenKey);

        return {
            user,
            backendTokens :{
                accessToken : await this.jwtService.signAsync(payload, {
                    expiresIn: '1h',
                    secret: process.env.jwtSecretKey,
                }),
                refreshToken : await this.jwtService.signAsync(payload, {
                    expiresIn: '7d',
                    secret: process.env.jwtRefreshTokenKey,
                })

            }
        }


    }

    async validateUser(dto: LoginDto) {

        const user = await this.userService.findByEmail(dto.username)

        console.log('user : ', user);
        
        if (user && (await compare(dto.password, user.password))) {
            console.log('ok');
            
            const { password, ...result} = user;
            return result
        }

        console.log('ko');
        
        throw new UnauthorizedException();

    }

    async refreshToken(user : any){
        
        const payload = {
            username : user.username,
            sub: user.sub
        }

        return {
            user,
            backendTokens :{
                accessToken : await this.jwtService.signAsync(payload, {
                    expiresIn: '5h',
                    secret: process.env.jwtSecretKey,
                }),
                refreshToken : await this.jwtService.signAsync(payload, {
                    expiresIn: '7d',
                    secret: process.env.jwtRefreshTokenKey,
                }),
                expiresIn : new Date().setTime(new Date().getTime() + EXPIRE_TIME)
            }
        }

    }

}