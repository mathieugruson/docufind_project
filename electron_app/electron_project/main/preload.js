"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const electron_1 = require("electron");
// We are using the context bridge to securely expose NodeAPIs.
// Please note that many Node APIs grant access to local system resources.
// Be very cautious about which globals and APIs you expose to untrusted remote content.
electron_1.contextBridge.exposeInMainWorld('electron', {
    sayHello: () => electron_1.ipcRenderer.send('message', 'hi frm next'),
    receiveHello: (handler) => electron_1.ipcRenderer.on('message', handler),
    stopReceivingHello: (handler) => electron_1.ipcRenderer.removeListener('message', handler),
    showOpenDialog: () => {
        electron_1.ipcRenderer.send('show_open_dialog');
    },
    receiveDialog: (handler) => electron_1.ipcRenderer.on('file_opened', handler),
    stopReceivingDialog: (handler) => electron_1.ipcRenderer.removeListener('file_opened', handler),
    saveFile: async (content) => {
        electron_1.ipcRenderer.send('save_file', content);
    },
    checkForUnsavedChanges: async (content) => {
        const result = await electron_1.ipcRenderer.invoke('check_for_unsaved_changes', content);
        return result;
    },
    // Select Folder Path 
    // 1. front to main
    selectFolderPath: () => {
        electron_1.ipcRenderer.send('selectFolderPath');
    },
    // 2. main to front
    receiveSelectedFolderPath: (handler) => electron_1.ipcRenderer.on('receiveSelectedFolderPath', handler),
    // 3. stop receiving signal
    stopReceiveSelectedFolderPath: (handler) => electron_1.ipcRenderer.removeListener('receiveSelectedFolderPath', handler),
    // getDirectoryFilesNames
    // 1. front to main
    getFolderFilesNames: (directoryPath) => {
        console.log('getFolderFilesNames ' + directoryPath + ' from preload.ts');
        electron_1.ipcRenderer.send('getFolderFilesNames', directoryPath);
    },
    // 2. main to front
    receiveFolderFilesNames: (handler) => {
        console.log('test receiveFolderFilesNames');
        electron_1.ipcRenderer.on('receiveFolderFilesNames', handler);
    },
    // 3. stop receiving signal
    stopReceiveFolderFilesNames: (handler) => electron_1.ipcRenderer.removeListener('receiveFolderFilesNames', handler),
    /*************************************************** */
    // sendQueryFromUser
    // 1. front to main
    sendQueryFromUser: (query) => {
        console.log('sendQueryFromUser ' + query + ' from preload.ts');
        electron_1.ipcRenderer.send('sendQueryFromUser', query);
    },
    // 2. main to front
    receiveSendQueryFromUser: (handler) => {
        console.log('test receiveSendQueryFromUser');
        electron_1.ipcRenderer.on('receiveSendQueryFromUser', handler);
    },
    // 3. stop receiving signal
    stopReceiveSendQueryFromUser: (handler) => electron_1.ipcRenderer.removeListener('receiveSendQueryFromUser', handler),
    // createFolderWorkSpace
    // 1. front to main
    createFolderWorkSpace: (workspaceInfo) => {
        console.log('createFolderWorkSpace ' + workspaceInfo + ' from preload.ts');
        electron_1.ipcRenderer.send('createFolderWorkSpace', workspaceInfo);
    },
    // 2. main to front
    receiveCreateFolderWorkSpace: (handler) => {
        console.log('test createFolderWorkSpace');
        electron_1.ipcRenderer.on('createFolderWorkSpace', handler);
    },
    // 3. stop receiving signal
    stopReceiveCreateFolderWorkSpace: (handler) => electron_1.ipcRenderer.removeListener('createFolderWorkSpace', handler),
    send: (channel, data) => electron_1.ipcRenderer.send(channel, data),
    on: (channel, func) => {
        // @ts-ignore
        const subscription = (event, ...args) => func(...args);
        electron_1.ipcRenderer.on(channel, subscription);
        return () => electron_1.ipcRenderer.removeListener(channel, subscription);
    },
});
/*
Pour faire de la communication entre le back et le front en utilisant react, le schema est le suivant:
3 fonctions =
SEND SIGNAL FROM FRONT
sayHello: () => ipcRenderer.send('message', 'hi from next'),
RECEIVE SIGNAL FROM MAIN
receiveHello: (handler: (event: IpcRendererEvent, ...args: any[]) => void) =>
    ipcRenderer.on('message', handler),
STOP RECEIVE SIGNAL FROM MAIN
stopReceivingHello: (handler: (event: IpcRendererEvent, ...args: any[]) => void) =>
ipcRenderer.removeListener('message', handler),
*/ 
