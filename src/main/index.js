'use strict'

import { app, ipcMain } from 'electron'
import mainWin from '../renderer/lib/window/mainWindow'
import chatImgWin from '../renderer/lib/window/chatImgWindow'
import chatVideoWin from '../renderer/lib/window/chatVideoWindow'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let downloadItems = []

function init () {
  mainWindow = mainWin(downloadItem)
  // chatImgWin(mainWindow)
}

app.on('ready', init)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    init()
  }
})

// 显示窗口
ipcMain.on('show-win-modal', (e, args) => {
  if (args.type === 'video') {
    chatVideoWin(mainWindow, args)
  }
  if (args.type === 'img') {
    chatImgWin(mainWindow, args)
  }
})

function downloadItem (item) {
  if (item.type === 'add') {
    if (item.downloadUrl.indexOf('?') !== -1) {
      item.downloadUrl = item.downloadUrl.split('?')[0];
    }
    downloadItems.push(item)
  }
  if (item.type === 'remove') {
    downloadItems = []
  }
}
