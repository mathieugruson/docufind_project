"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Native
const path_1 = require("path");
const url_1 = require("url");
const promises_1 = require("fs/promises");
// const os = require('node:os')
// const path = require('node:path')
// Packages
const electron_1 = require("electron");
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const electron_next_1 = __importDefault(require("electron-next"));
// Library
const selectFolderPath_1 = require("./library/selectFolderPath");
const sendQueryFromUser_1 = require("./library/sendQueryFromUser");
const createFolderWorkSpace_1 = require("./library/createFolderWorkSpace");
const getCurrentFile = (browserWindow) => {
    if (currentFile.filePath)
        return currentFile.filePath;
    if (!browserWindow)
        return;
    return showSaveDialog(browserWindow);
};
const setCurrentFile = (browserWindow, filePath, content) => {
    currentFile.filePath = filePath;
    currentFile.content = content;
    browserWindow.setTitle(`${(0, path_1.basename)(filePath)} - ${electron_1.app.name}`);
    browserWindow.setRepresentedFilename(filePath);
};
const hasChanges = (content) => {
    return currentFile.content !== content;
};
let currentFile = {
    content: '',
    filePath: undefined
};
// const reactDevToolsPath = path.join(
//     os.homedir(),
//     '.config/google-chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/5.0.0_0'
//   )
electron_1.app.whenReady().then(async () => {
    // await session.defaultSession.loadExtension(reactDevToolsPath)
    electron_1.protocol.handle('atom', (request) => {
        return electron_1.net.fetch('file://' + request.url.slice('atom://'.length));
    });
});
electron_1.app.on('ready', async () => {
    await (0, electron_next_1.default)('./renderer');
    const mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            //   contextIsolation: true,
            webSecurity: false,
            preload: (0, path_1.join)(__dirname, 'preload.js'),
        },
    });
    const url = electron_is_dev_1.default
        ? 'http://localhost:8000/'
        : (0, url_1.format)({
            pathname: (0, path_1.join)(__dirname, '../renderer/out/index.html'),
            protocol: 'file:',
            slashes: true,
        });
    mainWindow.loadURL(url);
    mainWindow.once('ready-to-show', () => {
        const contents = mainWindow.webContents;
        console.log('content :' + contents);
        // mainWindow.webContents.loadURL(`file:///mnt/nfs/homes/mgruson/Downloads/ft_transcendence_sujet.pdf.pdf`);
        mainWindow.show();
        mainWindow.focus();
        // showOpenDialog(mainWindow)
    });
});
// /mnt/nfs/homes/mgruson/.config/google-chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi
// Quit the app once all windows are closed
electron_1.app.on('window-all-closed', electron_1.app.quit);
// listen the channel `message` and resend the received message to the renderer process
electron_1.ipcMain.on('message', (event, message) => {
    console.log(message);
    setTimeout(() => event.sender.send('message', 'hi from electron'), 500);
});
electron_1.ipcMain.on('show_open_dialog', async (event, _message) => {
    console.log('show dialog in index');
    const browserWindow = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (!browserWindow)
        return;
    const content = await showOpenDialog(browserWindow);
    setTimeout(() => event.sender.send('file_opened', content), 500);
});
electron_1.ipcMain.on('selectFolderPath', async (event, _message) => {
    console.log('show selectFolderPath');
    const browserWindow = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (!browserWindow)
        return;
    const dirPath = await (0, selectFolderPath_1.selectFolderPath)(browserWindow);
    setTimeout(() => event.sender.send('receiveSelectedFolderPath', dirPath), 500);
});
electron_1.ipcMain.on('createFolderWorkSpace', async (event, _message) => {
    console.log('back createFolderWorkSpace receive from front ready to do back logic\n', _message);
    const browserWindow = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (!browserWindow)
        return;
    const content = await (0, createFolderWorkSpace_1.createFolderWorkSpace)(_message);
    browserWindow.webContents.send('loading-progress', 'test35');
    browserWindow.webContents.send('loading-progress', 'test39');
    console.log('back createFolderWorkSpace ready to send back to main \n', content);
    setTimeout(() => event.sender.send('createFolderWorkSpace', content), 500);
});
electron_1.ipcMain.on('sendQueryFromUser', async (event, _message) => {
    console.log('back sendQueryFromUser receive from front ready to do back logic\n', _message);
    const browserWindow = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (!browserWindow)
        return;
    if (0) {
        //@ts-ignore
        const content = await (0, sendQueryFromUser_1.sendQueryFromUser)(_message);
    }
    const content = `Monsieur DIANBIK Mahamadou a formellement identifié et reconnu deux des auteurs des 
    violences lors de l'incident (<span>/home/mathieug/Work/with_electron_next_js_app/electron_project/public/dossier_instruction_hamlet.pdf pages 2, 55</span>)
    Monsieur LOL plait a Madame MDR lors de l'incident (<span>/home/mathieug/Work/with_electron_next_js_app/electron_project/public/dossier_instruction_hamlet.pdf pages 3, 45</span>)
    `;
    console.log('back sendQueryFromUser ready to send back to main \n', content);
    // qu'est ce que je vais vouloir envoyer ?
    // 
    setTimeout(() => event.sender.send('receiveSendQueryFromUser', content), 500);
});
// ipcMain.on('getFolderFilesNames', async (event: IpcMainEvent, message: any) => {
//     console.log('show selectFolderPath ' + message)
//     const dirItems = await getFolderFilesNames(message)
//     console.log('getFolderFilesNames OK');
//     setTimeout(() => event.sender.send('receiveFolderFilesNames', dirItems), 500)
// })
const showOpenDialog = async (browserWindow) => {
    const result = await electron_1.dialog.showOpenDialog(browserWindow, {
        properties: ['openDirectory'],
    });
    console.log('result : ' + result);
    if (result.canceled)
        return;
    const [filePath] = result.filePaths;
    const content = openFile(browserWindow, filePath);
    console.log('content : ' + content);
    return filePath;
};
const openFile = async (_browserWindow, filePath) => {
    const content = await (0, promises_1.readFile)(filePath, { encoding: 'utf-8' });
    // browserWindow.webContents.send('file_opened', content, filePath)
    return content;
    // console.log({
    //     content,
    // });
};
const showSaveDialog = async (browserWindow) => {
    const result = await electron_1.dialog.showOpenDialog(browserWindow, {
        title: 'Save Markdown',
        filters: [{ name: 'Markdown File', extensions: ['md'] }]
    });
    if (result.canceled) {
        return;
    }
    const { filePath } = result;
    if (!filePath) {
        return;
    }
    return filePath;
    // return content
};
const saveFile = async (browserWindow, content) => {
    const filePath = await getCurrentFile(browserWindow);
    // const filePath = currentFile. filePath ?? await showSaveDialog(browserWindow, content)
    if (filePath)
        return;
    await (0, promises_1.writeFile)(filePath, content, { encoding: 'utf-8' });
    setCurrentFile(browserWindow, filePath, content);
};
electron_1.ipcMain.on('save_file', async (event, content) => {
    const browserWindow = electron_1.BrowserWindow.fromWebContents(event.sender);
    const changed = hasChanges(content);
    browserWindow?.setDocumentEdited(changed);
    if (!browserWindow)
        return;
    await saveFile(browserWindow, content);
});
electron_1.ipcMain.handle('has_changes', async (_event, content) => {
    return hasChanges(content);
});
