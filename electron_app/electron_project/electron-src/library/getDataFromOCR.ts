import * as pdf from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import { fromPath } from "pdf2pic";
import * as fs from "node:fs";

export const getTextDataFromOCR = async (pdfFileName : string, pdfFilePath : string) : Promise<[string[], number[]]> => {

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

        // to save file in txt to make test on chatGPT
        // const outputFolder = './dev_files';
        // const textFileName = `${outputFolder}/${pdfFileName}_page_${pageNumber}.txt`;
        // await fs.promises.writeFile(textFileName, ret.data.text);

        textFromPdf.push(ret.data.text);
        pageNumberFromPdf.push(pageNumber);
    }

    await worker.terminate();
    await fs.promises.unlink(`fra.traineddata`).catch((error) => {
        console.error(`Error deleting file fra.traineddata: ${error.message}`);
    });
    return [textFromPdf, pageNumberFromPdf];
}