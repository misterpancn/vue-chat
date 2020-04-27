import { BrowserWindow, ipcMain } from 'electron'
export default function imgWin (parentWin, args) {
  const winModalURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/#/modelWindow`
    : `file://${__dirname}/index.html#modelWindow`
  let winModal = new BrowserWindow({
    parent: parentWin,
    modal: true,
    useContentSize: true,
    frame: false,
    show: false,
    webPreferences: {
      devTools: false
    }
  })
  winModal.loadURL(winModalURL)
  winModal.on('closed', () => {
    winModal = null
  })
  winModal.once('ready-to-show', () => {
    winModal.center()
    winModal.webContents.send('send-win-modal-img', args.src)
    winModal.show()
  })
  /* ipcMain.on('show-wins-model', (e, args) => {
    winModal.setSize(args.width, args.height)
    winModal.show()
  }) */
  ipcMain.on('hide-win-modal', (e, args) => {
    if (winModal) {
      winModal.hide();
      winModal.close()
    }
  })
  return winModal
}
