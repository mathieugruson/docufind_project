"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectFolderPath = void 0;
const electron_1 = require("electron");
const selectFolderPath = async (browserWindow) => {
    const result = await electron_1.dialog.showOpenDialog(browserWindow, {
        properties: ['openDirectory'],
    });
    if (result.canceled)
        return;
    const [dirPath] = result.filePaths;
    console.log('filePath\n', dirPath);
    return dirPath;
};
exports.selectFolderPath = selectFolderPath;
