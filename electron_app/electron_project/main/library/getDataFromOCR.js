"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTextDataFromOCR = void 0;
const pdf = __importStar(require("pdfjs-dist"));
const tesseract_js_1 = require("tesseract.js");
const pdf2pic_1 = require("pdf2pic");
const fs = __importStar(require("node:fs"));
const getTextDataFromOCR = async (pdfFileName, pdfFilePath) => {
    const worker = await (0, tesseract_js_1.createWorker)("fra");
    const pdfDocument = await pdf.getDocument(pdfFilePath).promise;
    const textFromPdf = [];
    const pageNumberFromPdf = [];
    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
        const options = {
            density: 100,
            saveFilename: `${pdfFileName}`,
            savePath: "./",
            format: "png",
            width: 2480,
            height: 3508
        };
        const convert = (0, pdf2pic_1.fromPath)(pdfFilePath, options);
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
};
exports.getTextDataFromOCR = getTextDataFromOCR;
