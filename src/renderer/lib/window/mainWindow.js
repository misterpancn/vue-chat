import { app, BrowserWindow, ipcMain } from 'electron'
import config from '../../store/config/config'
import handleUpdate from './handleUpdate'
export default function main (callbacks) {
  const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`
  /**
   * Initial window options
   */
  // let exit = false
  let mainWindow = new BrowserWindow({
    height: config.windowSize.login.height,
    // useContentSize: true,
    width: config.windowSize.login.width,
    show: false,
    frame: false
  })

  // mainWindow.webContents.openDevTools()
  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
    // exit = false
  })
  mainWindow.on('focus', () => mainWindow.flashFrame(false))
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  mainWindow.on('close', (e) => {
    mainWindow.webContents.send('close-window')
    // exit = true
    app.quit()
  })
  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    // 设置保存路径,使Electron不提示保存对话框。
    // item.setSavePath('/tmp/save.pdf')
    let totalBytes = item.getTotalBytes()
    callbacks({
      item: item,
      downloadUrl: item.getURL(),
      type: 'add'
    })
    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed')
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused')
        } else {
          webContents.send('main-app-listen', {
            type: 'download-file-progress',
            data: {
              con: item.getReceivedBytes() / totalBytes,
              code: 'ing'
            }
          })
        }
        mainWindow.setProgressBar(item.getReceivedBytes() / totalBytes)
      }
    })
    item.once('done', (event, state) => {
      if (state === 'completed') {
        webContents.send('main-app-listen', {
          type: 'download-file-progress',
          data: {
            con: item.getSavePath(),
            code: 'success'
          }
        })
        console.log('Download successfully')
      } else {
        console.log(`Download failed: ${state}`)
      }
      mainWindow.setProgressBar(-1)
      webContents.send('main-app-listen', {
        type: 'download-file-progress',
        data: {
          con: 0,
          code: 'cancel'
        }
      })
      callbacks({
        item: item,
        downloadUrl: item.getURL(),
        type: 'remove'
      })
    })
  })
  const { session } = require('electron')

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    let c = {
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': config.contentSecurityPolicy ? config.contentSecurityPolicy : ['default-src \'self\' \'unsafe-inline\' \'unsafe-eval\' data:']
      }
    }
    callback(c)
  });
  // 软件自动更新
  handleUpdate(mainWindow)
  // 事件监听
  ipcMain.on('change-win-size', (e, args) => {
    mainWindow.setSize(args.width, args.height)
    mainWindow.center()
  })
  ipcMain.on('show-win-notify', (e, args) => {
    if (!mainWindow.isFocused()) {
      mainWindow.flashFrame(args.show)
    }
  })
  ipcMain.on('exit', (e) => {
    mainWindow.close()
  })
  ipcMain.on('winMaximize', (e) => {
    mainWindow.maximize()
  })
  ipcMain.on('winUnMaximize', (e) => {
    mainWindow.unmaximize()
  })
  ipcMain.on('winMinimize', (e) => {
    mainWindow.minimize()
  })
  ipcMain.on('download-chat-file', (e, option) => {
    if (option.cmd === 'url') {
      mainWindow.webContents.downloadURL(option.data)
    }
  })
  return mainWindow
}
