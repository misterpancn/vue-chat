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
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 350,
    useContentSize: true,
    width: 540,
    show: false
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
    exit = false
  })
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  mainWindow.on('close', (e) => {
    if (!exit) {
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
