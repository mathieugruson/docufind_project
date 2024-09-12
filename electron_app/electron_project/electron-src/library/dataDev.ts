import * as fs from "node:fs";
import * as path from "node:path";

const dataDirectory = './dev_files';

// type OCRData = {
//   texts: string[],
//   pageNumbers: number[]
// };

export const saveDevData = (filename : string, data : any) => {

    if (!fs.existsSync(dataDirectory)) {
        fs.mkdirSync(dataDirectory);
      }

      const filePath = path.join(dataDirectory, filename);
      fs.writeFileSync(filePath, JSON.stringify(data));

  }

export const loadDevData = (filename : string) => {

    try {
      const filePath = path.join(dataDirectory, filename);
      const dataString = fs.readFileSync(filePath, 'utf8');
      const dataJson = JSON.parse(dataString);
      // console.log('test ', test);
      
      return dataJson
    } catch (error) {
        console.error('Error reading data from file:', error);
        return null;
    }
  }
