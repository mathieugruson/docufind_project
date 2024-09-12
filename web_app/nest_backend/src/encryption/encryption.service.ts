import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from "node:fs";
import * as path from "node:path";

// TODO LATER : refactor this to make a propre encryption service 

const key = Buffer.from(process.env.ENCRYPTION_KEY, 'base64'); // If stored in base64

@Injectable()
export class EncryptionService {


    decryptString(text) {
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
      }
      
    encryptString(text) {
        const iv = crypto.randomBytes(16); // AES block size is 16 bytes
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

    decryptFileToBuffer(pdfFilePath) {
        const algorithm = 'aes-256-cbc';
        const encryptedWithIvBuffer = fs.readFileSync(pdfFilePath);
        const encryptedWithIv = new Uint8Array(encryptedWithIvBuffer);
        const iv = encryptedWithIv.slice(0, 16);
        const encryptedData = encryptedWithIv.slice(16);
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(Buffer.from(encryptedData));
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return { decrypted };
      }




      



}
