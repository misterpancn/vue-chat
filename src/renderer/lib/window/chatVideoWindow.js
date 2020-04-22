import { BrowserWindow, ipcMain } from 'electron'
export default function videoWin (parentWin, param) {
  const videoModalURl = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/#/videoModal`
    : `file://${__dirname}/index.html#videoModal`
  let videoModal = new BrowserWindow({
    parent: parentWin,
    modal: true,
    useContentSize: true,
    frame: false,
    show: false
  })
  videoModal.loadURL(videoModalURl)
  videoModal.on('closed', () => {
    videoModal = null
  })
  videoModal.once('ready-to-show', () => {
    videoModal.show()
    videoModal.webContents.send('video-modal-data', param)
  })
  ipcMain.on('close-video-modal', () => {
    if (videoModal) {
      videoModal.close()
    }
  })
  ipcMain.on('forwarded-message-to-video', (e, data) => {
    if (videoModal) {
      videoModal.webContents.send('forwarded-message-to-video', data)
    }
  })
  ipcMain.on('video-modal-full-screen', () => {
    if (videoModal) {
      if (videoModal.isMaximized()) {
        videoModal.unmaximize()
      } else {
        videoModal.maximize()
      }
    }
  })
}
