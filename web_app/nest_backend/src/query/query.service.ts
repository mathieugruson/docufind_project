import { Injectable, NotFoundException } from '@nestjs/common';
import { sendQueryFromUser } from 'src/query/library/sendQueryFromUser';
import { getAllTextFromAllDocsInArray, getSummaryByRecursivity } from 'src/query/library/thirdSolutionForSummary';
import * as path from 'path';
import { FolderCreationService } from 'src/folder-creation/folder-creation.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryGatewayDto, SaveQuestionDto } from './query.dto';
import { UserService } from 'src/user/user.service';
import { decryptString, encryptString } from 'src/encryption/library/encryptionString';


@Injectable()
export class QueryService {
    constructor(
        private readonly folderCreationService: FolderCreationService,
        private readonly prisma: PrismaService,
        private readonly userService : UserService
    ) {}

    async queryLLM(body : QueryGatewayDto, userEmail : string) : Promise<string> {

        // TODO : il faut mettre un centre de tri pour savoir à quel fonction on fait appel

        let answer : string = 'answer'
        console.log('__dirname Query Service\n', __dirname);
        
        const backSecurityPath = await this.folderCreationService.getfolderNameFromEmail(userEmail);
        const fullPathToDB = path.join(__dirname, '..', '..', 'upload', backSecurityPath, body.folderName, '.dev/lancedb');
        const fullPathToFiles = path.join(__dirname, '..', '..', 'upload', backSecurityPath, body.folderName);

        console.log('queryLLM fullPathToDB\n', fullPathToDB);
        

        if (1)  { // short question
          answer = await sendQueryFromUser(body.userPrompt, fullPathToDB)
        } 


        if (0) { // long question
            const textsArrayFromAllDocs = await getAllTextFromAllDocsInArray(fullPathToFiles)
            // @ts-ignore
            answer = await getSummaryByRecursivity(textsArrayFromAllDocs, query)

        }
        
        // answer = `Le chômeur mentionné dans le document est M. GRUSON Mathieu, résidant au 1 RUE DU RETRAIT, 75020 PARIS. Cette information provient de l'attestation des périodes d'inscription délivrée par Pôle emploi, datée du 1 mars 2024, et est indiquée dans le document référencé comme mi/attestation_des_periodes_inscription(1).pdf page 0 (<span>mi/attestation_des_periodes_inscription(1).pdf page 0</span>).`

        await this.storeAnswerViaQuestionId(body, userEmail, answer) // TODO : add the uuid of the folder to

        return answer
    }

    async storeAnswerViaQuestionId(body : QueryGatewayDto, userEmail: string, answerContent: string) {
        // Assuming a userEmail, folderName, questionContent, and answerContent are provided
        
        // First, find the UserFolder based on folderName and userEmail
        console.log('storeAnswerViaQuestionId body : ', body);
        
        const userFolder = await this.prisma.userFolder.findUnique({
            where: {
                id: body.folderUuid,
                user: {
                    email: userEmail,
                },
            },
        });

        if (!userFolder) {
            throw new NotFoundException('UserFolder not found');
        }        
        
        // TODO CRYPTER LA REPONSE

        const encryptedAnswer = encryptString(answerContent)

        const answer = await this.prisma.conversation.update({
            where: {
              id: body.questionUuid,
            },
            data: {
                answerContent: encryptedAnswer, // This step might be redundant depending on your Prisma setup and relation configuration
            },
          });

        return { answer }; // Returning both for demonstration; adjust as needed
    }

    async getConversationWithQuestionsAndAnswers(conversationUuid: string, userEmail: string): Promise<any> {
        // 1. Fetch the user_id for security reasons
        const user: any = await this.userService.findByEmail(userEmail);
        console.log('user', user);
        
        // 2. Fetch the conversation folder along with its questions and their answers
        const conversationFolder = await this.prisma.conversationFolder.findUnique({
            where: {
                id: conversationUuid,
                userFolder: {
                    userId: user.id,
                },
            },
            include: {
                // Including questions (termed as 'conversations' in your schema)
                conversations: true, // This will include all fields of conversations, including questionContent and answerContent
            },
        });
        
        if (!conversationFolder) {
            throw new Error("conversationFolder not found or you don't have permission to access it");
        }

        decryptString
        
        const conversationsData = conversationFolder.conversations.map((conversation, index) => ({
              conversationIndex: index,
              conversationId: conversation.id,
              questionContent: decryptString(conversation.questionContent),
              answerContent: decryptString(conversation.answerContent),
              // Add any other conversation properties you need to send
            }))


        console.log('getConversationWithQuestionsAndAnswers conversationsData\n', conversationsData);

        // Check if conversation exists
    
        return conversationsData;
    }

    async saveQuestionAndReturnId(body : SaveQuestionDto, userEmail : string) : Promise<any> {

        console.log('saveQuestionAndReturnId body : ', body);
        
        const userFolder = await this.prisma.userFolder.findUnique({
            where: {
                id: body.folderUuid,
                user: {
                    email: userEmail,
                },
            },
        });

        if (!userFolder) {
            throw new NotFoundException('UserFolder not found');
        }

        // Then, find or create a Conversation within this folder (simplified: assuming one conversation per folder for this example)
        
        let conversation
        if (body.conversationUuid == '') {
            conversation = await this.prisma.conversationFolder.create({
                data : {
                    folderName : body.folderName,
                    userFolder : {
                        connect : {
                            id: userFolder.id
                        }
                    }
                }
            });
        } else {
            conversation = await this.prisma.conversationFolder.findUnique({
                where: {
                    id: body.conversationUuid,
                },
            });
        }

        console.log('saveQuestionAndReturnId conversation : ', conversation);
        
        const encryptedUserPrompt = encryptString(body.userPrompt)

        // Next, create the Question within this conversation
        const question = await this.prisma.conversation.create({
            data: {
                questionContent: encryptedUserPrompt,
                conversation : {
                    connect : {
                        id : conversation.id
                    }
                }
            },
        });

        const conversationUuid = conversation.id
        const questionUuid = question.id

        return { conversationUuid, questionUuid } 


    }
}
