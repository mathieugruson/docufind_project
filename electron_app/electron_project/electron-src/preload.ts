/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { contextBridge, ipcRenderer } from 'electron'
import { IpcRendererEvent } from 'electron/main'

// We are using the context bridge to securely expose NodeAPIs.
// Please note that many Node APIs grant access to local system resources.
// Be very cautious about which globals and APIs you expose to untrusted remote content.

contextBridge.exposeInMainWorld('electron', {
    
    sayHello: () => ipcRenderer.send('message', 'hi frm next'),
    receiveHello: (handler: (event: IpcRendererEvent, ...args: any[]) => void) =>
        ipcRenderer.on('message', handler),
    stopReceivingHello: (handler: (event: IpcRendererEvent, ...args: any[]) => void) => 
    ipcRenderer.removeListener('message', handler),

    showOpenDialog: () => {
        ipcRenderer.send('show_open_dialog')
    },
    receiveDialog: (handler: (event: IpcRendererEvent, ...args: any[]) => void) =>
        ipcRenderer.on('file_opened', handler),
    stopReceivingDialog: (handler: (event: IpcRendererEvent, ...args: any[]) => void) => 
    ipcRenderer.removeListener('file_opened', handler),
    saveFile: async (content: string) => {
        ipcRenderer.send('save_file', content)
    },
    checkForUnsavedChanges: async (content: string) => {
        const result = await ipcRenderer.invoke('check_for_unsaved_changes', content)
        return result
    },
    
    
    // Select Folder Path 
    // 1. front to main
    selectFolderPath: () => {
        ipcRenderer.send('selectFolderPath')
    },
    // 2. main to front
    receiveSelectedFolderPath: (handler: (event: IpcRendererEvent, ...args: any[]) => void) =>
    ipcRenderer.on('receiveSelectedFolderPath', handler),
    // 3. stop receiving signal
    stopReceiveSelectedFolderPath: (handler: (event: IpcRendererEvent, ...args: any[]) => void) => 
    ipcRenderer.removeListener('receiveSelectedFolderPath', handler),


    // getDirectoryFilesNames
    // 1. front to main
    getFolderFilesNames: (directoryPath: string) => {
        console.log('getFolderFilesNames ' + directoryPath + ' from preload.ts');
        ipcRenderer.send('getFolderFilesNames', directoryPath)
    },
    // 2. main to front
    receiveFolderFilesNames: (handler: (event: IpcRendererEvent, ...args: any[]) => void) =>
    {
    console.log('test receiveFolderFilesNames')
    ipcRenderer.on('receiveFolderFilesNames', handler)
    },
    // 3. stop receiving signal
    stopReceiveFolderFilesNames: (handler: (event: IpcRendererEvent, ...args: any[]) => void) => 
    ipcRenderer.removeListener('receiveFolderFilesNames', handler),


    /*************************************************** */

    // sendQueryFromUser
    // 1. front to main
    sendQueryFromUser: (query: string) => {
        console.log('sendQueryFromUser ' + query + ' from preload.ts');
        ipcRenderer.send('sendQueryFromUser', query)
    },
    // 2. main to front
    receiveSendQueryFromUser: (handler: (event: IpcRendererEvent, ...args: any[]) => void) =>
    {
    console.log('test receiveSendQueryFromUser')
    ipcRenderer.on('receiveSendQueryFromUser', handler)
    },
    // 3. stop receiving signal
    stopReceiveSendQueryFromUser: (handler: (event: IpcRendererEvent, ...args: any[]) => void) => 
    ipcRenderer.removeListener('receiveSendQueryFromUser', handler),


    // createFolderWorkSpace
    // 1. front to main
    createFolderWorkSpace: (workspaceInfo: any) => {
        console.log('createFolderWorkSpace ' + workspaceInfo + ' from preload.ts');
        ipcRenderer.send('createFolderWorkSpace', workspaceInfo)
    },
    // 2. main to front
    receiveCreateFolderWorkSpace: (handler: (event: IpcRendererEvent, ...args: any[]) => void) =>
    {
    console.log('test createFolderWorkSpace')
    ipcRenderer.on('createFolderWorkSpace', handler)
    },
    // 3. stop receiving signal
    stopReceiveCreateFolderWorkSpace: (handler: (event: IpcRendererEvent, ...args: any[]) => void) => 
    ipcRenderer.removeListener('createFolderWorkSpace', handler),
    

    send: (channel : any, data : any) => ipcRenderer.send(channel, data),
    on: (channel: any, func: any) => {
        // @ts-ignore
      const subscription = (event : any, ...args : any) => func(...args);
      ipcRenderer.on(channel, subscription);
  
      return () => ipcRenderer.removeListener(channel, subscription);
    },
    
})

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