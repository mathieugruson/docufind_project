// Native
import { join, basename } from 'path'
import { format } from 'url'
import { readFile, writeFile } from 'fs/promises'
// const os = require('node:os')
// const path = require('node:path')

// Packages
import { BrowserWindow, app, ipcMain, IpcMainEvent, dialog, protocol, net } from 'electron'
import isDev from 'electron-is-dev'
import prepareNext from 'electron-next'

// Library
import { selectFolderPath } from './library/selectFolderPath'
import { sendQueryFromUser } from './library/sendQueryFromUser'
import { createFolderWorkSpace } from './library/createFolderWorkSpace' 
// Prepare the renderer once the app is ready

type MarkdownFile = {
    content?: string,
    filePath?: string

}

const getCurrentFile = (browserWindow : BrowserWindow) => {
    if (currentFile.filePath) return currentFile.filePath
    if (!browserWindow) return 
    return showSaveDialog(browserWindow)
}

const setCurrentFile = (browserWindow: BrowserWindow, filePath: string, content: string) => {
    currentFile.filePath = filePath
    currentFile.content = content
    browserWindow.setTitle(`${basename(filePath)} - ${app.name}`)
    browserWindow.setRepresentedFilename(filePath)
}

const hasChanges = (content: string) => {
    return currentFile.content !== content
}

let currentFile: MarkdownFile = {
    content: '',
    filePath: undefined
}

// const reactDevToolsPath = path.join(
//     os.homedir(),
//     '.config/google-chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/5.0.0_0'
//   )

app.whenReady().then(async () => {
    // await session.defaultSession.loadExtension(reactDevToolsPath)
    protocol.handle('atom', (request : any ) => {
        return net.fetch('file://' + request.url.slice('atom://'.length))
      })})

app.on('ready', async () => {

  await prepareNext('./renderer')

  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
    //   contextIsolation: true,
      webSecurity: false,
      preload: join(__dirname, 'preload.js'),
    },
  })

  const url = isDev
    ? 'http://localhost:8000/'
    : format({
        pathname: join(__dirname, '../renderer/out/index.html'),
        protocol: 'file:',
        slashes: true,
      })

  mainWindow.loadURL(url)
  
  mainWindow.once('ready-to-show', () => {
    const contents = mainWindow.webContents
    console.log('content :' + contents)
    // mainWindow.webContents.loadURL(`file:///mnt/nfs/homes/mgruson/Downloads/ft_transcendence_sujet.pdf.pdf`);

    mainWindow.show()
    mainWindow.focus()
    // showOpenDialog(mainWindow)
  })
})

// /mnt/nfs/homes/mgruson/.config/google-chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi
// Quit the app once all windows are closed
app.on('window-all-closed', app.quit)

// listen the channel `message` and resend the received message to the renderer process
ipcMain.on('message', (event: IpcMainEvent, message: any) => {
  console.log(message)
  setTimeout(() => event.sender.send('message', 'hi from electron'), 500)
})

ipcMain.on('show_open_dialog', async (event: IpcMainEvent, _message: any) => {
    console.log('show dialog in index')

    const browserWindow = BrowserWindow.fromWebContents(event.sender)
    
    if (!browserWindow)
        return 

    const content : any = await showOpenDialog(browserWindow)
    setTimeout(() => event.sender.send('file_opened', content), 500)
})


ipcMain.on('selectFolderPath', async (event: IpcMainEvent, _message: any) => {

    console.log('show selectFolderPath')

    const browserWindow = BrowserWindow.fromWebContents(event.sender)
    
    if (!browserWindow)
        return 

    const dirPath : any = await selectFolderPath(browserWindow)


    setTimeout(() => event.sender.send('receiveSelectedFolderPath', dirPath), 500)
})

ipcMain.on('createFolderWorkSpace', async (event: IpcMainEvent, _message: any) => {

    console.log('back createFolderWorkSpace receive from front ready to do back logic\n', _message)

    const browserWindow = BrowserWindow.fromWebContents(event.sender)
    
    if (!browserWindow)
        return 

    const content : any = await createFolderWorkSpace(_message)


    browserWindow.webContents.send('loading-progress', 'test35');
    browserWindow.webContents.send('loading-progress', 'test39');

    console.log('back createFolderWorkSpace ready to send back to main \n', content);
    
    setTimeout(() => event.sender.send('createFolderWorkSpace', content), 500)
})


ipcMain.on('sendQueryFromUser', async (event: IpcMainEvent, _message: any) => {

    console.log('back sendQueryFromUser receive from front ready to do back logic\n', _message)

    const browserWindow = BrowserWindow.fromWebContents(event.sender)
    
    if (!browserWindow)
        return 

    if (0) {
        //@ts-ignore
        const content : any = await sendQueryFromUser(_message)
    }

    const content = `Monsieur DIANBIK Mahamadou a formellement identifié et reconnu deux des auteurs des 
    violences lors de l'incident (<span>/home/mathieug/Work/with_electron_next_js_app/electron_project/public/dossier_instruction_hamlet.pdf pages 2, 55</span>)
    Monsieur LOL plait a Madame MDR lors de l'incident (<span>/home/mathieug/Work/with_electron_next_js_app/electron_project/public/dossier_instruction_hamlet.pdf pages 3, 45</span>)
    `
    console.log('back sendQueryFromUser ready to send back to main \n', content);
    

    // qu'est ce que je vais vouloir envoyer ?
    // 


    setTimeout(() => event.sender.send('receiveSendQueryFromUser', content), 500)
})

// ipcMain.on('getFolderFilesNames', async (event: IpcMainEvent, message: any) => {

//     console.log('show selectFolderPath ' + message)

//     const dirItems = await getFolderFilesNames(message)

//     console.log('getFolderFilesNames OK');
    
//     setTimeout(() => event.sender.send('receiveFolderFilesNames', dirItems), 500)
    
// })

const showOpenDialog = async (browserWindow: BrowserWindow) : Promise<any> => {
    
    const result = await dialog.showOpenDialog(browserWindow, {
        properties: ['openDirectory'],
    })

    console.log('result : ' + result);
    
    if (result.canceled)
        return ;

    const [filePath] = result.filePaths

    const content: any = openFile(browserWindow, filePath);
    console.log('content : ' + content);
    
    return filePath
}

const openFile = async (_browserWindow: BrowserWindow, filePath: string) : Promise<any> => {
    
    const content = await readFile(filePath, {encoding : 'utf-8'}, )
    
    // browserWindow.webContents.send('file_opened', content, filePath)
    
    return content
    // console.log({
    //     content,
    // });
}

const showSaveDialog = async (browserWindow : BrowserWindow) : Promise<any> => {

    const result = await dialog.showOpenDialog(browserWindow, {
        title: 'Save Markdown',
        filters: [{name: 'Markdown File', extensions: ['md']}]
    })

    if (result.canceled) {
        return
    }

    const {filePath} : any = result

    if (!filePath) {
        return
    } 

    return filePath
    
    // return content
}

const saveFile = async (browserWindow : BrowserWindow, content: string) => {
    const filePath = await getCurrentFile(browserWindow)

    // const filePath = currentFile. filePath ?? await showSaveDialog(browserWindow, content)
    if (filePath) return 

    await writeFile(filePath, content, { encoding: 'utf-8'})
    setCurrentFile(browserWindow, filePath, content)
}

ipcMain.on('save_file', async (event, content: string) => {
    const browserWindow = BrowserWindow.fromWebContents(event.sender)
    const changed = hasChanges(content)

    browserWindow?.setDocumentEdited(changed)
    
    if (!browserWindow) return 
    await saveFile(browserWindow, content)
})


ipcMain.handle('has_changes', async (_event : any, content: string) => {
    return hasChanges(content)
})

