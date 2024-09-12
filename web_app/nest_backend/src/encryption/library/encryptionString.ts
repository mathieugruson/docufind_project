import * as crypto from 'crypto';

const key = Buffer.from(process.env.ENCRYPTION_KEY, 'base64'); // If stored in base64

export function decryptString(text) {

    console.log('text : ', text);
    
    try {
        let textParts = text.split(':');
        console.log('textParts.length : ', textParts.length);
        
        if (textParts.length < 2) {
            throw new Error('Invalid input text format for decryption');
        }

        let iv = Buffer.from(textParts.shift(), 'hex');
        if (iv.length !== 16) {
            throw new Error('Invalid IV length: IV must be 16 bytes long');
        }

        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption error:', error.message);
        throw error; // Rethrow or handle as appropriate for your application
    }
}

  
export function encryptString(text) {
    const iv = crypto.randomBytes(16); // AES block size is 16 bytes
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }