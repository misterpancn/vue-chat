'use strict'

import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import config from '../renderer/store/config/config'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let exit = false
let winModal
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
const winModalURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#/modelWindow`
  : `file://${__dirname}/index.html#modelWindow`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: config.windowSize.login.height,
    // useContentSize: true,
    width: config.windowSize.login.width,
    show: false
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
    exit = false
  })
  mainWindow.on('focus', () => mainWindow.flashFrame(false))
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  winModal = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    useContentSize: true,
    frame: false,
    show: false,
    alwaysOnTop: true
  })
  winModal.loadURL(winModalURL)
  winModal.on('closed', () => {
    winModal = null
  })
  mainWindow.on('close', (e) => {
    if (!exit && isShowExitNotify()) {
      e.preventDefault()
      dialog.showMessageBox(mainWindow, {
        type: 'warning',
        title: 'info tips',
        message: 'Do you want to close the application?',
        buttons: ['Cancel', 'Ok']
      }, (idx) => {
        if (idx === 0) {
          e.preventDefault()
        } else {
          mainWindow.webContents.send('close-window')
          exit = true
          app.quit()
        }
      })
    }
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
  })
  handleUpdate()
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('change-win-size', (e, args) => {
  mainWindow.setSize(args.width, args.height)
  mainWindow.center()
})
ipcMain.on('show-win-notify', (e, args) => {
  if (!mainWindow.isFocused()) {
    mainWindow.flashFrame(args.show)
  }
})
ipcMain.on('show-win-model', (e, args) => {
  winModal.setSize(args.width, args.height)
  winModal.show()
  winModal.center()
  winModal.webContents.send('send-win-modal-img', args.src)
})
ipcMain.on('hide-win-modal', (e, args) => {
  winModal.hide()
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

function handleUpdate () {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false
  autoUpdater.setFeedURL(config.downloadAddress);
  autoUpdater.on('error', (err) => {
    mainWindow.webContents.send('update-error', String(err))
  })
  autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('update-available', info)
  })
  autoUpdater.on('update-not-available', (info) => {
    mainWindow.webContents.send('update-not-available', info)
  })
  autoUpdater.on('download-progress', (progress) => {
    mainWindow.webContents.send('update-download-progress', progress)
  })
  autoUpdater.on('update-downloaded', (info) => {
    mainWindow.webContents.send('update-downloaded', info)
  })
  ipcMain.on('check-for-update', () => {
    autoUpdater.checkForUpdates()
  })
  ipcMain.on('update-download', () => {
    autoUpdater.downloadUpdate()
  })
  ipcMain.on('update-install', () => {
    autoUpdater.quitAndInstall()
  })
}

function isShowExitNotify () {
  let size = mainWindow.getSize();
  if (size[0] === config.windowSize.login.width && size[1] === config.windowSize.login.height) {
    return false;
  }
  if (size[0] === config.windowSize.register.width && size[1] === config.windowSize.register.height) {
    return false;
  }
  return true;
}
