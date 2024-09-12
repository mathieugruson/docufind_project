import {IsEmail, IsString, IsUUID } from "class-validator"

export class userFolderInfo {
    
    @IsUUID("4")
    id: string

    @IsString()
    folderName: string

}