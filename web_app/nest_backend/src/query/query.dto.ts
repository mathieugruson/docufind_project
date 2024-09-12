import {IsEmail, IsString, IsUUID } from "class-validator"

export class SaveQuestionDto {
    
    @IsString()
    userPrompt: string

    @IsString()
    folderName: string

    @IsUUID("4")
    folderUuid: string

    @IsUUID("4")
    conversationUuid: string

}


export class QueryGatewayDto {
    
    @IsString()
    userPrompt: string

    @IsString()
    folderName: string

    @IsUUID("4")
    folderUuid: string

    @IsUUID("4")
    conversationUuid: string

    @IsUUID("4")
    questionUuid: string

}


export class QueryConversation {
    
    @IsUUID("4")
    conversationUuid: string

}