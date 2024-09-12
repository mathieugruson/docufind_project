import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from 'crypto';


// Ensure the encryption key is properly defined and secure
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'base64'); // If stored in base64

export const saveJsonData = (dirPath, filename, data) => {
  const databaseDirectory = path.join(dirPath, "/.dev");

  if (!fs.existsSync(databaseDirectory)) {
    fs.mkdirSync(databaseDirectory, { recursive: true });
  }

  const filePath = path.join(databaseDirectory, filename);
  
  // Convert data to Buffer and encrypt
  const dataBuffer = Buffer.from(JSON.stringify(data));
  const { encryptedData, iv } = encryptBuffer(dataBuffer);
  
  // Prepend IV to the encrypted data for storage
  const dataToSave = Buffer.concat([iv, encryptedData]);

  fs.writeFileSync(filePath, dataToSave);
}

function encryptBuffer(buffer) {
  const algorithm = 'aes-256-cbc';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  
  return {
    encryptedData: encrypted,
    iv: iv
  };
}
