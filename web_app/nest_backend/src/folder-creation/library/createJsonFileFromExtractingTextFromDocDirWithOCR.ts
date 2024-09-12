import { readdir } from 'node:fs/promises';
import { Dirent } from 'node:fs';
import mammoth, { convertToHtml } from 'mammoth';

import * as path from 'node:path';
//Own Library
import { getTextDataFromOCR } from './getDataFromOCR';
import * as fs from "node:fs";
import puppeteer, {PDFOptions} from 'puppeteer';
import { saveJsonData } from './saveJsonData';

function getFileName(filePath : string) {
    // Get the last portion of the path (in case it's a path)
    const baseName = filePath.split('/').pop();
    // Find the last dot where the extension starts
    const dotIndex = baseName?.lastIndexOf('.');
    // If there is no dot, return the whole name; otherwise, return the part before the dot
    if (!dotIndex)
        return baseName
    return dotIndex === -1 ? baseName : baseName?.substring(0, dotIndex);
}

function getFileExtension(filePath : string) {
    // Get the last portion of the path (in case it's a path)
    const baseName = filePath.split('/').pop();
    // Find the last dot where the extension starts
    const dotIndex = baseName?.lastIndexOf('.');
    // If there is no dot, return an empty string; otherwise, return the part after the dot
    if (!dotIndex)
        return baseName
    return dotIndex === -1 ? '' : baseName?.substring(dotIndex + 1);
}

async function createPdfFromHtml(htmlContent: string, outputPath: string) {
    try {

      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: "new" // Opt into the new headless mode
      });
      const page = await browser.newPage();
  
      // Set content with proper UTF-8 encoding for consistent rendering
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
      // Customize PDF options with correct format type
      const pdfOptions : PDFOptions = {
        format: 'A4', // Adjust format as needed (e.g., 'Letter', 'Legal')
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
        printBackground: true, // Include background elements (if desired)
      };
  
      const pdfBuffer = await page.pdf(pdfOptions);
  
      await browser.close(); // Close the browser instance
  
      await fs.promises.writeFile(outputPath, pdfBuffer); // Write PDF data to file using promises
  
      console.log(`PDF Generated: ${outputPath}`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Handle errors appropriately (e.g., log to a file, notify an administrator)
    }
  }


  async function processDocxFile(item, itemPath, socket) {
    const result = await convertToHtml({ path: itemPath });
    var html = result.value; // The generated HTML
    const pdfOutputPath = path.join(path.dirname(itemPath), `/.dev/${path.basename(itemPath, '.docx')}.pdf`);
    console.log('processDocxFile pdfOutputPath\n', pdfOutputPath);
    
    await createPdfFromHtml(html, pdfOutputPath);
    const [texts, pageNumbers] = await getTextDataFromOCR(item.name, pdfOutputPath, socket);
    saveJsonData(path.dirname(itemPath), `${item.name}.json`, { texts, pageNumbers });
    return pageNumbers[pageNumbers.length - 1];
}

async function processPdfFile(item, itemPath, socket) {
    const [texts, pageNumbers] = await getTextDataFromOCR(item.name, itemPath, socket);
    saveJsonData(path.dirname(itemPath), `${item.name}.json`, { texts, pageNumbers });
    return pageNumbers[pageNumbers.length - 1];
}

const fileProcessors = {
    'docx': processDocxFile,
    'pdf': processPdfFile,
    'enc': processPdfFile,

};

async function createJsonFileFromExtractingTextFromDocDirWithOCR(dirPath, socket) {
    const dirItems: Dirent[] = await readdir(dirPath, {
        encoding: 'utf-8',
        withFileTypes: true,
    })

    let totalFilesPages = 0;


    
    for (const item of dirItems) {
        if (6) {
            console.log('\ncreateJsonFileFromExtractingTextFromDocDirWithOCR');
            console.log('dirPath678 : ', dirPath);
            console.log('item.name : ', item.name);
            console.log('TEST');
            
        }
        const subDirPath = path.join(dirPath, item.name);

        if (item.isDirectory() && item.name && item.name !== '.dev') {
            const totalSubFilesPages = await createJsonFileFromExtractingTextFromDocDirWithOCR(subDirPath, socket);
            totalFilesPages += totalSubFilesPages;
        } else {
            const fileExtension = path.extname(item.name).substring(1);
            const fileName2 = getFileName(item.name)
            const fileExtensionName2 = getFileExtension(item.name)
            
            if (fileProcessors[fileExtension]) {
                const pages = await fileProcessors[fileExtension](item, subDirPath, socket);
                totalFilesPages += pages;
            }
        }
    }

    return totalFilesPages;
}

export default createJsonFileFromExtractingTextFromDocDirWithOCR
