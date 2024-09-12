import { readdir } from 'node:fs/promises';
import { Dirent } from 'node:fs';

export async function readDirectoryStructure(dirPath: string ): Promise<any> {

    let results = [];
    let fileCount = 0; // Initialize file count

    const dirItems: Dirent[] = await readdir(dirPath, {
        encoding: 'utf-8',
        withFileTypes: true,
    })

        
    for (const item of dirItems) {
        if (item.isDirectory()) {
            if (item.name != '.dev') {
                console.log('DIRECTORY');
                console.log('item.path\n', item.path);
                console.log('%c' + 'item.name\n' + '%c' + item.name, 'color: red;', 'color: red;');

                
                const { tree: children, fileCount: subFileCount } = await readDirectoryStructure(`${item.path}/${item.name}`);
                fileCount += subFileCount;
                const safeFullPath = item.path.replace(/^(.*?\/){3}/, '');
                console.log('safeFullPath\n', safeFullPath);
                results.push({ isFolder: true, name: item.name, fullPath: `${safeFullPath}/${item.name}`, children });
                // mainWindow.webContents.send('loading-progress', progress);

            }
            } else {
            fileCount++;
            console.log('FILE');
            console.log('item.path\n', item.path);
            console.log('item.name\n', item.name);
            const safeFullPath = item.path.replace(/^(.*?\/){3}/, '');
            console.log('safeFullPath\n', safeFullPath);
            
            results.push({ isFolder: false, name: item.name, fullPath: `${safeFullPath}/${item.name}` })
        }
                
    }

    // return results
    return { tree: results, fileCount };

}