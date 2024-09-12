import { BrowserWindow, dialog } from 'electron'

export const selectFolderPath = async (browserWindow: BrowserWindow): Promise<any> => {

    const result = await dialog.showOpenDialog(browserWindow, {
        properties: ['openDirectory'],
    })

    if (result.canceled)
        return;

    const [dirPath]: string[] = result.filePaths

    console.log('filePath\n', dirPath);
    
    return dirPath

}
