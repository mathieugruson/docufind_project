import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { CreateUserDto } from 'src/user/user.dto';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { RefreshJwtGuard } from './guards/refresh.guards';

@Controller('auth')
export class AuthController {
    constructor(private userService: UserService, 
        private authService: AuthService){}


    @Post('register')
    async registerUser(@Body() dto: CreateUserDto) {
        console.log('dto\n', dto);
        return await this.userService.create(dto)
    }

    @Post('login')
    async login(@Body() dto: any) {
        console.log('TEST LOGIN');
        return await this.authService.login(dto);
    }

    @UseGuards(RefreshJwtGuard)
    @Post('refresh')
    async refreshToken(@Request() req) {
        return await this.authService.refreshToken(req.user)
    }




}
