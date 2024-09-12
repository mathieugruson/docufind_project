// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';
// eslint-disable-next-line @typescript-eslint/no-unused-vars

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  interface Window {
    electron: {
      sayHello: () => void      
      receiveHello: (handler: (event, args) => void) => void
      stopReceivingHello: (handler: (event, args) => void) => void
      showOpenDialog: () => void
      receiveDialog: (handler: (event, args) => void) => void
      stopReceivingDialog: (handler: (event, args) => void) => void
      saveFile: (content: string) => void
      checkForUnsavedChanges: (content: string) => Promise<boolean>
      selectFolderOrFile: () => void
    }
  }
}

export type User = {
  id: number
  name: string
}