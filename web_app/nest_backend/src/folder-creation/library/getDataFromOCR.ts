import * as pdf from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import { fromPath } from "pdf2pic";
import * as fs from "node:fs";
import * as crypto from 'crypto';
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const { createCanvas } = require('canvas');
import { fromBuffer } from 'pdf2pic'

const key = Buffer.from(process.env.ENCRYPTION_KEY, 'base64'); // If stored in base64

async function convertPdfPageToImageBuffer(pdfData, pageNumber) {
    // Load the PDF file

    const pdf2picOptions = {
        format: 'png',
        width: 2550,
        height: 3300,
        density: 330,
        // savePath: './output/from-buffer-to-base64', // This line is commented out
      }
      
      const convert = fromBuffer(pdfData, pdf2picOptions)
      
      const pageOutputBuffer = await convert(pageNumber, {responseType: "buffer"})

      const arrayBuffer = pageOutputBuffer.buffer;


      return arrayBuffer
}


  function decryptBuffer(pdfFilePath) {
    const algorithm = 'aes-256-cbc';
    
    const encryptedWithIvBuffer = fs.readFileSync(pdfFilePath);

    // Convert the Buffer to Uint8Array to avoid using Buffer.slice()
    const encryptedWithIv = new Uint8Array(encryptedWithIvBuffer);
  
    // Extracting the IV and encrypted data using Uint8Array.prototype.slice() to create a copy
    const iv = encryptedWithIv.slice(0, 16);
    const encryptedData = encryptedWithIv.slice(16);
  
    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    let decrypted = decipher.update(Buffer.from(encryptedData));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    const decryptedData = new Uint8Array(decrypted);

    return {decryptedData, decrypted};
  }

export const getTextDataFromOCR = async (pdfFileName : string, pdfFilePath : string, socket : any) : Promise<[string[], number[]]> => {

    console.log('getTextDataFromOCR pdfFilePath : ', pdfFilePath);
    
    const {decryptedData, decrypted} = decryptBuffer(pdfFilePath)

    const worker = await createWorker("fra");
    const pdfDocument = await pdf.getDocument({data: decryptedData}).promise;

    const textFromPdf: string[] = [];
    const pageNumberFromPdf: number[] = [];

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
        const imageBuffer = await convertPdfPageToImageBuffer(decrypted, pageNumber); // Implement this function


        const { data: { text } } = await worker.recognize(imageBuffer);

        textFromPdf.push(text);
        pageNumberFromPdf.push(pageNumber);

        // Emit progress through socket
        socket.emitProgress({
            status: 'loading',
            fileName: pdfFileName, // Or adjust as needed without .enc
            totalPages: pdfDocument.numPages,
            pageTreated: pageNumber,
        });
    }

    await worker.terminate();

    console.log('textFromPdf\n', textFromPdf);
    

    return [textFromPdf, pageNumberFromPdf];
};

export const getTextDataFromOCR_former = async (pdfFileName : string, pdfFilePath : string, socket : any) : Promise<[string[], number[]]> => {

  const worker = await createWorker("fra");
  const pdfDocument = await pdf.getDocument(pdfFilePath).promise;
  const textFromPdf : string[] = []
  const pageNumberFromPdf : number[] = []

   for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {

      const options = {
          density: 100,
          saveFilename: `${pdfFileName}`,
          savePath: "./",
          format: "png",
          width: 2480,
          height: 3508
      };
      const convert = fromPath(pdfFilePath, options);
      console.log('convert ', convert);

      const pageToConvertAsImage = pageNumber;

      await convert(pageToConvertAsImage, { responseType: "image" })
          .then((resolve) => {
              console.log("Page 1 is now converted as image");
              console.log('resolve :', resolve);

              return resolve;
          });

      const ret = await worker.recognize(`${pdfFileName}.${pageToConvertAsImage}.png`);

      await fs.promises.unlink(`${pdfFileName}.${pageToConvertAsImage}.png`).catch((error) => {
          console.error(`Error deleting file ${pdfFileName}.${pageToConvertAsImage}.png: ${error.message}`);
      });

      // tosave file in txt to  make test on chatGPT
      // const outputFolder = './dev_files';
      // const textFileName = `${outputFolder}/${pdfFileName}_page_${pageNumber}.txt`;
      // await fs.promises.writeFile(textFileName, ret.data.text);

      textFromPdf.push(ret.data.text);
      pageNumberFromPdf.push(pageNumber);
      
      const loadingStatus = {
          status : 'loading',
          fileName : pdfFileName,
          totalPages : pdfDocument.numPages,
          pageTreated : pageNumber,
      }

      socket.emitProgress(loadingStatus)

  }

  await worker.terminate();
  await fs.promises.unlink(`fra.traineddata`).catch((error) => {
      console.error(`Error deleting file fra.traineddata: ${error.message}`);
  });


  return [textFromPdf, pageNumberFromPdf];
}