import { Controller, Res, Post, Get, UseGuards, Headers, Body, HttpCode, UploadedFile, UseInterceptors, Req, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FolderCreationService } from './folder-creation.service';
import { diskStorage } from 'multer';
import * as multer from 'multer';
import { v4 as uuidv4} from 'uuid';
import * as path from "node:path";
import { JwtGuard } from 'src/auth/guards/jwt.guards';
import { Response } from 'express';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as stream from 'stream';
import { userFolderInfo } from './dto/folder-creation.dto';

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.docx', '.txt'];
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'base64'); // If stored in base64
// const iv = Buffer.from(process.env.ENCRYPTION_IV, 'base64'); // If stored in base64

@Controller('folder-creation')
export class FolderCreationController {
    constructor(
        private readonly folderCreationService: FolderCreationService,
        ) {}

    @UseGuards(JwtGuard)
    @Post('file-former-path')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                // Extract the path from the request, assuming it's sent as a form field
                // req.query.path = name of the folder chosen by the user 
                const relativePath : any = req.query.path || ''; // Adjust based on how you send the path
                if (1) {

                    console.log('\n\nreq.query.path\n', req.query.path);
                    console.log('relativPth\n',relativePath);
                    console.log('req.user\n', req.user);
                    // @ts-ignore
                    console.log('req.user.username\n', req.user.username);
                    // @ts-ignore
                    console.log('req.folderName\n', req.folderName);
                }
                // @ts-ignore
                const folderName = req.folderName

                const baseDir = `./upload/${folderName}`; // Base directory for uploads
                // const  : string = uuidv4();

                const fullPath = path.join(baseDir, relativePath);
                console.log('\nfullPath\n' ,fullPath);
                

                // Create directory if it doesn't exist (optional)
                ensureDirectoryExists(fullPath);
                console.log('c');
                
                cb(null, fullPath);
            },
            filename: (req, file, cb) => {

                console.log('file\n', file);
                
                const filename: string = path.parse(file.originalname).name.replace(/\s/g, '')
                console.log('filename\n', filename);
                
                const extension: string = path.parse(file.originalname).ext;
                cb(null, `${filename}${extension}`)
            }
        }),
        limits: {
            fileSize: 1024 * 1024 * 10, // 10MB
        },
    }))
    async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req) {
        // Implement logic to handle the file after upload
        // For example, save file information to database, etc.
        const fileName: string = file.filename;
        const filePath: string = file.path; // This includes the dynamic path

        // Placeholder for service logic
        // return await this.settingsService.handleUploadedFile(file);

        // For demonstration, just return a simple object

        return { fileName, filePath };
    }

    
    @UseGuards(JwtGuard)
    @Post('files')
    @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
    async uploadFileBis(@UploadedFile() file: Express.Multer.File, @Req() req) {
        // Derive folder and file path
        const folderName = req.folderName || 'default'; // Make sure this is correctly derived from req
        const baseDir = `./upload/${folderName}`;
        const relativePath = req.query.path || ''; // Adjust based on how you send the path
        const fullPath = path.join(baseDir, relativePath);
        const fileName = path.parse(file.originalname).name.replace(/\s/g, '');
        const extension = path.parse(file.originalname).ext;
        const encryptedFilePath = path.join(fullPath, `${fileName}${extension}`);
    
        // Ensure directory exists
        ensureDirectoryExists(fullPath); 

        const { encryptedData, iv } = encryptBuffer(file.buffer);

        // You may want to prepend the IV to the encrypted data or store it separately
        // For simplicity, we'll prepend it here
        const fileDataWithIv = Buffer.concat([iv, encryptedData]);
        
        // Save the encrypted file with IV
        fs.writeFileSync(encryptedFilePath, fileDataWithIv);

        // ici creer le dossier et renvoyer cette info ? oui 

        return { fileName: `${fileName}${extension}`, filePath: encryptedFilePath };
    }

    
    @UseGuards(JwtGuard)
    @Get('process-directory')
    @HttpCode(202) // Use 202 to indicate the request has been accepted for processing
    async createFolderWorkSpace(@Headers() head, @Req() req) {
        const folder: any = req.query.folder || ''; 
    
        // Extract necessary info for processing
        const userEmail = req.user.username;
        const folderName = await this.folderCreationService.getfolderNameFromEmail(userEmail);
        const folderPath = `./upload/${folderName}/${folder}`;
    
        // Initiate processing without awaiting completion
        
        const userFolderResult = await this.folderCreationService.createUserFolder(userEmail, folder);
        
        this.startFolderProcessing(folderPath, userEmail, folder); // Example method to handle processing
        // Immediately return a response indicating the process is accepted
        return { userFolderResult };
    }
    
    // Example method to handle processing in the background
    async startFolderProcessing(folderPath: string, userEmail: string, folder: string) {
        const folderInfoTest = {
            folderPath: folderPath,
            language: 'fr'
        };
    
        try {
            const itemDirectoryResult = await this.folderCreationService.getOcrAndVectorizationDone(folderInfoTest);
    
            // Handle the results of the processing here, such as logging or updating the database
            console.log('Processing completed', { itemDirectoryResult });
        } catch (error) {
            // Handle any errors that occur during processing
            console.error('Error during folder processing', error);
        }
    }

    @UseGuards(JwtGuard)
    @Get('serve-directory')
    async serveFolder(@Req() req, @Res() res: Response) {

        const folder: any = req.query.folder || ''; 
    
        // Extract necessary info for processing
        const userEmail = req.user.username;
        console.log('userEmail\n', userEmail);
        
        const folderName = await this.folderCreationService.getfolderNameFromEmail(userEmail);
        const folderPath = `./upload/${folderName}/${folder}`;
        const folderStructure = await this.folderCreationService.getDirectoryStructure(folderPath)

        return {
            folderStructure
        }

    }

    @UseGuards(JwtGuard)
    @Post('serve-file')
    async serveFile(@Body() body: { filePath: string }, @Req() req, @Res() res: Response) {
        const { filePath } = body;

        const backSecurityPath = await this.folderCreationService.getfolderNameFromEmail(req.user.username);
        let fullFilePath: string;

        try {
            if (filePath.endsWith('.docx')) {
                // Split the filePath to directory path and file name
                const dirPath = path.dirname(filePath);
                console.log('dirPath : ', dirPath);
                
                const fileName = path.basename(filePath, '.docx');
                console.log('fileName : ', fileName);
    
                // Construct the new path with /.dev/ just before the file name
                const newFilePath = path.join(dirPath, '.dev', `${fileName}.pdf`);
                console.log('newFilePath : ', newFilePath);
    
    
                // Adjust the path to include .dev before the file name
                fullFilePath = path.join(__dirname, '..', '..', 'upload', backSecurityPath, newFilePath);
                console.log('fullFilePath : ', fullFilePath);
                
    
            } else {
              // For other file types, use the original logic
              fullFilePath = path.join(__dirname, '..', '..', 'upload', backSecurityPath, filePath);
            }
        
            // Decrypt the file content
            const { decrypted } = decryptBuffer(fullFilePath);

            // Set appropriate headers for the file response
            // Adjust these headers based on the actual file type and content you expect to send
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=file.pdf');
            
            // Stream the decrypted content to the client
            const readStream = new stream.PassThrough();
            readStream.end(decrypted);

            readStream.pipe(res);
        } catch (error) {
            console.error('Error serving file:', error);
            res.status(500).send('Error serving file');
        }
    }


}

// TODO : handle the pb of blocking sometimes
// https://chat.openai.com/share/a3212da9-68c9-481a-8046-cae4dd2cea42
function ensureDirectoryExists(dirPath: string) {
    console.log('dirPath\n', dirPath);

    const fs = require('fs');
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        console.log('Directory ensured:', dirPath);
    } catch (error) {
        console.error('Error ensuring directory:', error);
    }

    console.log('finish');
}

function encryptBuffer(buffer) {

    const algorithm = 'aes-256-cbc'; // AES-256 in CBC mode
    const iv = crypto.randomBytes(16); // IV is random for each encryption
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  
    return {
      encryptedData: encrypted,
      iv: iv
    };
}

function decryptBuffer(pdfFilePath) {
    const algorithm = 'aes-256-cbc';
    // Ensure the key is correctly initialized
    const encryptedWithIvBuffer = fs.readFileSync(pdfFilePath);
    const encryptedWithIv = new Uint8Array(encryptedWithIvBuffer);
    const iv = encryptedWithIv.slice(0, 16);
    const encryptedData = encryptedWithIv.slice(16);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(Buffer.from(encryptedData));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return { decrypted };
}