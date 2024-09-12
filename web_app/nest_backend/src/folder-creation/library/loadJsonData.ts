import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from 'crypto';


const key = Buffer.from(process.env.ENCRYPTION_KEY, 'base64'); // If stored in base64


export const loadJsonData = (dirPath, filename) => {
  
    const databaseDirectory = path.join(dirPath, "/.dev");
  
    try {
      const filePath = path.join(databaseDirectory, filename);
      const { decrypted } = decryptFileToBuffer(filePath);
      
      // Assuming decrypted is already a Buffer of the original JSON data
      const dataJson = JSON.parse(decrypted.toString());
  
      return dataJson;
  
    } catch (error) {
        console.error('Error reading data from file:', error);
        return null;
    }
  }
  
  function decryptFileToBuffer(pdfFilePath) {
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
  