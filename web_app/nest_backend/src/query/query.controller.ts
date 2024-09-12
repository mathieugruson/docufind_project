import { Controller, Res, Post, Get, UseGuards, Headers, Body, HttpCode, UploadedFile, UseInterceptors, Req, BadRequestException } from '@nestjs/common';
import { QueryService } from './query.service';
import { JwtGuard } from 'src/auth/guards/jwt.guards';
import { QueryConversation, SaveQuestionDto } from './query.dto';





@Controller('query')
export class QueryController {
    constructor(
        private readonly queryService: QueryService,
        ) {}

    @UseGuards(JwtGuard)
    @Post('conversation')
    @HttpCode(200)
    async getConversationWithQuestionsAndAnswers(@Headers() head, @Body() body: QueryConversation , @Req() req) {

        // get useremail 
        console.log('body : ', body);
        

        const result = await this.queryService.getConversationWithQuestionsAndAnswers(body.conversationUuid, req.user.username);


        return result
    }


    @UseGuards(JwtGuard)
    @Post('save-question')
    @HttpCode(200)
    async saveQuestionAndReturnId(@Headers() head, @Body() body: SaveQuestionDto , @Req() req) {

        // get useremail 
        console.log('body : ', body);
        

        const { conversationUuid, questionUuid }  = await this.queryService.saveQuestionAndReturnId(body, req.user.username);

        console.log('conversationUuid :', conversationUuid);
        
        return { conversationUuid, questionUuid }
    }



}
